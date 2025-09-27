import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, Zap, Target, TrendingUp, CheckCircle, User, LogOut } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/hooks/use-toast";

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userInfo, logout, loading } = useProfile();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-hero-gradient rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">BrandPilot</span>
          </div>
          
          {/* User Info or Sign In */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : isAuthenticated && userInfo ? (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center space-x-2"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary text-white text-xs font-medium">
                      {userInfo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{userInfo.name}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={handleGetStarted}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Grow Your Brand.{" "}
            <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              Effortlessly.
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            BrandPilot finds engaging content and drafts AI-powered posts so you can focus on your business.
          </p>
          
          <Button 
            variant="hero" 
            size="xl" 
            onClick={handleGetStarted}
            className="mb-16"
          >
            {isAuthenticated ? "Go to Dashboard" : "Get Started"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card-gradient p-8 rounded-2xl shadow-subtle border border-border/50 hover:shadow-brand transition-all duration-300 transform hover:-translate-y-1">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Smart Content Discovery</h3>
            <p className="text-muted-foreground">
              Find relevant posts and conversations in your industry automatically.
            </p>
          </div>

          <div className="bg-card-gradient p-8 rounded-2xl shadow-subtle border border-border/50 hover:shadow-brand transition-all duration-300 transform hover:-translate-y-1">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">AI-Powered Writing</h3>
            <p className="text-muted-foreground">
              Generate engaging posts and comments tailored to your brand voice.
            </p>
          </div>

          <div className="bg-card-gradient p-8 rounded-2xl shadow-subtle border border-border/50 hover:shadow-brand transition-all duration-300 transform hover:-translate-y-1">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Growth Analytics</h3>
            <p className="text-muted-foreground">
              Track your engagement and optimize your content strategy.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-secondary/30 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-8">
              Perfect for Solo-preneurs & Small Businesses
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="font-semibold text-foreground">Personal Branding</h4>
                  <p className="text-muted-foreground text-sm">Build authority in your industry</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="font-semibold text-foreground">Startup Promotion</h4>
                  <p className="text-muted-foreground text-sm">Increase brand awareness efficiently</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="font-semibold text-foreground">Time Saving</h4>
                  <p className="text-muted-foreground text-sm">Automate content discovery and creation</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="font-semibold text-foreground">Consistent Posting</h4>
                  <p className="text-muted-foreground text-sm">Maintain active social presence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Ready to Grow Your Brand?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join hundreds of entrepreneurs using BrandPilot to amplify their online presence.
            </p>
            <Button 
              variant="gradient" 
              size="lg" 
              onClick={handleGetStarted}
            >
              {isAuthenticated ? "Continue to Dashboard" : "Start Your Journey"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;