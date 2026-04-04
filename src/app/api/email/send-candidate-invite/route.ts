import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { candidateInviteEmail } from "@/lib/email-templates";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Verify internal secret or authenticated user
  const internalSecret = request.headers.get("x-internal-secret");
  if (internalSecret !== process.env.INTERNAL_API_SECRET) {
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const body = await request.json();
  const { candidateId } = body;

  if (!candidateId) {
    return NextResponse.json({ error: "Missing candidateId" }, { status: 400 });
  }

  // Get candidate
  const { data: candidate, error: candidateError } = await supabase
    .from("candidates")
    .select("*, profiles!inner(full_name, company_name)")
    .eq("id", candidateId)
    .single();

  if (candidateError || !candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  const profile = (candidate as any).profiles;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const formUrl = `${appUrl}/ref/${candidate.token}`;

  const html = candidateInviteEmail({
    candidateName: candidate.full_name,
    positionApplied: candidate.position_applied,
    recruiterName: profile.full_name || "The hiring team",
    companyName: profile.company_name || "the company",
    formUrl,
  });

  const { data, error } = await sendEmail({
    to: candidate.email,
    subject: `Reference check request for ${candidate.position_applied}`,
    html,
  });

  if (error) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  // Log the email
  await supabase.from("email_log").insert({
    recipient_email: candidate.email,
    template_name: "candidate-invite",
    resend_id: data?.id || null,
    status: "sent",
    metadata: { candidateId },
  });

  // Update candidate status
  await supabase
    .from("candidates")
    .update({ status: "invited" })
    .eq("id", candidateId);

  return NextResponse.json({ success: true, emailId: data?.id });
}
