import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Zap, 
  Brain, 
  MessageSquare, 
  Search, 
  Twitter, 
  Linkedin, 
  Facebook,
  Instagram,
  CheckCircle,
  Workflow
} from "lucide-react";
import Footer from "@/components/Footer";

const Product = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <button onClick={() => navigate("/")} className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-hero-gradient rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">BrandPilot</span>
            </button>
            
            <div className="hidden md:flex items-center space-x-6">
              <span className="text-foreground font-medium">Product</span>
              <button 
                onClick={() => navigate("/pricing")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </button>
            </div>
          </div>
          
          <Button onClick={() => navigate("/auth")} variant="gradient">
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            AI That Actually{" "}
            <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              Understands Your Brand
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Connect your social accounts and watch as BrandPilot intelligently grows your presence across platforms.
          </p>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Connect All Your Platforms
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            One dashboard to manage your entire social media presence
          </p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="bg-card-gradient p-6 rounded-xl border border-border/50 text-center">
            <Twitter className="h-12 w-12 text-[#1DA1F2] mx-auto mb-3" />
            <h3 className="font-semibold text-foreground">Twitter/X</h3>
            <p className="text-sm text-muted-foreground">Connect with industry leaders</p>
          </div>
          
          <div className="bg-card-gradient p-6 rounded-xl border border-border/50 text-center">
            <Linkedin className="h-12 w-12 text-[#0A66C2] mx-auto mb-3" />
            <h3 className="font-semibold text-foreground">LinkedIn</h3>
            <p className="text-sm text-muted-foreground">Build professional network</p>
          </div>
          
          <div className="bg-card-gradient p-6 rounded-xl border border-border/50 text-center">
            <Instagram className="h-12 w-12 text-[#E4405F] mx-auto mb-3" />
            <h3 className="font-semibold text-foreground">Instagram</h3>
            <p className="text-sm text-muted-foreground">Visual brand storytelling</p>
          </div>
          
          <div className="bg-card-gradient p-6 rounded-xl border border-border/50 text-center">
            <Facebook className="h-12 w-12 text-[#1877F2] mx-auto mb-3" />
            <h3 className="font-semibold text-foreground">Facebook</h3>
            <p className="text-sm text-muted-foreground">Reach wider audiences</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-secondary/30 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Three Ways to Generate Content
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              BrandPilot gives you multiple ways to create engaging content that resonates with your audience
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* AI Content Generation */}
            <div className="bg-background p-8 rounded-2xl shadow-subtle border border-border/50">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">AI Content Generation</h3>
              <p className="text-muted-foreground mb-6">
                Create original posts tailored to your brand voice and industry. Just provide a topic or idea, and watch AI craft engaging content.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Brand voice consistency</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Industry-specific insights</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Multiple format options</span>
                </div>
              </div>
            </div>

            {/* Content Curation */}
            <div className="bg-background p-8 rounded-2xl shadow-subtle border border-border/50">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Smart Content Curation</h3>
              <p className="text-muted-foreground mb-6">
                AI finds trending articles and news in your industry, then creates thoughtful reactions and summaries to share with your audience.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Trending topic discovery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Intelligent summarization</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Personal perspective</span>
                </div>
              </div>
            </div>

            {/* Smart Commenting */}
            <div className="bg-background p-8 rounded-2xl shadow-subtle border border-border/50">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Intelligent Commenting</h3>
              <p className="text-muted-foreground mb-6">
                Engage with relevant posts from other users in your industry with thoughtful, valuable comments that build relationships.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Relevant post discovery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Meaningful engagement</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Relationship building</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Simple Workflow, Powerful Results
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Set it up once, then let BrandPilot work in the background
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="h-16 w-16 bg-hero-gradient rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Connect & Configure</h3>
                <p className="text-muted-foreground">
                  Link your social accounts and tell us about your business, goals, and brand voice.
                </p>
              </div>
              
              <div className="text-center">
                <div className="h-16 w-16 bg-hero-gradient rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">AI Goes to Work</h3>
                <p className="text-muted-foreground">
                  Our AI analyzes your industry, finds opportunities, and creates content that matches your style.
                </p>
              </div>
              
              <div className="text-center">
                <div className="h-16 w-16 bg-hero-gradient rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Review & Publish</h3>
                <p className="text-muted-foreground">
                  Review suggested content, make tweaks if needed, and publish with one click.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary/30 py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Ready to Automate Your Growth?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join entrepreneurs who've 10x'd their social media presence while working half the time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gradient" size="xl" onClick={() => navigate("/auth")}>
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="xl" onClick={() => navigate("/pricing")}>
                See Pricing
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

export default Product;