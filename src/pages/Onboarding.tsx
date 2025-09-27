import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import OnboardingProgress from "@/components/OnboardingProgress";
import { ArrowLeft, ArrowRight, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { onboardingApi } from "@/integrations/supabase/api";

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    userType: "" as "freelancer" | "startup_founder" | "",
    domain: "",
    socialMediaGoal: "" as "find_clients" | "personal_branding" | "for_fund" | "",
    businessDescription: "",
    name: "",
    username: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  const totalSteps = 5;

  const freelancerDomains = [
    "Data Scientist",
    "Developer", 
    "Designer",
    "Copywriter"
  ];

  const startupDomains = [
    "FinTech",
    "HealthTech", 
    "EdTech",
    "E-commerce",
    "AI/ML",
    "SaaS",
    "Mobile Apps"
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!formData.userType || !formData.domain || !formData.socialMediaGoal || 
        !formData.businessDescription || !formData.name || !formData.email) {
      toast({
        title: "Please fill all required fields",
        description: "All fields are required to complete the onboarding.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      await onboardingApi.createOnboardingProfile({
        email: formData.email,
        name: formData.name,
        username: formData.username || undefined,
        user_type: formData.userType,
        domain: formData.domain,
        social_media_goal: formData.socialMediaGoal,
        business_description: formData.businessDescription,
      });

      toast({
        title: "Welcome to BrandPilot!",
        description: "Your account has been set up successfully.",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };


  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.userType !== "";
      case 2:
        return formData.domain !== "";
      case 3:
        return formData.socialMediaGoal !== "";
      case 4:
        return formData.businessDescription.trim() !== "";
      case 5:
        return formData.name.trim() !== "" && formData.email.includes("@");
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
              <h2 className="text-3xl font-bold text-foreground">Welcome! Let's get started</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Tell us about yourself to personalize your experience.
              </p>
            </div>
            
            <RadioGroup
              value={formData.userType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, userType: value as any }))}
              className="max-w-md mx-auto space-y-4"
            >
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-all">
                <RadioGroupItem value="freelancer" id="freelancer" />
                <Label htmlFor="freelancer" className="flex-1 text-left cursor-pointer">
                  <div className="font-medium text-foreground">I'm a Freelancer</div>
                  <div className="text-sm text-muted-foreground">Independent professional offering services</div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-all">
                <RadioGroupItem value="startup_founder" id="startup_founder" />
                <Label htmlFor="startup_founder" className="flex-1 text-left cursor-pointer">
                  <div className="font-medium text-foreground">I'm a Startup Founder</div>
                  <div className="text-sm text-muted-foreground">Building and launching my own business</div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 2:
        return (
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-foreground">What's your domain?</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {formData.userType === "freelancer" 
                  ? "Choose your area of expertise as a freelancer." 
                  : "Select the industry domain of your startup."}
              </p>
            </div>
            
            <RadioGroup
              value={formData.domain}
              onValueChange={(value) => setFormData(prev => ({ ...prev, domain: value }))}
              className="max-w-md mx-auto space-y-3"
            >
              {(formData.userType === "freelancer" ? freelancerDomains : startupDomains).map((domain) => (
                <div key={domain} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-all">
                  <RadioGroupItem value={domain} id={domain} />
                  <Label htmlFor={domain} className="flex-1 text-left cursor-pointer font-medium">
                    {domain}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 3:
        return (
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-foreground">Why do you want to post on social media?</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Help us understand your main goal for social media presence.
              </p>
            </div>
            
            <RadioGroup
              value={formData.socialMediaGoal}
              onValueChange={(value) => setFormData(prev => ({ ...prev, socialMediaGoal: value as any }))}
              className="max-w-md mx-auto space-y-4"
            >
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-all">
                <RadioGroupItem value="find_clients" id="find_clients" />
                <Label htmlFor="find_clients" className="flex-1 text-left cursor-pointer">
                  <div className="font-medium text-foreground">Find Clients</div>
                  <div className="text-sm text-muted-foreground">Attract new customers and business opportunities</div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-all">
                <RadioGroupItem value="personal_branding" id="personal_branding" />
                <Label htmlFor="personal_branding" className="flex-1 text-left cursor-pointer">
                  <div className="font-medium text-foreground">Personal Branding</div>
                  <div className="text-sm text-muted-foreground">Build authority and thought leadership</div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-all">
                <RadioGroupItem value="for_fund" id="for_fund" />
                <Label htmlFor="for_fund" className="flex-1 text-left cursor-pointer">
                  <div className="font-medium text-foreground">For Fund</div>
                  <div className="text-sm text-muted-foreground">Attract investors and funding opportunities</div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-foreground">Tell us about yourself and your business</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Share details about your expertise and business to help us create relevant content.
              </p>
            </div>
            
            <div className="space-y-4 max-w-lg mx-auto">
              <div className="space-y-2">
                <Label htmlFor="business_description" className="text-left block">Business Description *</Label>
                <Textarea
                  id="business_description"
                  placeholder="Describe your business, services, expertise, and what makes you unique..."
                  value={formData.businessDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessDescription: e.target.value }))}
                  className="min-h-[120px]"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-foreground">Complete your profile</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Add your personal details to finalize your account setup.
              </p>
            </div>
            
            <div className="space-y-4 max-w-sm mx-auto">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-left block">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-left block">Username (Optional)</Label>
                <Input
                  id="username"
                  placeholder="@johndoe"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-left block">Email Address *</Label>
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
                disabled={!canProceed() || loading}
                className="flex items-center space-x-2"
              >
                <span>{loading ? "Creating Profile..." : currentStep === totalSteps ? "Complete Setup" : "Next"}</span>
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