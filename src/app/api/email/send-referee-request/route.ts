import { createClient } from "@/lib/supabase/server";
import { sendRefereeRequest } from "@/lib/internal-actions";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Verify internal secret or authenticated user
  const internalSecret = request.headers.get("x-internal-secret");
  if (internalSecret !== process.env.INTERNAL_API_SECRET) {
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { refereeId } = body;

  if (!refereeId) {
    return NextResponse.json({ error: "Missing refereeId" }, { status: 400 });
  }

  const result = await sendRefereeRequest(refereeId);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: result.error === "Referee not found" ? 404 : 500 });
  }

  return NextResponse.json({ success: true, emailId: result.emailId });
}
