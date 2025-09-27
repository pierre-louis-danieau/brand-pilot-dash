import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Twitter, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { socialConnectionsApi } from "@/integrations/supabase/api";
import type { Database } from "@/integrations/supabase/types";

type SocialConnection = Database['public']['Tables']['social_connections']['Row'];

const TwitterConnection = () => {
  const { toast } = useToast();
  const { profile } = useProfile();
  const [twitterConnection, setTwitterConnection] = useState<SocialConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (profile) {
      loadTwitterConnection();
    }
  }, [profile]);

  const loadTwitterConnection = async () => {
    if (!profile) return;
    
    try {
      setLoading(true);
      const connections = await socialConnectionsApi.getConnections(profile.id);
      const twitterConn = connections.find(conn => conn.platform === 'twitter');
      setTwitterConnection(twitterConn || null);
    } catch (error) {
      console.error('Error loading Twitter connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectTwitter = async () => {
    if (!profile) return;

    try {
      setConnecting(true);
      const { authUrl } = await socialConnectionsApi.connectTwitter(profile.id);
      
      // Redirect to Twitter OAuth
      window.location.href = authUrl;
    } catch (error: any) {
      console.error('Error connecting to Twitter:', error);
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect to Twitter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnectTwitter = async () => {
    if (!profile) return;

    try {
      setConnecting(true);
      await socialConnectionsApi.disconnectTwitter(profile.id);
      setTwitterConnection(null);
      
      toast({
        title: "Twitter disconnected",
        description: "Your Twitter account has been disconnected successfully.",
      });
    } catch (error: any) {
      console.error('Error disconnecting Twitter:', error);
      toast({
        title: "Disconnection failed",
        description: error.message || "Failed to disconnect Twitter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Twitter className="h-5 w-5 text-blue-500" />
            <span>Twitter Connection</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const isConnected = twitterConnection?.is_connected;
  const connectionData = twitterConnection?.connection_data as any;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Twitter className="h-5 w-5 text-blue-500" />
          <span>Twitter Connection</span>
          {isConnected && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected && connectionData ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Username:</span>
                <span className="font-medium">@{connectionData.username}</span>
              </div>
              {connectionData.name && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Display Name:</span>
                  <span className="font-medium">{connectionData.name}</span>
                </div>
              )}
              {connectionData.public_metrics?.followers_count && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Followers:</span>
                  <span className="font-medium">{connectionData.public_metrics.followers_count.toLocaleString()}</span>
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleDisconnectTwitter}
                disabled={connecting}
                className="w-full"
              >
                {connecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Disconnect Twitter
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your Twitter account to enable automatic posting and audience insights.
            </p>
            
            <Button
              onClick={handleConnectTwitter}
              disabled={connecting}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              {connecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Twitter className="h-4 w-4 mr-2" />
                  Connect to Twitter
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TwitterConnection;