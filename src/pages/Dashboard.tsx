import { useState, useEffect } from "react";
import DashboardNavigation from "@/components/DashboardNavigation";
import SocialMediaSidebar from "@/components/SocialMediaSidebar";
import RelevantPosts from "@/components/RelevantPosts";
import DraftedPostsWithTwitterCheck from "@/components/DraftedPostsWithTwitterCheck";
import AICreatorWithTwitterCheck from "@/components/AICreatorWithTwitterCheck";
import TwitterConnection from "@/components/TwitterConnection";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("drafted");
  const [activePlatform, setActivePlatform] = useState("twitter");
  const [comingSoonPlatform, setComingSoonPlatform] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { isAuthenticated, loading } = useProfile();
  const navigate = useNavigate();

  // Check for Twitter connection success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('twitter_connected') === 'true') {
      toast({
        title: "Twitter Connected!",
        description: "Your Twitter account has been connected successfully.",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Listen for custom event to switch to connections tab
    const handleSwitchToConnections = () => {
      setActiveTab("connections");
    };

    window.addEventListener('switchToConnections', handleSwitchToConnections);
    
    return () => {
      window.removeEventListener('switchToConnections', handleSwitchToConnections);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 bg-hero-gradient rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="h-5 w-5 text-white animate-spin">⚡</div>
          </div>
          <p className="text-muted-foreground">Loading BrandPilot...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        comingSoonPlatform={comingSoonPlatform}
        activePlatform={activePlatform}
      />
      
      <div className="flex">
        <SocialMediaSidebar
          activePlatform={activePlatform}
          setActivePlatform={setActivePlatform}
          comingSoonPlatform={comingSoonPlatform}
          setComingSoonPlatform={setComingSoonPlatform}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
        
        <main className="flex-1 px-6 py-8">
          {/* Coming Soon Message for other platforms */}
          {comingSoonPlatform && comingSoonPlatform !== "twitter" && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {comingSoonPlatform === "linkedin" ? "LinkedIn" : "Reddit"} Integration Coming Soon!
                </h3>
                <p className="text-muted-foreground">
                  We're working hard to bring you {comingSoonPlatform === "linkedin" ? "LinkedIn" : "Reddit"} integration. 
                  Stay tuned for updates!
                </p>
              </div>
            </div>
          )}
          
          {/* Only show content tabs when not on a coming soon platform */}
          {!comingSoonPlatform && (
            <>
              {activeTab === "relevant" && <RelevantPosts />}
              
              {activeTab === "drafted" && <DraftedPostsWithTwitterCheck />}
              
              {activeTab === "ai-creator" && <AICreatorWithTwitterCheck />}
              
              {activeTab === "connections" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Social Connections</h2>
                    <p className="text-muted-foreground">Connect your social media accounts to enable posting and analytics.</p>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <TwitterConnection />
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Show connections tab even for coming soon platforms */}
          {comingSoonPlatform && activeTab === "connections" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Social Connections</h2>
                <p className="text-muted-foreground">Connect your social media accounts to enable posting and analytics.</p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <TwitterConnection />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;