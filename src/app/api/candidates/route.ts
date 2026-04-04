import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ candidates: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  // Send invite email
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    await fetch(`${appUrl}/api/email/send-candidate-invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-internal-secret": process.env.INTERNAL_API_SECRET || "" },
      body: JSON.stringify({ candidateId: candidate.id }),
    });
  } catch {
    // Email sending failure shouldn't block candidate creation
  }

  return NextResponse.json({ candidate }, { status: 201 });
}
