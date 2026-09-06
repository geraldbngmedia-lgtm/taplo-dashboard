import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { InterviewQuestion } from "@/routes/api/questions";
import type { QState } from "@/lib/question-fixtures";

function fmtClock(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const TARGET_SECONDS = 45 * 60;

export function QuestionList({
  questions,
  states,
  elapsedSec,
  role,
  loading,
}: {
  questions: InterviewQuestion[];
  states: Record<string, QState>;
  elapsedSec: number;
  role: string;
  loading?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
        Preparing questions…
      </div>
    );
  }
  if (questions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background p-3 text-xs text-muted-foreground">
        Paste a JD above to generate questions.
      </div>
    );
  }

  // current = first untouched or weak, else last
  const currentIdx = (() => {
    const i = questions.findIndex((q) => {
      const s = states[q.id] ?? "untouched";
      return s === "untouched" || s === "weak";
    });
    return i === -1 ? questions.length - 1 : i;
  })();

  const remaining = Math.max(0, TARGET_SECONDS - elapsedSec);
  const untouchedCount = questions.filter((q) => (states[q.id] ?? "untouched") === "untouched").length;
  const lowTime = remaining > 0 && remaining < 12 * 60;

  const windowStart = Math.max(0, Math.min(currentIdx - 1, questions.length - 3));
  const windowEnd = Math.min(questions.length, windowStart + 3);
  const visibleIdx = expanded
    ? questions.map((_, i) => i)
    : Array.from({ length: windowEnd - windowStart }, (_, i) => windowStart + i);
  const hiddenCount = questions.length - visibleIdx.length;

  return (
    <div className="space-y-2">
      {/* Status bar */}
      <div
        className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-[11px] tabular-nums transition-colors duration-500 ${
          lowTime
            ? "bg-[hsl(215_30%_92%)] text-[hsl(215_35%_30%)] dark:bg-[hsl(215_25%_22%)] dark:text-[hsl(215_30%_82%)]"
            : "bg-muted/40 text-muted-foreground"
        }`}
        aria-live="polite"
      >
        <span>
          {lowTime
            ? `${Math.ceil(remaining / 60)} min left`
            : `${fmtClock(elapsedSec)} elapsed`}
        </span>
        <span className="truncate pl-3 text-right">
          {lowTime && untouchedCount > 0
            ? `${untouchedCount} must-have${untouchedCount === 1 ? "" : "s"} untouched`
            : role || "Untitled role"}
        </span>
      </div>

      {/* Question list */}
      <ol className="space-y-2">
        {visibleIdx.map((i) => {
          const q = questions[i];
          const state: QState = (states[q.id] ?? "untouched") as QState;
          const isCurrent = i === currentIdx && state !== "covered";
          const rowState: "current" | "weak" | "covered" | "untouched" = isCurrent
            ? "current"
            : state;
          return <QuestionRow key={q.id} q={q} state={rowState} />;
        })}
      </ol>

      {/* Collapsed tail */}
      {hiddenCount > 0 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="flex w-full items-center justify-between rounded-md border border-border/60 bg-background/60 px-3 py-2 text-[11px] text-muted-foreground transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 motion-safe:transition-opacity motion-safe:duration-500"
        >
          <span>
            {hiddenCount} more question{hiddenCount === 1 ? "" : "s"}
          </span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function QuestionRow({
  q,
  state,
}: {
  q: InterviewQuestion;
  state: "current" | "weak" | "covered" | "untouched";
}) {
  const rail =
    state === "current"
      ? "bg-foreground"
      : state === "weak"
        ? "bg-[hsl(215_25%_55%)]"
        : state === "covered"
          ? "bg-muted-foreground/30"
          : "bg-border";

  const labelColor =
    state === "current"
      ? "text-muted-foreground"
      : state === "weak"
        ? "text-[hsl(215_35%_45%)]"
        : state === "covered"
          ? "text-muted-foreground/50"
          : "text-muted-foreground";

  const textColor =
    state === "current"
      ? "text-foreground"
      : state === "weak"
        ? "text-foreground/90"
        : state === "covered"
          ? "text-muted-foreground/60"
          : "text-foreground/80";

  const ariaLabel =
    state === "current"
      ? "current question"
      : state === "weak"
        ? "weak answer, needs probe"
        : state === "covered"
          ? "covered"
          : "not yet covered";

  return (
    <li
      aria-current={state === "current" ? "true" : undefined}
      aria-label={ariaLabel}
      className="relative pl-3"
    >
      <span
        aria-hidden
        className={`absolute left-0 top-0.5 h-[calc(100%-4px)] w-[2px] rounded-full transition-colors motion-safe:duration-500 ${rail}`}
      />
      <div
        className={`text-[9px] font-semibold uppercase tracking-[0.14em] transition-colors motion-safe:duration-500 ${labelColor}`}
      >
        {q.requirement}
      </div>
      <div
        className={`text-[15px] leading-snug transition-colors motion-safe:duration-500 ${textColor}`}
      >
        {q.question}
      </div>
      {state === "weak" && q.probe && (
        <div className="mt-1.5 rounded-md bg-[hsl(215_30%_92%)] px-2.5 py-1.5 text-[11px] leading-relaxed text-[hsl(215_35%_30%)] motion-safe:transition-opacity motion-safe:duration-500 dark:bg-[hsl(215_25%_22%)] dark:text-[hsl(215_30%_82%)]">
          {q.probe}
        </div>
      )}
    </li>
  );
}
