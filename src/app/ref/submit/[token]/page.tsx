import { createAdminClient } from "@/lib/supabase/admin";
import { RefereeQuestionnaireForm } from "./questionnaire-form";
import type { RefereeWithCandidate } from "@/lib/types";

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
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Link Expired or Invalid</h2>
        <p className="text-muted-foreground">
          This reference link is no longer valid. Please contact the recruiter for assistance.
        </p>
      </div>
    );
  }

  if (referee.status === "completed") {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Already Completed</h2>
        <p className="text-muted-foreground">
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
