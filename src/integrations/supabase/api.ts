import { supabase } from './client';
import type { Database } from './types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
type OnboardingProfile = Database['public']['Tables']['onboarding_profiles']['Row'];
type OnboardingProfileUpdate = Database['public']['Tables']['onboarding_profiles']['Update'];
type SocialConnection = Database['public']['Tables']['social_connections']['Row'];
type SocialConnectionInsert = Database['public']['Tables']['social_connections']['Insert'];

// Profile API functions
export const profileApi = {
  // Get existing profile by email
  async getProfileByEmail(email: string): Promise<Profile | null> {
    const { data: existingProfile, error: getError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (getError && getError.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(`Failed to fetch profile: ${getError.message}`);
    }

    return existingProfile || null;
  },

  // Create a new profile
  async createProfile(email: string, initialData: Partial<ProfileInsert> = {}): Promise<Profile> {
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        email,
        ai_voice: 'professional',
        goal: 'personal_branding',
        topics_of_interest: ['AI & Technology', 'Startups'],
        ...initialData
      })
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create profile: ${createError.message}`);
    }

    return newProfile;
  },

  // Get or create a profile (for demo purposes, we'll use a hardcoded email)
  async getOrCreateProfile(email: string = 'demo@brandpilot.com'): Promise<Profile> {
    // First try to get existing profile
    const existingProfile = await this.getProfileByEmail(email);
    
    if (existingProfile) {
      return existingProfile;
    }

    // If no profile exists, create one
    return await this.createProfile(email);
  },

  // Update profile settings
  async updateProfile(profileId: string, updates: ProfileUpdate): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profileId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return data;
  },

  // Get profile by ID
  async getProfile(profileId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }
};

// Onboarding Profile API functions
export const onboardingProfileApi = {
  // Get onboarding profile by email
  async getOnboardingProfileByEmail(email: string): Promise<OnboardingProfile | null> {
    const { data, error } = await supabase
      .from('onboarding_profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(`Failed to fetch onboarding profile: ${error.message}`);
    }

    return data || null;
  },

  // Update onboarding profile
  async updateOnboardingProfile(profileId: string, updates: OnboardingProfileUpdate): Promise<OnboardingProfile> {
    const { data, error } = await supabase
      .from('onboarding_profiles')
      .update(updates)
      .eq('id', profileId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update onboarding profile: ${error.message}`);
    }

    return data;
  },

  // Get onboarding profile by ID
  async getOnboardingProfile(profileId: string): Promise<OnboardingProfile | null> {
    const { data, error } = await supabase
      .from('onboarding_profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (error) {
      console.error('Error fetching onboarding profile:', error);
      return null;
    }

    return data;
  }
};

// Social connections API functions
export const socialConnectionsApi = {
  // Get all social connections for a profile
  async getConnections(profileId: string): Promise<SocialConnection[]> {
    const { data, error } = await supabase
      .from('social_connections')
      .select('*')
      .eq('profile_id', profileId);

    if (error) {
      throw new Error(`Failed to fetch connections: ${error.message}`);
    }

    return data || [];
  },

  // Create or update a social connection
  async updateConnection(profileId: string, platform: string, isConnected: boolean = true): Promise<SocialConnection> {
    // For Twitter, use real OAuth flow
    if (platform === 'twitter' && isConnected) {
      throw new Error('Use connectTwitter() for real Twitter authentication');
    }

    const connectionData = {
      // Fake connection data for other platforms
      username: platform === 'twitter' ? '@johndoe' : 'johndoe',
      followers: Math.floor(Math.random() * 10000) + 1000,
      connected_at: new Date().toISOString()
    };

    // First check if connection already exists
    const { data: existingConnection } = await supabase
      .from('social_connections')
      .select('*')
      .eq('profile_id', profileId)
      .eq('platform', platform)
      .maybeSingle();

    if (existingConnection) {
      // Update existing connection
      const { data, error } = await supabase
        .from('social_connections')
        .update({
          is_connected: isConnected,
          connection_data: connectionData
        })
        .eq('profile_id', profileId)
        .eq('platform', platform)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update connection: ${error.message}`);
      }
      return data;
    } else {
      // Create new connection
      const { data, error } = await supabase
        .from('social_connections')
        .insert({
          profile_id: profileId,
          platform,
          is_connected: isConnected,
          connection_data: connectionData
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create connection: ${error.message}`);
      }
      return data;
    }
  },

  // Check if a platform is connected
  async isConnected(profileId: string, platform: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('social_connections')
      .select('is_connected')
      .eq('profile_id', profileId)
      .eq('platform', platform)
      .single();

    if (error) {
      return false;
    }

    return data?.is_connected || false;
  },

  // Get Twitter connection details
  async getTwitterConnection(profileId: string): Promise<SocialConnection | null> {
    const { data, error } = await supabase
      .from('social_connections')
      .select('*')
      .eq('profile_id', profileId)
      .eq('platform', 'twitter')
      .eq('is_connected', true)
      .single();

    if (error) {
      return null;
    }

    return data;
  },

  // Connect to Twitter using OAuth 2.0
  async connectTwitter(profileId: string): Promise<{ authUrl: string }> {
    const { data, error } = await supabase.functions.invoke('twitter-auth', {
      body: { 
        profileId,
        action: 'authorize'
      }
    });
    
    if (error) {
      throw new Error(error.message || 'Failed to initiate Twitter connection');
    }
    
    return data;
  },

  // Disconnect Twitter account
  async disconnectTwitter(profileId: string): Promise<void> {
    const { error } = await supabase.functions.invoke('twitter-auth', {
      body: { 
        profileId,
        action: 'disconnect'
      }
    });
    
    if (error) {
      throw new Error(error.message || 'Failed to disconnect Twitter');
    }
  },

  // Post a tweet to Twitter
  async postToTwitter(profileId: string, tweet: string): Promise<void> {
    const { error } = await supabase.functions.invoke('twitter-auth', {
      body: { 
        profileId,
        tweet,
        action: 'post'
      }
    });
    
    if (error) {
      throw new Error(error.message || 'Failed to post tweet');
    }
  },

  // Search recent posts on Twitter based on user profile
  async searchRecentPosts(profileId: string, maxResults: number = 1): Promise<any> {
    // First get the user's profile to understand their interests
    const profile = await profileApi.getProfile(profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Get onboarding profile data for enhanced search context
    let onboardingProfile = null;
    if (profile.email) {
      onboardingProfile = await onboardingProfileApi.getOnboardingProfileByEmail(profile.email);
    }

    // Build comprehensive search query using multiple data sources
    const searchTerms: string[] = [];

    // Add topics of interest from profile
    const topics = profile.topics_of_interest || [];
    if (topics.length > 0) {
      searchTerms.push(...topics.map(topic => `"${topic}"`));
    }

    // Add onboarding profile fields if available
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
        // Extract key terms from business description (more comprehensive extraction)
        const businessTerms = onboardingProfile.business_description
          .split(' ')
          .slice(0, 15) // Take first 15 words instead of 5 for more context
          .filter(term => term.length > 2) // Include words longer than 2 characters (instead of 3)
          .map(term => term.replace(/[^\w\s]/g, '')) // Remove punctuation
          .filter(term => term.length > 0) // Remove empty strings after punctuation removal
          .map(term => `"${term}"`);
        searchTerms.push(...businessTerms);
      }
    }

    // Build search query with OR operators
    let searchQuery = '';
    if (searchTerms.length > 0) {
      searchQuery = searchTerms.join(' OR ') + ' -is:retweet -is:reply';
    } else {
      // Fallback if no terms available
      searchQuery = 'technology OR innovation OR startup -is:retweet -is:reply';
    }

    // Ensure query doesn't exceed Twitter's 4096 character limit
    const maxQueryLength = 4096;
    if (searchQuery.length > maxQueryLength) {
      // Truncate query to fit within limit, ensuring we don't break in the middle of a term
      const truncatedQuery = searchQuery.substring(0, maxQueryLength);
      const lastOrIndex = truncatedQuery.lastIndexOf(' OR ');
      searchQuery = lastOrIndex > 0 ? truncatedQuery.substring(0, lastOrIndex) : truncatedQuery;
      searchQuery += ' -is:retweet -is:reply'; // Ensure filters are always included
    }

    console.log('Enhanced search query:', searchQuery);
    console.log('Query length:', searchQuery.length);

    const { data, error } = await supabase.functions.invoke('twitter-auth', {
      body: { 
        profileId,
        query: searchQuery,
        maxResults,
        action: 'search'
      }
    });
    
    if (error) {
      throw new Error(error.message || 'Failed to search recent posts');
    }

    return data;
  },

  // Generate AI response for a tweet
  async generateAIResponse(profileId: string, tweetId: string) {
    const { data, error } = await supabase.functions.invoke('twitter-auth', {
      body: {
        action: 'generateResponse',
        profileId: profileId,
        tweetId: tweetId
      }
    });

    if (error) {
      throw new Error(`Failed to generate AI response: ${error.message}`);
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  },

  // Send AI-generated reply to Twitter
  async sendReply(profileId: string, tweetId: string, replyText: string) {
    const { data, error } = await supabase.functions.invoke('twitter-auth', {
      body: {
        action: 'sendReply',
        profileId: profileId,
        tweetId: tweetId,
        replyText: replyText
      }
    });

    if (error) {
      throw new Error(`Failed to send reply: ${error.message}`);
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  }
};

// Posts API functions
export const postsApi = {
  // Get all drafted posts for a profile
  async getDraftedPosts(profileId: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('profile_id', profileId)
      .eq('status', 'draft')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch drafted posts: ${error.message}`);
    }

    return data || [];
  },

  // Create a new drafted post
  async createDraftPost(profileId: string, content: string, platform: string = 'twitter', url?: string) {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        profile_id: profileId,
        content,
        platform,
        status: 'draft',
        url: url || null
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create draft post: ${error.message}`);
    }

    return data;
  },

  // Update post status (e.g., mark as published)
  async updatePostStatus(postId: string, status: 'draft' | 'published') {
    const { data, error } = await supabase
      .from('posts')
      .update({ status })
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update post status: ${error.message}`);
    }

    return data;
  },

  // Delete a post
  async deletePost(postId: string) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      throw new Error(`Failed to delete post: ${error.message}`);
    }

    return true;
  },

  // Update post content
  async updatePostContent(postId: string, content: string) {
    const { data, error } = await supabase
      .from('posts')
      .update({ content })
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update post content: ${error.message}`);
    }

    return data;
  },

  // Generate content using external API and save to database
  async generateAndSavePosts(profileId: string): Promise<{ posts: any[], url_article?: string }> {
    // First get the user's profile data
    const profile = await profileApi.getProfile(profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Get onboarding profile data for additional context
    let onboardingProfile = null;
    if (profile.email) {
      onboardingProfile = await onboardingProfileApi.getOnboardingProfileByEmail(profile.email);
    }

    // Build topics_of_interest array including user_type and domain from onboarding
    let topics_of_interest = profile.topics_of_interest || [];
    if (onboardingProfile) {
      if (onboardingProfile.user_type) {
        topics_of_interest.push(onboardingProfile.user_type);
      }
      if (onboardingProfile.domain) {
        topics_of_interest.push(onboardingProfile.domain);
      }
    }

    // Prepare the payload for the external API
    const payload = {
      topics_of_interest: topics_of_interest,
      ai_voice: 'professional', // Default voice for all API requests
      about_context: onboardingProfile?.social_media_goal || '',
      post_preference: onboardingProfile?.business_description || ''
    };

    console.log('Calling external API with payload:', payload);

    try {
      // Call the external API
      const response = await fetch('https://backend-smqp.onrender.com/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('API Response data:', result);
      
      if (!result.contents || !Array.isArray(result.contents)) {
        console.error('Invalid response format:', result);
        throw new Error('Invalid response format from external API');
      }

      // Save each generated post to the database
      const savedPosts = await Promise.all(
        result.contents.map(async (content: string) => {
          return await this.createDraftPost(profileId, content, 'twitter', result.url_content);
        })
      );

      return {
        posts: savedPosts,
        url_article: result.url_content
      };
    } catch (error) {
      console.error('Full error details:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          throw new Error('Failed to generate content: Network error. Please check your internet connection and try again.');
        }
        throw new Error(`Failed to generate content: ${error.message}`);
      }
      throw new Error('Failed to generate content: Unknown error');
    }
  },

  // Generate AI post using OpenAI
  async generateAIPost(profileId: string, prompt: string, tone: string, length: string): Promise<{ post: string; characterCount: number }> {
    const { data, error } = await supabase.functions.invoke('generate-post', {
      body: {
        prompt,
        tone,
        length,
        profileId
      }
    });

    if (error) {
      throw new Error(`Failed to generate AI post: ${error.message}`);
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  },
};

// Relevant Posts API functions
export const relevantPostsApi = {
  // Get all relevant posts for a profile
  async getRelevantPosts(profileId: string) {
    console.log('API: Getting relevant posts for profile:', profileId);
    
    // Check current user auth
    const { data: { user } } = await supabase.auth.getUser();
    console.log('API: Current authenticated user:', user?.id);
    console.log('API: Profile ID vs Auth ID match:', profileId === user?.id);
    
    // Test 1: Count total rows (this should work even with RLS)
    const { count, error: countError } = await supabase
      .from('relevant_posts' as any)
      .select('*', { count: 'exact', head: true });
    console.log('API: Total row count in relevant_posts table:', { count, countError });
    
    // Test 2: Our actual query
    const { data, error } = await supabase
      .from('relevant_posts' as any)
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    console.log('API: Main query result:', { data, error });
    console.log('API: Query details - searching for profileId:', profileId, 'authenticated as user.id:', user?.id);

    if (error) {
      console.error('API: Failed to fetch relevant posts:', error);
      throw new Error(`Failed to fetch relevant posts: ${error.message}`);
    }

    console.log('API: Returning posts:', data || []);
    return data || [];
  },

  // Find and save a new relevant post
  async findAndSaveRelevantPost(profileId: string) {
    const { data, error } = await supabase.functions.invoke('twitter-auth', {
      body: {
        action: 'findAndSave',
        profileId: profileId
      }
    });

    if (error) {
      throw new Error(`Failed to find and save relevant post: ${error.message}`);
    }

    if (data.error) {
      throw new Error(data.error);
    }

    // Return the response which now contains multiple posts
    return data;
  },

  // Delete a relevant post
  async deleteRelevantPost(postId: string) {
    const { error } = await supabase
      .from('relevant_posts' as any)
      .delete()
      .eq('id', postId);

    if (error) {
      throw new Error(`Failed to delete relevant post: ${error.message}`);
    }

    return true;
  },

  // Generate AI response for a specific post
  async generateAIResponse(postId: string) {
    const { data, error } = await supabase.functions.invoke('twitter-auth', {
      body: {
        action: 'generateResponse',
        postId: postId
      }
    });

    if (error) {
      throw new Error(`Failed to generate AI response: ${error.message}`);
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  },

  // Send reply to Twitter
  async sendReply(postId: string) {
    const { data, error } = await supabase.functions.invoke('twitter-auth', {
      body: {
        action: 'sendReply',
        postId: postId
      }
    });

    if (error) {
      throw new Error(`Failed to send reply: ${error.message}`);
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  },
};

// Onboarding API functions

export const onboardingApi = {
  createOnboardingProfile: async (profileData: {
    email: string;
    name: string;
    username?: string;
    user_type: 'freelancer' | 'startup_founder';
    domain: string;
    social_media_goal: 'find_clients' | 'personal_branding' | 'for_fund';
    business_description: string;
  }): Promise<OnboardingProfile> => {
    const { data, error } = await supabase
      .from('onboarding_profiles')
      .insert(profileData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  getOnboardingProfileByEmail: async (email: string): Promise<OnboardingProfile | null> => {
    const { data, error } = await supabase
      .from('onboarding_profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },
};
