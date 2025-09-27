/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Twitter OAuth 2.0 endpoints
const TWITTER_AUTH_URL = 'https://twitter.com/i/oauth2/authorize';
const TWITTER_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';
const TWITTER_USERINFO_URL = 'https://api.twitter.com/2/users/me';
const TWITTER_POST_URL = 'https://api.twitter.com/2/tweets';
const TWITTER_SEARCH_URL = 'https://api.twitter.com/2/tweets/search/recent';

// Rate limiting constants
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes in milliseconds
const MAX_SEARCH_REQUESTS = 300; // Twitter allows 300 requests per 15-minute window

// In-memory cache for rate limiting (in production, use Redis or similar)
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(profileId: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const key = `search_${profileId}`;
  const limit = rateLimitCache.get(key);
  
  if (!limit || now > limit.resetTime) {
    // Reset or initialize rate limit
    rateLimitCache.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }
  
  if (limit.count >= MAX_SEARCH_REQUESTS) {
    return { allowed: false, resetTime: limit.resetTime };
  }
  
  // Increment count
  limit.count += 1;
  rateLimitCache.set(key, limit);
  return { allowed: true };
}

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
  
  let requestBody = {};
  if (req.method === 'POST') {
    try {
      requestBody = await req.json();
      action = requestBody.action || action;
    } catch (error) {
      // Handle cases where there's no JSON body
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

      // Store code verifier and state temporarily (you might want to use a more secure storage)
      const authData = {
        code_verifier: codeVerifier,
        state: state,
        profile_id: profileId
      };

      // Store in a temporary table or use a different approach
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
      const tempConnection = tempConnections?.find(conn => {
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
        console.error('Token data:', tokenData);
        console.error('User data:', userData);
        console.error('Auth data:', authData);
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
      // Step 4: Post a tweet
      const { profileId, tweet } = requestBody;

      const { data: connections, error: retrieveError } = await supabase
        .from('social_connections')
        .select('*')
        .eq('profile_id', profileId)
        .eq('platform', 'twitter');

      if (retrieveError) {
        console.error('Error retrieving connections:', retrieveError);
        throw new Error('Failed to retrieve Twitter connection');
      }

      const connection = connections?.[0];

      if (!connection || !connection.access_token) {
        console.error('No Twitter connection found or access token is missing');
        throw new Error('Twitter connection is not established or access token is missing');
      }

      const accessToken = connection.access_token;

      const postResponse = await fetch(TWITTER_POST_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          text: tweet,
        }),
      });

      if (!postResponse.ok) {
        const errorText = await postResponse.text();
        console.error('Twitter post error:', errorText);
        throw new Error(`Failed to post tweet: ${errorText}`);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'search') {
      // Step 5: Search recent tweets with rate limiting
      const { profileId, query, maxResults = 10 } = requestBody;

      // Check rate limit first
      const rateLimitCheck = checkRateLimit(profileId);
      if (!rateLimitCheck.allowed) {
        const resetTime = new Date(rateLimitCheck.resetTime!);
        throw new Error(`Rate limit exceeded. Try again after ${resetTime.toLocaleTimeString()}`);
      }

      const { data: connections, error: retrieveError } = await supabase
        .from('social_connections')
        .select('*')
        .eq('profile_id', profileId)
        .eq('platform', 'twitter');

      if (retrieveError) {
        console.error('Error retrieving connections:', retrieveError);
        throw new Error('Failed to retrieve Twitter connection');
      }

      const connection = connections?.[0];

      if (!connection || !connection.access_token) {
        console.error('No Twitter connection found or access token is missing');
        throw new Error('Twitter connection is not established or access token is missing');
      }

      const accessToken = connection.access_token;

      // Build search URL with parameters
      const searchUrl = new URL(TWITTER_SEARCH_URL);
      searchUrl.searchParams.set('query', query);
      searchUrl.searchParams.set('max_results', Math.max(10, maxResults).toString()); // Ensure minimum 10
      searchUrl.searchParams.set('tweet.fields', 'created_at,author_id,public_metrics,context_annotations');
      searchUrl.searchParams.set('user.fields', 'name,username,profile_image_url,verified');
      searchUrl.searchParams.set('expansions', 'author_id');

      try {
        const searchResponse = await fetch(searchUrl.toString(), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!searchResponse.ok) {
          const errorText = await searchResponse.text();
          console.error('Twitter search error:', errorText);
          
          // Handle specific rate limit error
          if (searchResponse.status === 429) {
            // Mark this profile as rate limited
            const resetTime = Date.now() + (15 * 60 * 1000); // 15 minutes from now
            rateLimitCache.set(`search_${profileId}`, { 
              count: MAX_SEARCH_REQUESTS, 
              resetTime 
            });
            throw new Error('Twitter API rate limit reached. Please wait 15 minutes before trying again.');
          }
          
          throw new Error(`Failed to search tweets: ${errorText}`);
        }

        const searchData = await searchResponse.json();

        return new Response(JSON.stringify(searchData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (fetchError) {
        console.error('Fetch error during Twitter search:', fetchError);
        throw new Error(`Network error during Twitter search: ${fetchError.message}`);
      }

    } else if (action === 'findAndSave') {
      // New action: Find a relevant post and save it to database
      const { profileId } = requestBody;

      // Check rate limit first
      const rateLimitCheck = checkRateLimit(profileId);
      if (!rateLimitCheck.allowed) {
        const resetTime = new Date(rateLimitCheck.resetTime!);
        throw new Error(`Rate limit exceeded. Try again after ${resetTime.toLocaleTimeString()}`);
      }

      // Get user's profile and topics of interest
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('topics_of_interest')
        .eq('id', profileId)
        .single();

      if (profileError || !profile) {
        throw new Error('Failed to fetch user profile');
      }

      const topics = profile.topics_of_interest || ['technology', 'business'];
      const query = topics.join(' OR ');

      // Get Twitter connection
      const { data: connections, error: retrieveError } = await supabase
        .from('social_connections')
        .select('*')
        .eq('profile_id', profileId)
        .eq('platform', 'twitter');

      if (retrieveError) {
        throw new Error('Failed to retrieve Twitter connection');
      }

      const connection = connections?.[0];
      if (!connection || !connection.access_token) {
        throw new Error('Twitter connection is not established');
      }

      // Search for tweets
      const searchUrl = new URL(TWITTER_SEARCH_URL);
      searchUrl.searchParams.set('query', `(${query}) -is:retweet lang:en`);
      searchUrl.searchParams.set('max_results', '10');
      searchUrl.searchParams.set('tweet.fields', 'created_at,author_id,public_metrics,context_annotations');
      searchUrl.searchParams.set('user.fields', 'name,username');
      searchUrl.searchParams.set('expansions', 'author_id');

      try {
        const searchResponse = await fetch(searchUrl.toString(), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${connection.access_token}`,
          },
        });

        if (!searchResponse.ok) {
          if (searchResponse.status === 429) {
            const resetTime = Date.now() + (15 * 60 * 1000);
            rateLimitCache.set(`search_${profileId}`, { 
              count: MAX_SEARCH_REQUESTS, 
              resetTime 
            });
            throw new Error('Twitter API rate limit reached. Please wait 15 minutes before trying again.');
          }
          const errorText = await searchResponse.text();
          throw new Error(`Failed to search tweets: ${errorText}`);
        }

        const searchData = await searchResponse.json();
        
        if (!searchData.data || searchData.data.length === 0) {
          throw new Error('No relevant posts found for your topics');
        }

        // Get the first post that hasn't been saved yet
        for (const tweet of searchData.data) {
          // Check if this post is already saved
          const { data: existingPost } = await supabase
            .from('relevant_posts')
            .select('id')
            .eq('profile_id', profileId)
            .eq('twitter_post_id', tweet.id)
            .single();

          if (existingPost) {
            continue; // Skip if already saved
          }

          // Find the author info
          const author = searchData.includes?.users?.find((user: any) => user.id === tweet.author_id);
          
          if (!author) continue;

          // Determine topic
          let topic = 'General';
          if (tweet.context_annotations && tweet.context_annotations.length > 0) {
            topic = tweet.context_annotations[0].domain.name;
          } else {
            const content = tweet.text.toLowerCase();
            if (content.includes('ai') || content.includes('artificial intelligence')) topic = 'AI & Technology';
            else if (content.includes('startup') || content.includes('entrepreneur')) topic = 'Startups';
            else if (content.includes('marketing') || content.includes('brand')) topic = 'Marketing';
          }

          // Save the post
          const { data: savedPost, error: saveError } = await supabase
            .from('relevant_posts')
            .insert({
              profile_id: profileId,
              twitter_post_id: tweet.id,
              author_name: author.name,
              author_username: author.username,
              author_id: tweet.author_id,
              content: tweet.text,
              twitter_url: `https://twitter.com/${author.username}/status/${tweet.id}`,
              created_at_twitter: tweet.created_at,
              retweet_count: tweet.public_metrics?.retweet_count || 0,
              like_count: tweet.public_metrics?.like_count || 0,
              reply_count: tweet.public_metrics?.reply_count || 0,
              quote_count: tweet.public_metrics?.quote_count || 0,
              topic: topic,
              context_annotations: tweet.context_annotations || null
            })
            .select()
            .single();

          if (saveError) {
            console.error('Error saving post:', saveError);
            continue;
          }

          return new Response(JSON.stringify(savedPost), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // If we get here, all posts were already saved
        throw new Error('All found posts are already in your collection');

      } catch (fetchError) {
        console.error('Error in findAndSave:', fetchError);
        throw fetchError;
      }

    } else {
      throw new Error('Invalid action parameter');
    }

  } catch (error: any) {
    console.error('Twitter auth error:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});