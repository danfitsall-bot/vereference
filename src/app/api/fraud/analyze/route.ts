import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { FREE_EMAIL_DOMAINS } from "@/lib/constants";

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { candidateId, refereeId } = body;

  if (!candidateId) {
    return NextResponse.json({ error: "Missing candidateId" }, { status: 400 });
  }

  // Get candidate
  const { data: candidate } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", candidateId)
    .single();

  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  // Get referees
  const query = supabase.from("referees").select("*").eq("candidate_id", candidateId);
  if (refereeId) query.eq("id", refereeId);
  const { data: referees } = await query;

  if (!referees) return NextResponse.json({ signals: [] });

  const signals: Array<{
    candidate_id: string;
    referee_id: string;
    user_id: string;
    signal_type: string;
    severity: string;
    description: string;
    metadata: Record<string, unknown>;
  }> = [];

  for (const referee of referees) {
    // 1. IP Match Check
    if (candidate.ip_address && referee.ip_address &&
        candidate.ip_address === referee.ip_address) {
      signals.push({
        candidate_id: candidateId,
        referee_id: referee.id,
        user_id: candidate.user_id,
        signal_type: "ip_match",
        severity: "high",
        description: `Referee ${referee.full_name}'s IP address matches the candidate's IP`,
        metadata: { candidate_ip: candidate.ip_address, referee_ip: referee.ip_address },
      });
    }

    // 2. Free Email Domain Check
    const emailDomain = referee.email.split("@")[1]?.toLowerCase();
    if (emailDomain && FREE_EMAIL_DOMAINS.includes(emailDomain)) {
      signals.push({
        candidate_id: candidateId,
        referee_id: referee.id,
        user_id: candidate.user_id,
        signal_type: "free_email",
        severity: "medium",
        description: `Referee ${referee.full_name} is using a free email domain (${emailDomain})`,
        metadata: { email: referee.email, domain: emailDomain },
      });
    }

    // 3. Domain/Company Mismatch
    if (emailDomain && !FREE_EMAIL_DOMAINS.includes(emailDomain)) {
      const normalizedCompany = referee.company.toLowerCase().replace(/[^a-z0-9]/g, "");
      const normalizedDomain = emailDomain.replace(/\.[^.]+$/, "").replace(/[^a-z0-9]/g, "");
      if (!normalizedDomain.includes(normalizedCompany) && !normalizedCompany.includes(normalizedDomain)) {
        signals.push({
          candidate_id: candidateId,
          referee_id: referee.id,
          user_id: candidate.user_id,
          signal_type: "domain_mismatch",
          severity: "low",
          description: `Referee ${referee.full_name}'s email domain (${emailDomain}) doesn't match their company (${referee.company})`,
          metadata: { email: referee.email, company: referee.company, domain: emailDomain },
        });
      }
    }

    // 4. Timing Analysis
    if (referee.email_sent_at && referee.completed_at) {
      const sentAt = new Date(referee.email_sent_at).getTime();
      const completedAt = new Date(referee.completed_at).getTime();
      const minutesTaken = (completedAt - sentAt) / 60000;

      if (minutesTaken < 5) {
        signals.push({
          candidate_id: candidateId,
          referee_id: referee.id,
          user_id: candidate.user_id,
          signal_type: "timing_suspicious",
          severity: "medium",
          description: `Referee ${referee.full_name} completed the reference in ${Math.round(minutesTaken)} minute(s) after receiving the invite`,
          metadata: { minutes_taken: minutesTaken, email_sent_at: referee.email_sent_at, completed_at: referee.completed_at },
        });
      }
    }
  }

  // Insert signals (avoid duplicates)
  if (signals.length > 0) {
    for (const signal of signals) {
      // Check if signal already exists
      const { data: existing } = await supabase
        .from("fraud_signals")
        .select("id")
        .eq("candidate_id", signal.candidate_id)
        .eq("referee_id", signal.referee_id)
        .eq("signal_type", signal.signal_type)
        .maybeSingle();

      if (!existing) {
        await supabase.from("fraud_signals").insert(signal);
      }
    }
  }

  return NextResponse.json({ signals: signals.length });
}
