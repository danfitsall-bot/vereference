import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { candidateInviteEmail, refereeRequestEmail } from "@/lib/email-templates";
import { FREE_EMAIL_DOMAINS } from "@/lib/constants";

/**
 * Send a candidate invite email and update status.
 * Extracted from /api/email/send-candidate-invite so internal callers
 * can bypass the HTTP round-trip.
 */
export async function sendCandidateInvite(candidateId: string) {
  const supabase = createAdminClient();

  const { data: candidate, error: candidateError } = await supabase
    .from("candidates")
    .select("*, profiles!inner(full_name, company_name)")
    .eq("id", candidateId)
    .single();

  if (candidateError || !candidate) {
    return { success: false, error: "Candidate not found" };
  }

  const profile = candidate.profiles as { full_name: string | null; company_name: string | null };
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const formUrl = `${appUrl}/ref/${candidate.token}`;

  const html = candidateInviteEmail({
    candidateName: candidate.full_name,
    positionApplied: candidate.position_applied,
    recruiterName: profile.full_name || "The hiring team",
    companyName: profile.company_name || "the company",
    formUrl,
  });

  const { data, error } = await sendEmail({
    to: candidate.email,
    subject: `Reference check request for ${candidate.position_applied}`,
    html,
  });

  if (error) {
    return { success: false, error: "Failed to send email" };
  }

  // Log the email
  await supabase.from("email_log").insert({
    recipient_email: candidate.email,
    template_name: "candidate-invite",
    resend_id: data?.id || null,
    status: "sent",
    metadata: { candidateId },
  });

  // Update candidate status
  await supabase
    .from("candidates")
    .update({ status: "invited" })
    .eq("id", candidateId);

  return { success: true, emailId: data?.id };
}

/**
 * Send a referee request email and update status.
 * Extracted from /api/email/send-referee-request.
 */
export async function sendRefereeRequest(refereeId: string) {
  const supabase = createAdminClient();

  const { data: referee, error: refereeError } = await supabase
    .from("referees")
    .select("*, candidates!inner(full_name, position_applied, user_id, profiles!inner(full_name, company_name))")
    .eq("id", refereeId)
    .single();

  if (refereeError || !referee) {
    return { success: false, error: "Referee not found" };
  }

  const candidate = referee.candidates as unknown as {
    full_name: string;
    position_applied: string;
    user_id: string;
    profiles: { full_name: string | null; company_name: string | null };
  };
  const profile = candidate.profiles;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const html = refereeRequestEmail({
    refereeName: referee.full_name,
    candidateName: candidate.full_name,
    positionApplied: candidate.position_applied,
    companyName: profile.company_name || "the company",
    relationship: referee.relationship,
    formUrl: `${appUrl}/ref/submit/${referee.token}`,
    voiceUrl: `${appUrl}/ref/voice/${referee.token}`,
  });

  const { data, error } = await sendEmail({
    to: referee.email,
    subject: `Reference request for ${candidate.full_name}`,
    html,
  });

  if (error) {
    return { success: false, error: "Failed to send email" };
  }

  // Log the email
  await supabase.from("email_log").insert({
    recipient_email: referee.email,
    template_name: "referee-request",
    resend_id: data?.id || null,
    status: "sent",
    metadata: { refereeId, candidateId: referee.candidate_id },
  });

  // Update referee status
  await supabase
    .from("referees")
    .update({ status: "email_sent", email_sent_at: new Date().toISOString() })
    .eq("id", refereeId);

  return { success: true, emailId: data?.id };
}

/**
 * Analyze a candidate's referees for fraud signals.
 * Extracted from /api/fraud/analyze.
 */
export async function analyzeFraud(candidateId: string, refereeId?: string) {
  const supabase = createAdminClient();

  const { data: candidate } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", candidateId)
    .single();

  if (!candidate) {
    return { success: false, error: "Candidate not found", signals: 0 };
  }

  let query = supabase.from("referees").select("*").eq("candidate_id", candidateId);
  if (refereeId) query = query.eq("id", refereeId);
  const { data: referees } = await query;

  if (!referees) return { success: true, signals: 0 };

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
    if (
      candidate.ip_address &&
      referee.ip_address &&
      candidate.ip_address === referee.ip_address
    ) {
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
      if (
        !normalizedDomain.includes(normalizedCompany) &&
        !normalizedCompany.includes(normalizedDomain)
      ) {
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
          metadata: {
            minutes_taken: minutesTaken,
            email_sent_at: referee.email_sent_at,
            completed_at: referee.completed_at,
          },
        });
      }
    }
  }

  // Insert signals (avoid duplicates)
  if (signals.length > 0) {
    for (const signal of signals) {
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

  return { success: true, signals: signals.length };
}
