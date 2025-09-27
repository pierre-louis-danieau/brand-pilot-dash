import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import UserOnboarding from "@/components/UserOnboarding";
import { useProfile } from "@/hooks/useProfile";

type AuthMode = 'login' | 'signup';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('signup'); // Default to signup (onboarding)
  const navigate = useNavigate();
  const { login } = useProfile();

  const handleLogin = (profile: any, userInfo: { email: string; name: string }) => {
    login(profile, userInfo);
    navigate("/dashboard");
  };

  const handleOnboardingComplete = (profile: any, userInfo: { email: string; name: string }) => {
    login(profile, userInfo);
    navigate("/dashboard");
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
        <UserOnboarding 
          onComplete={handleOnboardingComplete}
          onSwitchToLogin={() => setMode('login')}
        />
      )}
    </div>
  );
};

export default Auth;
