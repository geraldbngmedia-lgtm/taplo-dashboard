import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronRight, Lightbulb, ListChecks, X } from "lucide-react";

/**
 * Three live states, all detected automatically — never set by hand:
 * - open      : not yet asked (or unsure). Stays in its section.
 * - thin      : asked but shallow. Amber, lightbulb offered.
 * - confirmed : answered well. Sinks into the collapsed "covered" group.
 */
export type LiveQuestionState = "open" | "thin" | "confirmed";

export type LiveQuestion = {
  id: string;
  text: string;
  state: LiveQuestionState;
  /** Follow-up probe, only meaningful while the question is thin. */
  cue?: string;
  /** Section the question belongs to, e.g. Background / Qualifications. */
  label?: string;
};

const ORDER: Record<LiveQuestionState, number> = { open: 0, thin: 1, confirmed: 2 };

export function LiveQuestionPanel({
  questions,
  version = "v1.4.2",
  className = "",
  embedded = false,
  variant = "minimal",
}: {
  questions: LiveQuestion[];
  version?: string;
  className?: string;
  /** Renders just the list, without window chrome or footer. */
  embedded?: boolean;
  /** "cards" renders numbered question cards inside a white sheet. */
  variant?: "minimal" | "cards";
}) {
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});
  const [coveredOpen, setCoveredOpen] = useState(false);


  // Pulse when a question is auto-detected as answered.
  const prev = useRef<Record<string, LiveQuestionState>>({});
  const [justCovered, setJustCovered] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const flipped: string[] = [];
    const next: Record<string, LiveQuestionState> = {};
    for (const q of questions) {
      next[q.id] = q.state;
      if (prev.current[q.id] && prev.current[q.id] !== "confirmed" && q.state === "confirmed") {
        flipped.push(q.id);
      }
    }
    prev.current = next;
    if (flipped.length === 0) return;
    setJustCovered((m) => {
      const copy = { ...m };
      for (const id of flipped) copy[id] = true;
      return copy;
    });
    const t = window.setTimeout(() => {
      setJustCovered((m) => {
        const copy = { ...m };
        for (const id of flipped) delete copy[id];
        return copy;
      });
    }, 700);
    return () => window.clearTimeout(t);
  }, [questions]);

  const covered = useMemo(() => questions.filter((q) => q.state === "confirmed"), [questions]);

  /** Remaining questions stay grouped by section, open before thin inside each. */
  const sections = useMemo(() => {
    const groups: { label: string; items: LiveQuestion[] }[] = [];
    for (const q of questions) {
      if (q.state === "confirmed") continue;
      const label = q.label?.trim() || "Questions";
      let group = groups.find((g) => g.label === label);
      if (!group) {
        group = { label, items: [] };
        groups.push(group);
      }
      group.items.push(q);
    }
    for (const g of groups) g.items.sort((a, b) => ORDER[a.state] - ORDER[b.state]);
    return groups;
  }, [questions]);

  if (variant === "cards") {
    return (
      <div
        className={`rounded-[14px] p-4 ${className}`}
        style={{
          background: "rgba(255,255,255,0.52)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.55)",
        }}
      >
        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--accent-wash)] text-[var(--accent)]">
            <ListChecks className="h-4 w-4" strokeWidth={2} />
          </span>
          <span
            className="text-[15px] font-semibold text-[var(--ink)]"
            style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
          >
            Interview
          </span>
        </div>

        {sections.length === 0 && covered.length === 0 && (
          <p className="text-[12.5px] text-[var(--ink-tertiary)]">No questions yet.</p>
        )}

        {sections.map((section, i) => (
          <div key={section.label} className={i === 0 ? "" : "mt-5"}>
            <p
              className="border-b border-[var(--hairline)] pb-2 text-[13.5px] font-semibold text-[var(--ink)]"
              style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
            >
              {section.label}
            </p>
            <div className="mt-3 space-y-2.5">
              {section.items.map((q, idx) => (
                <QuestionCard
                  key={q.id}
                  q={q}
                  index={idx + 1}
                  pulse={!!justCovered[q.id]}
                  cueDismissed={!!dismissed[q.id]}
                  onDismissCue={() => setDismissed((m) => ({ ...m, [q.id]: true }))}
                />
              ))}
            </div>
          </div>
        ))}

        {covered.length > 0 && (
          <div className="mt-5 border-t border-[var(--hairline)] pt-3">
            <button
              type="button"
              onClick={() => setCoveredOpen((v) => !v)}
              aria-expanded={coveredOpen}
              className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-tertiary)] transition-colors hover:text-[var(--ink-secondary)]"
            >
              <span className="tabular-nums">{covered.length} covered</span>
              <ChevronRight
                className={`h-3 w-3 transition-transform duration-150 ${coveredOpen ? "rotate-90" : ""}`}
              />
            </button>
            {coveredOpen && (
              <div className="mt-3 space-y-2.5">
                {covered.map((q, idx) => (
                  <QuestionCard
                    key={q.id}
                    q={q}
                    index={idx + 1}
                    pulse={!!justCovered[q.id]}
                    cueDismissed
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }


  const list = (
    <div className="text-[var(--ink)]">
      {sections.length === 0 && covered.length === 0 && (
        <p className="text-[12.5px] text-[var(--ink-tertiary)]">No questions yet.</p>
      )}

      {sections.map((section, i) => (
        <div key={section.label} className={i === 0 ? "" : "mt-4"}>
          <p className="pb-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-tertiary)]">
            {section.label}
          </p>
          {section.items.map((q) => (
            <QuestionRow
              key={q.id}
              q={q}
              pulse={!!justCovered[q.id]}
              cueDismissed={!!dismissed[q.id]}
              onDismissCue={() => setDismissed((m) => ({ ...m, [q.id]: true }))}
            />
          ))}
        </div>
      ))}

      {covered.length > 0 && (
        <div className={sections.length > 0 ? "mt-3 border-t border-[var(--hairline)] pt-3" : ""}>
          <button
            type="button"
            onClick={() => setCoveredOpen((v) => !v)}
            aria-expanded={coveredOpen}
            className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-tertiary)] transition-colors hover:text-[var(--ink-secondary)]"
          >
            <span className="tabular-nums">{covered.length} covered</span>
            <ChevronRight
              className={`h-3 w-3 transition-transform duration-150 ${coveredOpen ? "rotate-90" : ""}`}
            />
          </button>

          {coveredOpen && (
            <div className="pt-3">
              {covered.map((q) => (
                <QuestionRow key={q.id} q={q} pulse={!!justCovered[q.id]} cueDismissed />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );


  if (embedded) return <div className={className}>{list}</div>;

  return (
    <div
      className={`flex h-full w-[320px] flex-col overflow-hidden rounded-[14px] border border-[var(--hairline)] bg-[var(--surface-page)] text-[var(--ink)] ${className}`}
      style={{ ["--surface-page" as string]: "#F0EBE2" }}
    >
      <div className="flex items-center justify-between px-[18px] pb-3 pt-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-tertiary)]">
          Interview
        </span>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-[9px] w-[9px] rounded-full bg-[var(--hairline)]" />
          ))}
        </div>
      </div>

      <div className="scroll-quiet flex-1 overflow-y-auto px-[18px] pb-4 pt-1">{list}</div>

      <div className="flex items-center justify-between border-t border-[var(--hairline)] px-[18px] py-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--state-covered)]" />
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-tertiary)]">
            Live capture active
          </span>
        </div>
        <span className="text-[9px] font-medium tabular-nums text-[var(--ink-tertiary)] opacity-70">
          {version}
        </span>
      </div>
    </div>
  );
}

function QuestionRow({
  q,
  pulse,
  cueDismissed,
  onDismissCue,
}: {
  q: LiveQuestion;
  pulse: boolean;
  cueDismissed: boolean;
  onDismissCue?: () => void;
}) {
  const [showCue, setShowCue] = useState(false);
  const isThin = q.state === "thin";
  const isConfirmed = q.state === "confirmed";
  const offerCue = isThin && !!q.cue && !cueDismissed;

  useEffect(() => {
    if (!isThin) setShowCue(false);
  }, [isThin]);

  return (
    <div className="group relative pb-4 pl-7 last:pb-1">
      <Marker state={q.state} pulse={pulse} />

      <div className="flex items-start gap-2">
        <p
          className={`flex-1 text-[13px] leading-[1.5] transition-colors duration-[600ms] ease-out ${
            isConfirmed
              ? "text-[var(--ink-tertiary)] line-through decoration-[var(--ink-tertiary)]/60"
              : isThin
                ? "font-medium text-[var(--state-thin-ink)]"
                : "text-[var(--ink)]"
          }`}
        >
          {q.text}
        </p>

        {offerCue && (
          <button
            type="button"
            onClick={() => setShowCue((v) => !v)}
            aria-expanded={showCue}
            aria-label={showCue ? "Hide follow-up" : "Show follow-up"}
            className={`mt-[1px] flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border transition-colors duration-150 ${
              showCue
                ? "border-transparent bg-[var(--state-thin-wash)] text-[var(--state-thin-ink)]"
                : "border-[var(--hairline)] text-[var(--ink-tertiary)] hover:text-[var(--state-thin-ink)]"
            }`}
          >
            <Lightbulb className="h-[13px] w-[13px]" strokeWidth={1.9} />
          </button>
        )}
      </div>

      {offerCue && showCue && (
        <div className="mt-2.5 flex items-start gap-2 rounded-[10px] border border-[var(--hairline)] bg-[var(--surface-card)] px-3 py-2.5">
          <span className="flex-1 text-[11.5px] leading-[1.5] text-[var(--ink-secondary)]">
            {q.cue}
          </span>
          <button
            type="button"
            onClick={onDismissCue}
            aria-label="Dismiss follow-up"
            className="mt-[1px] shrink-0 text-[var(--ink-tertiary)] transition-colors hover:text-[var(--ink)]"
          >
            <X className="h-3 w-3" strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}

function Marker({ state, pulse }: { state: LiveQuestionState; pulse: boolean }) {
  if (state === "confirmed") {
    return (
      <span className="absolute left-[3px] top-[2px] text-[var(--state-covered)]">
        <Check
          className={`h-[13px] w-[13px] ${pulse ? "motion-safe:animate-[taplo-dot-pulse_600ms_ease-out]" : ""}`}
          strokeWidth={2.4}
        />
      </span>
    );
  }

  return (
    <span
      className={`absolute left-[6px] top-[5px] h-[9px] w-[9px] rounded-full transition-colors duration-[600ms] ease-out ${
        state === "thin"
          ? "bg-[var(--state-thin)]"
          : "border-[1.5px] border-[color:color-mix(in_oklab,var(--ink)_28%,transparent)] bg-transparent"
      }`}
    />
  );
}

function QuestionCard({
  q,
  index,
  pulse,
  cueDismissed,
  onDismissCue,
}: {
  q: LiveQuestion;
  index: number;
  pulse: boolean;
  cueDismissed: boolean;
  onDismissCue?: () => void;
}) {
  const [showCue, setShowCue] = useState(false);
  const isThin = q.state === "thin";
  const isConfirmed = q.state === "confirmed";
  const offerCue = isThin && !!q.cue && !cueDismissed;

  useEffect(() => {
    if (!isThin) setShowCue(false);
  }, [isThin]);

  return (
    <div
      className={`rounded-[11px] px-3.5 py-3 transition-colors duration-300 ${
        isThin ? "border border-[var(--state-thin)]" : "border border-white/50"
      } ${pulse ? "motion-safe:animate-[taplo-dot-pulse_600ms_ease-out]" : ""}`}
      style={{
        background: isThin
          ? "var(--state-thin-wash)"
          : isConfirmed
            ? "rgba(255,255,255,0.32)"
            : "rgba(255,255,255,0.62)",
        backdropFilter: "blur(6px)",
      }}
    >

      <div className="flex items-start gap-2.5">
        <span
          className={`mt-[1px] shrink-0 text-[13px] font-medium tabular-nums ${
            isConfirmed ? "text-[var(--state-covered)]" : "text-[var(--ink-tertiary)]"
          }`}
        >
          {isConfirmed ? <Check className="h-[14px] w-[14px]" strokeWidth={2.4} /> : `${index}.`}
        </span>
        <p
          className={`flex-1 text-[13px] font-medium leading-[1.5] ${
            isConfirmed
              ? "text-[var(--ink-tertiary)] line-through decoration-[var(--ink-tertiary)]/60"
              : isThin
                ? "text-[var(--state-thin-ink)]"
                : "text-[var(--ink)]"
          }`}
        >
          {q.text}
        </p>

        {offerCue && (
          <button
            type="button"
            onClick={() => setShowCue((v) => !v)}
            aria-expanded={showCue}
            aria-label={showCue ? "Hide follow-up" : "Show follow-up"}
            className={`mt-[1px] flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border transition-colors duration-150 ${
              showCue
                ? "border-transparent bg-[var(--surface-card)] text-[var(--state-thin-ink)]"
                : "border-[var(--hairline)] text-[var(--ink-tertiary)] hover:text-[var(--state-thin-ink)]"
            }`}
          >
            <Lightbulb className="h-[13px] w-[13px]" strokeWidth={1.9} />
          </button>
        )}
      </div>

      {offerCue && showCue && (
        <div className="mt-2.5 flex items-start gap-2 rounded-[10px] border border-[var(--hairline)] bg-[var(--surface-card)] px-3 py-2.5">
          <span className="flex-1 text-[11.5px] leading-[1.5] text-[var(--ink-secondary)]">
            {q.cue}
          </span>
          <button
            type="button"
            onClick={onDismissCue}
            aria-label="Dismiss follow-up"
            className="mt-[1px] shrink-0 text-[var(--ink-tertiary)] transition-colors hover:text-[var(--ink)]"
          >
            <X className="h-3 w-3" strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}
