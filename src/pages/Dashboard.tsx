import { useState } from "react";
import DashboardNavigation from "@/components/DashboardNavigation";
import RelevantPosts from "@/components/RelevantPosts";
import DraftedPosts from "@/components/DraftedPosts";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("relevant");

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="container mx-auto px-6 py-8">
        {activeTab === "relevant" && <RelevantPosts />}
        {activeTab === "drafted" && <DraftedPosts />}
      </main>
    </div>
  );
};

export default Dashboard;