import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const avatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face",
];

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-background pointer-events-none" />
      
      <div className="relative max-w-4xl mx-auto text-center">
        <div className="animate-fade-up">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
            ✨ The modern publishing platform
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight mb-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
          Write. Publish.{' '}
          <span className="text-muted-foreground">Inspire.</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: '200ms' }}>
          Create beautiful, SEO-friendly blogs in minutes. No coding required.
          Join thousands of writers who trust Nova Chronicle.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-up" style={{ animationDelay: '300ms' }}>
          <Button variant="hero" size="lg" asChild>
            <Link to="/dashboard">
              Start your free trial
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button variant="heroOutline" size="lg" asChild>
            <Link to="/explore">View examples</Link>
          </Button>
        </div>

        <div className="flex items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: '400ms' }}>
          <div className="flex -space-x-2">
            {avatars.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="w-8 h-8 rounded-full border-2 border-background object-cover"
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Join <strong className="text-foreground">2,400+</strong> creators publishing today
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
