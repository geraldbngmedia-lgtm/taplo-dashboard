import type { ReactNode } from "react";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function todayLabel() {
  const d = new Date();
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`.toUpperCase();
}

export function PageHeader({
  title,
  eyebrow,
  actions,
}: {
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4 sm:gap-6">
      <div>
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-muted)]"
        >
          {eyebrow ?? todayLabel()}
        </div>
        <h1
          className="mt-2 text-[28px] font-semibold leading-[1.1] tracking-[-0.02em] text-[var(--ink)] sm:text-[40px]"
          style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
        >
          {title}
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {actions}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--hairline)] bg-[var(--surface)] px-3 py-1.5 text-[12px] font-medium text-[var(--ink)]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Ready
        </span>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--hairline)] bg-[var(--surface)] text-[11px] font-semibold text-[var(--ink)]"
          style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
          aria-label="Account"
        >
          GB
        </div>
      </div>
    </header>
  );
}
