import { createClient } from "@/lib/supabase/server";
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
    .single();

  if (error || !candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  if (candidate.status !== "pending") {
    return NextResponse.json({ error: "Candidate has already been invited" }, { status: 400 });
  }

  // Send invite email via internal route
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${appUrl}/api/email/send-candidate-invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
      },
      body: JSON.stringify({ candidateId: id }),
    });

    if (!res.ok) {
      const data = await res.json();
      return NextResponse.json({ error: data.error || "Failed to send invite" }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: "Failed to send invite email" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
