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

  if (referees.length > 5) {
    return NextResponse.json({ error: "Maximum 5 referees allowed" }, { status: 400 });
  }

  // Validate each referee's fields
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  for (const ref of referees) {
    if (!ref.full_name || !ref.email || !ref.relationship || !ref.company) {
      return NextResponse.json({ error: "Each referee must have full_name, email, relationship, and company" }, { status: 400 });
    }
    if (!emailRegex.test(ref.email)) {
      return NextResponse.json({ error: `Invalid email format: ${ref.email}` }, { status: 400 });
    }
    // Trim and limit string lengths
    ref.full_name = String(ref.full_name).trim().slice(0, 200);
    ref.email = String(ref.email).trim().slice(0, 200);
    ref.company = String(ref.company).trim().slice(0, 200);
    if (ref.job_title) ref.job_title = String(ref.job_title).trim().slice(0, 200);
    if (ref.phone) ref.phone = String(ref.phone).trim().slice(0, 50);
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
        headers: { "Content-Type": "application/json", "x-internal-secret": process.env.INTERNAL_API_SECRET || "" },
        body: JSON.stringify({ refereeId: referee.id }),
      });
    } catch {
      // Continue with other referees if one email fails
    }
  }

  return NextResponse.json({ success: true, count: insertedReferees?.length });
}
