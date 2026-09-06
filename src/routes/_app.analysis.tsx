import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { sessions as mockSessions } from "@/lib/mock";
import { useCapturedSessions, type CapturedLine, type CapturedSession } from "@/lib/capture-store";
import { PageHeader } from "@/components/ui-taplo/PageHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronsUpDown, Search } from "lucide-react";
import {
  VAXJO_ANALYSIS,
  VAXJO_SESSION_ID,
  VAXJO_SESSION_LABEL,
  VAXJO_TRANSCRIPT,
  swedishDateLabel,
  type AnalysisRating,
  type AnalysisRequirement,
} from "@/lib/analysis-fixture";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  s: z.string().optional(),
  demo: z.string().optional(),
  act: z.string().optional(),
  captions: z.string().optional(),
});

export const Route = createFileRoute("/_app/analysis")({
  head: () => ({ meta: [{ title: "Analysis — Taplo" }] }),
  validateSearch: searchSchema,
  component: AnalysisPage,
});

type ViewSession = {
  id: string;
  label: string;
  candidate: string;
  role: string;
  date: string;
  duration: string;
  jd: string;
  transcript: CapturedLine[];
  notAsked: string[];
  isCaptured: boolean;
};

const VAXJO_SESSION: ViewSession = {
  id: VAXJO_SESSION_ID,
  label: VAXJO_SESSION_LABEL,
  candidate: "Fullstack Developer Candidate Växjö",
  role: "Fullstack Developer",
  date: "Today 22:52",
  duration: "",
  jd: "",
  transcript: VAXJO_TRANSCRIPT,
  notAsked: [],
  isCaptured: false,
};

function AnalysisPage() {
  const { s } = Route.useSearch();
  const captured = useCapturedSessions();

  const all: ViewSession[] = useMemo(() => {
    const extra = captured.map(toView);
    const names = new Set([VAXJO_SESSION.candidate, ...extra.map((session) => session.candidate)]);
    const mocks = mockSessions
      .filter((x) => !names.has(x.candidate))
      .map((x) => ({
        id: x.id,
        label: `${x.candidate} · ${x.date} · ${x.duration}`,
        candidate: x.candidate,
        role: x.role,
        date: x.date,
        duration: x.duration,
        jd: "",
        transcript: [],
        notAsked: [],
        isCaptured: false,
      }));
    return [VAXJO_SESSION, ...extra, ...mocks];
  }, [captured]);

  const session = useMemo(() => all.find((x) => x.id === s) ?? all[0], [all, s]);
  const [tab, setTab] = useState<"scorecard" | "presentation">("scorecard");
  const isVaxjo = session?.id === VAXJO_SESSION_ID;

  if (!session) {
    return (
      <div className="mx-auto max-w-[1080px] px-4 pt-8 sm:px-6 lg:px-10 lg:pt-10">
        <PageHeader title="Analysis" eyebrow={swedishDateLabel()} />
        <p className="text-[14px] text-[var(--ink-muted)]">No sessions yet.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1080px] px-4 pb-28 pt-8 sm:px-6 lg:px-10 lg:pt-10">
      <PageHeader title="Analysis" eyebrow={swedishDateLabel()} />

      <div className="rounded-[14px] border border-[var(--hairline)] bg-[var(--surface)] p-6">
        <label
          className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]"
          style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
        >
          Select session
        </label>
        <div className="relative mt-3">
          <select
            value={session.id}
            onChange={(e) => {
              const params = new URLSearchParams(window.location.search);
              params.set("s", e.target.value);
              window.history.replaceState(null, "", `/analysis?${params.toString()}`);
              window.location.reload();
            }}
            className="w-full appearance-none rounded-[10px] border border-[var(--hairline)] bg-[var(--bg)] px-4 py-3 pr-10 text-[14px] font-medium text-[var(--ink)] outline-none transition-colors duration-150 focus:border-[var(--accent)]"
          >
            {all.map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
          </select>
          <ChevronsUpDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-faint)]" />
        </div>
      </div>

      <div className="mt-6 rounded-[14px] border border-[var(--hairline)] bg-[var(--surface)] p-7">
        <h2
          className="text-[20px] font-semibold leading-[1.2] tracking-[-0.01em] text-[var(--ink)]"
          style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
        >
          Analysis
        </h2>

        <div className="mt-4 flex items-center justify-between">
          <div
            className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]"
            style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
          >
            AI Analysis
          </div>
          <span className="rounded-full border border-[var(--hairline)] bg-[var(--bg)] px-2.5 py-1 text-[11px] font-medium text-[var(--ink-muted)]">
            {isVaxjo ? VAXJO_ANALYSIS.language : "English"}
          </span>
        </div>

        <div className="mt-4 inline-flex rounded-[10px] bg-[var(--surface-sunken)] p-1">
          {(["scorecard", "presentation"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-[8px] px-4 py-1.5 text-[13px] font-semibold transition-all duration-150 ease-out ${
                tab === t
                  ? "bg-[var(--surface)] text-[var(--ink)] shadow-[0_1px_2px_rgba(45,45,45,0.06)]"
                  : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
              }`}
            >
              {t === "scorecard" ? "Scorecard" : "Candidate Presentation"}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <InternalPanel>
            {tab === "scorecard" ? (
              isVaxjo ? (
                <VaxjoScorecard />
              ) : (
                <p className="text-[14px] leading-[1.65] text-[var(--ink-muted)]">
                  No write-up is stored for this session yet.
                </p>
              )
            ) : isVaxjo ? (
              <VaxjoPresentation />
            ) : (
              <p className="text-[14px] leading-[1.65] text-[var(--ink-muted)]">
                No client presentation is stored for this session yet.
              </p>
            )}
          </InternalPanel>
        </div>
      </div>

      <InterviewContextCard
        role={session.role}
        date={session.date}
        language={isVaxjo ? VAXJO_ANALYSIS.language : "English"}
      />
      <TranscriptCard lines={session.transcript} />
    </div>
  );
}

function InterviewContextCard({
  role,
  date,
  language,
}: {
  role: string;
  date: string;
  language: string;
}) {
  return (
    <div className="mt-6 rounded-[14px] border border-[var(--hairline)] bg-[var(--surface)]">
      <Accordion type="single" collapsible>
        <AccordionItem value="context" className="border-b-0">
          <AccordionTrigger
            className="px-6 py-5 text-[16px] font-semibold text-[var(--ink)] hover:no-underline [&[data-state=open]>svg]:rotate-180"
            style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
          >
            Interview context
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-5">
            <dl className="grid gap-3 text-[14px] sm:grid-cols-3">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                  Role
                </dt>
                <dd className="mt-1 text-[var(--ink)]">{role || "—"}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                  Date
                </dt>
                <dd className="mt-1 text-[var(--ink)]">{date || "—"}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                  Language
                </dt>
                <dd className="mt-1 text-[var(--ink)]">{language}</dd>
              </div>
            </dl>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

function TranscriptCard({ lines }: { lines: CapturedLine[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return lines;
    return lines.filter(
      (line) =>
        line.line.toLowerCase().includes(q) ||
        line.t.includes(q) ||
        line.who.toLowerCase().includes(q) ||
        (line.who === "Recruiter" && "me".includes(q)) ||
        (line.who === "Candidate" && "guest".includes(q)),
    );
  }, [lines, query]);

  return (
    <div className="mt-6 rounded-[14px] border border-[var(--hairline)] bg-[var(--surface)] p-6">
      <h2
        className="text-[16px] font-semibold text-[var(--ink)]"
        style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
      >
        Transcript · {filtered.length} segments
      </h2>
      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-faint)]" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search transcript..."
          className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--bg)] py-2.5 pl-10 pr-4 text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)] focus:border-[var(--accent)]"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="mt-6 text-[14px] leading-[1.65] text-[var(--ink-muted)]">
          {lines.length === 0
            ? "No transcript for this session."
            : "No segments match that search."}
        </p>
      ) : (
        <ul className="mt-6 space-y-5">
          {filtered.map((line, i) => (
            <TranscriptBubble key={`${line.t}-${line.who}-${i}`} line={line} />
          ))}
        </ul>
      )}
    </div>
  );
}

function TranscriptBubble({ line }: { line: CapturedLine }) {
  const isMe = line.who === "Recruiter";
  return (
    <li className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
      <div className="mb-1.5 text-[11px] text-[var(--ink-faint)]">
        {isMe ? `${line.t} Me` : `Guest ${line.t}`}
      </div>
      <div
        className={cn(
          "max-w-[78%] rounded-[14px] px-4 py-3 text-[14px] leading-[1.55] text-[var(--ink)]",
          isMe ? "bg-[#E0EBFF]" : "bg-[#F2ECE4]",
        )}
      >
        {line.line}
      </div>
    </li>
  );
}

function InternalPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--hairline)] px-5 py-3">
        <span className="rounded-full bg-[var(--surface-sunken)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--ink-muted)]">
          Internal
        </span>
        <span className="text-[12px] italic text-[var(--ink-faint)]">
          Internal recruiter notes — not for clients
        </span>
      </div>
      <div className="space-y-8 px-5 py-6">{children}</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]"
      style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
    >
      {children}
    </div>
  );
}

function VaxjoScorecard() {
  return (
    <>
      <section>
        <SectionLabel>Overview</SectionLabel>
        <p className="text-[14.5px] leading-[1.7] text-[var(--ink)]">{VAXJO_ANALYSIS.overview}</p>
      </section>

      <section>
        <SectionLabel>Candidate profile</SectionLabel>
        <p className="text-[14.5px] leading-[1.7] text-[var(--ink)]">{VAXJO_ANALYSIS.profile}</p>
      </section>

      <section>
        <SectionLabel>Key discussion points</SectionLabel>
        <p className="text-[13px] text-[var(--ink-secondary)]">
          {VAXJO_ANALYSIS.coverage}% of requirements covered in this interview
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-sunken)]">
          <div
            className="h-full rounded-full bg-[#2D2926]"
            style={{ width: `${VAXJO_ANALYSIS.coverage}%` }}
          />
        </div>

        <ul className="mt-6 divide-y divide-[var(--hairline)]">
          {VAXJO_ANALYSIS.requirements.map((item) => (
            <RequirementRow key={item.title} item={item} />
          ))}
        </ul>
      </section>
    </>
  );
}

function VaxjoPresentation() {
  return (
    <div className="space-y-5 text-[14.5px] leading-[1.7] text-[var(--ink)]">
      <section>
        <SectionLabel>Candidate profile</SectionLabel>
        <p>{VAXJO_ANALYSIS.profile}</p>
      </section>
      <section>
        <SectionLabel>Overview</SectionLabel>
        <p>{VAXJO_ANALYSIS.overview}</p>
      </section>
    </div>
  );
}

function RequirementRow({ item }: { item: AnalysisRequirement }) {
  return (
    <li className="flex flex-col gap-3 py-5 first:pt-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 max-w-[720px]">
        <h3
          className="text-[15px] font-semibold text-[var(--ink)]"
          style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
        >
          {item.title}
        </h3>
        <p className="mt-1.5 text-[13.5px] leading-[1.6] text-[var(--ink-secondary)]">{item.note}</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
        {item.confidence ? (
          <span className="text-[11px] text-[var(--ink-faint)]">{item.confidence}</span>
        ) : null}
        <RatingPill rating={item.rating} />
      </div>
    </li>
  );
}

function RatingPill({ rating }: { rating: AnalysisRating }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
        rating === "Limited" && "bg-[#FEEBC8] text-[#C05621]",
        rating === "Strong" && "bg-[#C6F6D5] text-[#2F855A]",
        rating === "Adequate" && "bg-[#C6F6D5]/70 text-[#276749]",
        rating === "Not covered" && "bg-[#EDF2F7] text-[#718096]",
      )}
    >
      {rating}
    </span>
  );
}

function toView(c: CapturedSession): ViewSession {
  return {
    ...c,
    label: `${c.candidate} · ${c.date} · ${c.duration}`,
    notAsked: c.notAsked ?? [],
    isCaptured: true,
  };
}
