import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Repeat2, Share, Reply, Sparkles, Twitter, RefreshCw, ExternalLink, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { socialConnectionsApi, relevantPostsApi } from "@/integrations/supabase/api";

interface SavedRelevantPost {
  id: string;
  twitter_post_id: string;
  author_name: string;
  author_username: string;
  author_id: string;
  content: string;
  twitter_url: string;
  created_at_twitter: string;
  retweet_count: number;
  like_count: number;
  reply_count: number;
  quote_count: number;
  topic: string;
  context_annotations: any;
  ai_response?: string;
  created_at: string;
}

const RelevantPosts = () => {
  const { toast } = useToast();
  const { profile } = useProfile();
  const [posts, setPosts] = useState<SavedRelevantPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [hasCheckedConnection, setHasCheckedConnection] = useState(false);
  const [generatingResponse, setGeneratingResponse] = useState<string | null>(null);
  const [sendingReply, setSendingReply] = useState<string | null>(null);

  useEffect(() => {
    console.log('RelevantPosts: Profile changed:', profile);
    if (profile) {
      checkTwitterConnection();
    }
  }, [profile]);

  useEffect(() => {
    console.log('RelevantPosts: Connection status changed:', { profile: !!profile, isConnected });
    if (profile && isConnected) {
      loadSavedPosts();
    }
  }, [profile, isConnected]);

  const checkTwitterConnection = async () => {
    console.log('RelevantPosts: Checking Twitter connection for profile:', profile?.id);
    if (!profile) return;
    
    try {
      const twitterConnection = await socialConnectionsApi.getTwitterConnection(profile.id);
      console.log('RelevantPosts: Twitter connection result:', twitterConnection);
      setIsConnected(!!twitterConnection);
    } catch (error) {
      console.error('RelevantPosts: Error checking Twitter connection:', error);
      setIsConnected(false);
    } finally {
      setHasCheckedConnection(true);
    }
  };

  const loadSavedPosts = async () => {
    console.log('RelevantPosts: Loading saved posts for profile:', profile?.id);
    if (!profile) return;
    
    try {
      const savedPosts = await relevantPostsApi.getRelevantPosts(profile.id);
      console.log('RelevantPosts: Loaded saved posts:', savedPosts);
      console.log('RelevantPosts: Number of posts:', savedPosts?.length || 0);
      setPosts((savedPosts || []) as unknown as SavedRelevantPost[]);
    } catch (error) {
      console.error('RelevantPosts: Error loading saved posts:', error);
    }
  };

  const fetchRelevantPost = async () => {
    if (!profile) return;
    
    try {
      setLoading(true);
      
      // Find and save new relevant posts (now returns multiple posts)
      const result = await relevantPostsApi.findAndSaveRelevantPost(profile.id);
      
      if (result && result.savedPosts && result.savedPosts.length > 0) {
        // Add all new posts to the beginning of the list
        setPosts(prevPosts => [...result.savedPosts, ...prevPosts]);
        
        toast({
          title: `Found ${result.newPostsCount} new relevant posts!`,
          description: result.message,
        });
      } else if (result && result.skippedPostsCount > 0) {
        toast({
          title: "Posts already saved",
          description: result.message,
        });
      } else {
        toast({
          title: "No new posts found",
          description: "No relevant posts were found for your interests.",
        });
      }
    } catch (error) {
      console.error('Error fetching relevant post:', error);
      toast({
        title: "Error finding posts",
        description: error instanceof Error ? error.message : "Failed to find relevant posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await relevantPostsApi.deleteRelevantPost(postId);
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      
      toast({
        title: "Post removed",
        description: "The post has been removed from your collection.",
      });
    } catch (error) {
      toast({
        title: "Error removing post",
        description: "Failed to remove the post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  const generateSuggestedComment = (post: SavedRelevantPost): string => {
    const topic = post.topic;
    const comments = {
      'AI & Technology': "Great insights on AI! I've been exploring similar concepts and would love to hear more about your experience with implementation.",
      'Startups': "This resonates with my entrepreneurial journey! The lessons learned from building products are invaluable. Thanks for sharing!",
      'Marketing': "Excellent point about marketing strategy! This aligns with what I've seen work in practice. Would love to discuss this further.",
      'General': "Thanks for sharing this perspective! It's always valuable to hear different viewpoints on important topics."
    };
    
    return comments[topic as keyof typeof comments] || comments['General'];
  };

  const handleComment = (postId: string) => {
    toast({
      title: "Comment feature coming soon!",
      description: "AI-generated commenting will be available in the next update.",
    });
  };

  const generateAIResponse = async (postId: string) => {
    if (!profile) return;
    
    console.log('RelevantPosts: generateAIResponse called with postId:', postId);
    
    try {
      setGeneratingResponse(postId);
      
      const result = await relevantPostsApi.generateAIResponse(postId);
      
      console.log('RelevantPosts: AI response generated:', result);
      
      // Update the post in the local state
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, ai_response: result.aiResponse }
            : post
        )
      );
      
      toast({
        title: "AI response generated!",
        description: "Your personalized response is ready to send.",
      });
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast({
        title: "Error generating response",
        description: error instanceof Error ? error.message : "Failed to generate AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingResponse(null);
    }
  };

  const sendReply = async (postId: string) => {
    if (!profile) return;
    
    console.log('RelevantPosts: sendReply called with postId:', postId);
    
    try {
      setSendingReply(postId);
      
      const result = await relevantPostsApi.sendReply(postId);
      
      console.log('RelevantPosts: Reply sent successfully:', result);
      
      toast({
        title: "Reply sent!",
        description: "Your response has been posted to Twitter.",
      });
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error sending reply",
        description: error instanceof Error ? error.message : "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingReply(null);
    }
  };

  if (!hasCheckedConnection) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Relevant Posts</h2>
            <p className="text-muted-foreground">Checking Twitter connection...</p>
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
            <h2 className="text-2xl font-bold text-foreground">Relevant Posts</h2>
            <p className="text-muted-foreground">Posts from your topics of interest</p>
          </div>
        </div>
        
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Twitter className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Connect Twitter to See Relevant Posts</h3>
              <p className="text-muted-foreground mb-4">
                Connect your Twitter account to discover relevant posts based on your interests and topics.
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Relevant Posts</h2>
          <p className="text-muted-foreground">Your collection of relevant posts</p>
        </div>
        <Button 
          onClick={fetchRelevantPost}
          disabled={loading}
          className="inline-flex items-center space-x-2"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Twitter className="h-4 w-4" />
          )}
          <span>{loading ? 'Finding Post...' : 'Find Relevant Post'}</span>
        </Button>
      </div>

      <div className="grid gap-6">
        {posts.map((post) => {
          const suggestedComment = generateSuggestedComment(post);
          
          return (
            <Card key={post.id} className="shadow-subtle hover:shadow-brand transition-all duration-300 border border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {post.author_name?.slice(0, 2).toUpperCase() || 'TW'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-foreground">{post.author_name}</span>
                        <span className="text-muted-foreground text-sm">@{post.author_username}</span>
                        <span className="text-muted-foreground text-sm">·</span>
                        <span className="text-muted-foreground text-sm">{formatTimeAgo(post.created_at_twitter)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {post.topic}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(post.twitter_url, '_blank')}
                      className="text-xs p-1 h-auto"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePost(post.id)}
                      className="text-xs p-1 h-auto text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-foreground leading-relaxed">{post.content}</p>
                
                {/* Post Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.reply_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Repeat2 className="h-4 w-4" />
                      <span>{post.retweet_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{post.like_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Share className="h-4 w-4" />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(post.twitter_url, '_blank')}
                    className="text-xs"
                  >
                    <Twitter className="h-3 w-3 mr-1" />
                    View on Twitter
                  </Button>
                </div>

                {/* AI Suggested Comment */}
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">AI Response</span>
                    </div>
                  </div>
                  
                  {post.ai_response ? (
                    <>
                      <p className="text-sm text-foreground leading-relaxed mb-3">
                        {post.ai_response}
                      </p>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => sendReply(post.id)}
                          disabled={sendingReply === post.id}
                          className="text-xs"
                        >
                          {sendingReply === post.id ? (
                            <>
                              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Reply className="h-3 w-3 mr-1" />
                              Send Reply
                            </>
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => generateAIResponse(post.id)}
                          disabled={generatingResponse === post.id}
                          className="text-xs"
                        >
                          {generatingResponse === post.id ? (
                            <>
                              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              Regenerating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3 mr-1" />
                              Regenerate
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        Generate a personalized AI response for this tweet based on your profile and interests.
                      </p>
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => generateAIResponse(post.id)}
                        disabled={generatingResponse === post.id}
                        className="text-xs"
                      >
                        {generatingResponse === post.id ? (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3 mr-1" />
                            Generate AI Response
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {posts.length === 0 && isConnected && (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <Twitter className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No posts saved yet</h3>
          <p className="text-muted-foreground mb-4">
            Click "Find Relevant Post" to discover and save content based on your interests.
          </p>
          <Button onClick={fetchRelevantPost} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Finding Post...
              </>
            ) : (
              <>
                <Twitter className="h-4 w-4 mr-2" />
                Find Relevant Post
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default RelevantPosts;