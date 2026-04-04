import { createClient } from "@/lib/supabase/server";
import { sendCandidateInvite } from "@/lib/internal-actions";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify candidate belongs to user
  const { data: candidate, error } = await supabase
    .from("candidates")
    .select("id, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  if (candidate.status !== "pending") {
    return NextResponse.json({ error: "Candidate has already been invited" }, { status: 400 });
  }

  // Send invite email (direct call, no HTTP round-trip)
  const result = await sendCandidateInvite(id);

  if (!result.success) {
    return NextResponse.json({ error: result.error || "Failed to send invite" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
