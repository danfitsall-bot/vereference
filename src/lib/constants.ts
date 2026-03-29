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
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  invited: { label: "Invited", color: "bg-blue-100 text-blue-800" },
  submitted: { label: "Submitted", color: "bg-purple-100 text-purple-800" },
  completed: { label: "Completed", color: "bg-green-100 text-green-800" },
  expired: { label: "Expired", color: "bg-gray-100 text-gray-800" },
} as const;

export const REFEREE_STATUSES = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  email_sent: { label: "Email Sent", color: "bg-blue-100 text-blue-800" },
  in_progress: {
    label: "In Progress",
    color: "bg-purple-100 text-purple-800",
  },
  completed: { label: "Completed", color: "bg-green-100 text-green-800" },
  declined: { label: "Declined", color: "bg-red-100 text-red-800" },
  expired: { label: "Expired", color: "bg-gray-100 text-gray-800" },
} as const;

export const FRAUD_SEVERITY_WEIGHTS = {
  low: 1,
  medium: 3,
  high: 7,
  critical: 10,
} as const;

export const FRAUD_SEVERITY_COLORS = {
  low: "bg-yellow-100 text-yellow-800",
  medium: "bg-orange-100 text-orange-800",
  high: "bg-red-100 text-red-800",
  critical: "bg-red-200 text-red-900",
} as const;

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
