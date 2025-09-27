import { supabase } from './client';
import type { Database } from './types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
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

  // Create or update a social connection (fake for now)
  async updateConnection(profileId: string, platform: string, isConnected: boolean = true): Promise<SocialConnection> {
    const connectionData = {
      // Fake connection data for demo
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
  async createDraftPost(profileId: string, content: string, platform: string = 'twitter') {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        profile_id: profileId,
        content,
        platform,
        status: 'draft'
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
  }
};
