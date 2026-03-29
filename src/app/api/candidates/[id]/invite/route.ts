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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const res = await fetch(`${appUrl}/api/email/send-candidate-invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId: id }),
    });

    if (!res.ok) {
      const data = await res.json();
      return NextResponse.json({ error: data.error }, { status: 500 });
    }

    // Update candidate status to invited
    await supabase
      .from("candidates")
      .update({ status: "invited" })
      .eq("id", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send invite" }, { status: 500 });
  }
}
