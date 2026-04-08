import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import useSEO from "@/hooks/useSEO";

const Login = () => {
  useSEO({ title: "Login — PawaMore Systems", description: "Log in to your PawaMore Systems account." });
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      const intendedPath = sessionStorage.getItem("intendedPath") || "/";
      sessionStorage.removeItem("intendedPath");
      navigate(intendedPath, { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Improve error messages for common issues
        if (error.message.includes("Invalid login")) {
          setError("Invalid email or password. Please check and try again.");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Please verify your email address before logging in.");
        } else {
          setError(error.message);
        }
      }
      // Navigation is handled by useEffect when user state changes
    } catch (err: any) {
      setError("Connection error. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-3"></div>
            <p className="text-muted-foreground text-sm">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-6 sm:py-12 lg:py-20">
        <div className="container max-w-md px-4 sm:px-6">
          <div className="bg-card rounded-2xl p-4 sm:p-6 lg:p-8 border border-border shadow-[var(--shadow-card)] mx-auto">
            <h1 className="font-display font-extrabold text-xl sm:text-2xl lg:text-3xl mb-2">Welcome Back</h1>
            <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6">Log in to your PawaMore account</p>

            {error && <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 mb-4">{error}</div>}

            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]" />
              <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]" />
              <Button type="submit" variant="amber" className="w-full min-h-[44px] sm:min-h-[48px]" size="lg" disabled={loading}>
                {loading ? "Logging in..." : "Log In →"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground space-y-2">
              <Link to="/forgot-password" className="text-primary hover:underline block">Forgot password?</Link>
              <p>Don't have an account? <Link to="/signup" className="text-primary font-semibold hover:underline">Sign Up</Link></p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Login;
