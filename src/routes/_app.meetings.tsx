import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { meetings } from "@/lib/mock";
import { PageHeader } from "@/components/ui-taplo/PageHeader";
import { CalendarPlus, RefreshCcw, Video } from "lucide-react";

export const Route = createFileRoute("/_app/meetings")({
  head: () => ({ meta: [{ title: "Meetings — Taplo" }] }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const today = meetings.filter((m) => m.status === "today");
  const later = meetings.filter((m) => m.status !== "today");

  return (
    <div className="mx-auto w-full max-w-[1080px] px-4 pb-28 pt-8 sm:px-6 lg:px-10 lg:pt-10">
      <PageHeader title="Meetings" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AddMeetingForm />
        <TodaysMeetings today={today} later={later} />
      </div>
    </div>
  );
}

function AddMeetingForm() {
  const [candidate, setCandidate] = useState("");
  const [role, setRole] = useState("");
  const [time, setTime] = useState(() =>
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16),
  );
  const [url, setUrl] = useState("");
  const [jd, setJd] = useState("");

  return (
    <section className="rounded-[14px] border border-[var(--hairline)] bg-[var(--surface)] p-7">
      <h2
        className="text-[20px] font-semibold leading-[1.2] tracking-[-0.01em] text-[var(--ink)]"
        style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
      >
        Add meeting manually
      </h2>

      <div className="mt-6 space-y-4">
        <FormField label="Candidate name" required>
          <input
            value={candidate}
            onChange={(e) => setCandidate(e.target.value)}
            className={inputCls}
          />
        </FormField>

        <FormField label="Role title" required>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={inputCls}
          />
        </FormField>

        <FormField label="Scheduled time" required>
          <input
            type="datetime-local"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={`${inputCls} tabular-nums`}
          />
        </FormField>

        <FormField label="Meeting join URL" required>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://meet.google.com/…"
            className={inputCls}
          />
        </FormField>

        <FormField label="Job description">
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            rows={4}
            placeholder="Paste the JD to pre-generate interview questions."
            className={`${inputCls} min-h-[112px] resize-y py-3 leading-[1.55]`}
          />
        </FormField>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button className="rounded-[10px] border border-[var(--hairline)] bg-[var(--bg)] px-4 py-2 text-[13px] font-semibold text-[var(--ink)] hover:bg-[var(--hairline)]/40">
            Cancel
          </button>
          <button className="rounded-[10px] bg-[var(--accent)] px-4 py-2 text-[13px] font-semibold text-white transition-opacity duration-150 hover:opacity-90">
            Add meeting
          </button>
        </div>
      </div>
    </section>
  );
}

const inputCls =
  "w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--bg)] px-3 py-2.5 text-[14px] text-[var(--ink)] placeholder:text-[var(--ink-faint)] outline-none transition-colors duration-150 focus:border-[var(--accent)] focus:bg-[var(--surface)]";

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-[12px] font-semibold text-[var(--ink-muted)]">
        {label}
        {required && <span className="text-[var(--accent)]">*</span>}
      </span>
      {children}
    </label>
  );
}

function TodaysMeetings({
  today,
  later,
}: {
  today: typeof meetings;
  later: typeof meetings;
}) {
  return (
    <section className="rounded-[14px] border border-[var(--hairline)] bg-[var(--surface)] p-7">
      <div className="flex items-center justify-between">
        <h2
          className="text-[20px] font-semibold leading-[1.2] tracking-[-0.01em] text-[var(--ink)]"
          style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
        >
          Today&rsquo;s meetings
        </h2>
        <button className="inline-flex items-center gap-1.5 rounded-[10px] border border-[var(--hairline)] bg-[var(--bg)] px-3 py-1.5 text-[12px] font-semibold text-[var(--ink)] hover:bg-[var(--hairline)]/40">
          <RefreshCcw className="h-3.5 w-3.5" strokeWidth={1.8} />
          Sync calendar
        </button>
      </div>

      {today.length === 0 ? (
        <div className="mt-5 flex flex-col items-center rounded-[12px] border border-dashed border-[var(--hairline)] bg-[var(--bg)]/60 px-6 py-10 text-center">
          <CalendarPlus className="h-5 w-5 text-[var(--ink-faint)]" strokeWidth={1.6} />
          <p className="mt-3 text-[13px] text-[var(--ink-muted)]">
            No upcoming meetings for today. Sync your calendar or add one manually.
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-2.5">
          {today.map((m) => (
            <MeetingRow key={m.id} m={m} />
          ))}
        </ul>
      )}

      {later.length > 0 && (
        <>
          <div
            className="mt-8 mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]"
            style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
          >
            Later this week
          </div>
          <ul className="space-y-2.5">
            {later.map((m) => (
              <MeetingRow key={m.id} m={m} muted />
            ))}
          </ul>
        </>
      )}

      <p className="mt-6 text-[12px] leading-[1.5] text-[var(--ink-faint)]">
        Optional: paste the job description in your Outlook calendar event description
        to pre-fill on first sync.
      </p>
    </section>
  );
}

function MeetingRow({ m, muted }: { m: (typeof meetings)[number]; muted?: boolean }) {
  const initials = m.candidate
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <li
      className={`group flex items-center justify-between gap-3 rounded-[12px] border border-[var(--hairline)] p-3.5 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-[color:color-mix(in_oklab,var(--accent)_30%,var(--hairline))] hover:shadow-[0_6px_16px_-8px_rgba(45,45,45,0.14)] ${
        muted ? "bg-[var(--bg)]/50" : "bg-[var(--bg)]"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--hairline)] bg-[var(--surface)] text-[10px] font-semibold text-[var(--ink-faint)]"
          style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-semibold text-[var(--ink)]">
            {m.candidate}
          </p>
          <p className="mt-0.5 truncate text-[11.5px] text-[var(--ink-faint)]">
            {m.role} · {m.time}
          </p>
        </div>
      </div>
      <button className="inline-flex items-center gap-1.5 rounded-full border border-[var(--hairline)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-semibold text-[var(--ink-muted)] transition-colors duration-150 group-hover:text-[var(--accent)]">
        <Video className="h-3 w-3" strokeWidth={1.8} />
        Join
      </button>
    </li>
  );
}
