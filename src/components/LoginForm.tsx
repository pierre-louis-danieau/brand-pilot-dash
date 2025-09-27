import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { profileApi, socialConnectionsApi } from "@/integrations/supabase/api";

interface LoginFormProps {
  onLogin: (profile: any, userInfo: { email: string; name: string }) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Check if profile exists
      const existingProfile = await profileApi.getProfileByEmail(email);
      
      if (existingProfile) {
        // User exists, log them in
        const userInfo = {
          email: email,
          name: existingProfile.email.split('@')[0], // Use email prefix as fallback name
          profileId: existingProfile.id
        };
        
        // Store in localStorage
        localStorage.setItem('brandpilot_user', JSON.stringify(userInfo));
        
        // Initialize fake Twitter connection (handle potential conflicts)
        try {
          await socialConnectionsApi.updateConnection(existingProfile.id, 'twitter', true);
        } catch (connectionError) {
          console.warn('Twitter connection already exists or failed to create:', connectionError);
          // Continue anyway, this is not critical for login
        }
        
        toast({
          title: "Welcome back!",
          description: "You've been logged in successfully.",
        });
        
        onLogin(existingProfile, userInfo);
      } else {
        // New user, need name input
        setIsNewUser(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to create an account.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Create or get profile
      const profile = await profileApi.getOrCreateProfile(email);
      
      // Update with basic info
      const updatedProfile = await profileApi.updateProfile(profile.id, {
        topics_of_interest: ['AI & Technology', 'Startups'], // Default topics
        goal: 'personal_branding',
        ai_voice: 'professional'
      });
      
      const userInfo = {
        email: email,
        name: name,
        profileId: updatedProfile.id
      };
      
      // Store in localStorage
      localStorage.setItem('brandpilot_user', JSON.stringify(userInfo));
      
      // Initialize fake Twitter connection
      await socialConnectionsApi.updateConnection(updatedProfile.id, 'twitter', true);
      
      toast({
        title: "Account created!",
        description: "Welcome to BrandPilot! You can now customize your settings.",
      });
      
      onLogin(updatedProfile, userInfo);
    } catch (error) {
      toast({
        title: "Error creating account",
        description: "Failed to create your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-brand">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-10 w-10 bg-hero-gradient rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">BrandPilot</span>
          </div>
          <CardTitle className="text-xl">
            {isNewUser ? "Create Your Account" : "Welcome Back"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {!isNewUser ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleEmailSubmit()}
                />
              </div>
              
              <Button 
                onClick={handleEmailSubmit} 
                className="w-full"
                disabled={loading}
              >
                {loading ? "Checking..." : "Continue"}
              </Button>
              
              <p className="text-sm text-muted-foreground text-center">
                Enter your email to sign in or create a new account
              </p>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="email-display">Email Address</Label>
                <Input
                  id="email-display"
                  type="email"
                  value={email}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateAccount()}
                />
              </div>
              
              <Button 
                onClick={handleCreateAccount} 
                className="w-full"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => setIsNewUser(false)}
                className="w-full"
                disabled={loading}
              >
                Back
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
