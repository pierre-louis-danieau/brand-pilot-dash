import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Edit3, Trash2, Send, Calendar, Sparkles, Plus, Loader2, ExternalLink, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { postsApi, socialConnectionsApi } from "@/integrations/supabase/api";
import type { Database } from "@/integrations/supabase/types";

type Post = Database['public']['Tables']['posts']['Row'] & {
  url?: string | null;
};

const DraftedPosts = () => {
  const { toast } = useToast();
  const { profile } = useProfile();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [articleUrl, setArticleUrl] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");

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
      setPosts(draftedPosts);
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
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    setEditingPostId(postId);
    setEditingContent(post.content);
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
      setGenerating(true);
      
      // Call the external API to generate new posts
      const result = await postsApi.generateAndSavePosts(profile.id);
      
      // Add the new posts to the beginning of the list
      setPosts([...result.posts, ...posts]);
      
      toast({
        title: "New posts generated!",
        description: `${result.posts.length} AI-generated posts have been added to your drafts.`,
      });

      // If there's an article URL, you could show it in a separate toast or UI element
      if (result.url_article) {
        setArticleUrl(result.url_article);
      }
    } catch (error) {
      console.error('Error generating posts:', error);
      toast({
        title: "Error generating posts",
        description: error instanceof Error ? error.message : "Failed to generate new posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
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

  // Group posts by URL
  const groupPostsByUrl = (posts: Post[]) => {
    const grouped = posts.reduce((acc, post) => {
      const key = post.url || 'no-url';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(post);
      return acc;
    }, {} as Record<string, Post[]>);
    
    return grouped;
  };

  const groupedPosts = groupPostsByUrl(posts);

  const getUrlDomain = (url: string | null) => {
    if (!url) return null;
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return null;
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPostId) return;
    try {
      await postsApi.updatePostContent(editingPostId, editingContent);
      const updatedPosts = posts.map(post => post.id === editingPostId ? { ...post, content: editingContent } : post);
      setPosts(updatedPosts);
      setEditingPostId(null);
      setEditingContent("");
    } catch (error) {
      console.error('Error saving edited post:', error);
      toast({
        title: "Error saving edited post",
        description: error instanceof Error ? error.message : "Failed to save the edited post. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Content Studio</h2>
            <p className="text-muted-foreground">Generating your AI-powered content...</p>
          </div>
        </div>
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <div className="text-muted-foreground">Loading posts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Content Studio</h2>
          <p className="text-muted-foreground">Transform trending articles into engaging posts with AI</p>
        </div>
        <Button 
          variant="default" 
          className="flex items-center space-x-2"
          onClick={handleGenerateNewPost}
          disabled={generating}
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              <span>Generate New Posts</span>
            </>
          )}
        </Button>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedPosts).map(([urlKey, postsGroup]) => (
          <div key={urlKey} className={`space-y-4 ${urlKey !== 'no-url' ? 'p-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-xl border-2 border-blue-100/60' : ''}`}>
            {/* Article Source Header */}
            {urlKey !== 'no-url' && postsGroup[0].url && (
              <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-blue-200/60 shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <ExternalLink className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    AI Content Generated From Article
                  </div>
                  <a 
                    href={postsGroup[0].url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium truncate block max-w-md"
                    title={postsGroup[0].url}
                  >
                    {getUrlDomain(postsGroup[0].url)}
                  </a>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {postsGroup.length} {postsGroup.length === 1 ? 'post' : 'posts'}
                  </Badge>
                </div>
              </div>
            )}
            
            {urlKey === 'no-url' && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                  <Sparkles className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    Custom AI Generated Posts
                  </div>
                  <div className="text-sm text-gray-600">
                    Generated without specific article reference
                  </div>
                </div>
              </div>
            )}
            
            {/* Posts Grid */}
            <div className="grid gap-4 ml-4 border-l-2 border-blue-200/40 pl-6">
              {postsGroup.map((post, index) => (
                <Card key={post.id} className="shadow-subtle hover:shadow-brand transition-all duration-300 border border-border/50 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-white text-sm font-medium">
                              JD
                            </AvatarFallback>
                          </Avatar>
                          {post.url && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{index + 1}</span>
                            </div>
                          )}
                        </div>
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
                        {post.url && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            From: {getUrlDomain(post.url)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {editingPostId === post.id ? (
                      <Textarea 
                        value={editingContent} 
                        onChange={(e) => setEditingContent(e.target.value)} 
                        className="w-full text-foreground"
                      />
                    ) : (
                      <p className="text-foreground leading-relaxed">{post.content}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">AI Generated</span>
                        {post.url && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-blue-600 text-xs">Article-based</span>
                          </>
                        )}
                      </div>
                      <span className={`text-xs ${getCharacterColor(post.content.length)}`}>
                        {post.content.length}/280 characters
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      {editingPostId === post.id ? (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={handleSaveEdit}
                            className="text-xs"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setEditingPostId(null)}
                            className="text-xs text-destructive hover:text-destructive"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      ) : (
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
                      )}
                      
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
          </div>
        ))}
      </div>

      {posts.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">No drafted posts yet</div>
          <Button 
            variant="outline" 
            onClick={handleGenerateNewPost}
            disabled={generating}
            className="flex items-center space-x-2"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating Your First Posts...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Generate Your First Posts</span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* Load More */}
      {posts.length > 0 && (
        <div className="text-center py-6">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleGenerateNewPost}
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating More Posts...
              </>
            ) : (
              'Generate More Posts'
            )}
          </Button>
        </div>
      )}

    </div>
  );
};

export default DraftedPosts;