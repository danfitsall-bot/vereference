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
    free: "bg-gray-100 text-gray-500",
    pro: "bg-blue-50 text-blue-600",
    enterprise: "bg-teal-50 text-teal-700",
  };

  const credits = profile?.credits_remaining ?? 10;
  const creditsPercent = Math.min(100, (credits / 10) * 100);

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-[#0F1B2D] tracking-tight">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Your account and plan details</p>
      </div>

      {/* Account info */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-[#0F1B2D]">Account</h2>
        </div>
        <div className="divide-y divide-gray-50">
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-sm text-gray-500">Full Name</span>
            <span className="text-sm text-[#0F1B2D] font-medium">{profile?.full_name || <span className="text-gray-300 italic">Not set</span>}</span>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-sm text-[#0F1B2D] font-medium">{user.email}</span>
          </div>
        </div>
      </div>

      {/* Company */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Building className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-[#0F1B2D]">Company</h2>
        </div>
        <div className="divide-y divide-gray-50">
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-sm text-gray-500">Company Name</span>
            <span className="text-sm text-[#0F1B2D] font-medium">{profile?.company_name || <span className="text-gray-300 italic">Not set</span>}</span>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-sm text-gray-500">Company Domain</span>
            <span className="text-sm text-[#0F1B2D] font-medium">{profile?.company_domain || <span className="text-gray-300 italic">Not set</span>}</span>
          </div>
        </div>
      </div>

      {/* Plan & Credits */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-[#0F1B2D]">Plan & Credits</h2>
        </div>
        <div className="divide-y divide-gray-50">
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-sm text-gray-500">Current Plan</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${planColors[plan] || planColors.free}`}>
              {planLabel}
            </span>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Credits Remaining</span>
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-[#0A6E6E]" />
                <span className="text-sm text-[#0F1B2D] font-bold">{credits}</span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${credits > 3 ? "bg-[#0A6E6E]" : "bg-red-500"}`}
                style={{ width: `${creditsPercent}%` }}
              />
            </div>
            {credits <= 3 && (
              <p className="text-xs text-red-500 mt-2">Low credits — contact support to top up.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
