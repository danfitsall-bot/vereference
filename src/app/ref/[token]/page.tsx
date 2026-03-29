import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { CandidateRefForm } from "./candidate-ref-form";

export default async function CandidateRefPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: candidate } = await supabase
    .from("candidates")
    .select("id, full_name, position_applied, referee_count_required, status, token_expires_at")
    .eq("token", token)
    .gt("token_expires_at", new Date().toISOString())
    .single();

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Link Expired or Invalid</h2>
        <p className="text-muted-foreground">
          This reference submission link is no longer valid. Please contact the recruiter for a new link.
        </p>
      </div>
    );
  }

  if (candidate.status === "submitted" || candidate.status === "completed") {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Already Submitted</h2>
        <p className="text-muted-foreground">
          You have already submitted your referee details. Thank you!
        </p>
      </div>
    );
  }

  return (
    <CandidateRefForm
      token={token}
      candidateName={candidate.full_name}
      positionApplied={candidate.position_applied}
      minReferees={candidate.referee_count_required}
    />
  );
}
