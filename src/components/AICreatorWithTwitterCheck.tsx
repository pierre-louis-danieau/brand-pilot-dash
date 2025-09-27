import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Twitter } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { socialConnectionsApi } from "@/integrations/supabase/api";
import AICreator from "./AICreator";

const AICreatorWithTwitterCheck = () => {
  const { profile } = useProfile();
  const [isConnected, setIsConnected] = useState(false);
  const [hasCheckedConnection, setHasCheckedConnection] = useState(false);

  const checkTwitterConnection = async () => {
    if (!profile) return;
    
    try {
      const connection = await socialConnectionsApi.getTwitterConnection(profile.id);
      setIsConnected(!!connection);
    } catch (error) {
      console.error('Error checking Twitter connection:', error);
      setIsConnected(false);
    } finally {
      setHasCheckedConnection(true);
    }
  };

  useEffect(() => {
    if (profile) {
      checkTwitterConnection();
    }
  }, [profile]);

  if (!hasCheckedConnection) {
    return <div>Loading...</div>;
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md text-center shadow-subtle border border-border/50">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Twitter className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl font-semibold text-foreground">
              Connect Twitter to Start Creating Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Connect your Twitter account to create and publish AI-generated posts directly to your timeline.
            </p>
            <Button 
              onClick={() => {
                // This will be handled by the parent component to switch tabs
                const event = new CustomEvent('switchToConnections');
                window.dispatchEvent(event);
              }}
              className="w-full"
            >
              <Twitter className="h-4 w-4 mr-2" />
              Go to Connections Tab
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AICreator />;
};

export default AICreatorWithTwitterCheck;