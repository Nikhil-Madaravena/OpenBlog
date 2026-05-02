import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PenLine, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const ok = await login(email, password);
        if (ok) {
          toast.success("Welcome back!");
          navigate(from);
        } else {
          toast.error("Invalid credentials. Try sarah@openblog.co / password");
        }
      } else {
        if (!name.trim()) {
          toast.error("Please enter your name");
          return;
        }
        const ok = await signup(name, email, password);
        if (ok) {
          toast.success("Account created! Welcome to OpenBlog.");
          navigate(from);
        } else {
          toast.error("Email already taken or something went wrong");
        }
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground flex items-center justify-center">
              <PenLine className="w-5 h-5 text-primary" />
            </div>
            <span className="text-2xl font-bold font-heading text-primary-foreground">OpenBlog</span>
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground font-heading leading-tight mb-4">
            Where words find their audience.
          </h1>
          <p className="text-primary-foreground/70 leading-relaxed">
            Join thousands of writers creating beautiful, SEO-optimized blogs. Start your writing journey today.
          </p>
          <div className="mt-8 p-4 bg-primary-foreground/10 rounded-xl border border-primary-foreground/20">
            <p className="text-primary-foreground/80 text-sm font-medium">Demo credentials:</p>
            <p className="text-primary-foreground/60 text-sm mt-1">sarah@openblog.co / password</p>
            <p className="text-primary-foreground/60 text-sm">marcus@openblog.co / password</p>
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <PenLine className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold font-heading text-foreground">OpenBlog</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground font-heading mb-2">
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            {isLogin ? "Enter your credentials to access your dashboard" : "Start your writing journey today"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={6}
              />
            </div>

            <Button variant="hero" className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Please wait...</>
              ) : (
                <>{isLogin ? "Sign In" : "Create Account"}<ArrowRight className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-foreground font-medium hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>

          <div className="mt-4 text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
