import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Twitter } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { socialConnectionsApi } from "@/integrations/supabase/api";
import DraftedPosts from "./DraftedPosts";

const DraftedPostsWithTwitterCheck = () => {
  const { profile } = useProfile();
  const [isConnected, setIsConnected] = useState(false);
  const [hasCheckedConnection, setHasCheckedConnection] = useState(false);

  useEffect(() => {
    if (profile) {
      checkTwitterConnection();
    }
  }, [profile]);

  const checkTwitterConnection = async () => {
    if (!profile) return;
    
    try {
      const twitterConnection = await socialConnectionsApi.getTwitterConnection(profile.id);
      setIsConnected(!!twitterConnection);
    } catch (error) {
      console.error('Error checking Twitter connection:', error);
      setIsConnected(false);
    } finally {
      setHasCheckedConnection(true);
    }
  };

  if (!hasCheckedConnection) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Content Studio</h2>
            <p className="text-muted-foreground">AI-powered content generation from trending articles and industry insights</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Content Studio</h2>
            <p className="text-muted-foreground">Transform articles into engaging social media content</p>
          </div>
        </div>
        
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Twitter className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Connect Twitter to Start Creating Content</h3>
              <p className="text-muted-foreground mb-4">
                Connect your Twitter account to generate content based on trending articles and industry insights tailored to your audience.
              </p>
              <Button 
                onClick={() => window.location.href = '/dashboard?tab=connections'}
                className="inline-flex items-center space-x-2"
              >
                <Twitter className="h-4 w-4" />
                <span>Connect Twitter Account</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <DraftedPosts />;
};

export default DraftedPostsWithTwitterCheck;