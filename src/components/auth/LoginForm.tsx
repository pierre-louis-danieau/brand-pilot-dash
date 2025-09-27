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
  onSwitchToSignup: () => void;
}

const LoginForm = ({ onLogin, onSwitchToSignup }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
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
        }
        
        toast({
          title: "Welcome back!",
          description: "You've been logged in successfully.",
        });
        
        onLogin(existingProfile, userInfo);
      } else {
        // User doesn't exist, suggest signup
        toast({
          title: "Account not found",
          description: "No account found with this email. Please sign up instead.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Failed to log in. Please try again.",
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
        <CardTitle className="text-xl">Welcome Back</CardTitle>
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
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>
        
        <Button 
          onClick={handleLogin} 
          className="w-full"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </Button>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-medium text-primary"
              onClick={onSwitchToSignup}
              disabled={loading}
            >
              Sign up here
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;