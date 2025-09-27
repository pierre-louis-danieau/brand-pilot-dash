import { useState, useEffect } from "react";
import DashboardNavigation from "@/components/DashboardNavigation";
import RelevantPosts from "@/components/RelevantPosts";
import DraftedPostsWithTwitterCheck from "@/components/DraftedPostsWithTwitterCheck";
import TwitterConnection from "@/components/TwitterConnection";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("drafted");
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
      <DashboardNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="container mx-auto px-6 py-8">
        {activeTab === "relevant" && <RelevantPosts />}
        
        {activeTab === "drafted" && <DraftedPostsWithTwitterCheck />}
        
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
      </main>
    </div>
  );
};

export default Dashboard;