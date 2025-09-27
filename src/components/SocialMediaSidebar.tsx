import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Twitter, MessageCircle } from "lucide-react";

interface SocialMediaSidebarProps {
  activePlatform: string;
  setActivePlatform: (platform: string) => void;
  comingSoonPlatform: string | null;
  setComingSoonPlatform: (platform: string | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SocialMediaSidebar = ({
  activePlatform,
  setActivePlatform,
  comingSoonPlatform,
  setComingSoonPlatform,
  activeTab,
  setActiveTab
}: SocialMediaSidebarProps) => {
  return (
    <div className="w-64 bg-card border-r border-border min-h-screen">
      <div className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
          Social Platforms
        </h3>
        
        <div className="space-y-2">
          <Button
            variant={activePlatform === "twitter" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setActivePlatform("twitter");
              setComingSoonPlatform(null);
            }}
            className="w-full justify-start space-x-3"
          >
            <Twitter className="h-4 w-4" />
            <span>Twitter</span>
            <Badge variant="secondary" className="text-xs ml-auto">Connected</Badge>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setActivePlatform("linkedin");
              setComingSoonPlatform("linkedin");
              if (activeTab !== "connections") {
                setActiveTab("relevant");
              }
            }}
            className="w-full justify-start space-x-3"
          >
            <MessageCircle className="h-4 w-4" />
            <span>LinkedIn</span>
            <Badge variant="outline" className="text-xs ml-auto bg-yellow-100 text-yellow-800 border-yellow-300">
              Soon
            </Badge>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setActivePlatform("reddit");
              setComingSoonPlatform("reddit");
              if (activeTab !== "connections") {
                setActiveTab("relevant");
              }
            }}
            className="w-full justify-start space-x-3"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Reddit</span>
            <Badge variant="outline" className="text-xs ml-auto bg-yellow-100 text-yellow-800 border-yellow-300">
              Soon
            </Badge>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaSidebar;