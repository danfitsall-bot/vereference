import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Building, AlertTriangle } from "lucide-react";
import { CANDIDATE_STATUSES, REFEREE_STATUSES, FRAUD_SEVERITY_COLORS } from "@/lib/constants";
import { SendInviteButton } from "@/components/send-invite-button";

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: candidate } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", id)
    .single();

  if (!candidate) notFound();

  const { data: referees } = await supabase
    .from("referees")
    .select("*")
    .eq("candidate_id", id)
    .order("created_at", { ascending: true });

  const { data: fraudSignals } = await supabase
    .from("fraud_signals")
    .select("*")
    .eq("candidate_id", id)
    .eq("dismissed", false)
    .order("created_at", { ascending: false });

  const refereeIds = (referees || []).map((r: any) => r.id);
  const { data: responses } = refereeIds.length > 0
    ? await supabase.from("responses").select("*").in("referee_id", refereeIds)
    : { data: [] as any[] };

  const statusConfig = CANDIDATE_STATUSES[candidate.status as keyof typeof CANDIDATE_STATUSES] || CANDIDATE_STATUSES.pending;

  return (
    <div className="p-8 max-w-4xl">
      <Link href="/candidates" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Candidates
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/8 flex items-center justify-center text-xl font-bold text-white/70 flex-shrink-0">
            {candidate.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{candidate.full_name}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
            <p className="text-white/40 text-sm mt-0.5">{candidate.position_applied}</p>
            <div className="flex items-center gap-4 mt-1.5 text-xs text-white/30">
              <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {candidate.email}</span>
              {candidate.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {candidate.phone}</span>}
            </div>
          </div>
        </div>
        {candidate.status === "pending" && (
          <SendInviteButton candidateId={id} />
        )}
      </div>

      {/* Fraud Alerts */}
      {fraudSignals && fraudSignals.length > 0 && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <h2 className="text-sm font-semibold text-red-400">Fraud Alerts ({fraudSignals.length})</h2>
          </div>
          <div className="space-y-2">
            {fraudSignals.map((signal) => (
              <div key={signal.id} className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/3 border border-white/5">
                <span className="text-sm text-white/70">{signal.description}</span>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ml-3 flex-shrink-0 ${FRAUD_SEVERITY_COLORS[signal.severity as keyof typeof FRAUD_SEVERITY_COLORS]}`}>
                  {signal.severity.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Referees */}
      <div className="rounded-xl border border-white/8" style={{ background: "var(--card)" }}>
        <div className="px-6 py-4 border-b border-white/6">
          <h2 className="text-sm font-semibold text-white">Referees ({referees?.length ?? 0})</h2>
        </div>

        {referees && referees.length > 0 ? (
          <div className="divide-y divide-white/5">
            {referees.map((referee) => {
              const refStatus = REFEREE_STATUSES[referee.status as keyof typeof REFEREE_STATUSES] || REFEREE_STATUSES.pending;
              const refereeResponses = (responses || []).filter(r => r.referee_id === referee.id);
              return (
                <div key={referee.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{referee.full_name}</p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {referee.relationship} at {referee.company}
                        {referee.job_title && ` · ${referee.job_title}`}
                      </p>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-white/30">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {referee.email}</span>
                        {referee.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {referee.phone}</span>}
                        <span className="flex items-center gap-1"><Building className="h-3 w-3" /> {referee.company}</span>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${refStatus.color}`}>
                      {refStatus.label}
                    </span>
                  </div>

                  {referee.status === "completed" && refereeResponses.length > 0 && (
                    <div className="mt-4 space-y-4 pt-4 border-t border-white/6">
                      {refereeResponses.map((response) => (
                        <div key={response.id}>
                          <p className="text-xs font-medium text-white/40 mb-1">{response.question_text}</p>
                          {response.answer_rating ? (
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className={`text-base ${star <= response.answer_rating ? "text-primary" : "text-white/15"}`}>
                                  ★
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-white/70">{response.answer_text || "—"}</p>
                          )}
                        </div>
                      ))}
                      {refereeResponses.some(r => r.source === "voice_transcript") && (
                        <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/20">
                          Completed via Voice
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm text-white/30">
              {candidate.status === "pending" || candidate.status === "invited"
                ? "Waiting for candidate to submit referee details."
                : "No referees found."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
