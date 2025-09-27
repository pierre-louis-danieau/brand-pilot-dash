import { useState, useEffect } from "react";

interface CounterProps {
  end: number;
  duration: number;
  suffix?: string;
  prefix?: string;
}

const AnimatedCounter = ({ end, duration, suffix = "", prefix = "" }: CounterProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById(`counter-${end}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [end, isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (startTime === undefined) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <span id={`counter-${end}`} className="inline-block">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

const StatsSection = () => {
  const stats = [
    {
      number: 95,
      suffix: "%",
      label: "Time Saved on Content Creation",
      description: "Users report spending 95% less time on social media management"
    },
    {
      number: 300,
      suffix: "%",
      label: "Average Engagement Increase",
      description: "AI-optimized content performs 3x better than manual posts"
    },
    {
      number: 24,
      suffix: "/7",
      label: "Automated Monitoring",
      description: "Our AI never sleeps, constantly finding opportunities"
    },
    {
      number: 100,
      suffix: "+",
      label: "Posts Generated Daily",
      description: "Helping entrepreneurs worldwide create engaging content"
    }
  ];

  return (
    <div className="bg-gradient-to-r from-primary/5 to-secondary/5 py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            The Numbers Speak for Themselves
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of entrepreneurs who've transformed their social media presence with BrandPilot.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center group hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className="bg-card rounded-2xl p-8 shadow-subtle border border-border/50 hover:shadow-brand transition-all duration-300">
                <div className="text-4xl lg:text-5xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                  <AnimatedCounter
                    end={stat.number}
                    duration={2000}
                    suffix={stat.suffix}
                  />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {stat.label}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;