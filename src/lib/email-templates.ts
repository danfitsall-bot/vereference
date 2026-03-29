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
  return `
    <div style="${baseStyle}">
      <h2 style="margin-bottom: 4px;">Reference Check Request</h2>
      <p style="color: #666; margin-top: 4px;">VeReference</p>

      <p>Hi ${params.candidateName},</p>

      <p>${params.recruiterName} from <strong>${params.companyName}</strong> has requested reference details for the <strong>${params.positionApplied}</strong> position.</p>

      <p>To proceed, please provide the contact details of 2-5 professional referees who can speak to your work experience and skills.</p>

      <div style="margin: 30px 0;">
        <a href="${params.formUrl}" style="${buttonStyle}">Submit Your Referees</a>
      </div>

      <p style="font-size: 14px; color: #666;">This link will expire in 14 days. Your referees will be contacted individually via email and given the option to respond via an online form or an AI voice assistant.</p>

      <p style="font-size: 14px; color: #666;">By clicking the link above, you consent to VeReference collecting and processing reference information on behalf of ${params.companyName} for the purpose of evaluating your application.</p>

      <div style="${footerStyle}">
        <p>Sent by VeReference on behalf of ${params.companyName}</p>
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
  return `
    <div style="${baseStyle}">
      <h2 style="margin-bottom: 4px;">Reference Request</h2>
      <p style="color: #666; margin-top: 4px;">VeReference</p>

      <p>Hi ${params.refereeName},</p>

      <p><strong>${params.candidateName}</strong> has listed you as a reference for a <strong>${params.positionApplied}</strong> position at <strong>${params.companyName}</strong>. They indicated you were their <strong>${params.relationship}</strong>.</p>

      <p>We'd appreciate if you could take 5-10 minutes to share your experience working with ${params.candidateName}. You can choose how you'd like to respond:</p>

      <div style="margin: 30px 0;">
        <a href="${params.formUrl}" style="${buttonStyle}">Complete Online Form</a>
        &nbsp;&nbsp;
        <a href="${params.voiceUrl}" style="${secondaryButtonStyle}">Speak with AI Assistant</a>
      </div>

      <p style="font-size: 14px; color: #666;"><strong>Online Form:</strong> Answer a short questionnaire at your own pace.</p>
      <p style="font-size: 14px; color: #666;"><strong>AI Assistant:</strong> Have a brief voice conversation in your browser — no app or phone call needed.</p>

      <p style="font-size: 14px; color: #666;">This link will expire in 14 days. Your responses will be shared with ${params.companyName} to support ${params.candidateName}'s application.</p>

      <div style="${footerStyle}">
        <p>Sent by VeReference on behalf of ${params.companyName}</p>
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
  return `
    <div style="${baseStyle}">
      <h2 style="margin-bottom: 4px;">Friendly Reminder</h2>
      <p style="color: #666; margin-top: 4px;">VeReference</p>

      <p>Hi ${params.refereeName},</p>

      <p>Just a quick reminder — <strong>${params.candidateName}</strong> listed you as a reference for the <strong>${params.positionApplied}</strong> position at <strong>${params.companyName}</strong>.</p>

      <p>If you have a few minutes, we'd really appreciate your input:</p>

      <div style="margin: 30px 0;">
        <a href="${params.formUrl}" style="${buttonStyle}">Complete Online Form</a>
        &nbsp;&nbsp;
        <a href="${params.voiceUrl}" style="${secondaryButtonStyle}">Speak with AI Assistant</a>
      </div>

      <div style="${footerStyle}">
        <p>Sent by VeReference on behalf of ${params.companyName}</p>
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
  return `
    <div style="${baseStyle}">
      <h2 style="margin-bottom: 4px;">Reference Completed</h2>
      <p style="color: #666; margin-top: 4px;">VeReference</p>

      <p>Hi ${params.recruiterName},</p>

      <p><strong>${params.refereeName}</strong> has completed their reference for <strong>${params.candidateName}</strong> (${params.positionApplied}) via ${params.method}.</p>

      <div style="margin: 30px 0;">
        <a href="${params.dashboardUrl}" style="${buttonStyle}">View Results</a>
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
  return `
    <div style="${baseStyle}">
      <h2 style="margin-bottom: 4px;">References Complete</h2>
      <p style="color: #666; margin-top: 4px;">VeReference</p>

      <p>Hi ${params.candidateName},</p>

      <p>All your referees have submitted their references for the <strong>${params.positionApplied}</strong> position at <strong>${params.companyName}</strong>.</p>

      <p>The hiring team at ${params.companyName} will review the feedback. No further action is needed from you.</p>

      <p>Best of luck with your application!</p>

      <div style="${footerStyle}">
        <p>VeReference - AI-Powered Reference Verification</p>
      </div>
    </div>
  `;
}
