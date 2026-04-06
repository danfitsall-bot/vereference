export const FREE_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "aol.com",
  "icloud.com",
  "mail.com",
  "protonmail.com",
  "zoho.com",
  "yandex.com",
  "gmx.com",
  "live.com",
  "msn.com",
  "me.com",
  "inbox.com",
];

export const CANDIDATE_STATUSES = {
  pending: { label: "Pending", color: "bg-amber-50 text-amber-700" },
  invited: { label: "Invited", color: "bg-blue-50 text-blue-700" },
  submitted: { label: "Submitted", color: "bg-purple-50 text-purple-700" },
  completed: { label: "Completed", color: "bg-teal-50 text-teal-700" },
  expired: { label: "Expired", color: "bg-gray-100 text-gray-500" },
} as const;

export const REFEREE_STATUSES = {
  pending: { label: "Pending", color: "bg-amber-50 text-amber-700" },
  email_sent: { label: "Email Sent", color: "bg-blue-50 text-blue-700" },
  in_progress: {
    label: "In Progress",
    color: "bg-purple-50 text-purple-700",
  },
  completed: { label: "Completed", color: "bg-teal-50 text-teal-700" },
  declined: { label: "Declined", color: "bg-red-50 text-red-600" },
  expired: { label: "Expired", color: "bg-gray-100 text-gray-500" },
} as const;

export const FRAUD_SEVERITY_WEIGHTS = {
  low: 1,
  medium: 3,
  high: 7,
  critical: 10,
} as const;

export const FRAUD_SEVERITY_COLORS = {
  low: "bg-amber-50 text-amber-700",
  medium: "bg-orange-50 text-orange-700",
  high: "bg-red-50 text-red-600",
  critical: "bg-red-100 text-red-700",
} as const;

// TODO v2: Replace hardcoded questions with DB queries from the questions_template table.
// The questions_template table is seeded and ready; custom per-user questions will read from it.
export const DEFAULT_QUESTIONS = [
  {
    key: "relationship",
    text: "What was your working relationship with {candidate}?",
    type: "text",
    required: true,
  },
  {
    key: "duration",
    text: "How long did you work together?",
    type: "text",
    required: true,
  },
  {
    key: "role_description",
    text: "Can you describe their role and responsibilities?",
    type: "text",
    required: true,
  },
  {
    key: "strengths",
    text: "What would you say are their key strengths?",
    type: "text",
    required: true,
  },
  {
    key: "improvement",
    text: "What areas could they improve in?",
    type: "text",
    required: true,
  },
  {
    key: "performance_rating",
    text: "How would you rate their overall performance?",
    type: "rating",
    required: true,
  },
  {
    key: "teamwork",
    text: "How well did they work with the team?",
    type: "text",
    required: true,
  },
  {
    key: "reliability",
    text: "How would you describe their reliability and work ethic?",
    type: "text",
    required: true,
  },
  {
    key: "reason_leaving",
    text: "Why did they leave the role?",
    type: "text",
    required: false,
  },
  {
    key: "rehire",
    text: "Would you work with them again?",
    type: "yes_no",
    required: true,
  },
  {
    key: "additional",
    text: "Is there anything else you'd like to share?",
    type: "text",
    required: false,
  },
] as const;
