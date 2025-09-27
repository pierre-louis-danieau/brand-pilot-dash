import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Zap, Twitter, MessageCircle, LogOut } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import ProfileSettingsDialog from "./ProfileSettingsDialog";
import { onboardingProfileApi } from "@/integrations/supabase/api";
import type { Database } from "@/integrations/supabase/types";

type OnboardingProfile = Database['public']['Tables']['onboarding_profiles']['Row'];

interface DashboardNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  comingSoonPlatform: string | null;
  activePlatform: string;
}

const DashboardNavigation = ({ activeTab, setActiveTab, comingSoonPlatform, activePlatform }: DashboardNavigationProps) => {
  const [onboardingProfile, setOnboardingProfile] = useState<OnboardingProfile | null>(null);

  const { profile, loading, updateProfile, userInfo, logout } = useProfile();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Load onboarding profile when component mounts
  useEffect(() => {
    const loadOnboardingProfile = async () => {
      if (userInfo?.email) {
        try {
          const onboardingData = await onboardingProfileApi.getOnboardingProfileByEmail(userInfo.email);
          setOnboardingProfile(onboardingData);
        } catch (error) {
          console.error('Error loading onboarding profile:', error);
        }
      }
    };

    loadOnboardingProfile();
  }, [userInfo?.email]);

  const handleProfileUpdate = (updatedProfile: OnboardingProfile) => {
    setOnboardingProfile(updatedProfile);
  };

  if (loading) {
    return (
      <nav className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={handleLogoClick}>
            <div className="h-8 w-8 bg-hero-gradient rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">BrandPilot</span>
          </div>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Top Navigation */}
      <nav className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={handleLogoClick}>
            <div className="h-8 w-8 bg-hero-gradient rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">BrandPilot</span>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            <ProfileSettingsDialog 
              profile={onboardingProfile}
              onProfileUpdate={handleProfileUpdate}
            />
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-3 cursor-pointer" onClick={handleLogout}>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-white text-sm font-medium">
                  {userInfo?.name ? userInfo.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">
                {userInfo?.name || 'User'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Content Type Navigation - Only show when Twitter is active */}
      {activePlatform === "twitter" && !comingSoonPlatform && (
        <nav className="bg-secondary/20 border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="bg-card rounded-lg p-1 shadow-sm border">
              <div className="flex space-x-1">
                <Button
                  variant={activeTab === "relevant" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("relevant")}
                  className="px-6 py-2"
                >
                  💬 Social Engagement
                </Button>
                <Button
                  variant={activeTab === "drafted" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("drafted")}
                  className="px-6 py-2"
                >
                  📰 Content Studio
                </Button>
                <Button
                  variant={activeTab === "ai-creator" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("ai-creator")}
                  className="px-6 py-2"
                >
                  ✨ AI Creator
                </Button>
              </div>
            </div>
            
            <div className="bg-card rounded-lg p-1 shadow-sm border">
              <div className="flex space-x-1">
                <Button
                  variant={activeTab === "connections" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("connections")}
                  className="px-6 py-2"
                >
                  🔗 Connections
                </Button>
              </div>
            </div>
          </div>
        </nav>
      )}
    </>
  );
};

export default DashboardNavigation;