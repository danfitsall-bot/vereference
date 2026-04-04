import { createClient } from "@/lib/supabase/server";
import { analyzeFraud } from "@/lib/internal-actions";
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
  const { candidateId, refereeId } = body;

  if (!candidateId) {
    return NextResponse.json({ error: "Missing candidateId" }, { status: 400 });
  }

  const result = await analyzeFraud(candidateId, refereeId);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ signals: result.signals });
}
