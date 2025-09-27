import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit3, Trash2, Send, Calendar, Sparkles, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { postsApi, socialConnectionsApi } from "@/integrations/supabase/api";
import type { Database } from "@/integrations/supabase/types";

type Post = Database['public']['Tables']['posts']['Row'];

// Mock data for generating sample posts when none exist
const samplePosts = [
  {
    content: "The intersection of AI and human creativity is where the magic happens. Instead of fearing AI, we should embrace it as a powerful tool that amplifies our unique human insights and intuition. 🤖✨ #AI #Innovation",
    topic: "AI & Technology",
    voice: "Professional"
  },
  {
    content: "Building in public has been a game-changer for our startup. The accountability, feedback, and community support are invaluable. Here's what we learned after 30 days... 🧵 #BuildInPublic #StartupLife",
    topic: "Startups", 
    voice: "Friendly"
  },
  {
    content: "Hot take: The best content strategy isn't about going viral—it's about consistently providing value to your specific audience. Depth over reach, every time. 📊",
    topic: "Marketing",
    voice: "Witty"
  }
];

const DraftedPosts = () => {
  const { toast } = useToast();
  const { profile } = useProfile();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadDraftedPosts();
    }
  }, [profile]);

  const loadDraftedPosts = async () => {
    if (!profile) return;
    
    try {
      setLoading(true);
      const draftedPosts = await postsApi.getDraftedPosts(profile.id);
      
      // If no posts exist, create some sample posts for demo
      if (draftedPosts.length === 0) {
        const createdPosts = await Promise.all(
          samplePosts.map(sample => 
            postsApi.createDraftPost(profile.id, sample.content)
          )
        );
        setPosts(createdPosts);
      } else {
        setPosts(draftedPosts);
      }
    } catch (error) {
      console.error('Error loading drafted posts:', error);
      toast({
        title: "Error loading posts",
        description: "Failed to load your drafted posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (postId: string) => {
    try {
      // Check if Twitter is connected
      const twitterConnection = await socialConnectionsApi.getTwitterConnection(profile.id);
      if (!twitterConnection) {
        toast({
          title: "Twitter connection required",
          description: "Please connect your Twitter account in the Connections tab to publish posts.",
          variant: "destructive",
        });
        return;
      }

      // Find the post to get its content
      const post = posts.find(p => p.id === postId);
      if (!post) {
        throw new Error('Post not found');
      }

      // Post to Twitter first
      await socialConnectionsApi.postToTwitter(profile.id, post.content);
      
      // Then update the database status
      await postsApi.updatePostStatus(postId, 'published');
      
      // Remove from local state
      setPosts(posts.filter(post => post.id !== postId));
      
      toast({
        title: "Post published!",
        description: "Your post has been published to Twitter successfully.",
      });
    } catch (error) {
      console.error('Error publishing post:', error);
      toast({
        title: "Error publishing post",
        description: error instanceof Error ? error.message : "Failed to publish the post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (postId: string) => {
    toast({
      title: "Edit mode",
      description: "Opening editor for this draft...",
    });
  };

  const handleDelete = async (postId: string) => {
    try {
      await postsApi.deletePost(postId);
      
      // Remove from local state
      setPosts(posts.filter(post => post.id !== postId));
      
      toast({
        title: "Draft deleted",
        description: "The draft has been removed from your list.",
      });
    } catch (error) {
      toast({
        title: "Error deleting post",
        description: "Failed to delete the post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSchedule = (postId: string) => {
    toast({
      title: "Post scheduled",
      description: "Your post has been scheduled for publishing.",
    });
  };

  const handleGenerateNewPost = async () => {
    if (!profile) return;

    try {
      // Generate a random sample post for demo
      const randomSample = samplePosts[Math.floor(Math.random() * samplePosts.length)];
      const newPost = await postsApi.createDraftPost(profile.id, randomSample.content);
      
      setPosts([newPost, ...posts]);
      
      toast({
        title: "New post generated!",
        description: "A new AI-generated post has been added to your drafts.",
      });
    } catch (error) {
      toast({
        title: "Error generating post",
        description: "Failed to generate a new post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getVoiceColor = (voice: string) => {
    switch (voice) {
      case "Professional":
        return "bg-blue-100 text-blue-800";
      case "Friendly":
        return "bg-green-100 text-green-800";
      case "Witty":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCharacterColor = (count: number) => {
    if (count > 240) return "text-red-500";
    if (count > 200) return "text-yellow-500";
    return "text-muted-foreground";
  };

  const getTopicFromContent = (content: string) => {
    if (content.includes('AI') || content.includes('technology')) return 'AI & Technology';
    if (content.includes('startup') || content.includes('building')) return 'Startups';
    if (content.includes('content') || content.includes('marketing')) return 'Marketing';
    return 'General';
  };

  const getVoiceFromProfile = () => {
    if (!profile?.ai_voice) return 'Professional';
    return profile.ai_voice.charAt(0).toUpperCase() + profile.ai_voice.slice(1);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Drafted Posts</h2>
            <p className="text-muted-foreground">Loading your AI-generated content...</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading posts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Drafted Posts</h2>
          <p className="text-muted-foreground">AI-generated content ready for review</p>
        </div>
        <Button 
          variant="default" 
          className="flex items-center space-x-2"
          onClick={handleGenerateNewPost}
        >
          <Plus className="h-4 w-4" />
          <span>Generate New Post</span>
        </Button>
      </div>

      <div className="grid gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="shadow-subtle hover:shadow-brand transition-all duration-300 border border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-white text-sm font-medium">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">Your Draft</span>
                    <span className="text-muted-foreground text-sm">·</span>
                    <span className="text-muted-foreground text-sm">{formatTimeAgo(post.created_at)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {getTopicFromContent(post.content)}
                  </Badge>
                  <Badge className={`text-xs ${getVoiceColor(getVoiceFromProfile())}`}>
                    {getVoiceFromProfile()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-foreground leading-relaxed">{post.content}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">AI Generated</span>
                  </div>
                  <span className={`text-xs ${getCharacterColor(post.content.length)}`}>
                    {post.content.length}/280 characters
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => handlePublish(post.id)}
                    className="text-xs"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Publish
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleSchedule(post.id)}
                    className="text-xs"
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Schedule
                  </Button>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleEdit(post.id)}
                    className="text-xs"
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleDelete(post.id)}
                    className="text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {posts.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">No drafted posts yet</div>
          <Button 
            variant="outline" 
            onClick={handleGenerateNewPost}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Generate Your First Post</span>
          </Button>
        </div>
      )}

      {/* Load More */}
      {posts.length > 0 && (
        <div className="text-center py-6">
          <Button variant="outline" size="lg" onClick={handleGenerateNewPost}>
            Generate More Posts
          </Button>
        </div>
      )}
    </div>
  );
};

export default DraftedPosts;