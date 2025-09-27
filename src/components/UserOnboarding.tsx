import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Zap, User, Target, MessageSquare, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { profileApi } from "@/integrations/supabase/api";

interface UserOnboardingProps {
  onComplete: (profile: any) => void;
}

const UserOnboarding = ({ onComplete }: UserOnboardingProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    topics: [] as string[],
    goal: "personal_branding",
    aiVoice: "professional",
    aboutContext: "",
    postPreferences: "",
    industryDomain: ""
  });

  const availableTopics = [
    "AI & Technology",
    "Startups",
    "Marketing",
    "Business Strategy",
    "Product Development",
    "Leadership",
    "Finance",
    "Healthcare",
    "Education",
    "Design",
    "Sales",
    "Customer Success"
  ];

  const handleTopicToggle = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic]
    }));
  };

  const handleNext = () => {
    if (step === 1 && (!formData.email || !formData.name)) {
      toast({
        title: "Required fields missing",
        description: "Please fill in your email and name to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (step === 2 && formData.topics.length === 0) {
      toast({
        title: "Select at least one topic",
        description: "Please select at least one topic of interest.",
        variant: "destructive",
      });
      return;
    }

    setStep(step + 1);
  };

  const handleComplete = async () => {
    if (!formData.aboutContext.trim()) {
      toast({
        title: "Please tell us about yourself",
        description: "The 'About You' section helps us create better content.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Create profile with real user data
      const profile = await profileApi.getOrCreateProfile(formData.email);
      
      // Update with all the collected information
      const updatedProfile = await profileApi.updateProfile(profile.id, {
        topics_of_interest: formData.topics,
        goal: formData.goal,
        ai_voice: formData.aiVoice,
        about_context: formData.aboutContext,
        post_preferences: formData.postPreferences,
        industry_domain: formData.industryDomain
      });

      // Store user info in localStorage for persistence
      localStorage.setItem('brandpilot_user', JSON.stringify({
        email: formData.email,
        name: formData.name,
        profileId: updatedProfile.id
      }));

      toast({
        title: "Welcome to BrandPilot!",
        description: "Your profile has been created successfully.",
      });

      onComplete(updatedProfile);
    } catch (error) {
      toast({
        title: "Error creating profile",
        description: "Failed to create your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-brand">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-10 w-10 bg-hero-gradient rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">BrandPilot</span>
          </div>
          <CardTitle className="text-xl">
            {step === 1 && "Welcome! Let's get started"}
            {step === 2 && "What topics interest you?"}
            {step === 3 && "Set your preferences"}
            {step === 4 && "Tell us about yourself"}
          </CardTitle>
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-2 w-8 rounded-full ${
                    i <= step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-muted-foreground mb-4">
                <User className="h-4 w-4" />
                <span className="text-sm">Basic Information</span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry/Domain (Optional)</Label>
                <Input
                  id="industry"
                  placeholder="e.g., Technology, Healthcare, Finance"
                  value={formData.industryDomain}
                  onChange={(e) => setFormData(prev => ({ ...prev, industryDomain: e.target.value }))}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-muted-foreground mb-4">
                <Target className="h-4 w-4" />
                <span className="text-sm">Topics of Interest</span>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Select the topics you'd like to create content about (choose at least one):
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableTopics.map((topic) => (
                  <div
                    key={topic}
                    className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.topics.includes(topic)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleTopicToggle(topic)}
                  >
                    <Checkbox
                      checked={formData.topics.includes(topic)}
                      onChange={() => handleTopicToggle(topic)}
                    />
                    <span className="text-sm">{topic}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-muted-foreground mb-4">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">Content Preferences</span>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">What's your main goal?</Label>
                  <RadioGroup
                    value={formData.goal}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, goal: value }))}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="personal_branding" id="personal_branding" />
                      <Label htmlFor="personal_branding">Develop personal branding</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="startup_promotion" id="startup_promotion" />
                      <Label htmlFor="startup_promotion">Startup promotion</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-medium">AI Voice & Tone</Label>
                  <RadioGroup
                    value={formData.aiVoice}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, aiVoice: value }))}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="professional" id="professional" />
                      <Label htmlFor="professional">Professional</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="friendly" id="friendly" />
                      <Label htmlFor="friendly">Friendly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="witty" id="witty" />
                      <Label htmlFor="witty">Witty</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-muted-foreground mb-4">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm">About You</span>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="about" className="text-base font-medium">
                    About You & Your Business *
                  </Label>
                  <Textarea
                    id="about"
                    placeholder="Tell us about yourself, your business, your expertise, and what makes you unique. This helps us create more relevant content for you..."
                    value={formData.aboutContext}
                    onChange={(e) => setFormData(prev => ({ ...prev, aboutContext: e.target.value }))}
                    className="min-h-[100px] mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="preferences" className="text-base font-medium">
                    Post Preferences & Style (Optional)
                  </Label>
                  <Textarea
                    id="preferences"
                    placeholder="Describe the type of posts you want to create. Include tone, topics to avoid, preferred formats (threads, single tweets, etc.), and any specific messaging guidelines..."
                    value={formData.postPreferences}
                    onChange={(e) => setFormData(prev => ({ ...prev, postPreferences: e.target.value }))}
                    className="min-h-[80px] mt-2"
                  />
                </div>
              </div>

              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <h4 className="font-medium text-primary mb-2">Selected Topics:</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.topics.map((topic) => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={loading}
              >
                Back
              </Button>
            )}
            
            <div className="ml-auto">
              {step < 4 ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={loading}>
                  {loading ? "Creating Profile..." : "Complete Setup"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserOnboarding;
