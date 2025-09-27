import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Twitter OAuth 2.0 endpoints
const TWITTER_AUTH_URL = 'https://twitter.com/i/oauth2/authorize';
const TWITTER_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';
const TWITTER_USERINFO_URL = 'https://api.twitter.com/2/users/me';

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const url = new URL(req.url);
  let action = url.searchParams.get('action');
  
  let requestBody: any = {};
  if (req.method === 'POST') {
    try {
      requestBody = await req.json();
      action = requestBody.action || action;
    } catch (error) {
      console.log('No JSON body in request');
    }
  }

  try {
    if (action === 'authorize') {
      // Step 1: Generate authorization URL
      const { profileId } = requestBody;
      
      if (!profileId) {
        throw new Error('Profile ID is required');
      }

      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = crypto.randomUUID();

      // Store code verifier and state temporarily
      const authData = {
        code_verifier: codeVerifier,
        state: state,
        profile_id: profileId
      };

      const { error: storeError } = await supabase
        .from('social_connections')
        .upsert({
          profile_id: profileId,
          platform: 'twitter_temp',
          is_connected: false,
          connection_data: authData
        }, {
          onConflict: 'profile_id,platform'
        });

      if (storeError) {
        console.error('Error storing auth data:', storeError);
      }

      const redirectUri = `https://iymlvqlpdsauayedemaq.supabase.co/functions/v1/twitter-auth?action=callback`;
      
      const authUrl = new URL(TWITTER_AUTH_URL);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('client_id', Deno.env.get('TWITTER_CLIENT_ID') || '');
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('scope', 'tweet.read tweet.write users.read offline.access');
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('code_challenge', codeChallenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');

      return new Response(JSON.stringify({ 
        authUrl: authUrl.toString(),
        state: state 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'callback') {
      // Step 2: Handle OAuth callback
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');

      if (!code || !state) {
        throw new Error('Missing code or state parameter');
      }

      // Retrieve stored auth data
      const { data: tempConnections, error: retrieveError } = await supabase
        .from('social_connections')
        .select('*')
        .eq('platform', 'twitter_temp');

      if (retrieveError) {
        console.error('Error retrieving temp connections:', retrieveError);
        throw new Error('Invalid state parameter or expired session');
      }

      // Find the connection with matching state
      const tempConnection = tempConnections?.find((conn: any) => {
        const authData = conn.connection_data as any;
        return authData && authData.state === state;
      });

      if (!tempConnection) {
        console.error('No temp connection found for state:', state);
        throw new Error('Invalid state parameter or expired session');
      }

      const authData = tempConnection.connection_data as any;
      const redirectUri = `https://iymlvqlpdsauayedemaq.supabase.co/functions/v1/twitter-auth?action=callback`;

      // Exchange code for access token
      const clientId = Deno.env.get('TWITTER_CLIENT_ID') || '';
      const clientSecret = Deno.env.get('TWITTER_CLIENT_SECRET') || '';
      const basicAuth = btoa(`${clientId}:${clientSecret}`);
      
      const tokenResponse = await fetch(TWITTER_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${basicAuth}`,
        },
        body: new URLSearchParams({
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code_verifier: authData.code_verifier,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Twitter token error:', errorText);
        throw new Error(`Failed to exchange code for token: ${errorText}`);
      }

      const tokenData = await tokenResponse.json();

      // Get user info from Twitter
      const userResponse = await fetch(TWITTER_USERINFO_URL, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user info from Twitter');
      }

      const userData = await userResponse.json();

      // Store the connection with real Twitter data
      const { error: updateError } = await supabase
        .from('social_connections')
        .upsert({
          profile_id: authData.profile_id,
          platform: 'twitter',
          is_connected: true,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: tokenData.expires_in ? 
            new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
          connection_data: {
            username: userData.data.username,
            name: userData.data.name,
            id: userData.data.id,
            public_metrics: userData.data.public_metrics || {}
          }
        }, {
          onConflict: 'profile_id,platform'
        });

      if (updateError) {
        console.error('Error updating connection:', updateError);
        throw new Error(`Failed to save Twitter connection: ${updateError.message}`);
      }

      // Clean up temporary connection
      await supabase
        .from('social_connections')
        .delete()
        .eq('id', tempConnection.id);

      // Redirect back to the dashboard with success
      const frontendUrl = Deno.env.get('FRONTEND_URL') || 'http://localhost:8080';
      const dashboardUrl = `${frontendUrl}/dashboard?twitter_connected=true`;
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': dashboardUrl,
        },
      });

    } else if (action === 'disconnect') {
      // Step 3: Disconnect Twitter account
      const { profileId } = requestBody;

      const { error } = await supabase
        .from('social_connections')
        .update({
          is_connected: false,
          access_token: null,
          refresh_token: null,
          token_expires_at: null
        })
        .eq('profile_id', profileId)
        .eq('platform', 'twitter');

      if (error) {
        throw new Error(`Failed to disconnect Twitter: ${error.message}`);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'post') {
      // Step 4: Post a tweet to Twitter
      const { profileId, tweet } = requestBody;

      if (!profileId || !tweet) {
        throw new Error('Profile ID and tweet content are required');
      }

      // Get the user's Twitter connection
      const { data: connection, error: connectionError } = await supabase
        .from('social_connections')
        .select('access_token')
        .eq('profile_id', profileId)
        .eq('platform', 'twitter')
        .eq('is_connected', true)
        .single();

      if (connectionError || !connection) {
        throw new Error('Twitter account not connected or access token not found');
      }

      // Post the tweet using Twitter API v2
      const tweetResponse = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${connection.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: tweet
        }),
      });

      if (!tweetResponse.ok) {
        const errorText = await tweetResponse.text();
        console.error('Twitter post error:', errorText);
        throw new Error(`Failed to post tweet: ${errorText}`);
      }

      const tweetData = await tweetResponse.json();

      return new Response(JSON.stringify({ 
        success: true, 
        tweetId: tweetData.data?.id,
        tweetUrl: `https://twitter.com/user/status/${tweetData.data?.id}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'search') {
      // Step 5: Search for tweets using Twitter API v2
      const { profileId, query, maxResults = 10 } = requestBody;

      if (!profileId || !query) {
        throw new Error('Profile ID and search query are required');
      }

      // Get the user's Twitter connection
      const { data: connection, error: connectionError } = await supabase
        .from('social_connections')
        .select('access_token')
        .eq('profile_id', profileId)
        .eq('platform', 'twitter')
        .eq('is_connected', true)
        .single();

      if (connectionError || !connection) {
        throw new Error('Twitter account not connected or access token not found');
      }

      // Search tweets using Twitter API v2
      const searchUrl = new URL('https://api.twitter.com/2/tweets/search/recent');
      searchUrl.searchParams.set('query', query);
      searchUrl.searchParams.set('max_results', Math.min(maxResults, 100).toString());
      searchUrl.searchParams.set('tweet.fields', 'created_at,author_id,context_annotations,public_metrics');
      searchUrl.searchParams.set('user.fields', 'name,username');
      searchUrl.searchParams.set('expansions', 'author_id');

      const searchResponse = await fetch(searchUrl.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${connection.access_token}`,
        },
      });

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error('Twitter search error:', errorText);
        throw new Error(`Failed to search tweets: ${errorText}`);
      }

      const searchData = await searchResponse.json();

      return new Response(JSON.stringify(searchData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'findAndSave') {
      // Step 6: Find and save relevant posts to database
      const { profileId } = requestBody;

      if (!profileId) {
        throw new Error('Profile ID is required');
      }

      // Get the user's Twitter connection
      const { data: connection, error: connectionError } = await supabase
        .from('social_connections')
        .select('access_token')
        .eq('profile_id', profileId)
        .eq('platform', 'twitter')
        .eq('is_connected', true)
        .single();

      if (connectionError || !connection) {
        throw new Error('Twitter account not connected or access token not found');
      }

      // Get user profile to build search query
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, topics_of_interest')
        .eq('id', profileId)
        .single();

      if (profileError || !profile) {
        throw new Error('Profile not found');
      }

      // Get onboarding profile for enhanced search
      let onboardingProfile = null;
      if (profile.email) {
        const { data: onboarding } = await supabase
          .from('onboarding_profiles')
          .select('user_type, domain, social_media_goal, business_description')
          .eq('email', profile.email)
          .single();
        onboardingProfile = onboarding;
      }

      // Build search query (same logic as in API)
      const searchTerms = [];
      
      // Add topics of interest
      const topics = profile.topics_of_interest || [];
      if (topics.length > 0) {
        searchTerms.push(...topics.map(topic => `"${topic}"`));
      }

      // Add onboarding profile fields
      if (onboardingProfile) {
        if (onboardingProfile.user_type) {
          searchTerms.push(`"${onboardingProfile.user_type}"`);
        }
        if (onboardingProfile.domain) {
          searchTerms.push(`"${onboardingProfile.domain}"`);
        }
        if (onboardingProfile.social_media_goal) {
          searchTerms.push(`"${onboardingProfile.social_media_goal}"`);
        }
        if (onboardingProfile.business_description) {
          const businessTerms = onboardingProfile.business_description
            .split(' ')
            .slice(0, 15)
            .filter(term => term.length > 2)
            .map(term => term.replace(/[^\w\s]/g, ''))
            .filter(term => term.length > 0)
            .map(term => `"${term}"`);
          searchTerms.push(...businessTerms);
        }
      }

      let searchQuery = '';
      if (searchTerms.length > 0) {
        searchQuery = searchTerms.join(' OR ') + ' -is:retweet -is:reply';
      } else {
        searchQuery = 'technology OR innovation OR startup -is:retweet -is:reply';
      }

      // Ensure query doesn't exceed 4096 character limit
      if (searchQuery.length > 4096) {
        const truncatedQuery = searchQuery.substring(0, 4096);
        const lastOrIndex = truncatedQuery.lastIndexOf(' OR ');
        searchQuery = lastOrIndex > 0 ? truncatedQuery.substring(0, lastOrIndex) : truncatedQuery;
        searchQuery += ' -is:retweet -is:reply';
      }

      // Search for tweets
      const searchUrl = new URL('https://api.twitter.com/2/tweets/search/recent');
      searchUrl.searchParams.set('query', searchQuery);
      searchUrl.searchParams.set('max_results', '10');
      searchUrl.searchParams.set('tweet.fields', 'created_at,author_id,context_annotations,public_metrics');
      searchUrl.searchParams.set('user.fields', 'name,username');
      searchUrl.searchParams.set('expansions', 'author_id');

      const searchResponse = await fetch(searchUrl.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${connection.access_token}`,
        },
      });

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error('Twitter search error:', errorText);
        throw new Error(`Failed to search tweets: ${errorText}`);
      }

      const searchData = await searchResponse.json();

      if (!searchData.data || searchData.data.length === 0) {
        return new Response(JSON.stringify({
          savedPosts: [],
          newPostsCount: 0,
          skippedPostsCount: 0,
          message: 'No relevant posts found for your interests.'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Save posts to relevant_posts table
      const savedPosts = [];
      let newPostsCount = 0;
      let skippedPostsCount = 0;

      for (const tweet of searchData.data) {
        const author = searchData.includes?.users?.find(user => user.id === tweet.author_id);
        
        // Check if post already exists
        const { data: existingPost } = await supabase
          .from('relevant_posts')
          .select('id')
          .eq('twitter_post_id', tweet.id)
          .single();

        if (existingPost) {
          skippedPostsCount++;
          continue;
        }

        // Determine topic based on content
        let topic = 'General';
        const content = tweet.text.toLowerCase();
        if (content.includes('ai') || content.includes('technology')) topic = 'AI & Technology';
        else if (content.includes('startup') || content.includes('business')) topic = 'Startups';
        else if (content.includes('marketing') || content.includes('content')) topic = 'Marketing';

        // Save to database
        const { data: savedPost, error: saveError } = await supabase
          .from('relevant_posts')
          .insert({
            profile_id: profileId,
            twitter_post_id: tweet.id,
            author_name: author?.name || 'Unknown',
            author_username: author?.username || 'unknown',
            author_id: tweet.author_id,
            content: tweet.text,
            twitter_url: `https://twitter.com/${author?.username}/status/${tweet.id}`,
            created_at_twitter: tweet.created_at,
            retweet_count: tweet.public_metrics?.retweet_count || 0,
            like_count: tweet.public_metrics?.like_count || 0,
            reply_count: tweet.public_metrics?.reply_count || 0,
            quote_count: tweet.public_metrics?.quote_count || 0,
            topic: topic,
            context_annotations: tweet.context_annotations || []
          })
          .select()
          .single();

        if (!saveError && savedPost) {
          savedPosts.push(savedPost);
          newPostsCount++;
        }
      }

      return new Response(JSON.stringify({
        savedPosts,
        newPostsCount,
        skippedPostsCount,
        message: newPostsCount > 0 
          ? `Found and saved ${newPostsCount} new relevant posts!`
          : `Found ${skippedPostsCount} posts but they were already saved.`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'generateResponse') {
      // Step 7: Generate AI response for a relevant post
      const { postId, profileId, tweetId } = requestBody;

      if (!postId && !tweetId) {
        throw new Error('Post ID or Tweet ID is required');
      }

      // Get the relevant post from database
      let relevantPost;
      if (postId) {
        const { data: post, error: postError } = await supabase
          .from('relevant_posts')
          .select('*')
          .eq('id', postId)
          .single();

        if (postError || !post) {
          throw new Error('Relevant post not found');
        }
        relevantPost = post;
      } else {
        // If only tweetId provided, find by twitter_post_id
        const { data: post, error: postError } = await supabase
          .from('relevant_posts')
          .select('*')
          .eq('twitter_post_id', tweetId)
          .single();

        if (postError || !post) {
          throw new Error('Relevant post not found');
        }
        relevantPost = post;
      }

      // Get user profile for context
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, topics_of_interest, ai_voice, about_context')
        .eq('id', relevantPost.profile_id)
        .single();

      if (profileError || !profile) {
        throw new Error('Profile not found');
      }

      // Get onboarding profile for additional context
      let onboardingProfile = null;
      if (profile.email) {
        const { data: onboarding } = await supabase
          .from('onboarding_profiles')
          .select('user_type, domain, social_media_goal, business_description')
          .eq('email', profile.email)
          .single();
        onboardingProfile = onboarding;
      }

      // Check for OpenAI API key
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      // Build context for AI response
      let userContext = `
User Background: ${profile.about_context || 'No specific context provided'}
Topics of Interest: ${profile.topics_of_interest?.join(', ') || 'General topics'}
Voice: ${profile.ai_voice || 'professional'}`;

      if (onboardingProfile) {
        userContext += `
User Type: ${onboardingProfile.user_type || 'Not specified'}
Domain: ${onboardingProfile.domain || 'Not specified'}
Social Media Goal: ${onboardingProfile.social_media_goal || 'Not specified'}
Business: ${onboardingProfile.business_description || 'Not specified'}`;
      }

      const systemPrompt = `You are an expert social media engagement assistant. Generate a thoughtful, professional reply to the given tweet that:

1. Is relevant and adds value to the conversation
2. Reflects the user's expertise and interests
3. Is engaging but not overly promotional
4. Stays under 280 characters
5. Uses a ${profile.ai_voice || 'professional'} tone

User Context: ${userContext}

Original Tweet: "${relevantPost.content}"

Generate ONLY the reply text, nothing else. Make it conversational and authentic.`;

      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: `Generate a reply to this tweet: "${relevantPost.content}"`
            }
          ],
          max_tokens: 100,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', errorText);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      let aiResponse = data.choices[0]?.message?.content?.trim();

      if (!aiResponse) {
        throw new Error('No response generated from OpenAI');
      }

      // Ensure response is under 280 characters
      if (aiResponse.length > 280) {
        aiResponse = aiResponse.substring(0, 277) + '...';
      }

      // Update the relevant post with the AI response
      const { error: updateError } = await supabase
        .from('relevant_posts')
        .update({ ai_response: aiResponse })
        .eq('id', relevantPost.id);

      if (updateError) {
        console.error('Error updating post with AI response:', updateError);
      }

      return new Response(JSON.stringify({ 
        aiResponse: aiResponse,
        characterCount: aiResponse.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'sendReply') {
      // Step 8: Send AI-generated reply to Twitter
      const { postId, profileId, tweetId, replyText } = requestBody;

      if (!postId && !tweetId) {
        throw new Error('Post ID or Tweet ID is required');
      }

      // Get the relevant post from database
      let relevantPost;
      if (postId) {
        const { data: post, error: postError } = await supabase
          .from('relevant_posts')
          .select('*')
          .eq('id', postId)
          .single();

        if (postError || !post) {
          throw new Error('Relevant post not found');
        }
        relevantPost = post;
      } else {
        // If only tweetId provided, find by twitter_post_id
        const { data: post, error: postError } = await supabase
          .from('relevant_posts')
          .select('*')
          .eq('twitter_post_id', tweetId)
          .single();

        if (postError || !post) {
          throw new Error('Relevant post not found');
        }
        relevantPost = post;
      }

      // Get the user's Twitter connection
      const { data: connection, error: connectionError } = await supabase
        .from('social_connections')
        .select('access_token')
        .eq('profile_id', relevantPost.profile_id)
        .eq('platform', 'twitter')
        .eq('is_connected', true)
        .single();

      if (connectionError || !connection) {
        throw new Error('Twitter account not connected or access token not found');
      }

      // Use the AI response from the post or the provided replyText
      const textToReply = replyText || relevantPost.ai_response;
      
      if (!textToReply) {
        throw new Error('No reply text available. Generate an AI response first.');
      }

      // Post the reply using Twitter API v2
      const replyResponse = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${connection.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToReply,
          reply: {
            in_reply_to_tweet_id: relevantPost.twitter_post_id
          }
        }),
      });

      if (!replyResponse.ok) {
        const errorText = await replyResponse.text();
        console.error('Twitter reply error:', errorText);
        throw new Error(`Failed to send reply: ${errorText}`);
      }

      const replyData = await replyResponse.json();

      return new Response(JSON.stringify({ 
        success: true,
        replyId: replyData.data?.id,
        replyUrl: `https://twitter.com/user/status/${replyData.data?.id}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error: any) {
    console.error('Twitter auth error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'An error occurred during Twitter authentication'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});