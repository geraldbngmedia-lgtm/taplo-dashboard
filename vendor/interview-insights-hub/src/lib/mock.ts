export type Meeting = {
  id: string;
  candidate: string;
  role: string;
  company: string;
  time: string;
  duration: string;
  source: "Google" | "Outlook" | "Manual";
  status: "upcoming" | "today" | "later";
  joinIn: string;
  jd?: string;
  joinUrl?: string;
};

export const hasSyncedCalendar = true;


export const meetings: Meeting[] = [
  {
    id: "m1",
    candidate: "Amara Okafor",
    role: "Senior Backend Engineer",
    company: "Northwind Labs",
    time: "Today · 14:30",
    duration: "45 min",
    source: "Google",
    status: "today",
    joinIn: "in 8 min",
    jd: "Senior Backend Engineer — distributed systems, Go, Kubernetes.",
    joinUrl: "https://meet.google.com/abc-defg-hij",
  },
  {
    id: "m2",
    candidate: "Léa Berger",
    role: "Product Designer",
    company: "Mossbloom",
    time: "Today · 16:00",
    duration: "30 min",
    source: "Outlook",
    status: "today",
    joinIn: "in 1h 38m",
    joinUrl: "https://teams.microsoft.com/l/meetup-join/xyz",
  },
  {
    id: "m3",
    candidate: "Tomás Reyes",
    role: "ML Research Engineer",
    company: "Cinder AI",
    time: "Tomorrow · 10:00",
    duration: "60 min",
    source: "Google",
    status: "upcoming",
    joinIn: "tomorrow",
    jd: "ML Research Engineer — RLHF, evals, distributed training.",
    joinUrl: "https://meet.google.com/xyz-uvwx-rst",
  },
  {
    id: "m4",
    candidate: "Priya Raman",
    role: "Engineering Manager",
    company: "Holloway",
    time: "Thu · 11:30",
    duration: "45 min",
    source: "Manual",
    status: "later",
    joinIn: "Thursday",
  },
  {
    id: "m5",
    candidate: "Jakob Lindgren",
    role: "Staff iOS Engineer",
    company: "Northwind Labs",
    time: "Fri · 09:00",
    duration: "45 min",
    source: "Google",
    status: "later",
    joinIn: "Friday",
    jd: "Staff iOS Engineer — Swift, performance, architecture.",
    joinUrl: "https://meet.google.com/fri-ios-123",
  },

];

export type Session = {
  id: string;
  candidate: string;
  role: string;
  date: string;
  duration: string;
  fit: "Strong" | "Moderate" | "Weak";
  summary: string;
};

export const sessions: Session[] = [
  {
    id: "s1",
    candidate: "test test",
    role: "Senior Platform Engineer",
    date: "Yesterday · 15:00",
    duration: "42 min",
    fit: "Strong",
    summary:
      "Eight years at scale; led a Kubernetes migration touching 200+ services. Strong on observability, less on cost ownership.",
  },
  {
    id: "s2",
    candidate: "Sienna Webb",
    role: "Senior Product Designer",
    date: "Yesterday · 11:00",
    duration: "38 min",
    fit: "Moderate",
    summary:
      "Strong craft and systems thinking. Mostly B2C — limited exposure to enterprise workflows the client needs.",
  },
  {
    id: "s3",
    candidate: "Noah Kepler",
    role: "Frontend Lead",
    date: "Mon · 14:30",
    duration: "51 min",
    fit: "Strong",
    summary:
      "Deep React expertise, has shipped a design system across 4 product surfaces. Open to relocation in Q3.",
  },
  {
    id: "s4",
    candidate: "Marisol Vega",
    role: "Data Engineering Manager",
    date: "Mon · 10:00",
    duration: "47 min",
    fit: "Weak",
    summary:
      "Solid background but management style leans hands-off — client explicitly asked for an embedded, hands-on lead.",
  },
];

export const transcript = [
  { t: "00:00", who: "Recruiter", line: "Thanks for making the time, Ravi. Walk me through the platform migration at Anvil." },
  { t: "00:18", who: "Candidate", line: "Sure — we were running about 220 services across two regions. The pain point was deploy times stretching past 40 minutes and observability being fragmented across three tools." },
  { t: "01:02", who: "Candidate", line: "I led a six-engineer pod to move everything to a unified Kubernetes platform, with Argo for deploys and OpenTelemetry as the single tracing layer." },
  { t: "02:31", who: "Recruiter", line: "How did you handle the cost side? The client is sensitive to cloud spend." },
  { t: "02:40", who: "Candidate", line: "Honestly, cost wasn't my direct ownership — we had a FinOps function. I worked closely with them but didn't drive the budget myself." },
  { t: "04:15", who: "Recruiter", line: "Got it. What about incident response — who carried the pager?" },
  { t: "04:24", who: "Candidate", line: "The platform team ran a follow-the-sun rotation. I was on it for two years before stepping into the lead role." },
];

export const covered = [
  "8+ years backend / platform experience",
  "Kubernetes at scale (200+ services)",
  "Observability tooling expertise",
  "Team leadership (6 engineers)",
];

export const gaps = ["Cloud cost ownership", "Direct vendor negotiation", "On-call escalation policy design"];

export const followUps = [
  "Can you describe a time you had to push back on a budget request from product?",
  "How would you structure a FinOps partnership in your first 90 days here?",
  "What's your philosophy on platform team SLAs vs. product team autonomy?",
];

export const usageRows = [
  { id: "s1", candidate: "test test", date: "Yesterday", minutes: 42, whisper: 0.25, gpt: 0.18, total: 0.43 },
  { id: "s2", candidate: "Sienna Webb", date: "Yesterday", minutes: 38, whisper: 0.23, gpt: 0.16, total: 0.39 },
  { id: "s3", candidate: "Noah Kepler", date: "Mon", minutes: 51, whisper: 0.31, gpt: 0.21, total: 0.52 },
  { id: "s4", candidate: "Marisol Vega", date: "Mon", minutes: 47, whisper: 0.28, gpt: 0.19, total: 0.47 },
  { id: "s5", candidate: "Hugo Mendes", date: "Last week", minutes: 36, whisper: 0.22, gpt: 0.14, total: 0.36 },
];
