import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Twitter, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface SocialMediaSidebarProps {
  activePlatform: string;
  setActivePlatform: (platform: string) => void;
  comingSoonPlatform: string | null;
  setComingSoonPlatform: (platform: string | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const SocialMediaSidebar = ({
  activePlatform,
  setActivePlatform,
  comingSoonPlatform,
  setComingSoonPlatform,
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed
}: SocialMediaSidebarProps) => {
  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-card border-r border-border min-h-screen transition-all duration-300 relative`}>
      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-4 z-10 bg-card border border-border rounded-full h-6 w-6 p-0 shadow-sm"
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <div className="p-4">
        {!isCollapsed && (
          <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
            Social Platforms
          </h3>
        )}
        
        <div className="space-y-2">
          <Button
            variant={activePlatform === "twitter" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setActivePlatform("twitter");
              setComingSoonPlatform(null);
            }}
            className={`${isCollapsed ? 'w-12 justify-center px-0' : 'w-full justify-start'} space-x-3`}
            title={isCollapsed ? "Twitter" : ""}
          >
            <Twitter className="h-4 w-4" />
            {!isCollapsed && (
              <>
                <span>Twitter</span>
                <Badge variant="secondary" className="text-xs ml-auto">Connected</Badge>
              </>
            )}
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
            className={`${isCollapsed ? 'w-12 justify-center px-0' : 'w-full justify-start'} space-x-3`}
            title={isCollapsed ? "LinkedIn" : ""}
          >
            <MessageCircle className="h-4 w-4" />
            {!isCollapsed && (
              <>
                <span>LinkedIn</span>
                <Badge variant="outline" className="text-xs ml-auto bg-yellow-100 text-yellow-800 border-yellow-300">
                  Soon
                </Badge>
              </>
            )}
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
            className={`${isCollapsed ? 'w-12 justify-center px-0' : 'w-full justify-start'} space-x-3`}
            title={isCollapsed ? "Reddit" : ""}
          >
            <MessageCircle className="h-4 w-4" />
            {!isCollapsed && (
              <>
                <span>Reddit</span>
                <Badge variant="outline" className="text-xs ml-auto bg-yellow-100 text-yellow-800 border-yellow-300">
                  Soon
                </Badge>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaSidebar;