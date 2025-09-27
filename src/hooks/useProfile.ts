import { useState, useEffect } from 'react';
import { profileApi, socialConnectionsApi } from '@/integrations/supabase/api';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

interface UserInfo {
  email: string;
  name: string;
  profileId: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize profile on mount
  useEffect(() => {
    initializeProfile();
  }, []);

  const initializeProfile = async () => {
    try {
      setLoading(true);
      
      // Check if user info exists in localStorage
      const storedUserInfo = localStorage.getItem('brandpilot_user');
      
      if (storedUserInfo) {
        // User has logged in, load their profile
        const userInfo: UserInfo = JSON.parse(storedUserInfo);
        setUserInfo(userInfo);
        
        const userProfile = await profileApi.getOrCreateProfile(userInfo.email);
        setProfile(userProfile);
        setIsAuthenticated(true);
        
        // Remove fake Twitter connection - users will connect manually in dashboard
      } else {
        // No user logged in
        setProfile(null);
        setUserInfo(null);
        setIsAuthenticated(false);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      console.error('Profile initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: ProfileUpdate) => {
    if (!profile) {
      throw new Error('No profile loaded');
    }

    try {
      setLoading(true);
      const updatedProfile = await profileApi.updateProfile(profile.id, updates);
      setProfile(updatedProfile);
      setError(null);
      return updatedProfile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!profile) return;
    
    try {
      const refreshedProfile = await profileApi.getProfile(profile.id);
      if (refreshedProfile) {
        setProfile(refreshedProfile);
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const login = (newProfile: Profile, userData: { email: string; name: string }) => {
    setProfile(newProfile);
    setUserInfo({
      email: userData.email,
      name: userData.name,
      profileId: newProfile.id
    });
    setIsAuthenticated(true);
    
    // Store in localStorage
    localStorage.setItem('brandpilot_user', JSON.stringify({
      email: userData.email,
      name: userData.name,
      profileId: newProfile.id
    }));
  };

  const logout = () => {
    localStorage.removeItem('brandpilot_user');
    setProfile(null);
    setUserInfo(null);
    setIsAuthenticated(false);
    setError(null);
  };

  return {
    profile,
    userInfo,
    loading,
    error,
    isAuthenticated,
    updateProfile,
    refreshProfile,
    initializeProfile,
    login,
    logout
  };
};
