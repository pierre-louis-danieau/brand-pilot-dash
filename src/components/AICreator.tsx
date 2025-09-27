import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, Copy, Twitter, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { postsApi, socialConnectionsApi } from "@/integrations/supabase/api";

const AICreator = () => {
  const { toast } = useToast();
  const { profile } = useProfile();
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("short");
  const [generatedPost, setGeneratedPost] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const tones = [
    { value: "professional", label: "Professional", emoji: "💼" },
    { value: "friendly", label: "Friendly", emoji: "😊" },
    { value: "witty", label: "Witty", emoji: "🎯" },
    { value: "inspirational", label: "Inspirational", emoji: "✨" },
    { value: "educational", label: "Educational", emoji: "📚" },
  ];

  const lengths = [
    { value: "short", label: "Short (1-2 sentences)", emoji: "⚡" },
    { value: "medium", label: "Medium (3-4 sentences)", emoji: "📝" },
    { value: "long", label: "Long (5+ sentences)", emoji: "📄" },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Describe what kind of post you'd like to create.",
        variant: "destructive",
      });
      return;
    }

    if (!profile) {
      toast({
        title: "Profile not found",
        description: "Please make sure you're logged in.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // For now, we'll create a mock AI-generated post
      // In a real implementation, this would call an AI service
      const mockPost = generateMockPost(prompt, tone, length);
      setGeneratedPost(mockPost);
      
      toast({
        title: "Post generated successfully!",
        description: "Your AI-generated post is ready to review and publish.",
      });
    } catch (error) {
      console.error('Error generating post:', error);
      toast({
        title: "Error generating post",
        description: "Failed to generate the post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockPost = (userPrompt: string, selectedTone: string, selectedLength: string): string => {
    // This is a mock implementation - in production, this would call an AI API
    const toneStyles = {
      professional: "Based on my experience,",
      friendly: "Hey everyone! 👋",
      witty: "Here's a thought that might surprise you:",
      inspirational: "Remember this:",
      educational: "Let me break this down:"
    };

    const lengthMods = {
      short: ". That's the key insight.",
      medium: ". This approach has proven effective in my work, and I believe it can help others too. What are your thoughts?",
      long: ". This methodology has consistently delivered results across different industries and team sizes. I've seen it transform how organizations approach their challenges, leading to more sustainable and scalable solutions. The key is consistent application and adaptation to your specific context."
    };

    const starter = toneStyles[selectedTone as keyof typeof toneStyles] || toneStyles.professional;
    const ending = lengthMods[selectedLength as keyof typeof lengthMods] || lengthMods.medium;
    
    return `${starter} ${userPrompt}${ending}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPost);
    toast({
      title: "Copied to clipboard!",
      description: "The post has been copied to your clipboard.",
    });
  };

  const saveToDrafts = async () => {
    if (!profile || !generatedPost) return;

    try {
      await postsApi.createDraftPost(profile.id, generatedPost);
      toast({
        title: "Saved to drafts!",
        description: "Your post has been saved to your drafted posts.",
      });
    } catch (error) {
      toast({
        title: "Error saving draft",
        description: "Failed to save the post to drafts. Please try again.",
        variant: "destructive",
      });
    }
  };

  const publishDirectly = async () => {
    if (!profile || !generatedPost) return;

    try {
      setIsPublishing(true);
      
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

      // Post to Twitter
      await socialConnectionsApi.postToTwitter(profile.id, generatedPost);
      
      toast({
        title: "Post published!",
        description: "Your post has been published to Twitter successfully.",
      });
      
      // Clear the generated post
      setGeneratedPost("");
      setPrompt("");
    } catch (error) {
      console.error('Error publishing post:', error);
      toast({
        title: "Error publishing post",
        description: error instanceof Error ? error.message : "Failed to publish the post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">AI Creator</h2>
          <p className="text-muted-foreground">Create custom posts with AI assistance</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card className="shadow-subtle border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wand2 className="h-5 w-5 text-primary" />
              <span>Create Your Post</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prompt" className="text-sm font-medium text-foreground">
                What would you like to post about?
              </Label>
              <Textarea
                id="prompt"
                placeholder="e.g., Share insights about remote work productivity, discuss the latest AI trends, or give advice for startup founders..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-2 min-h-[100px]"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground">Tone</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {tones.map((toneOption) => (
                  <Button
                    key={toneOption.value}
                    variant={tone === toneOption.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTone(toneOption.value)}
                    className="text-xs"
                  >
                    {toneOption.emoji} {toneOption.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground">Length</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {lengths.map((lengthOption) => (
                  <Button
                    key={lengthOption.value}
                    variant={length === lengthOption.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLength(lengthOption.value)}
                    className="text-xs"
                  >
                    {lengthOption.emoji} {lengthOption.label}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Post
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="shadow-subtle border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>Generated Post</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedPost ? (
              <>
                <div className="bg-secondary/20 rounded-lg p-4 border">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {generatedPost}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {generatedPost.length}/280 characters
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                  
                  <Button
                    onClick={saveToDrafts}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Twitter className="h-4 w-4 mr-2" />
                    Save to Drafts
                  </Button>
                  
                  <Button
                    onClick={publishDirectly}
                    disabled={isPublishing}
                    size="sm"
                    className="w-full"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Publish Now
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground">
                  Your AI-generated post will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AICreator;