import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, CheckCircle, X } from "lucide-react";
import Footer from "@/components/Footer";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for getting started",
      features: [
        "1 social media account",
        "5 AI-generated posts per month", 
        "Basic content curation",
        "Community support",
        "Basic analytics"
      ],
      limitations: [
        "No smart commenting",
        "No advanced scheduling",
        "Limited customization"
      ],
      cta: "Start Free",
      variant: "outline" as const,
      popular: false
    },
    {
      name: "Professional",
      price: "$29",
      description: "For serious entrepreneurs",
      features: [
        "3 social media accounts",
        "Unlimited AI-generated posts",
        "Advanced content curation",
        "Smart commenting on relevant posts",
        "Advanced scheduling",
        "Custom brand voice training",
        "Priority support",
        "Detailed analytics",
        "Content calendar"
      ],
      limitations: [],
      cta: "Start Free Trial", 
      variant: "gradient" as const,
      popular: true
    },
    {
      name: "Growth",
      price: "$79",
      description: "For scaling businesses",
      features: [
        "Unlimited social media accounts",
        "Everything in Professional",
        "Multi-brand management",
        "Team collaboration",
        "Custom integrations",
        "White-label reporting",
        "Dedicated account manager",
        "Custom AI model training",
        "Advanced automation rules"
      ],
      limitations: [],
      cta: "Start Free Trial",
      variant: "outline" as const,
      popular: false
    }
  ];

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
              <button 
                onClick={() => navigate("/product")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Product
              </button>
              <span className="text-foreground font-medium">Pricing</span>
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
            Simple Pricing for{" "}
            <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              Every Entrepreneur
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Start free, scale as you grow. No hidden fees, no complex contracts.
          </p>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="container mx-auto px-6 pb-20">
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={plan.name}
              className={`relative bg-card-gradient rounded-2xl border p-8 ${
                plan.popular 
                  ? "border-primary shadow-brand scale-105" 
                  : "border-border/50 shadow-subtle"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-2 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.price !== "Free" && <span className="text-muted-foreground">/month</span>}
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              <Button 
                variant={plan.variant}
                className="w-full mb-8"
                size="lg"
                onClick={() => navigate("/auth")}
              >
                {plan.cta}
              </Button>

              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">What's included:</h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation, limitationIndex) => (
                    <li key={limitationIndex} className="flex items-start space-x-3">
                      <X className="h-5 w-5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground/70 line-through">{limitation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-secondary/30 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-background p-6 rounded-xl border border-border/50">
              <h3 className="font-semibold text-foreground mb-2">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">Yes! You can cancel your subscription at any time. No contracts, no cancellation fees.</p>
            </div>
            
            <div className="bg-background p-6 rounded-xl border border-border/50">
              <h3 className="font-semibold text-foreground mb-2">What happens to my content if I cancel?</h3>
              <p className="text-muted-foreground">You'll retain access to all your content for 30 days after cancellation, giving you time to export everything.</p>
            </div>
            
            <div className="bg-background p-6 rounded-xl border border-border/50">
              <h3 className="font-semibold text-foreground mb-2">Do you offer refunds?</h3>
              <p className="text-muted-foreground">We offer a 14-day free trial, so you can test everything before paying. If you're not satisfied within the first 30 days of a paid plan, we'll provide a full refund.</p>
            </div>
            
            <div className="bg-background p-6 rounded-xl border border-border/50">
              <h3 className="font-semibold text-foreground mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-muted-foreground">Absolutely! You can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at your next billing cycle.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Ready to Start Growing?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of entrepreneurs who've transformed their social media presence with BrandPilot.
            </p>
            <Button variant="gradient" size="xl" onClick={() => navigate("/auth")}>
              Start Your Free Trial
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Pricing;