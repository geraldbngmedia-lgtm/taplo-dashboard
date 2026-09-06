import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Plug } from "lucide-react";
import { TaploLogo } from "@/components/ui-taplo/TaploLogo";
import { LiveQuestionPanel, type LiveQuestion } from "@/components/capture/LiveQuestionPanel";
import {
  DEMO_CANDIDATE,
  DEMO_COMPANY,
  DEMO_QUESTIONS,
  DEMO_ROLE,
  RAVI_JD,
  RAVI_PRESENTATION,
  RAVI_SCORECARD,
  coverageForDemoElapsed,
} from "@/lib/demo/fixtures";
import type { QState } from "@/lib/question-fixtures";

export const Route = createFileRoute("/demo-reel")({
  head: () => ({ meta: [{ title: "Taplo product demo" }] }),
  component: DemoReel,
});

type Scene = "title" | "chat" | "connect" | "widget" | "analysis" | "recall" | "end";

const TIMELINE: { scene: Scene; ms: number; caption: string; line: string }[] = [
  {
    scene: "title",
    ms: 4000,
    caption: "Taplo",
    line: "Interview intelligence for recruiters",
  },
  {
    scene: "chat",
    ms: 14000,
    caption: "Ask across ATS, LinkedIn, and interviews.",
    line: "Taplo resurfaces candidates from what they said — not the CV.",
  },
  {
    scene: "connect",
    ms: 9000,
    caption: "Fill the workspace.",
    line: "Connect LinkedIn and your ATS. The notetaker catches the interview.",
  },
  {
    scene: "widget",
    ms: 18000,
    caption: "Paste the job spec. Confirm. Go.",
    line: "Taplo notices the call. Coverage tracks the candidate’s answers.",
  },
  {
    scene: "analysis",
    ms: 14000,
    caption: "Analysis after the interview.",
    line: "Job spec plus answers become a structured write-up.",
  },
  {
    scene: "recall",
    ms: 12000,
    caption: "Ask, and that write-up comes back.",
    line: "The same evidence pack — searchable later in chat.",
  },
  {
    scene: "end",
    ms: 5000,
    caption: "Taplo",
    line: "What they said. When you need it.",
  },
];

function DemoReel() {
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const query = new URLSearchParams(window.location.search);
    if (query.get("autoplay") === "0") return;
    if (reduce && query.get("force") !== "1") {
      setStarted(true);
      return;
    }
    setStarted(true);
  }, []);

  useEffect(() => {
    if (!started) return;
    if (index >= TIMELINE.length - 1) return;
    const id = window.setTimeout(() => setIndex((value) => value + 1), TIMELINE[index].ms);
    return () => window.clearTimeout(id);
  }, [index, started]);

  const current = TIMELINE[index];
  const done = index === TIMELINE.length - 1;

  return (
    <main
      data-reel={done ? "done" : current.scene}
      data-reel-index={index}
      className="relative flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-[var(--surface-page)] text-[var(--ink)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,#ffffff_0%,transparent_55%)]" />

      <header className="relative z-10 flex h-14 shrink-0 items-center justify-between px-8">
        <TaploLogo variant="wordmark" className="h-6" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
          Product demo
        </span>
      </header>

      <div className="relative z-10 min-h-0 flex-1 px-8 pb-4">
        {current.scene === "title" || current.scene === "end" ? (
          <TitleCard caption={current.caption} line={current.line} />
        ) : current.scene === "chat" ? (
          <ChatScene />
        ) : current.scene === "connect" ? (
          <ConnectScene />
        ) : current.scene === "widget" ? (
          <WidgetScene active />
        ) : current.scene === "analysis" ? (
          <AnalysisScene />
        ) : (
          <RecallScene />
        )}
      </div>

      {current.scene !== "title" && current.scene !== "end" ? (
        <div className="relative z-10 mx-auto mb-6 w-full max-w-[720px] rounded-[16px] border border-[var(--glass-border)] bg-[var(--dashboard-glass-strong)] px-5 py-3 text-center shadow-[var(--shadow-glass-overlay)] backdrop-blur-xl">
          <p
            className="text-[15px] font-semibold text-[var(--ink)]"
            style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
          >
            {current.caption}
          </p>
          <p className="mt-1 text-[12.5px] text-[var(--ink-muted)]">{current.line}</p>
        </div>
      ) : null}
    </main>
  );
}

function TitleCard({ caption, line }: { caption: string; line: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <TaploLogo variant="mark" className="mb-6 h-16 w-16" />
      <h1
        className="text-[56px] font-medium tracking-[-0.03em] text-[var(--ink)]"
        style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
      >
        {caption}
      </h1>
      <p className="mt-3 text-[18px] text-[var(--ink-secondary)]">{line}</p>
    </div>
  );
}

function ChatScene() {
  return (
    <div className="mx-auto grid h-full max-w-[1080px] grid-cols-[1fr_280px] gap-6">
      <div className="flex min-h-0 flex-col rounded-[20px] border border-[var(--glass-border)] bg-[var(--dashboard-glass)] p-6 shadow-[var(--shadow-glass)] backdrop-blur-xl">
        <Bubble who="you">Who’s the strongest platform hire in @Teamtailor and @LinkedIn?</Bubble>
        <div className="mt-4 space-y-3 text-[14px] leading-6 text-[var(--ink)]">
          <p>
            Using <strong>@Teamtailor</strong> and <strong>@LinkedIn</strong> plus your interview notes.
          </p>
          <p>
            <strong>{DEMO_CANDIDATE}</strong> — {DEMO_ROLE} at {DEMO_COMPANY}. Stage: on-site / technical.
            LinkedIn: 8 years platform, Kubernetes + observability.
          </p>
          <p className="text-[var(--ink-muted)]">
            What you can search later is what he said on the call: 220 services, Argo, OpenTelemetry. Cost
            ownership was not his. Not the CV.
          </p>
          <div className="flex gap-2 pt-1">
            <Chip connected>Teamtailor connected</Chip>
            <Chip connected>LinkedIn connected</Chip>
          </div>
        </div>
      </div>
      <aside className="rounded-[20px] border border-[var(--hairline)] bg-[var(--surface-card)] p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]">Sources</p>
        <ul className="mt-3 space-y-2 text-[13px]">
          <li>ATS · Teamtailor pipeline</li>
          <li>LinkedIn · profile + tenure</li>
          <li>Interview · what Ravi said</li>
        </ul>
      </aside>
    </div>
  );
}

function ConnectScene() {
  return (
    <div className="mx-auto flex h-full max-w-[720px] flex-col justify-center">
      <div className="rounded-[20px] border border-[var(--hairline)] bg-[var(--surface-card)] p-8 shadow-[var(--shadow-overlay)]">
        <h2
          className="text-[22px] font-semibold"
          style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
        >
          Connected sources
        </h2>
        <p className="mt-1 text-[13px] text-[var(--ink-muted)]">
          LinkedIn and your ATS fill the database. Interviews land via the notetaker.
        </p>
        <ul className="mt-6 space-y-3">
          <SourceRow name="LinkedIn" kind="Professional network" on />
          <SourceRow name="Teamtailor" kind="ATS" on />
        </ul>
      </div>
    </div>
  );
}

function WidgetScene({ active }: { active: boolean }) {
  const [elapsed, setElapsed] = useState(active ? 4 : 0);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setElapsed((value) => Math.min(value + 1, 24)), 700);
    return () => window.clearInterval(id);
  }, [active]);

  const states = coverageForDemoElapsed(elapsed);
  const questions = toLive(DEMO_QUESTIONS, states);

  return (
    <div className="mx-auto flex h-full max-w-[920px] items-stretch gap-6">
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          Meeting detected
        </p>
        <h2
          className="mt-2 text-[22px] font-semibold"
          style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
        >
          Interview starting — {DEMO_CANDIDATE} · {DEMO_ROLE}
        </h2>
        <div className="mt-4 rounded-[14px] border border-[var(--hairline)] bg-[var(--surface-card)] p-4 text-[13px] leading-5 text-[var(--ink-muted)]">
          <span className="font-semibold text-[var(--ink)]">Job spec added.</span> {RAVI_JD.split("\n")[0]}
        </div>
        <p className="mt-3 text-[13px] text-[var(--ink-secondary)]">
          Confirmed. Recording. Coverage updates from the answers — not the CV.
        </p>
      </div>
      <div className="h-full w-[380px] shrink-0 overflow-hidden rounded-[20px] border border-white/80 bg-[rgba(255,249,242,0.72)] shadow-[0_24px_60px_rgba(42,33,27,0.16)] backdrop-blur-xl">
        <div className="flex items-center justify-between px-5 pt-4">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--state-stop)]">
            <span className="h-[7px] w-[7px] rounded-full bg-[var(--state-stop)]" />
            Recording · 00:{String(42 + elapsed).padStart(2, "0")}
          </span>
        </div>
        <h3
          className="px-5 pb-2 pt-2 text-[17px] font-bold"
          style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
        >
          {DEMO_CANDIDATE}
        </h3>
        <div className="h-[calc(100%-88px)] overflow-hidden px-3 pb-3">
          <LiveQuestionPanel variant="cards" questions={questions} />
        </div>
      </div>
    </div>
  );
}

function AnalysisScene() {
  return (
    <div className="mx-auto grid h-full max-w-[1080px] grid-cols-[280px_1fr] gap-6">
      <div className="rounded-[20px] border border-[var(--hairline)] bg-[var(--surface-card)] p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-wash)] text-[26px] font-semibold text-[var(--accent)]">
          {RAVI_SCORECARD.overall}
        </div>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
          Overall
        </p>
        <p className="mt-2 text-[13.5px] leading-6 text-[var(--ink)]">{RAVI_SCORECARD.verdict}</p>
      </div>
      <div className="overflow-hidden rounded-[20px] border border-[var(--hairline)] bg-[var(--surface-card)] p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
          Candidate presentation
        </p>
        <h2
          className="mt-2 text-[20px] font-semibold"
          style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
        >
          Why {DEMO_CANDIDATE.split(" ")[0]}?
        </h2>
        <p className="mt-3 text-[14px] leading-6 text-[var(--ink-secondary)]">{RAVI_PRESENTATION.why[0]}</p>
        <ul className="mt-4 space-y-2 text-[13.5px] text-[var(--ink)]">
          {RAVI_PRESENTATION.competencies.map((item) => (
            <li key={item.title}>
              <strong>{item.title}.</strong>{" "}
              <span className="text-[var(--ink-muted)]">{item.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RecallScene() {
  return (
    <div className="mx-auto flex h-full max-w-[760px] flex-col justify-center">
      <Bubble who="you">Bring back Ravi’s write-up</Bubble>
      <div className="mt-4 rounded-[20px] border border-[var(--glass-border)] bg-[var(--dashboard-glass)] p-6 text-[14px] leading-7 shadow-[var(--shadow-glass)] backdrop-blur-xl">
        <p>
          Here’s what the interview record supports for <strong>{DEMO_CANDIDATE}</strong>.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-[13.5px] text-[var(--ink-secondary)]">
          <li>Role: {DEMO_ROLE} · {DEMO_COMPANY}</li>
          <li>Fit: Strong — Kubernetes at scale, observability evidenced in the call</li>
          <li>Gap: Cloud cost ownership — FinOps was adjacent, not owned</li>
        </ul>
        <p className="mt-3 text-[13px] text-[var(--ink-faint)]">
          Source: interview notes in Taplo (what the candidate said — not the CV).
        </p>
      </div>
    </div>
  );
}

function Bubble({ who, children }: { who: "you" | "taplo"; children: React.ReactNode }) {
  return (
    <div
      className={`max-w-[36rem] rounded-[18px] px-4 py-3 text-[14px] leading-6 ${
        who === "you"
          ? "border border-[var(--glass-border-subtle)] bg-[var(--chat-user-soft)] text-[var(--ink)]"
          : ""
      }`}
    >
      {children}
    </div>
  );
}

function Chip({ children, connected }: { children: React.ReactNode; connected?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--dashboard-glass-soft)] px-3 py-1.5 text-[11px] font-medium">
      {connected ? <Check className="size-3 text-[var(--state-covered)]" /> : <Plug className="size-3" />}
      {children}
    </span>
  );
}

function SourceRow({ name, kind, on }: { name: string; kind: string; on: boolean }) {
  return (
    <li className="flex items-center justify-between rounded-[12px] border border-[var(--hairline)] px-4 py-3">
      <div>
        <div className="text-[14px] font-semibold">{name}</div>
        <div className="text-[11px] uppercase tracking-wider text-[var(--ink-faint)]">{kind}</div>
      </div>
      {on ? (
        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--state-covered)]">
          <Check className="size-3.5" /> Connected
        </span>
      ) : (
        <span className="text-[12px] text-[var(--ink-faint)]">Connect</span>
      )}
    </li>
  );
}

function toLive(
  questions: typeof DEMO_QUESTIONS,
  states: Record<string, QState>,
): LiveQuestion[] {
  return questions.map((question) => {
    const state = states[question.id] ?? "untouched";
    return {
      id: question.id,
      text: question.question,
      state: state === "covered" ? "confirmed" : state === "weak" ? "thin" : "open",
      label: question.requirement,
    };
  });
}
