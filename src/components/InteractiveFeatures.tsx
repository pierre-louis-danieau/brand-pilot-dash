import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Target, Zap, TrendingUp, BarChart3, Users, Clock, MessageCircle, Sparkles } from "lucide-react";

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  benefits: string[];
}

const features: Feature[] = [
  {
    id: "discovery",
    title: "Smart Content Discovery",
    description: "AI scans thousands of posts to find trending content in your industry automatically.",
    icon: Target,
    color: "from-blue-500 to-blue-600",
    benefits: [
      "Real-time trend detection",
      "Industry-specific filtering",
      "Engagement prediction",
      "Competitor analysis"
    ]
  },
  {
    id: "creation",
    title: "AI-Powered Writing",
    description: "Generate engaging posts, comments, and replies that match your brand voice perfectly.",
    icon: Zap,
    color: "from-purple-500 to-purple-600",
    benefits: [
      "Brand voice consistency",
      "Multiple content formats",
      "Tone customization",
      "Grammar optimization"
    ]
  },
  {
    id: "analytics",
    title: "Growth Analytics",
    description: "Track performance metrics and get actionable insights to optimize your strategy.",
    icon: TrendingUp,
    color: "from-green-500 to-green-600",
    benefits: [
      "Real-time metrics",
      "Growth predictions",
      "Audience insights",
      "ROI tracking"
    ]
  },
  {
    id: "automation",
    title: "Smart Automation",
    description: "Schedule posts, auto-engage with relevant content, and manage multiple platforms.",
    icon: BarChart3,
    color: "from-orange-500 to-orange-600",
    benefits: [
      "Smart scheduling",
      "Auto-engagement",
      "Multi-platform sync",
      "Time optimization"
    ]
  }
];

const InteractiveFeatures = () => {
  const [activeFeature, setActiveFeature] = useState("discovery");
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const active = features.find(f => f.id === activeFeature) || features[0];

  return (
    <div className="bg-gradient-to-br from-secondary/20 to-background py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4 animate-fade-in">
            Powerful Features That Work Together
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Every feature is designed to save you time while maximizing your social media impact.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
          {/* Interactive Feature Buttons */}
          <div className="space-y-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = activeFeature === feature.id;
              const isHovered = hoveredFeature === feature.id;
              
              return (
                <Button
                  key={feature.id}
                  variant="ghost"
                  onClick={() => setActiveFeature(feature.id)}
                  onMouseEnter={() => setHoveredFeature(feature.id)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className={`
                    w-full p-6 h-auto justify-start text-left transition-all duration-300 
                    ${isActive ? 'bg-primary/10 border-primary/20 shadow-lg transform scale-105' : 'hover:bg-card'}
                    ${isHovered && !isActive ? 'transform scale-102' : ''}
                    border border-border/50 rounded-xl group
                  `}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="flex items-start space-x-4 w-full">
                    <div className={`
                      h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0
                      bg-gradient-to-r ${feature.color} transition-all duration-300
                      ${isActive ? 'shadow-lg scale-110' : 'group-hover:scale-105'}
                    `}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`
                        text-lg font-semibold mb-2 transition-colors duration-300
                        ${isActive ? 'text-primary' : 'text-foreground group-hover:text-primary/80'}
                      `}>
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Feature Details Panel */}
          <div className="bg-card-gradient rounded-2xl p-8 shadow-subtle border border-border/50 animate-fade-in">
            <div className="flex items-center space-x-4 mb-6">
              <div className={`
                h-16 w-16 rounded-2xl flex items-center justify-center
                bg-gradient-to-r ${active.color} shadow-lg
              `}>
                <active.icon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">{active.title}</h3>
                <p className="text-muted-foreground">{active.description}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                Key Benefits
              </h4>
              {active.benefits.map((benefit, index) => (
                <div 
                  key={benefit}
                  className="flex items-center space-x-3 group animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 group-hover:scale-150 transition-transform duration-200" />
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <div className="flex items-center space-x-2 text-primary">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Pro Tip</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Combine this feature with our automation tools to maximize your time savings and engagement rates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveFeatures;