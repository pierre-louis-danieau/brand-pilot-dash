import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import UserOnboarding from "@/components/UserOnboarding";
import { useProfile } from "@/hooks/useProfile";

type AuthMode = 'login' | 'signup' | 'onboarding';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [signupData, setSignupData] = useState<{ email: string; name: string } | null>(null);
  const navigate = useNavigate();
  const { login } = useProfile();

  const handleLogin = (profile: any, userInfo: { email: string; name: string }) => {
    login(profile, userInfo);
    navigate("/dashboard");
  };

  const handleSignupSuccess = (email: string, name: string) => {
    setSignupData({ email, name });
    setMode('onboarding');
  };

  const handleOnboardingComplete = (profile: any) => {
    if (signupData) {
      login(profile, signupData);
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      {mode === 'login' && (
        <LoginForm 
          onLogin={handleLogin}
          onSwitchToSignup={() => setMode('signup')}
        />
      )}
      
      {mode === 'signup' && (
        <SignupForm 
          onSignupSuccess={handleSignupSuccess}
          onSwitchToLogin={() => setMode('login')}
        />
      )}
      
      {mode === 'onboarding' && signupData && (
        <UserOnboarding 
          initialEmail={signupData.email}
          initialName={signupData.name}
          onComplete={handleOnboardingComplete}
        />
      )}
    </div>
  );
};

export default Auth;