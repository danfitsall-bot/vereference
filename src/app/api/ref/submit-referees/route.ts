import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { token, referees } = body;

  if (!token || !referees || !Array.isArray(referees) || referees.length < 1) {
    return NextResponse.json({ error: "Missing token or referees" }, { status: 400 });
  }

  // Validate token
  const { data: candidate, error: candidateError } = await supabase
    .from("candidates")
    .select("*")
    .eq("token", token)
    .gt("token_expires_at", new Date().toISOString())
    .single();

  if (candidateError || !candidate) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
  }

  // Capture IP and user agent
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
             headersList.get("x-real-ip") || null;
  const userAgent = headersList.get("user-agent") || null;

  // Update candidate with consent and metadata
  await supabase
    .from("candidates")
    .update({
      status: "submitted",
      consent_given: true,
      consent_given_at: new Date().toISOString(),
      ip_address: ip,
      user_agent: userAgent,
    })
    .eq("id", candidate.id);

  // Insert referees
  const refereeInserts = referees.map((ref: any) => ({
    candidate_id: candidate.id,
    user_id: candidate.user_id,
    full_name: ref.full_name,
    email: ref.email,
    phone: ref.phone || null,
    relationship: ref.relationship,
    company: ref.company,
    job_title: ref.job_title || null,
  }));

  const { data: insertedReferees, error: insertError } = await supabase
    .from("referees")
    .insert(refereeInserts)
    .select();

  if (insertError) {
    return NextResponse.json({ error: "Failed to save referees" }, { status: 500 });
  }

  // Send email to each referee
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  for (const referee of insertedReferees || []) {
    try {
      await fetch(`${appUrl}/api/email/send-referee-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refereeId: referee.id }),
      });
    } catch {
      // Continue with other referees if one email fails
    }
  }

  return NextResponse.json({ success: true, count: insertedReferees?.length });
}
