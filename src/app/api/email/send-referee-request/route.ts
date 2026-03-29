import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { refereeRequestEmail } from "@/lib/email-templates";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { refereeId } = body;

  if (!refereeId) {
    return NextResponse.json({ error: "Missing refereeId" }, { status: 400 });
  }

  // Get referee with candidate and profile info
  const { data: referee, error: refereeError } = await supabase
    .from("referees")
    .select("*, candidates!inner(full_name, position_applied, user_id, profiles!inner(full_name, company_name))")
    .eq("id", refereeId)
    .single();

  if (refereeError || !referee) {
    return NextResponse.json({ error: "Referee not found" }, { status: 404 });
  }

  const candidate = (referee as any).candidates;
  const profile = candidate.profiles;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const html = refereeRequestEmail({
    refereeName: referee.full_name,
    candidateName: candidate.full_name,
    positionApplied: candidate.position_applied,
    companyName: profile.company_name || "the company",
    relationship: referee.relationship,
    formUrl: `${appUrl}/ref/submit/${referee.token}`,
    voiceUrl: `${appUrl}/ref/voice/${referee.token}`,
  });

  const { data, error } = await sendEmail({
    to: referee.email,
    subject: `Reference request for ${candidate.full_name}`,
    html,
  });

  if (error) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  // Log the email
  await supabase.from("email_log").insert({
    recipient_email: referee.email,
    template_name: "referee-request",
    resend_id: data?.id || null,
    status: "sent",
    metadata: { refereeId, candidateId: referee.candidate_id },
  });

  // Update referee status
  await supabase
    .from("referees")
    .update({ status: "email_sent", email_sent_at: new Date().toISOString() })
    .eq("id", refereeId);

  return NextResponse.json({ success: true, emailId: data?.id });
}
