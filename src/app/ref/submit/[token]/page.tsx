import { createAdminClient } from "@/lib/supabase/admin";
import { RefereeQuestionnaireForm } from "./questionnaire-form";
import type { RefereeWithCandidate } from "@/lib/types";
import { AlertCircle, CheckCircle } from "lucide-react";

export default async function RefereeSubmitPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: referee } = await supabase
    .from("referees")
    .select("id, full_name, status, token_expires_at, relationship, candidates!inner(full_name, position_applied)")
    .eq("token", token)
    .gt("token_expires_at", new Date().toISOString())
    .single();

  if (!referee) {
    return (
      <div className="text-center py-16">
        <div className="w-14 h-14 rounded-full bg-red-400/10 border border-red-400/20 flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="h-6 w-6 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Link Expired or Invalid</h2>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          This reference link is no longer valid. Please contact the recruiter for assistance.
        </p>
      </div>
    );
  }

  if (referee.status === "completed") {
    return (
      <div className="text-center py-16">
        <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Already Completed</h2>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          You have already submitted your reference. Thank you for your time!
        </p>
      </div>
    );
  }

  const typedReferee = referee as unknown as RefereeWithCandidate;
  const candidate = typedReferee.candidates;

  return (
    <RefereeQuestionnaireForm
      token={token}
      refereeName={referee.full_name}
      candidateName={candidate.full_name}
      positionApplied={candidate.position_applied}
    />
  );
}
