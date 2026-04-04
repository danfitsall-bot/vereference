import { createClient } from "@/lib/supabase/server";
import { sendCandidateInvite } from "@/lib/internal-actions";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ candidates: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Credit/quota enforcement
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits_remaining, plan")
    .eq("id", user.id)
    .single();

  if (profile && profile.credits_remaining !== null && profile.credits_remaining <= 0) {
    return NextResponse.json({ error: "No credits remaining" }, { status: 403 });
  }

  const body = await request.json();
  const { full_name, email, position_applied, phone, department } = body;

  if (!full_name || !email || !position_applied) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data: candidate, error } = await supabase
    .from("candidates")
    .insert({
      user_id: user.id,
      full_name,
      email,
      position_applied,
      phone: phone || null,
      department: department || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Decrement credits after successful creation
  if (profile && profile.credits_remaining !== null) {
    await supabase
      .from("profiles")
      .update({ credits_remaining: profile.credits_remaining - 1 })
      .eq("id", user.id);
  }

  // Send invite email (direct call, no HTTP round-trip)
  try {
    await sendCandidateInvite(candidate.id);
  } catch {
    // Email sending failure shouldn't block candidate creation
  }

  return NextResponse.json({ candidate }, { status: 201 });
}
