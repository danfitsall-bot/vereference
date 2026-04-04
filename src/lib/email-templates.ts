function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function validateUrl(url: string): string {
  if (url.startsWith('https://') || url.startsWith('http://localhost')) {
    return url;
  }
  return '#';
}

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
  color: #1a1a1a;
`;

const buttonStyle = `
  display: inline-block;
  background-color: #171717;
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
`;

const secondaryButtonStyle = `
  display: inline-block;
  background-color: #ffffff;
  color: #171717;
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  border: 1px solid #e5e5e5;
`;

const footerStyle = `
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e5e5e5;
  font-size: 12px;
  color: #666666;
`;

export function candidateInviteEmail(params: {
  candidateName: string;
  positionApplied: string;
  recruiterName: string;
  companyName: string;
  formUrl: string;
}) {
  const candidateName = escapeHtml(params.candidateName);
  const positionApplied = escapeHtml(params.positionApplied);
  const recruiterName = escapeHtml(params.recruiterName);
  const companyName = escapeHtml(params.companyName);
  const formUrl = validateUrl(params.formUrl);

  return `
    <div style="${baseStyle}">
      <h2 style="margin-bottom: 4px;">Reference Check Request</h2>
      <p style="color: #666; margin-top: 4px;">VeReference</p>

      <p>Hi ${candidateName},</p>

      <p>${recruiterName} from <strong>${companyName}</strong> has requested reference details for the <strong>${positionApplied}</strong> position.</p>

      <p>To proceed, please provide the contact details of 2-5 professional referees who can speak to your work experience and skills.</p>

      <div style="margin: 30px 0;">
        <a href="${formUrl}" style="${buttonStyle}">Submit Your Referees</a>
      </div>

      <p style="font-size: 14px; color: #666;">This link will expire in 14 days. Your referees will be contacted individually via email and given the option to respond via an online form or an AI voice assistant.</p>

      <p style="font-size: 14px; color: #666;">By clicking the link above, you consent to VeReference collecting and processing reference information on behalf of ${companyName} for the purpose of evaluating your application.</p>

      <div style="${footerStyle}">
        <p>Sent by VeReference on behalf of ${companyName}</p>
        <p>If you did not apply for this position, please disregard this email.</p>
      </div>
    </div>
  `;
}

export function refereeRequestEmail(params: {
  refereeName: string;
  candidateName: string;
  positionApplied: string;
  companyName: string;
  relationship: string;
  formUrl: string;
  voiceUrl: string;
}) {
  const refereeName = escapeHtml(params.refereeName);
  const candidateName = escapeHtml(params.candidateName);
  const positionApplied = escapeHtml(params.positionApplied);
  const companyName = escapeHtml(params.companyName);
  const relationship = escapeHtml(params.relationship);
  const formUrl = validateUrl(params.formUrl);
  const voiceUrl = validateUrl(params.voiceUrl);

  return `
    <div style="${baseStyle}">
      <h2 style="margin-bottom: 4px;">Reference Request</h2>
      <p style="color: #666; margin-top: 4px;">VeReference</p>

      <p>Hi ${refereeName},</p>

      <p><strong>${candidateName}</strong> has listed you as a reference for a <strong>${positionApplied}</strong> position at <strong>${companyName}</strong>. They indicated you were their <strong>${relationship}</strong>.</p>

      <p>We'd appreciate if you could take 5-10 minutes to share your experience working with ${candidateName}. You can choose how you'd like to respond:</p>

      <div style="margin: 30px 0;">
        <a href="${formUrl}" style="${buttonStyle}">Complete Online Form</a>
        &nbsp;&nbsp;
        <a href="${voiceUrl}" style="${secondaryButtonStyle}">Speak with AI Assistant</a>
      </div>

      <p style="font-size: 14px; color: #666;"><strong>Online Form:</strong> Answer a short questionnaire at your own pace.</p>
      <p style="font-size: 14px; color: #666;"><strong>AI Assistant:</strong> Have a brief voice conversation in your browser — no app or phone call needed.</p>

      <p style="font-size: 14px; color: #666;">This link will expire in 14 days. Your responses will be shared with ${companyName} to support ${candidateName}'s application.</p>

      <div style="${footerStyle}">
        <p>Sent by VeReference on behalf of ${companyName}</p>
        <p>If you do not know this candidate or wish to decline, you may simply ignore this email.</p>
      </div>
    </div>
  `;
}

export function refereeReminderEmail(params: {
  refereeName: string;
  candidateName: string;
  positionApplied: string;
  companyName: string;
  formUrl: string;
  voiceUrl: string;
}) {
  const refereeName = escapeHtml(params.refereeName);
  const candidateName = escapeHtml(params.candidateName);
  const positionApplied = escapeHtml(params.positionApplied);
  const companyName = escapeHtml(params.companyName);
  const formUrl = validateUrl(params.formUrl);
  const voiceUrl = validateUrl(params.voiceUrl);

  return `
    <div style="${baseStyle}">
      <h2 style="margin-bottom: 4px;">Friendly Reminder</h2>
      <p style="color: #666; margin-top: 4px;">VeReference</p>

      <p>Hi ${refereeName},</p>

      <p>Just a quick reminder — <strong>${candidateName}</strong> listed you as a reference for the <strong>${positionApplied}</strong> position at <strong>${companyName}</strong>.</p>

      <p>If you have a few minutes, we'd really appreciate your input:</p>

      <div style="margin: 30px 0;">
        <a href="${formUrl}" style="${buttonStyle}">Complete Online Form</a>
        &nbsp;&nbsp;
        <a href="${voiceUrl}" style="${secondaryButtonStyle}">Speak with AI Assistant</a>
      </div>

      <div style="${footerStyle}">
        <p>Sent by VeReference on behalf of ${companyName}</p>
      </div>
    </div>
  `;
}

export function recruiterNotificationEmail(params: {
  recruiterName: string;
  refereeName: string;
  candidateName: string;
  positionApplied: string;
  dashboardUrl: string;
  method: string;
}) {
  const recruiterName = escapeHtml(params.recruiterName);
  const refereeName = escapeHtml(params.refereeName);
  const candidateName = escapeHtml(params.candidateName);
  const positionApplied = escapeHtml(params.positionApplied);
  const method = escapeHtml(params.method);
  const dashboardUrl = validateUrl(params.dashboardUrl);

  return `
    <div style="${baseStyle}">
      <h2 style="margin-bottom: 4px;">Reference Completed</h2>
      <p style="color: #666; margin-top: 4px;">VeReference</p>

      <p>Hi ${recruiterName},</p>

      <p><strong>${refereeName}</strong> has completed their reference for <strong>${candidateName}</strong> (${positionApplied}) via ${method}.</p>

      <div style="margin: 30px 0;">
        <a href="${dashboardUrl}" style="${buttonStyle}">View Results</a>
      </div>

      <div style="${footerStyle}">
        <p>VeReference - AI-Powered Reference Verification</p>
      </div>
    </div>
  `;
}

export function candidateCompleteEmail(params: {
  candidateName: string;
  positionApplied: string;
  companyName: string;
}) {
  const candidateName = escapeHtml(params.candidateName);
  const positionApplied = escapeHtml(params.positionApplied);
  const companyName = escapeHtml(params.companyName);

  return `
    <div style="${baseStyle}">
      <h2 style="margin-bottom: 4px;">References Complete</h2>
      <p style="color: #666; margin-top: 4px;">VeReference</p>

      <p>Hi ${candidateName},</p>

      <p>All your referees have submitted their references for the <strong>${positionApplied}</strong> position at <strong>${companyName}</strong>.</p>

      <p>The hiring team at ${companyName} will review the feedback. No further action is needed from you.</p>

      <p>Best of luck with your application!</p>

      <div style="${footerStyle}">
        <p>VeReference - AI-Powered Reference Verification</p>
      </div>
    </div>
  `;
}
