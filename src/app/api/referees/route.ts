import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const candidateId = request.nextUrl.searchParams.get("candidateId");

  let query = supabase.from("referees").select("*").eq("user_id", user.id).order("created_at", { ascending: true });

  if (candidateId) {
    query = query.eq("candidate_id", candidateId);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ referees: data });
}
