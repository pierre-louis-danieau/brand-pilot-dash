import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import OnboardingProgress from "@/components/OnboardingProgress";
import { ArrowLeft, ArrowRight, Zap, Twitter, Linkedin, Instagram, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    topics: [] as string[],
    goal: "",
    industry: "",
    aiVoice: "",
  });

  const totalSteps = 5;

  const predefinedTopics = [
    "AI & Technology", "Startups", "Marketing", "SaaS", "E-commerce",
    "Finance", "Health & Wellness", "Education", "Real Estate", "Travel",
    "Food & Cooking", "Fitness", "Photography", "Design", "Programming"
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      toast({
        title: "Welcome to BrandPilot!",
        description: "Your account has been set up successfully.",
      });
      navigate("/dashboard");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleTopic = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic]
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.email.includes("@");
      case 2:
        return formData.topics.length > 0;
      case 3:
        return formData.goal !== "";
      case 4:
      case 5:
        return true; // Optional steps
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-foreground">Welcome to BrandPilot</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Let's get you started with growing your brand online. First, we need your email.
              </p>
            </div>
            
            <div className="space-y-4 max-w-sm mx-auto">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-left block">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="h-12"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-foreground">What are your interests?</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Select topics you're passionate about. We'll find relevant content for you.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
              {predefinedTopics.map((topic) => (
                <Badge
                  key={topic}
                  variant={formData.topics.includes(topic) ? "default" : "secondary"}
                  className={`cursor-pointer px-4 py-2 text-sm transition-all duration-200 hover:scale-105 ${
                    formData.topics.includes(topic) 
                      ? "bg-primary text-white shadow-brand" 
                      : "hover:bg-primary/10"
                  }`}
                  onClick={() => toggleTopic(topic)}
                >
                  {topic}
                </Badge>
              ))}
            </div>
            
            {formData.topics.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Selected {formData.topics.length} topic{formData.topics.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        );

      case 3:
        return (
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-foreground">What's your goal?</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Help us understand what you want to achieve with your online presence.
              </p>
            </div>
            
            <RadioGroup
              value={formData.goal}
              onValueChange={(value) => setFormData(prev => ({ ...prev, goal: value }))}
              className="max-w-md mx-auto space-y-4"
            >
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-all">
                <RadioGroupItem value="personal" id="personal" />
                <Label htmlFor="personal" className="flex-1 text-left cursor-pointer">
                  <div className="font-medium text-foreground">Develop personal branding</div>
                  <div className="text-sm text-muted-foreground">Build authority and thought leadership</div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-all">
                <RadioGroupItem value="startup" id="startup" />
                <Label htmlFor="startup" className="flex-1 text-left cursor-pointer">
                  <div className="font-medium text-foreground">Promote my startup</div>
                  <div className="text-sm text-muted-foreground">Increase brand awareness and customer acquisition</div>
                </Label>
              </div>
            </RadioGroup>
            
            {formData.goal === "startup" && (
              <div className="space-y-2 max-w-sm mx-auto">
                <Label htmlFor="industry">Industry/Domain (Optional)</Label>
                <Input
                  id="industry"
                  placeholder="e.g., FinTech, HealthTech, E-commerce"
                  value={formData.industry}
                  onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                />
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-foreground">Choose your AI voice</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Select the tone for your AI-generated content. You can always edit posts later.
              </p>
            </div>
            
            <RadioGroup
              value={formData.aiVoice}
              onValueChange={(value) => setFormData(prev => ({ ...prev, aiVoice: value }))}
              className="max-w-md mx-auto space-y-4"
            >
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-all">
                <RadioGroupItem value="professional" id="professional" />
                <Label htmlFor="professional" className="flex-1 text-left cursor-pointer">
                  <div className="font-medium text-foreground">Professional</div>
                  <div className="text-sm text-muted-foreground">Formal, authoritative, and business-focused</div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-all">
                <RadioGroupItem value="friendly" id="friendly" />
                <Label htmlFor="friendly" className="flex-1 text-left cursor-pointer">
                  <div className="font-medium text-foreground">Friendly</div>
                  <div className="text-sm text-muted-foreground">Approachable, warm, and conversational</div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-all">
                <RadioGroupItem value="witty" id="witty" />
                <Label htmlFor="witty" className="flex-1 text-left cursor-pointer">
                  <div className="font-medium text-foreground">Witty</div>
                  <div className="text-sm text-muted-foreground">Clever, engaging, and slightly humorous</div>
                </Label>
              </div>
            </RadioGroup>
            
            <div className="flex justify-center">
              <Button 
                variant="ghost" 
                onClick={handleNext}
                className="text-muted-foreground hover:text-foreground"
              >
                Skip for now
              </Button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-foreground">Connect your social accounts</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Connect your social media accounts to start growing your presence.
              </p>
            </div>
            
            <div className="space-y-4 max-w-sm mx-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full h-14 justify-start space-x-3 border-blue-200 hover:bg-blue-50 text-blue-600"
                onClick={() => toast({ title: "Connected to X (Twitter)!", description: "You can now manage your Twitter presence." })}
              >
                <Twitter className="h-5 w-5" />
                <span>Connect to X (Twitter)</span>
                <CheckCircle className="h-4 w-4 ml-auto text-green-600" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="w-full h-14 justify-start space-x-3 opacity-60 cursor-not-allowed"
                disabled
              >
                <Linkedin className="h-5 w-5" />
                <span>LinkedIn</span>
                <Badge variant="secondary" className="ml-auto text-xs">Coming Soon</Badge>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="w-full h-14 justify-start space-x-3 opacity-60 cursor-not-allowed"
                disabled
              >
                <Instagram className="h-5 w-5" />
                <span>Instagram</span>
                <Badge variant="secondary" className="ml-auto text-xs">Coming Soon</Badge>
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-hero-gradient rounded-lg flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">BrandPilot</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-2xl">
          <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
          
          <div className="bg-card-gradient rounded-2xl shadow-subtle border border-border/50 p-8 md:p-12">
            {renderStep()}
            
            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
              
              <Button
                variant="default"
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center space-x-2"
              >
                <span>{currentStep === totalSteps ? "Complete Setup" : "Next"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;