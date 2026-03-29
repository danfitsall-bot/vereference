import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || "");
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const fromAddress = process.env.RESEND_FROM_EMAIL || "VeReference <onboarding@resend.dev>";

  const resend = getResend();
  const { data, error } = await resend.emails.send({
    from: fromAddress,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    replyTo: opts.replyTo,
  });

  return { data, error };
}
