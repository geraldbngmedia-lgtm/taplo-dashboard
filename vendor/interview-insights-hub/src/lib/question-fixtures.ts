import type { InterviewQuestion } from "@/routes/api/questions";
import type { LiveQuestion } from "@/components/capture/LiveQuestionPanel";

export type QState = "covered" | "weak" | "untouched";

export const FIXTURE_QUESTIONS: InterviewQuestion[] = [
  {
    id: "f1",
    requirement: "PAYMENTS DOMAIN",
    question: "Walk me through a payments system you designed end-to-end.",
    probe: "Ask about reconciliation and idempotency guarantees.",
  },
  {
    id: "f2",
    requirement: "DISTRIBUTED SYSTEMS",
    question: "How do you approach consistency vs availability trade-offs?",
    probe: "Push for a concrete outage they've handled.",
  },
  {
    id: "f3",
    requirement: "TEAM LEADERSHIP",
    question: "Tell me about a team you grew from small to mid-size.",
    probe: "Ask about hiring bar and how they scaled review culture.",
  },
  {
    id: "f4",
    requirement: "OBSERVABILITY",
    question: "How do you instrument a service you're bringing to production?",
    probe: "Get specifics: SLOs, traces, alert routing.",
  },
  {
    id: "f5",
    requirement: "STAKEHOLDERS",
    question: "Describe negotiating scope with a product counterpart under pressure.",
    probe: "Ask what they gave up and why.",
  },
  {
    id: "f6",
    requirement: "MOTIVATION",
    question: "Why leave your current role, and what are you optimizing for next?",
    probe: "Listen for long-term fit signals.",
  },
];

export const FIXTURE_ROLE = "Senior Backend Engineer";

export const FIXTURE_STATES: Record<"early" | "mid" | "late", Record<string, QState>> = {
  early: {
    f1: "untouched",
    f2: "untouched",
    f3: "untouched",
    f4: "untouched",
    f5: "untouched",
    f6: "untouched",
  },
  mid: {
    f1: "covered",
    f2: "weak",
    f3: "untouched",
    f4: "untouched",
    f5: "untouched",
    f6: "untouched",
  },
  late: {
    f1: "covered",
    f2: "covered",
    f3: "covered",
    f4: "weak",
    f5: "weak",
    f6: "untouched",
  },
};

export const FIXTURE_ELAPSED: Record<"early" | "mid" | "late", number> = {
  early: 3 * 60 + 20,
  mid: 18 * 60 + 45,
  late: 34 * 60 + 10,
};

// ---- Live interview panel fixture -------------------------------------------------


export const LIVE_PANEL_QUESTIONS: LiveQuestion[] = [
  {
    id: "lp1",
    text: "Could you walk me through your recent professional journey?",
    state: "confirmed",
    label: "Background",
  },
  {
    id: "lp2",
    text: "What specific impact did you have on your team's velocity last quarter?",
    state: "thin",
    label: "Background",
    cue: "Ask for a number, then for their contribution versus the team's.",
  },
  {
    id: "lp3",
    text: "How do you handle conflict in high-pressure technical environments?",
    state: "open",
    label: "Working style",
  },
  {
    id: "lp4",
    text: "Are you comfortable working in a distributed, async-first team?",
    state: "open",
    label: "Qualifications",
  },
  {
    id: "lp5",
    text: "What notice period are you on, and what are your salary expectations?",
    state: "confirmed",
    label: "Practical",
  },
];

/** Preview affordance: a thin question auto-resolves to confirmed after a delay. */
export const LIVE_PANEL_DEMO_QUESTION_ID = "lp2";
export const LIVE_PANEL_DEMO_DELAY_MS = 3000;
