import { useState } from "react";
import DashboardNavigation from "@/components/DashboardNavigation";
import RelevantPosts from "@/components/RelevantPosts";
import DraftedPosts from "@/components/DraftedPosts";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("relevant");
  const { isAuthenticated, loading } = useProfile();
  const navigate = useNavigate();

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
        {activeTab === "relevant" && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Relevant Posts</h2>
            <p className="text-muted-foreground">Coming soon! We'll show you relevant posts from your network here.</p>
          </div>
        )}
        
        {activeTab === "drafted" && <DraftedPosts />}
      </main>
    </div>
  );
};

export default Dashboard;