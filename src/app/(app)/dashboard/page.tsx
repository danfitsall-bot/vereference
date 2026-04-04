import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, FileText, AlertTriangle, CheckCircle, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { count: candidateCount } = await supabase
    .from("candidates")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: completedCount } = await supabase
    .from("candidates")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "completed");

  const { count: pendingRefCount } = await supabase
    .from("referees")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .in("status", ["pending", "email_sent"]);

  const { count: fraudCount } = await supabase
    .from("fraud_signals")
    .select("*, candidates!inner(user_id)", { count: "exact", head: true })
    .eq("candidates.user_id", user.id)
    .eq("dismissed", false)
    .in("severity", ["high", "critical"]);

  const { data: recentCandidates } = await supabase
    .from("candidates")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(8);

  const stats = [
    { label: "Total Candidates", value: candidateCount ?? 0, icon: Users, accent: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Completed", value: completedCount ?? 0, icon: CheckCircle, accent: "text-primary", bg: "bg-primary/10" },
    { label: "Awaiting References", value: pendingRefCount ?? 0, icon: FileText, accent: "text-yellow-400", bg: "bg-yellow-400/10" },
    { label: "Fraud Alerts", value: fraudCount ?? 0, icon: AlertTriangle, accent: "text-red-400", bg: "bg-red-400/10" },
  ];

  const statusStyles: Record<string, string> = {
    completed: "bg-primary/15 text-primary",
    submitted: "bg-purple-400/15 text-purple-400",
    invited: "bg-blue-400/15 text-blue-400",
    pending: "bg-white/10 text-white/50",
    expired: "bg-red-400/15 text-red-400",
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-white/40 text-sm mt-0.5">Overview of your reference checks</p>
        </div>
        <Link
          href="/candidates/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Candidate
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/8 p-5" style={{ background: "var(--card)" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/40 font-medium uppercase tracking-wider">{stat.label}</span>
              <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-3.5 w-3.5 ${stat.accent}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/8" style={{ background: "var(--card)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
          <h2 className="text-sm font-semibold text-white">Recent Candidates</h2>
          <Link href="/candidates" className="flex items-center gap-1 text-xs text-white/40 hover:text-primary transition-colors">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentCandidates && recentCandidates.length > 0 ? (
          <div className="divide-y divide-white/5">
            {recentCandidates.map((candidate) => (
              <Link
                key={candidate.id}
                href={`/candidates/${candidate.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-sm font-semibold text-white/70 flex-shrink-0">
                    {candidate.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">{candidate.full_name}</p>
                    <p className="text-xs text-white/40 mt-0.5">{candidate.position_applied}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[candidate.status] || statusStyles.pending}`}>
                    {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                  </span>
                  <span className="text-xs text-white/25">
                    {new Date(candidate.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Users className="h-5 w-5 text-white/25" />
            </div>
            <p className="text-sm text-white/40 mb-4">No candidates yet</p>
            <Link
              href="/candidates/new"
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Add your first candidate
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
