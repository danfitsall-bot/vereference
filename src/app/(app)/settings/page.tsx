import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const fields = [
    { label: "Full Name", value: profile?.full_name || "—" },
    { label: "Email", value: user.email || "—" },
    { label: "Company", value: profile?.company_name || "—" },
    { label: "Plan", value: profile?.plan ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) : "Free" },
    { label: "Credits Remaining", value: String(profile?.credits_remaining ?? 10) },
  ];

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-white/40 text-sm mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="rounded-xl border border-white/8" style={{ background: "var(--card)" }}>
        <div className="px-6 py-4 border-b border-white/6">
          <h2 className="text-sm font-semibold text-white">Account</h2>
        </div>
        <div className="divide-y divide-white/5">
          {fields.map((field) => (
            <div key={field.label} className="flex items-center justify-between px-6 py-4">
              <span className="text-sm text-white/40">{field.label}</span>
              <span className="text-sm text-white font-medium">{field.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
