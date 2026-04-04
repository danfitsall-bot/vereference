import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { REFEREE_STATUSES } from "@/lib/constants";
import Link from "next/link";
import { FileText } from "lucide-react";

export default async function ReferencesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: referees } = await supabase
    .from("referees")
    .select("*, candidates!inner(full_name, position_applied)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white tracking-tight">References</h1>
        <p className="text-white/40 text-sm mt-0.5">All reference checks across candidates</p>
      </div>

      {referees && referees.length > 0 ? (
        <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: "var(--card)" }}>
          <div className="grid grid-cols-[1fr_140px_120px] gap-4 px-6 py-3 border-b border-white/6">
            <span className="text-xs font-medium text-white/30 uppercase tracking-wider">Referee</span>
            <span className="text-xs font-medium text-white/30 uppercase tracking-wider">For Candidate</span>
            <span className="text-xs font-medium text-white/30 uppercase tracking-wider">Status</span>
          </div>
          <div className="divide-y divide-white/5">
            {referees.map((referee: any) => {
              const statusConfig = REFEREE_STATUSES[referee.status as keyof typeof REFEREE_STATUSES] || REFEREE_STATUSES.pending;
              return (
                <Link
                  key={referee.id}
                  href={`/candidates/${referee.candidate_id}`}
                  className="grid grid-cols-[1fr_140px_120px] gap-4 items-center px-6 py-4 hover:bg-white/3 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-sm font-semibold text-white/70 flex-shrink-0">
                      {referee.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white group-hover:text-primary transition-colors truncate">{referee.full_name}</p>
                      <p className="text-xs text-white/40 truncate">{referee.relationship} at {referee.company}</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/50 truncate">{referee.candidates?.full_name}</p>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium w-fit ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-white/8 flex flex-col items-center justify-center py-20" style={{ background: "var(--card)" }}>
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <FileText className="h-5 w-5 text-white/25" />
          </div>
          <p className="text-sm text-white/40">No references yet. Add candidates to get started.</p>
        </div>
      )}
    </div>
  );
}
