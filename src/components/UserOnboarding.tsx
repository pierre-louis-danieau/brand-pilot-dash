import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { onboardingApi } from "@/integrations/supabase/api";

interface UserOnboardingProps {
  onComplete: (profile: any, userInfo: { email: string; name: string }) => void;
  initialEmail?: string;
  initialName?: string;
  onSwitchToLogin?: () => void;
}

const UserOnboarding = ({ onComplete, initialEmail = "", initialName = "", onSwitchToLogin }: UserOnboardingProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form data for new flow
  const [formData, setFormData] = useState({
    userType: "" as "freelancer" | "startup_founder" | "",
    domain: "",
    socialMediaGoal: "" as "find_clients" | "personal_branding" | "for_fund" | "",
    businessDescription: "",
    name: initialName,
    username: "",
    email: initialEmail,
  });

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
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const canProceed = () => {
    switch (step) {
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
      
      // Create onboarding profile
      const profile = await onboardingApi.createOnboardingProfile({
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

      onComplete(profile, { email: formData.email, name: formData.name });
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
            {step === 2 && "What's your domain?"}
            {step === 3 && "Why social media?"}
            {step === 4 && "Tell us about yourself"}
            {step === 5 && "Complete your profile"}
          </CardTitle>
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
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
              <p className="text-sm text-muted-foreground text-center">
                Tell us about yourself to personalize your experience.
              </p>
              
              <RadioGroup
                value={formData.userType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, userType: value as any }))}
                className="space-y-4"
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
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {formData.userType === "freelancer" 
                  ? "Choose your area of expertise as a freelancer." 
                  : "Select the industry domain of your startup."}
              </p>
              
              <RadioGroup
                value={formData.domain}
                onValueChange={(value) => setFormData(prev => ({ ...prev, domain: value }))}
                className="space-y-3"
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
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Help us understand your main goal for social media presence.
              </p>
              
              <RadioGroup
                value={formData.socialMediaGoal}
                onValueChange={(value) => setFormData(prev => ({ ...prev, socialMediaGoal: value as any }))}
                className="space-y-4"
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
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Share details about your expertise and business to help us create relevant content.
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="business_description">Business Description *</Label>
                <Textarea
                  id="business_description"
                  placeholder="Describe your business, services, expertise, and what makes you unique..."
                  value={formData.businessDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessDescription: e.target.value }))}
                  className="min-h-[120px]"
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Add your personal details to finalize your account setup.
              </p>
              
              <div className="space-y-4">
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
                  <Label htmlFor="username">Username (Optional)</Label>
                  <Input
                    id="username"
                    placeholder="@johndoe"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={loading}
              >
                Back
              </Button>
            ) : onSwitchToLogin ? (
              <Button
                variant="ghost"
                onClick={onSwitchToLogin}
                disabled={loading}
                className="text-sm"
              >
                Already have an account? Sign in
              </Button>
            ) : null}
            
            <div className="ml-auto">
              {step < 5 ? (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={loading || !canProceed()}>
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
