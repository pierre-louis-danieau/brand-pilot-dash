import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Settings, Bell, User, Zap, Twitter } from "lucide-react";

interface DashboardNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DashboardNavigation = ({ activeTab, setActiveTab }: DashboardNavigationProps) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      {/* Top Navigation */}
      <nav className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
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
            
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-white text-sm font-medium">
                  JD
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">John Doe</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-secondary/30 border-b border-border px-6 py-4">
          <div className="max-w-2xl">
            <h3 className="font-medium text-foreground mb-3">Quick Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <label className="text-muted-foreground">Topics:</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge variant="secondary" className="text-xs">AI & Technology</Badge>
                  <Badge variant="secondary" className="text-xs">Startups</Badge>
                </div>
              </div>
              <div>
                <label className="text-muted-foreground">Goal:</label>
                <p className="text-foreground">Develop personal branding</p>
              </div>
              <div>
                <label className="text-muted-foreground">AI Voice:</label>
                <p className="text-foreground">Professional</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Platform Navigation */}
      <nav className="bg-card border-b border-border px-6 py-3">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-foreground">
            <Twitter className="h-5 w-5 text-blue-500" />
            <span className="font-medium">Twitter</span>
            <Badge variant="secondary" className="text-xs">Connected</Badge>
          </div>
          
          <div className="h-4 w-px bg-border"></div>
          
          <div className="flex space-x-1">
            <Button
              variant={activeTab === "relevant" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("relevant")}
              className="text-sm"
            >
              Relevant Posts
            </Button>
            <Button
              variant={activeTab === "drafted" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("drafted")}
              className="text-sm"
            >
              Drafted Posts
            </Button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default DashboardNavigation;