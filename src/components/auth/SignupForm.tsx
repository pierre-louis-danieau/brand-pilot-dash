import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { profileApi } from "@/integrations/supabase/api";

interface SignupFormProps {
  onSignupSuccess: (email: string, name: string) => void;
  onSwitchToLogin: () => void;
}

const SignupForm = ({ onSignupSuccess, onSwitchToLogin }: SignupFormProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email.trim() || !name.trim()) {
      toast({
        title: "All fields required",
        description: "Please fill in both email and name.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Check if user already exists
      const existingProfile = await profileApi.getProfileByEmail(email);
      
      if (existingProfile) {
        toast({
          title: "Account already exists",
          description: "An account with this email already exists. Please sign in instead.",
          variant: "destructive",
        });
        return;
      }
      
      // Proceed to onboarding with collected email and name
      onSignupSuccess(email, name);
      
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "Failed to check account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-brand">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="h-10 w-10 bg-hero-gradient rounded-lg flex items-center justify-center">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground">BrandPilot</span>
        </div>
        <CardTitle className="text-xl">Create Your Account</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSignup()}
          />
        </div>
        
        <Button 
          onClick={handleSignup} 
          className="w-full"
          disabled={loading}
        >
          {loading ? "Getting Started..." : "Continue to Setup"}
        </Button>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-medium text-primary"
              onClick={onSwitchToLogin}
              disabled={loading}
            >
              Sign in here
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignupForm;