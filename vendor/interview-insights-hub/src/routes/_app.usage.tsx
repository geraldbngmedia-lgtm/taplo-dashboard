import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-taplo/PageHeader";
import { Button } from "@/components/ui-taplo/Button";

const SWEDISH_WEEKDAYS = [
  "Söndag",
  "Måndag",
  "Tisdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lördag",
];

const SWEDISH_MONTHS = [
  "Januari",
  "Februari",
  "Mars",
  "April",
  "Maj",
  "Juni",
  "Juli",
  "Augusti",
  "September",
  "Oktober",
  "November",
  "December",
];

function todayLabel() {
  const d = new Date();
  return `${SWEDISH_WEEKDAYS[d.getDay()]} ${d.getDate()} ${SWEDISH_MONTHS[d.getMonth()]}`.toUpperCase();
}

export const Route = createFileRoute("/_app/usage")({
  head: () => ({ meta: [{ title: "Usage — Taplo" }] }),
  component: UsagePage,
});

function UsagePage() {
  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <PageHeader title="Usage" eyebrow={todayLabel()} />

      <section className="mt-8 space-y-4">
        <div className="rounded-[10px] border border-[var(--hairline)] bg-[var(--surface-card)] p-6">
          <h2 className="t-card-title">Plan</h2>
          <div className="mt-4 rounded-[10px] bg-[var(--surface-sunken)] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="t-section">Pro plan</p>
                <p className="mt-1 t-card-title">Unlimited interviews</p>
              </div>
              <Button variant="secondary">Manage billing</Button>
            </div>
          </div>
        </div>

        <div className="rounded-[10px] border border-[var(--hairline)] bg-[var(--surface-card)] p-6">
          <h2 className="t-card-title">Interview hours</h2>
          <div className="mt-4 rounded-[10px] bg-[var(--surface-sunken)] p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <p className="t-section">Recorded interview time</p>
              <p className="mt-3 t-stat tnum">44.9</p>
              <p className="mt-2 t-stat-label">minutes</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
