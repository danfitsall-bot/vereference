import { Resend } from "resend";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "" || apiKey === "re_placeholder" || apiKey === "your-api-key-here") {
    return null;
  }
  return new Resend(apiKey);
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY is missing or placeholder — email not sent to:", opts.to);
    return { data: null, error: { message: "Email service not configured: RESEND_API_KEY is missing or invalid" } };
  }

  const fromAddress = process.env.RESEND_FROM_EMAIL || "VeReference <onboarding@resend.dev>";

  const { data, error } = await resend.emails.send({
    from: fromAddress,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    replyTo: opts.replyTo,
  });

  return { data, error };
}
