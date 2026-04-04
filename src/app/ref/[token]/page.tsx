import { createAdminClient } from "@/lib/supabase/admin";
import { CandidateRefForm } from "./candidate-ref-form";
import { AlertCircle, CheckCircle } from "lucide-react";

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
      <div className="text-center py-16">
        <div className="w-14 h-14 rounded-full bg-red-400/10 border border-red-400/20 flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="h-6 w-6 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Link Expired or Invalid</h2>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          This reference submission link is no longer valid. Please contact the recruiter for a new link.
        </p>
      </div>
    );
  }

  if (candidate.status === "submitted" || candidate.status === "completed") {
    return (
      <div className="text-center py-16">
        <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Already Submitted</h2>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          You have already submitted your referee details. Thank you — we&apos;ll be in touch with your referees shortly.
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
