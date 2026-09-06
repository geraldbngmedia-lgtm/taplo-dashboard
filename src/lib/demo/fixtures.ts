import type { CapturedLine, CapturedSession } from "@/lib/capture-store";
import { transcript as mockTranscript } from "@/lib/mock";
import type { InterviewQuestion } from "@/routes/api/questions";
import type { QState } from "@/lib/question-fixtures";

export const DEMO_SESSION_ID = "demo-ravi";

export const DEMO_CANDIDATE = "Ravi Anand";
export const DEMO_ROLE = "Senior Platform Engineer";
export const DEMO_COMPANY = "Northwind Labs";

export const RAVI_JD = `Senior Platform Engineer — Northwind Labs.

Own the Kubernetes platform (200+ services), observability (OpenTelemetry), and incident response.
Lead a small platform pod. Nice-to-have: cloud cost / FinOps ownership.`;

export const RAVI_TRANSCRIPT: CapturedLine[] = mockTranscript.map((line) => ({
  t: line.t,
  who: line.who as CapturedLine["who"],
  line: line.line,
}));

export const RAVI_NOT_ASKED = [
  "Describe negotiating scope with a product counterpart under pressure.",
  "Why leave your current role, and what are you optimizing for next?",
];

export const DEMO_QUESTIONS: InterviewQuestion[] = [
  {
    id: "f1",
    requirement: "PLATFORM SCALE",
    question: "Walk me through the platform migration at Anvil.",
    probe: "Get the service count, regions, and what broke first.",
    category: "background",
  },
  {
    id: "f2",
    requirement: "KUBERNETES",
    question: "How did you run Kubernetes across that many services?",
    probe: "Ask about deploys, tenancy, and the six-engineer pod.",
    category: "qualifications",
  },
  {
    id: "f3",
    requirement: "OBSERVABILITY",
    question: "How do you instrument a service you're bringing to production?",
    probe: "Get specifics: OpenTelemetry, traces, alert routing.",
    category: "qualifications",
  },
  {
    id: "f4",
    requirement: "INCIDENT RESPONSE",
    question: "Who carried the pager, and how did escalation work?",
    probe: "Follow-the-sun rotation and his years on-call.",
    category: "working_style",
  },
  {
    id: "f5",
    requirement: "FINOPS",
    question: "How did you handle cloud cost on that platform?",
    probe: "Cost wasn't owned — confirm the FinOps split.",
    category: "qualifications",
  },
  {
    id: "f6",
    requirement: "MOTIVATION",
    question: "Why leave your current role, and what are you optimizing for next?",
    probe: "Listen for long-term fit signals.",
    category: "background",
  },
];

export function coverageForDemoElapsed(seconds: number): Record<string, QState> {
  const next: Record<string, QState> = {
    f1: "untouched",
    f2: "untouched",
    f3: "untouched",
    f4: "untouched",
    f5: "untouched",
    f6: "untouched",
  };
  if (seconds >= 3) next.f1 = "covered";
  if (seconds >= 7) next.f2 = "weak";
  if (seconds >= 11) next.f2 = "covered";
  if (seconds >= 12) next.f3 = "covered";
  if (seconds >= 16) next.f4 = "weak";
  if (seconds >= 20) next.f4 = "covered";
  if (seconds >= 21) next.f5 = "weak";
  return next;
}

export const DEMO_CAPTURED_SESSION: CapturedSession = {
  id: DEMO_SESSION_ID,
  candidate: DEMO_CANDIDATE,
  role: DEMO_ROLE,
  date: "Yesterday · 15:00",
  duration: "42 min",
  jd: RAVI_JD,
  transcript: RAVI_TRANSCRIPT,
  notAsked: RAVI_NOT_ASKED,
};

export const RAVI_SCORECARD = {
  overall: 4,
  verdict:
    "Strong platform hire. Kubernetes at scale and observability are evidenced in the interview — not the CV. Cost ownership is the gap to close before offer.",
  items: [
    {
      category: "Kubernetes at scale",
      score: 5,
      note: "Led a six-engineer pod moving 220 services across two regions onto a unified Kubernetes platform with Argo.",
    },
    {
      category: "Observability",
      score: 5,
      note: "Named the pain (three tools, 40-minute deploys) and the fix (OpenTelemetry as the single tracing layer).",
    },
    {
      category: "Incident response",
      score: 4,
      note: "Follow-the-sun pager rotation; two years on-call before the lead role.",
    },
    {
      category: "Cloud cost / FinOps",
      score: 2,
      note: "Cost was not his ownership. Worked with FinOps, did not drive the budget — the brief’s remaining gap.",
    },
  ],
};

export const RAVI_PRESENTATION = {
  background: [
    "Ravi spent eight years on platform work at scale. In the interview he walked through Anvil’s migration: ~220 services, two regions, deploy times past 40 minutes, observability split across three tools.",
    "He led a six-engineer pod onto a unified Kubernetes platform, Argo for deploys, OpenTelemetry as the tracing layer. That is what Taplo stored — the answers, not the CV.",
  ],
  competencies: [
    {
      title: "Platform leadership",
      description: "Owned the migration end-to-end and stepped from on-call engineer into the lead role.",
    },
    {
      title: "Observability",
      description: "Collapsed fragmented tooling onto OpenTelemetry with a clear operational story.",
    },
    {
      title: "Cost ownership",
      description: "Adjacent to FinOps, not accountable for cloud spend — flag this in the next round.",
    },
  ],
  why: [
    "The Northwind brief asks for Kubernetes and observability at scale. Ravi evidenced both in the call, with specifics on services, regions, and tooling.",
    "Shortlist him. Confirm FinOps partnership in the first 90 days before you sell the client.",
  ],
  practical: {
    location: "Open to the Northwind hub; relocation not discussed.",
    salary: "Not covered in this interview.",
    noticePeriod: "Not covered in this interview.",
  },
};

/** Same structured write-up chat brings back when you ask about Ravi. */
export function raviInterviewWriteup(): string {
  return [
    `Here’s what the interview record supports for **${DEMO_CANDIDATE}**.`,
    "",
    `- Role: ${DEMO_ROLE} · ${DEMO_COMPANY}`,
    "- Interview: Yesterday · 15:00 · 42 min",
    "- Fit: **Strong**",
    "- Evidence: Eight years at scale; led a Kubernetes migration touching 200+ services. Strong on observability, less on cost ownership.",
    "- Gap: Cloud cost ownership — FinOps was adjacent, not owned.",
    "",
    "**Background.** ~220 services across two regions; deploy times past 40 minutes; observability fragmented across three tools. He led a six-engineer pod onto Kubernetes + Argo + OpenTelemetry.",
    "",
    "**Why Ravi?** The brief is Kubernetes + observability at scale. Those answers are in the transcript. Cost ownership is the remaining probe.",
    "",
    "Recommendation: strong enough to shortlist. Confirm remaining gaps before offer.",
    "",
    "Source: interview notes in Taplo (what the candidate said — not the CV).",
  ].join("\n");
}

export const RAVI_ATS_WRITEUP = [
  `Using **@Teamtailor** plus your interview notes.`,
  "",
  `**${DEMO_CANDIDATE}** is in Teamtailor on **${DEMO_ROLE}** at ${DEMO_COMPANY}.`,
  "",
  "- Stage: On-site / technical (moved yesterday after the Taplo interview)",
  "- Owner: Elena Marsh",
  "- Last ATS note: “Strong platform signal — waiting on scorecard.”",
  "",
  "The scorecard that belongs on this card is the interview write-up (Kubernetes, observability, FinOps gap) — not the uploaded CV.",
].join("\n");

export const RAVI_LINKEDIN_WRITEUP = [
  `Using **@LinkedIn** plus your interview notes.`,
  "",
  `**${DEMO_CANDIDATE}** — Staff-adjacent platform engineer, Anvil.`,
  "",
  "- Headline: Platform engineering · Kubernetes · observability",
  "- Tenure: 8 years in platform / infrastructure roles",
  "- Shared context: 2nd-degree via Northwind engineering leadership",
  "",
  "LinkedIn is the profile. What you can search later is what he said on the call: 220 services, Argo, OpenTelemetry, FinOps not owned.",
].join("\n");

export const DEMO_CAPTIONS = [
  {
    title: "Ask across ATS, LinkedIn, and interviews.",
    line: "Type @Teamtailor or @LinkedIn, or ask about a candidate by name.",
  },
  {
    title: "Taplo answers from what was said, not the CV.",
    line: "Coverage from the interview is what becomes searchable.",
  },
  {
    title: "Connect LinkedIn and your ATS to fill the workspace.",
    line: "Settings → Connected sources, or the chips under an answer.",
  },
  {
    title: "Paste the job spec. Taplo notices the interview. You confirm.",
    line: "Open the widget, add the JD, then confirm the detected call.",
  },
  {
    title: "Coverage tracks the candidate’s answers.",
    line: "Watch questions move from open to covered as they speak.",
  },
  {
    title: "After the call, analysis is the same write-up chat will bring back.",
    line: "Open Analysis, then ask Taplo to bring back Ravi’s write-up.",
  },
] as const;
