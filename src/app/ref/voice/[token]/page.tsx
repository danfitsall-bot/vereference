import { createAdminClient } from "@/lib/supabase/admin";
import type { RefereeWithCandidate } from "@/lib/types";
import Link from "next/link";

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

  const typedReferee = referee as unknown as RefereeWithCandidate;
  const candidate = typedReferee.candidates;

  const formUrl = `/ref/submit/${token}`;

  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold mb-4">Voice References Coming Soon</h2>
      <p className="text-muted-foreground mb-2">
        Hi {referee.full_name}, voice references for{" "}
        <strong>{candidate.full_name}</strong> ({candidate.position_applied}) are not yet available.
      </p>
      <p className="text-muted-foreground mb-6">
        Please use the written form instead. It typically takes 5-10 minutes.
      </p>
      <Link
        href={formUrl}
        className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
      >
        Complete Written Form
      </Link>
    </div>
  );
}
