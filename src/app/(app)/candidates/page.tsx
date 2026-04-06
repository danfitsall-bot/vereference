import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CANDIDATE_STATUSES } from "@/lib/constants";
import { Plus, Users } from "lucide-react";

export default async function CandidatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: candidates } = await supabase
    .from("candidates")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1B2D] tracking-tight">Candidates</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your reference checks</p>
        </div>
        <Link
          href="/candidates/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0A6E6E] text-white text-sm font-semibold hover:bg-[#085959] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Candidate
        </Link>
      </div>

      {candidates && candidates.length > 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="grid grid-cols-[1fr_120px_80px] gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Candidate</span>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Status</span>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Added</span>
          </div>
          <div className="divide-y divide-gray-50">
            {candidates.map((candidate) => {
              const statusConfig = CANDIDATE_STATUSES[candidate.status as keyof typeof CANDIDATE_STATUSES] || CANDIDATE_STATUSES.pending;
              return (
                <Link
                  key={candidate.id}
                  href={`/candidates/${candidate.id}`}
                  className="grid grid-cols-[1fr_120px_80px] gap-4 items-center px-6 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-500 flex-shrink-0">
                      {candidate.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#0F1B2D] group-hover:text-[#0A6E6E] transition-colors truncate">{candidate.full_name}</p>
                      <p className="text-xs text-gray-400 truncate">{candidate.position_applied} · {candidate.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap w-fit ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                  <span className="text-xs text-gray-300 whitespace-nowrap">
                    {new Date(candidate.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col items-center justify-center py-20">
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
  );
}
