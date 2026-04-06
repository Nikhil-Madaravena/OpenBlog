import { BookOpen, TrendingUp, Users, Zap, Globe, Shield } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Rich Text Editor",
    description: "A powerful, distraction-free editor with markdown support, embeds, and beautiful formatting.",
  },
  {
    icon: TrendingUp,
    title: "Built-in Analytics",
    description: "Track views, reads, and engagement. Understand your audience with actionable insights.",
  },
  {
    icon: Users,
    title: "Collaborative Writing",
    description: "Invite co-authors, leave comments, and manage editorial workflows seamlessly.",
  },
  {
    icon: Zap,
    title: "Instant Publishing",
    description: "One click to publish. Your content goes live with SEO optimization built in.",
  },
  {
    icon: Globe,
    title: "Custom Domains",
    description: "Use your own domain for a fully branded experience your readers will remember.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your data stays yours. No tracking scripts, no ads, no compromises on privacy.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-accent uppercase tracking-wider">Features</span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">
            Everything you need to publish
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From writing to analytics, OpenBlog has every tool a modern writer needs.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group p-8 rounded-2xl border border-border bg-card hover:shadow-lg hover:border-accent/30 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2 font-heading">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
