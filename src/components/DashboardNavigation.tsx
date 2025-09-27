import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Bell, User, Zap, Twitter, MessageCircle, LogOut } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";

interface DashboardNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DashboardNavigation = ({ activeTab, setActiveTab }: DashboardNavigationProps) => {
  const [showSettings, setShowSettings] = useState(false);
  const [activePlatform, setActivePlatform] = useState("twitter");
  const [userContext, setUserContext] = useState("");
  const [postPreferences, setPostPreferences] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedGoal, setSelectedGoal] = useState("personal_branding");
  const [selectedVoice, setSelectedVoice] = useState("professional");

  const { profile, loading, updateProfile, userInfo, logout } = useProfile();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Update local state when profile loads
  useEffect(() => {
    if (profile) {
      setUserContext(profile.about_context || "");
      setPostPreferences(profile.post_preferences || "");
      setSelectedTopics(profile.topics_of_interest || ["AI & Technology", "Startups"]);
      setSelectedGoal(profile.goal || "personal_branding");
      setSelectedVoice(profile.ai_voice || "professional");
    }
  }, [profile]);

  const handleSaveSettings = async () => {
    try {
      await updateProfile({
        about_context: userContext,
        post_preferences: postPreferences,
        topics_of_interest: selectedTopics,
        goal: selectedGoal,
        ai_voice: selectedVoice
      });

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getGoalDisplay = (goal: string | null) => {
    switch (goal) {
      case 'personal_branding':
        return 'Develop personal branding';
      case 'startup_promotion':
        return 'Startup promotion';
      default:
        return 'Develop personal branding';
    }
  };

  const getVoiceDisplay = (voice: string | null) => {
    switch (voice) {
      case 'professional':
        return 'Professional';
      case 'friendly':
        return 'Friendly';
      case 'witty':
        return 'Witty';
      default:
        return 'Professional';
    }
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
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-5 w-5" />
            </Button>
            
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

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-secondary/30 border-b border-border px-6 py-6">
          <div className="max-w-4xl">
            <h3 className="font-medium text-foreground mb-4">Settings & Preferences</h3>
            
            {/* Basic Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6">
              <div>
                <label className="text-muted-foreground">Topics:</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedTopics.map((topic, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">{topic}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-muted-foreground">Goal:</label>
                <p className="text-foreground">{getGoalDisplay(selectedGoal)}</p>
              </div>
              <div>
                <label className="text-muted-foreground">AI Voice:</label>
                <p className="text-foreground">{getVoiceDisplay(selectedVoice)}</p>
              </div>
            </div>
            
            {/* Content Preferences */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  About You & Your Business
                </label>
                <Textarea
                  placeholder="Tell us about yourself, your business, your expertise, and what makes you unique. This helps us create more relevant content for you..."
                  value={userContext}
                  onChange={(e) => setUserContext(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Post Preferences & Style
                </label>
                <Textarea
                  placeholder="Describe the type of posts you want to create or react to. Include tone, topics to avoid, preferred formats (threads, single tweets, etc.), and any specific messaging guidelines..."
                  value={postPreferences}
                  onChange={(e) => setPostPreferences(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              
              <Button 
                size="sm" 
                onClick={handleSaveSettings}
                className="w-fit"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Platform Selection */}
      <nav className="bg-card border-b border-border px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant={activePlatform === "twitter" ? "default" : "outline"}
              size="sm"
              onClick={() => setActivePlatform("twitter")}
              className="flex items-center space-x-2"
            >
              <Twitter className="h-4 w-4" />
              <span>Twitter</span>
              <Badge variant="secondary" className="text-xs ml-1">Connected</Badge>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast({
                  title: "Coming Soon!",
                  description: "LinkedIn integration will be available soon. Stay tuned!",
                });
              }}
              className="flex items-center space-x-2 relative"
            >
              <MessageCircle className="h-4 w-4" />
              <span>LinkedIn</span>
              <Badge variant="outline" className="text-xs ml-1 bg-yellow-100 text-yellow-800 border-yellow-300">
                Soon
              </Badge>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast({
                  title: "Coming Soon!",
                  description: "Reddit integration will be available soon. Stay tuned!",
                });
              }}
              className="flex items-center space-x-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Reddit</span>
              <Badge variant="outline" className="text-xs ml-1 bg-yellow-100 text-yellow-800 border-yellow-300">
                Soon
              </Badge>
            </Button>
          </div>
        </div>
      </nav>

      {/* Content Type Navigation - Only show when Twitter is active */}
      {activePlatform === "twitter" && (
        <nav className="bg-secondary/20 border-b border-border px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="bg-card rounded-lg p-1 shadow-sm border">
              <div className="flex space-x-1">
                <Button
                  variant={activeTab === "relevant" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("relevant")}
                  className="px-6 py-2"
                >
                  📈 Relevant Posts
                </Button>
                <Button
                  variant={activeTab === "drafted" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("drafted")}
                  className="px-6 py-2"
                >
                  ✍️ Drafted Posts
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