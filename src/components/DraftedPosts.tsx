import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit3, Trash2, Send, Calendar, Sparkles, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data - Replace with real API data
const mockDrafts = [
  {
    id: 1,
    content: "The intersection of AI and human creativity is where the magic happens. Instead of fearing AI, we should embrace it as a powerful tool that amplifies our unique human insights and intuition. 🤖✨ #AI #Innovation",
    topic: "AI & Technology",
    voice: "Professional",
    createdAt: "2h ago",
    scheduled: false,
    characters: 234
  },
  {
    id: 2,
    content: "Building in public has been a game-changer for our startup. The accountability, feedback, and community support are invaluable. Here's what we learned after 30 days... 🧵 #BuildInPublic #StartupLife",
    topic: "Startups",
    voice: "Friendly",
    createdAt: "5h ago",
    scheduled: true,
    scheduleTime: "Tomorrow 9:00 AM",
    characters: 198
  },
  {
    id: 3,
    content: "Hot take: The best content strategy isn't about going viral—it's about consistently providing value to your specific audience. Depth over reach, every time. 📊",
    topic: "Marketing",
    voice: "Witty",
    createdAt: "1d ago",
    scheduled: false,
    characters: 167
  },
  {
    id: 4,
    content: "Just shipped a feature that took 3 weeks to build but 3 months to perfect. Sometimes the details matter more than the delivery date. Quality compounds over time. 🔧 #ProductDevelopment",
    topic: "Startups",
    voice: "Professional",
    createdAt: "2d ago",
    scheduled: false,
    characters: 201
  }
];

const DraftedPosts = () => {
  const { toast } = useToast();

  const handlePublish = (draftId: number) => {
    toast({
      title: "Post published!",
      description: "Your post has been published to Twitter successfully.",
    });
  };

  const handleEdit = (draftId: number) => {
    toast({
      title: "Edit mode",
      description: "Opening editor for this draft...",
    });
  };

  const handleDelete = (draftId: number) => {
    toast({
      title: "Draft deleted",
      description: "The draft has been removed from your list.",
      variant: "destructive",
    });
  };

  const handleSchedule = (draftId: number) => {
    toast({
      title: "Post scheduled",
      description: "Your post has been scheduled for publishing.",
    });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Drafted Posts</h2>
          <p className="text-muted-foreground">AI-generated content ready for review</p>
        </div>
        <Button variant="default" className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Generate New Post</span>
        </Button>
      </div>

      <div className="grid gap-6">
        {mockDrafts.map((draft) => (
          <Card key={draft.id} className="shadow-subtle hover:shadow-brand transition-all duration-300 border border-border/50">
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
                    <span className="text-muted-foreground text-sm">{draft.createdAt}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {draft.topic}
                  </Badge>
                  <Badge className={`text-xs ${getVoiceColor(draft.voice)}`}>
                    {draft.voice}
                  </Badge>
                  {draft.scheduled && (
                    <Badge variant="outline" className="text-xs border-primary text-primary">
                      <Calendar className="h-3 w-3 mr-1" />
                      Scheduled
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-foreground leading-relaxed">{draft.content}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">AI Generated</span>
                  </div>
                  <span className={`text-xs ${getCharacterColor(draft.characters)}`}>
                    {draft.characters}/280 characters
                  </span>
                </div>

                {draft.scheduled && (
                  <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm text-primary font-medium">
                        Scheduled for {draft.scheduleTime}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => handlePublish(draft.id)}
                    className="text-xs"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    {draft.scheduled ? "Publish Now" : "Publish"}
                  </Button>
                  
                  {!draft.scheduled && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSchedule(draft.id)}
                      className="text-xs"
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Schedule
                    </Button>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleEdit(draft.id)}
                    className="text-xs"
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleDelete(draft.id)}
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

      {/* Load More */}
      <div className="text-center py-6">
        <Button variant="outline" size="lg">
          Load More Drafts
        </Button>
      </div>
    </div>
  );
};

export default DraftedPosts;