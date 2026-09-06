import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { transcript as mockTranscript, sessions as mockSessions } from "@/lib/mock";
import { useCapturedSessions, type CapturedLine, type CapturedSession } from "@/lib/capture-store";
import { PageHeader } from "@/components/ui-taplo/PageHeader";
import { ChevronsUpDown, Copy, Loader2, Sparkles, Star } from "lucide-react";

const searchSchema = z.object({ s: z.string().optional() });

export const Route = createFileRoute("/_app/analysis")({
  head: () => ({ meta: [{ title: "Analysis — Taplo" }] }),
  validateSearch: searchSchema,
  component: AnalysisPage,
});

type ViewSession = {
  id: string;
  candidate: string;
  role: string;
  date: string;
  duration: string;
  jd: string;
  transcript: CapturedLine[];
  notAsked: string[];
  isCaptured: boolean;
};

function AnalysisPage() {
  const { s } = Route.useSearch();
  const captured = useCapturedSessions();

  const all: ViewSession[] = useMemo(() => {
    const c = captured.map(toView);
    const m = mockSessions.map((x) => ({
      id: x.id,
      candidate: x.candidate,
      role: x.role,
      date: x.date,
      duration: x.duration,
      jd: "",
      transcript: mockTranscript as CapturedLine[],
      notAsked: [],
      isCaptured: false,
    }));
    return [...c, ...m];
  }, [captured]);

  const session = useMemo(
    () => all.find((x) => x.id === s) ?? all[0],
    [all, s],
  );

  const [tab, setTab] = useState<"scorecard" | "presentation">("scorecard");

  if (!session) {
    return (
      <div className="mx-auto max-w-[1080px] px-10 pt-10">
        <PageHeader title="Analysis" />
        <p className="text-[14px] text-[var(--ink-muted)]">No sessions yet.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1080px] px-10 pb-24 pt-10">
      <PageHeader title="Analysis" />

      {/* Session selector */}
      <div className="rounded-[14px] border border-[var(--hairline)] bg-[var(--surface)] p-6">
        <label
          className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]"
          style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
        >
          Select session
        </label>
        <div className="relative mt-3">
          <select
            defaultValue={session.id}
            onChange={(e) => {
              window.history.replaceState(null, "", `/analysis?s=${e.target.value}`);
              window.location.reload();
            }}
            className="w-full appearance-none rounded-[10px] border border-[var(--hairline)] bg-[var(--bg)] px-4 py-3 pr-10 text-[14px] font-medium text-[var(--ink)] outline-none transition-colors duration-150 focus:border-[var(--accent)]"
          >
            {all.map((x) => (
              <option key={x.id} value={x.id}>
                {x.candidate} · {x.date} · {x.duration}
              </option>
            ))}
          </select>
          <ChevronsUpDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-faint)]" />
        </div>
      </div>

      {/* Meeting context bar */}
      <div className="mt-4 flex items-center justify-between gap-4 rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)] px-5 py-3.5">
        <div className="min-w-0">
          <span className="text-[12px] font-semibold text-[var(--ink-muted)]">
            Meeting:
          </span>{" "}
          <span className="text-[13px] font-semibold text-[var(--ink)]">
            {session.candidate}
          </span>
          <span className="text-[13px] text-[var(--ink-muted)]">
            {" "}
            · {session.role} · {session.date}
          </span>
        </div>
        <Link
          to="/meetings"
          className="shrink-0 rounded-full border border-[var(--hairline)] bg-[var(--bg)] px-3 py-1.5 text-[12px] font-semibold text-[var(--ink)] hover:bg-[var(--hairline)]/40"
        >
          Change meeting
        </Link>
      </div>

      {/* Analysis card */}
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
            English
          </span>
        </div>

        {/* Tabs */}
        <div className="mt-4 inline-flex rounded-[10px] border border-[var(--hairline)] bg-[var(--bg)] p-1">
          {(["scorecard", "presentation"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-[8px] px-4 py-1.5 text-[13px] font-semibold capitalize transition-all duration-150 ease-out ${
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
          {tab === "scorecard" ? (
            <ScorecardBody session={session} />
          ) : (
            <PresentationBody session={session} />
          )}
        </div>
      </div>

      {/* Questions not asked */}
      {session.notAsked.length > 0 && (
        <div className="mt-6 rounded-[14px] border border-[var(--hairline)] bg-[var(--surface)] p-7">
          <h3
            className="text-[16px] font-semibold text-[var(--ink)]"
            style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
          >
            Not asked
          </h3>
          <p className="mt-1 text-[12px] text-[var(--ink-faint)]">
            {session.notAsked.length} planned questions never came up in the interview.
          </p>
          <ul className="mt-3 space-y-2">
            {session.notAsked.map((q) => (
              <li
                key={q}
                className="flex gap-2 text-[13.5px] leading-[1.55] text-[var(--ink-secondary)]"
              >
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--state-thin)]" />
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Transcript */}
      <div className="mt-6 rounded-[14px] border border-[var(--hairline)] bg-[var(--surface)] p-7">
        <h3
          className="text-[16px] font-semibold text-[var(--ink)]"
          style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
        >
          Transcript
        </h3>
        <p className="mt-1 text-[12px] text-[var(--ink-faint)]">
          {session.transcript.length} lines
        </p>
        <TranscriptBody lines={session.transcript} />
      </div>
    </div>
  );
}

function toView(c: CapturedSession): ViewSession {
  return { ...c, notAsked: c.notAsked ?? [], isCaptured: true };
}

type ScorecardData = {
  overall: number;
  verdict: string;
  items: { category: string; score: number; note: string }[];
};

function ScorecardBody({ session }: { session: ViewSession }) {
  const [data, setData] = useState<ScorecardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setErr(null);
    try {
      const transcriptText = session.transcript
        .map((l) => `${l.who}: ${l.line}`)
        .join("\n");
      const res = await fetch("/api/scorecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jd: session.jd,
          transcript: transcriptText,
          candidate: session.candidate,
        }),
      });
      const json = (await res.json()) as ScorecardData & { error?: string };
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setData(json);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  if (!data) {
    return (
      <div className="rounded-[12px] border border-dashed border-[var(--hairline)] bg-[var(--bg)]/60 p-6">
        <p className="text-[13px] text-[var(--ink-muted)]">
          Generate a scorecard to see how the candidate measures against the JD.
        </p>
        <button
          onClick={generate}
          disabled={loading}
          className="mt-4 inline-flex items-center gap-1.5 rounded-[10px] bg-[var(--accent)] px-3.5 py-2 text-[13px] font-semibold text-white transition-opacity duration-150 hover:opacity-90 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {loading ? "Analyzing…" : "Generate scorecard"}
        </button>
        {err && <p className="mt-3 text-[12px] text-red-600">{err}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-5 rounded-[12px] border border-[var(--hairline)] bg-[var(--bg)] p-5">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[color:color-mix(in_oklab,var(--accent)_14%,transparent)] text-[26px] font-semibold text-[var(--accent)]"
          style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
        >
          {data.overall}
        </div>
        <div>
          <div
            className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]"
            style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
          >
            Overall score
          </div>
          <p className="mt-1 text-[13.5px] leading-[1.55] text-[var(--ink)]">
            {data.verdict}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {data.items.map((item, i) => (
          <div
            key={i}
            className="rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)] p-4"
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[13px] font-semibold text-[var(--ink)]"
                style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
              >
                {item.category}
              </span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`h-3 w-3 ${
                      j < item.score
                        ? "fill-[var(--accent)] text-[var(--accent)]"
                        : "text-[var(--hairline)]"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="mt-2 text-[12.5px] leading-[1.55] text-[var(--ink-muted)]">
              {item.note}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={generate}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-[10px] border border-[var(--hairline)] bg-[var(--bg)] px-3 py-1.5 text-[12px] font-semibold text-[var(--ink-muted)] hover:text-[var(--ink)] disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Sparkles className="h-3 w-3" />
        )}
        Regenerate
      </button>
    </div>
  );
}

type Presentation = {
  background: string[];
  competencies: { title: string; description: string }[];
  why: string[];
  practical: { location: string; salary: string; noticePeriod: string };
};

function PresentationBody({ session }: { session: ViewSession }) {
  const [data, setData] = useState<Presentation | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setErr(null);
    try {
      const transcriptText = session.transcript
        .map((l) => `${l.who}: ${l.line}`)
        .join("\n");
      const res = await fetch("/api/presentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jd: session.jd,
          transcript: transcriptText,
          candidate: session.candidate,
        }),
      });
      const json = (await res.json()) as Presentation & { error?: string };
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setData(json);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  if (!data) {
    return (
      <div className="rounded-[12px] border border-dashed border-[var(--hairline)] bg-[var(--bg)]/60 p-6">
        <p className="text-[13px] text-[var(--ink-muted)]">
          Generate a client-ready brief from this session&rsquo;s transcript and JD.
        </p>
        <button
          onClick={generate}
          disabled={loading}
          className="mt-4 inline-flex items-center gap-1.5 rounded-[10px] bg-[var(--accent)] px-3.5 py-2 text-[13px] font-semibold text-white transition-opacity duration-150 hover:opacity-90 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {loading ? "Generating…" : "Generate presentation"}
        </button>
        {err && <p className="mt-3 text-[12px] text-red-600">{err}</p>}
      </div>
    );
  }

  const firstName = (session.candidate || "the candidate").split(" ")[0];

  return (
    <div className="space-y-6 text-[14px] leading-[1.6] text-[var(--ink)]">
      <div className="flex items-start justify-end">
        <button
          onClick={() =>
            navigator.clipboard.writeText(formatPresentation(data, session))
          }
          className="rounded-md p-1.5 text-[var(--ink-faint)] hover:bg-[var(--bg)] hover:text-[var(--ink)]"
          aria-label="Copy"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>

      <Block label="Background">
        {data.background.length === 0 ? (
          <p className="text-[var(--ink-faint)]">No background captured yet.</p>
        ) : (
          <div className="space-y-3">
            {data.background.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}
      </Block>

      <Block label="Key competencies and skills">
        {data.competencies.length === 0 ? (
          <p className="text-[var(--ink-faint)]">Not enough detail yet.</p>
        ) : (
          <ul className="space-y-2.5">
            {data.competencies.map((c, i) => (
              <li key={i}>
                <span className="font-semibold text-[var(--ink)]">{c.title}:</span>{" "}
                <span className="text-[var(--ink-muted)]">{c.description}</span>
              </li>
            ))}
          </ul>
        )}
      </Block>

      <Block label={`Why ${firstName}?`}>
        {data.why.length === 0 ? (
          <p className="text-[var(--ink-faint)]">Not discussed yet.</p>
        ) : (
          <div className="space-y-3">
            {data.why.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}
      </Block>

      <Block label="Practical information">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { k: "Location", v: data.practical.location },
            { k: "Salary expectation", v: data.practical.salary },
            { k: "Notice period", v: data.practical.noticePeriod },
          ].map((f) => (
            <div key={f.k}>
              <dt
                className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-faint)]"
                style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
              >
                {f.k}
              </dt>
              <dd className="mt-1 text-[13.5px] text-[var(--ink)]">
                {f.v || <span className="text-[var(--ink-faint)]">—</span>}
              </dd>
            </div>
          ))}
        </dl>
      </Block>

      <button
        onClick={generate}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-[10px] border border-[var(--hairline)] bg-[var(--bg)] px-3 py-1.5 text-[12px] font-semibold text-[var(--ink-muted)] hover:text-[var(--ink)] disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Sparkles className="h-3 w-3" />
        )}
        Regenerate
      </button>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]"
        style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
      >
        {label}
      </div>
      <div className="rounded-[12px] border border-[var(--hairline)] bg-[var(--bg)] p-5">
        {children}
      </div>
    </div>
  );
}

function TranscriptBody({ lines }: { lines: CapturedLine[] }) {
  if (lines.length === 0) {
    return (
      <p className="mt-4 text-[13px] text-[var(--ink-faint)]">
        No transcript captured.
      </p>
    );
  }
  return (
    <div className="mt-4 space-y-3">
      {lines.map((line, i) => (
        <div key={i} className="flex gap-4 text-[13.5px]">
          <span className="w-12 shrink-0 font-mono text-[11px] text-[var(--ink-faint)] tabular-nums">
            {line.t}
          </span>
          <div className="flex-1">
            <div
              className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${
                line.who === "Recruiter"
                  ? "text-[var(--accent)]"
                  : "text-[var(--ink-faint)]"
              }`}
            >
              {line.who}
            </div>
            <p className="mt-0.5 leading-[1.55] text-[var(--ink)]">{line.line}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatPresentation(p: Presentation, s: ViewSession) {
  const firstName = (s.candidate || "the candidate").split(" ")[0];
  const comps = p.competencies.map((c) => `• ${c.title}: ${c.description}`).join("\n");
  return (
    `Candidate: ${s.candidate}\nRole: ${s.role}\n\n` +
    `Background\n${p.background.join("\n\n")}\n\n` +
    `Key Competencies and Skills\n${comps}\n\n` +
    `Why ${firstName}?\n${p.why.join("\n\n")}\n\n` +
    `Practical Information\n` +
    `Location: ${p.practical.location || "—"}\n` +
    `Salary Expectation: ${p.practical.salary || "—"}\n` +
    `Notice Period: ${p.practical.noticePeriod || "—"}\n`
  );
}
