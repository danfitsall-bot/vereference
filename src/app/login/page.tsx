"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#F7F5F2]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 rounded-2xl bg-[#0A6E6E] flex items-center justify-center mb-4 shadow-sm">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F1B2D]">VeReference</h1>
          <p className="text-sm text-gray-500 mt-1">AI-Powered Reference Verification</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 rounded-lg p-1">
              <TabsTrigger value="login" className="rounded-md text-sm data-[state=active]:bg-white data-[state=active]:text-[#0F1B2D] data-[state=active]:shadow-sm text-gray-500">
                Log In
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-md text-sm data-[state=active]:bg-white data-[state=active]:text-[#0F1B2D] data-[state=active]:shadow-sm text-gray-500">
                Sign Up
              </TabsTrigger>
            </TabsList>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-5 border border-red-200">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-teal-50 text-teal-700 text-sm px-4 py-3 rounded-lg mb-5 border border-teal-200">
                {message}
              </div>
            )}

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-sm text-gray-600">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white border-gray-200 text-[#0F1B2D] placeholder:text-gray-300 focus:border-[#0A6E6E] h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="login-password" className="text-sm text-gray-600">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white border-gray-200 text-[#0F1B2D] placeholder:text-gray-300 focus:border-[#0A6E6E] h-10"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-10 bg-[#0A6E6E] text-white hover:bg-[#085959] font-semibold mt-2"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Log In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name" className="text-sm text-gray-600">Full Name</Label>
                  <Input
                    id="signup-name"
                    placeholder="Jane Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="bg-white border-gray-200 text-[#0F1B2D] placeholder:text-gray-300 focus:border-[#0A6E6E] h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-company" className="text-sm text-gray-600">Company Name</Label>
                  <Input
                    id="signup-company"
                    placeholder="Acme Inc."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="bg-white border-gray-200 text-[#0F1B2D] placeholder:text-gray-300 focus:border-[#0A6E6E] h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-sm text-gray-600">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white border-gray-200 text-[#0F1B2D] placeholder:text-gray-300 focus:border-[#0A6E6E] h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-sm text-gray-600">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-white border-gray-200 text-[#0F1B2D] placeholder:text-gray-300 focus:border-[#0A6E6E] h-10"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-10 bg-[#0A6E6E] text-white hover:bg-[#085959] font-semibold mt-2"
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
