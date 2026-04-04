import { createAdminClient } from "@/lib/supabase/admin";
import { analyzeFraud } from "@/lib/internal-actions";
import { rateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(request: Request) {
  // Rate limit on public endpoint
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
             headersList.get("x-real-ip") || "unknown";

  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const supabase = createAdminClient();
  const body = await request.json();
  const { token, answers } = body;

  if (!token || !answers || !Array.isArray(answers)) {
    return NextResponse.json({ error: "Missing token or answers" }, { status: 400 });
  }

  // Validate token
  const { data: referee, error: refereeError } = await supabase
    .from("referees")
    .select("*, candidates!inner(full_name, user_id)")
    .eq("token", token)
    .gt("token_expires_at", new Date().toISOString())
    .single();

  if (refereeError || !referee) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
  }

  if (referee.status === 'completed') {
    return NextResponse.json({ error: "Reference already submitted" }, { status: 400 });
  }

  const userAgent = headersList.get("user-agent") || "unknown";

  // Save responses
  const responseInserts = answers.map((answer: { question_key: string; question_text: string; answer_text?: string; answer_rating?: number }) => ({
    referee_id: referee.id,
    user_id: referee.user_id,
    question_key: answer.question_key,
    question_text: answer.question_text,
    answer_text: answer.answer_text || null,
    answer_rating: answer.answer_rating || null,
    source: "form" as const,
  }));

  const { error: insertError } = await supabase
    .from("responses")
    .insert(responseInserts);

  if (insertError) {
    return NextResponse.json({ error: "Failed to save responses" }, { status: 500 });
  }

  // Update referee status and capture metadata
  await supabase
    .from("referees")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      ip_address: ip,
      user_agent: userAgent,
      contact_method: "email",
    })
    .eq("id", referee.id);

  // Trigger fraud analysis (direct call, no HTTP round-trip)
  try {
    await analyzeFraud(referee.candidate_id, referee.id);
  } catch {
    // Non-blocking
  }

  // Check if all referees are completed for this candidate
  const { data: allReferees } = await supabase
    .from("referees")
    .select("status")
    .eq("candidate_id", referee.candidate_id);

  const allCompleted = allReferees?.every(r => r.status === "completed");
  if (allCompleted) {
    await supabase
      .from("candidates")
      .update({ status: "completed" })
      .eq("id", referee.candidate_id);
  }

  return NextResponse.json({ success: true });
}
