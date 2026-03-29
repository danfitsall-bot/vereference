import { createAdminClient } from "@/lib/supabase/admin";
import { VoiceClient } from "./voice-client";

export default async function VoiceSessionPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: referee } = await supabase
    .from("referees")
    .select("id, full_name, status, token_expires_at, relationship, company, candidates!inner(full_name, position_applied)")
    .eq("token", token)
    .gt("token_expires_at", new Date().toISOString())
    .single();

  if (!referee) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Link Expired or Invalid</h2>
        <p className="text-muted-foreground">
          This voice session link is no longer valid. Please contact the recruiter for assistance.
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

  const candidate = (referee as any).candidates;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Voice Reference</h2>
        <p className="text-muted-foreground mt-1">
          Hi {referee.full_name}, you'll have a brief conversation with our AI assistant about your experience working with{" "}
          <strong>{candidate.full_name}</strong> ({candidate.position_applied}).
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          The conversation typically takes 5-10 minutes. Your browser will ask for microphone access.
        </p>
      </div>

      <VoiceClient
        token={token}
        refereeName={referee.full_name}
        candidateName={candidate.full_name}
        positionApplied={candidate.position_applied}
        relationship={referee.relationship}
        company={referee.company}
      />
    </div>
  );
}
