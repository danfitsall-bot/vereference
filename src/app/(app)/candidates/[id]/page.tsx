import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, Building } from "lucide-react";
import { CANDIDATE_STATUSES, REFEREE_STATUSES, FRAUD_SEVERITY_COLORS } from "@/lib/constants";

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
    ? await supabase
        .from("responses")
        .select("*")
        .in("referee_id", refereeIds)
    : { data: [] as any[] };

  const statusConfig = CANDIDATE_STATUSES[candidate.status as keyof typeof CANDIDATE_STATUSES] || CANDIDATE_STATUSES.pending;

  return (
    <div>
      <Link href="/candidates" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Candidates
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{candidate.full_name}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
          <p className="text-muted-foreground mt-1">
            {candidate.position_applied}
            {candidate.department && ` · ${candidate.department}`}
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {candidate.email}</span>
            {candidate.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {candidate.phone}</span>}
          </div>
        </div>
        {candidate.status === "pending" && (
          <form action={`/api/candidates/${id}/invite`} method="POST">
            <Button type="submit">Send Invite Email</Button>
          </form>
        )}
      </div>

      {/* Fraud Alerts */}
      {fraudSignals && fraudSignals.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              Fraud Alerts ({fraudSignals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {fraudSignals.map((signal) => (
                <div key={signal.id} className="flex items-center justify-between p-2 rounded bg-white border">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${FRAUD_SEVERITY_COLORS[signal.severity as keyof typeof FRAUD_SEVERITY_COLORS]}`}>
                      {signal.severity.toUpperCase()}
                    </span>
                    <span className="text-sm">{signal.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referees */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Referees ({referees?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {referees && referees.length > 0 ? (
            <div className="space-y-3">
              {referees.map((referee) => {
                const refStatus = REFEREE_STATUSES[referee.status as keyof typeof REFEREE_STATUSES] || REFEREE_STATUSES.pending;
                const refereeResponses = (responses || []).filter(r => r.referee_id === referee.id);
                return (
                  <div key={referee.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{referee.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {referee.relationship} at {referee.company}
                            {referee.job_title && ` · ${referee.job_title}`}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${refStatus.color}`}>
                        {refStatus.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {referee.email}</span>
                      {referee.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {referee.phone}</span>}
                      <span className="flex items-center gap-1"><Building className="h-3 w-3" /> {referee.company}</span>
                    </div>

                    {/* Show responses if completed */}
                    {referee.status === "completed" && refereeResponses.length > 0 && (
                      <div className="mt-4 space-y-3 border-t pt-4">
                        {refereeResponses.map((response) => (
                          <div key={response.id}>
                            <p className="text-sm font-medium text-muted-foreground">{response.question_text}</p>
                            {response.answer_rating ? (
                              <div className="flex items-center gap-1 mt-1">
                                {[1,2,3,4,5].map((star) => (
                                  <span key={star} className={star <= response.answer_rating! ? "text-yellow-500" : "text-gray-300"}>
                                    ★
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm mt-1">{response.answer_text || "—"}</p>
                            )}
                          </div>
                        ))}
                        {refereeResponses.some(r => r.source === "voice_transcript") && (
                          <Badge variant="outline" className="mt-2">Completed via Voice</Badge>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              {candidate.status === "pending" || candidate.status === "invited"
                ? "Waiting for candidate to submit referee details."
                : "No referees found."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
