import { useRef } from "react";

export type PreviewValue = "early" | "mid" | "late";

const OPTIONS: PreviewValue[] = ["early", "mid", "late"];
const LABELS: Record<PreviewValue, string> = { early: "Early", mid: "Mid", late: "Late" };

export function PreviewToggle({
  value,
  onChange,
}: {
  value: PreviewValue;
  onChange: (v: PreviewValue) => void;
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = OPTIONS[(i + dir + OPTIONS.length) % OPTIONS.length];
    onChange(next);
    refs.current[next]?.focus();
  }

  return (
    <div className="mt-1">
      <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Preview
      </div>
      <div
        role="radiogroup"
        aria-label="Preview state"
        className="inline-flex rounded-lg bg-black/[0.06] p-0.5 shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.06)] dark:bg-white/[0.06]"
      >
        {OPTIONS.map((opt, i) => {
          const active = opt === value;
          return (
            <button
              key={opt}
              ref={(el) => {
                refs.current[opt] = el;
              }}
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(opt)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`min-h-7 rounded-md px-3 text-[11px] font-medium transition-all focus-visible:outline-none ${
                active
                  ? "bg-white text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_0_0_0.5px_rgba(0,0,0,0.06)] dark:bg-white/90 dark:text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {LABELS[opt]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
