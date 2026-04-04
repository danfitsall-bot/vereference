import { createAdminClient } from "@/lib/supabase/admin";
import type { RefereeWithCandidate } from "@/lib/types";
import Link from "next/link";
import { Mic, FileText } from "lucide-react";

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
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-foreground mb-2">Link Expired or Invalid</h2>
        <p className="text-muted-foreground">
          This voice session link is no longer valid. Please contact the recruiter for assistance.
        </p>
      </div>
    );
  }

  if (referee.status === "completed") {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-foreground mb-2">Already Completed</h2>
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
      <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
        <Mic className="h-7 w-7 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-3">Voice References Coming Soon</h2>
      <p className="text-muted-foreground mb-2 max-w-sm mx-auto">
        Hi <strong className="text-foreground">{referee.full_name}</strong>, voice references for{" "}
        <strong className="text-foreground">{candidate.full_name}</strong> ({candidate.position_applied}) are not yet available.
      </p>
      <p className="text-muted-foreground mb-8 text-sm">
        Please use the written form instead — it typically takes 5–10 minutes.
      </p>
      <Link
        href={formUrl}
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
      >
        <FileText className="h-4 w-4" />
        Complete Written Form
      </Link>
    </div>
  );
}
