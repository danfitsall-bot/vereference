import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User, Building, CreditCard, Zap } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const plan = profile?.plan ?? "free";
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
  const planColors: Record<string, string> = {
    free: "bg-white/10 text-white/50",
    pro: "bg-blue-400/15 text-blue-400",
    enterprise: "bg-primary/15 text-primary",
  };

  const credits = profile?.credits_remaining ?? 10;
  const creditsPercent = Math.min(100, (credits / 10) * 100);

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-white/40 text-sm mt-0.5">Your account and plan details</p>
      </div>

      {/* Account info */}
      <div className="rounded-xl border border-white/8 mb-6" style={{ background: "var(--card)" }}>
        <div className="px-6 py-4 border-b border-white/6 flex items-center gap-2">
          <User className="h-4 w-4 text-white/40" />
          <h2 className="text-sm font-semibold text-white">Account</h2>
        </div>
        <div className="divide-y divide-white/5">
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-sm text-white/40">Full Name</span>
            <span className="text-sm text-white font-medium">{profile?.full_name || <span className="text-white/25 italic">Not set</span>}</span>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-sm text-white/40">Email</span>
            <span className="text-sm text-white font-medium">{user.email}</span>
          </div>
        </div>
      </div>

      {/* Company */}
      <div className="rounded-xl border border-white/8 mb-6" style={{ background: "var(--card)" }}>
        <div className="px-6 py-4 border-b border-white/6 flex items-center gap-2">
          <Building className="h-4 w-4 text-white/40" />
          <h2 className="text-sm font-semibold text-white">Company</h2>
        </div>
        <div className="divide-y divide-white/5">
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-sm text-white/40">Company Name</span>
            <span className="text-sm text-white font-medium">{profile?.company_name || <span className="text-white/25 italic">Not set</span>}</span>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-sm text-white/40">Company Domain</span>
            <span className="text-sm text-white font-medium">{profile?.company_domain || <span className="text-white/25 italic">Not set</span>}</span>
          </div>
        </div>
      </div>

      {/* Plan & Credits */}
      <div className="rounded-xl border border-white/8" style={{ background: "var(--card)" }}>
        <div className="px-6 py-4 border-b border-white/6 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-white/40" />
          <h2 className="text-sm font-semibold text-white">Plan & Credits</h2>
        </div>
        <div className="divide-y divide-white/5">
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-sm text-white/40">Current Plan</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${planColors[plan] || planColors.free}`}>
              {planLabel}
            </span>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/40">Credits Remaining</span>
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm text-white font-bold">{credits}</span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-white/8 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${credits > 3 ? "bg-primary" : "bg-red-400"}`}
                style={{ width: `${creditsPercent}%` }}
              />
            </div>
            {credits <= 3 && (
              <p className="text-xs text-red-400 mt-2">Low credits — contact support to top up.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
