import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, Zap, Target, TrendingUp, CheckCircle, User, LogOut, Clock, Users, BarChart3 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";

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
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-hero-gradient rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">BrandPilot</span>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => navigate("/product")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Product
              </button>
              <button 
                onClick={() => navigate("/pricing")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </button>
            </div>
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
            AI-Powered Social Media{" "}
            <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              for Busy Entrepreneurs
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Perfect for freelancers and startup founders. Let AI handle your social media growth while you focus on what matters most - building your business.
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

      {/* Target Audience Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Built for Ambitious Entrepreneurs
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether you're a freelancer building your personal brand or a startup founder launching your business, BrandPilot grows with you.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Freelancers */}
            <div className="bg-card-gradient p-8 rounded-2xl shadow-subtle border border-border/50">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <User className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">For Freelancers</h3>
              <p className="text-muted-foreground mb-6">
                Build your personal brand and attract high-value clients while focusing on delivering exceptional work.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Establish thought leadership in your niche</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Share expertise without time investment</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Build trust with potential clients</span>
                </div>
              </div>
            </div>
            
            {/* Startup Founders */}
            <div className="bg-card-gradient p-8 rounded-2xl shadow-subtle border border-border/50">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">For Startup Founders</h3>
              <p className="text-muted-foreground mb-6">
                Scale your brand awareness and build community around your product without hiring a social media team.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Generate buzz around product launches</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Engage with industry conversations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Build investor and customer confidence</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-secondary/30 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Why Choose BrandPilot?
            </h2>
            <p className="text-xl text-muted-foreground">
              Stop struggling with social media. Let AI do the heavy lifting while you focus on growing your business.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Save 10+ Hours Weekly</h3>
              <p className="text-muted-foreground">
                Automate content discovery, creation, and engagement so you can focus on your core business.
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Grow Your Audience</h3>
              <p className="text-muted-foreground">
                Connect with your ideal customers and build a loyal following through consistent, valuable content.
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Boost Brand Authority</h3>
              <p className="text-muted-foreground">
                Establish yourself as an industry expert with AI-powered insights and engaging content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Ready to Transform Your Social Media?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join ambitious entrepreneurs who've reclaimed their time while growing their brands with BrandPilot.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="gradient" 
                size="xl" 
                onClick={handleGetStarted}
              >
                {isAuthenticated ? "Go to Dashboard" : "Start Free Trial"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="xl" 
                onClick={() => navigate("/product")}
              >
                Learn More
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • 14-day free trial
            </p>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Landing;