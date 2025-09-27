import { Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-card-gradient border-t border-border/50">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 bg-hero-gradient rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">BrandPilot</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              AI-powered social media growth for ambitious entrepreneurs. Focus on your business while we handle your brand.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => navigate("/product")}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Features
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/pricing")}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/dashboard")}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Solutions</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-muted-foreground text-sm">For Freelancers</span>
              </li>
              <li>
                <span className="text-muted-foreground text-sm">For Startups</span>
              </li>
              <li>
                <span className="text-muted-foreground text-sm">Personal Branding</span>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-muted-foreground text-sm">About</span>
              </li>
              <li>
                <span className="text-muted-foreground text-sm">Privacy</span>
              </li>
              <li>
                <span className="text-muted-foreground text-sm">Terms</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 BrandPilot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;