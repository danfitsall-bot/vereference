"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, company_name: companyName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setMessage("Check your email for a confirmation link.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-bold text-xl">V</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">VeReference</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-Powered Reference Verification</p>
        </div>

        <div className="rounded-2xl border border-white/8 p-8" style={{ background: "var(--card)" }}>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5 rounded-lg p-1">
              <TabsTrigger value="login" className="rounded-md text-sm data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50">
                Log In
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-md text-sm data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50">
                Sign Up
              </TabsTrigger>
            </TabsList>

            {error && (
              <div className="bg-destructive/15 text-destructive text-sm px-4 py-3 rounded-lg mb-5 border border-destructive/20">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-primary/15 text-primary text-sm px-4 py-3 rounded-lg mb-5 border border-primary/20">
                {message}
              </div>
            )}

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-sm text-white/70">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-primary/50 h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="login-password" className="text-sm text-white/70">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-primary/50 h-10"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold mt-2"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Log In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name" className="text-sm text-white/70">Full Name</Label>
                  <Input
                    id="signup-name"
                    placeholder="Jane Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-primary/50 h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-company" className="text-sm text-white/70">Company Name</Label>
                  <Input
                    id="signup-company"
                    placeholder="Acme Inc."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-primary/50 h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-sm text-white/70">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-primary/50 h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-sm text-white/70">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-primary/50 h-10"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold mt-2"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
