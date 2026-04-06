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
    { label: "Total Candidates", value: candidateCount ?? 0, icon: Users, accent: "text-blue-600", bg: "bg-blue-50" },
    { label: "Completed", value: completedCount ?? 0, icon: CheckCircle, accent: "text-[#0A6E6E]", bg: "bg-teal-50" },
    { label: "Awaiting References", value: pendingRefCount ?? 0, icon: FileText, accent: "text-amber-600", bg: "bg-amber-50" },
    { label: "Fraud Alerts", value: fraudCount ?? 0, icon: AlertTriangle, accent: "text-red-600", bg: "bg-red-50" },
  ];

  const statusStyles: Record<string, string> = {
    completed: "bg-teal-50 text-teal-700",
    submitted: "bg-purple-50 text-purple-700",
    invited: "bg-blue-50 text-blue-700",
    pending: "bg-gray-100 text-gray-500",
    expired: "bg-red-50 text-red-600",
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1B2D] tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Overview of your reference checks</p>
        </div>
        <Link
          href="/candidates/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0A6E6E] text-white text-sm font-semibold hover:bg-[#085959] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Candidate
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{stat.label}</span>
              <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-3.5 w-3.5 ${stat.accent}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#0F1B2D]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-[#0F1B2D]">Recent Candidates</h2>
          <Link href="/candidates" className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#0A6E6E] transition-colors">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentCandidates && recentCandidates.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {recentCandidates.map((candidate) => (
              <Link
                key={candidate.id}
                href={`/candidates/${candidate.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-500 flex-shrink-0">
                    {candidate.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0F1B2D] group-hover:text-[#0A6E6E] transition-colors">{candidate.full_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{candidate.position_applied}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[candidate.status] || statusStyles.pending}`}>
                    {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                  </span>
                  <span className="text-xs text-gray-300">
                    {new Date(candidate.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <Users className="h-5 w-5 text-gray-300" />
            </div>
            <p className="text-sm text-gray-400 mb-4">No candidates yet</p>
            <Link
              href="/candidates/new"
              className="text-sm text-[#0A6E6E] hover:text-[#085959] font-medium transition-colors"
            >
              Add your first candidate
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
