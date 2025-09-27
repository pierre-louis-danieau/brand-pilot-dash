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