import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Repeat2, Share, Reply, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data - Replace with real API data
const mockPosts = [
  {
    id: 1,
    author: "Alex Chen",
    handle: "@alexchen_ai",
    avatar: "AC",
    time: "2h",
    content: "The future of AI is not about replacing humans, but augmenting human capabilities. What are your thoughts on AI collaboration tools?",
    likes: 24,
    replies: 8,
    retweets: 12,
    topic: "AI & Technology",
    suggestedComment: "Absolutely agree! AI should be a force multiplier for human creativity and problem-solving. I've seen amazing results when teams use AI tools to enhance their workflow rather than replace their expertise."
  },
  {
    id: 2,
    author: "Sarah Rodriguez",
    handle: "@sarahbuilds",
    avatar: "SR",
    time: "4h",
    content: "Just launched our MVP after 6 months of building. The biggest lesson: ship early, iterate fast. Don't wait for perfection.",
    likes: 89,
    replies: 23,
    retweets: 34,
    topic: "Startups",
    suggestedComment: "Congratulations on the launch! 🎉 This is such valuable advice. The feedback loop from real users is irreplaceable. What was the most surprising piece of feedback you received?"
  },
  {
    id: 3,
    author: "Mike Johnson",
    handle: "@mikejdev",
    avatar: "MJ",
    time: "6h",
    content: "Hot take: The best marketing strategy for B2B SaaS is becoming genuinely helpful to your target audience. Create value first, sales will follow.",
    likes: 156,
    replies: 45,
    retweets: 67,
    topic: "Marketing",
    suggestedComment: "This is the way! When you focus on solving real problems and sharing knowledge, you build trust and authority. It's a longer game but creates much stronger customer relationships."
  }
];

const RelevantPosts = () => {
  const { toast } = useToast();

  const handleComment = (postId: number) => {
    toast({
      title: "Comment posted!",
      description: "Your AI-generated comment has been posted successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Relevant Posts</h2>
          <p className="text-muted-foreground">Posts from your topics of interest</p>
        </div>
        <Badge variant="secondary" className="text-xs">
          🔄 Auto-refreshing
        </Badge>
      </div>

      <div className="grid gap-6">
        {mockPosts.map((post) => (
          <Card key={post.id} className="shadow-subtle hover:shadow-brand transition-all duration-300 border border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {post.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-foreground">{post.author}</span>
                      <span className="text-muted-foreground text-sm">{post.handle}</span>
                      <span className="text-muted-foreground text-sm">·</span>
                      <span className="text-muted-foreground text-sm">{post.time}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {post.topic}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-foreground leading-relaxed">{post.content}</p>
              
              {/* Post Stats */}
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.replies}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Repeat2 className="h-4 w-4" />
                  <span>{post.retweets}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Share className="h-4 w-4" />
                </div>
              </div>

              {/* AI Suggested Comment */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">AI Suggested Comment</span>
                  </div>
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-3">
                  {post.suggestedComment}
                </p>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => handleComment(post.id)}
                    className="text-xs"
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Post Comment
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    Edit Comment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center py-6">
        <Button variant="outline" size="lg">
          Load More Posts
        </Button>
      </div>
    </div>
  );
};

export default RelevantPosts;