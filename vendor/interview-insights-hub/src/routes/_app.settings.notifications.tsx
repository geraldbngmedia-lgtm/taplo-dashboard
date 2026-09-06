import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/settings/notifications")({
  component: NotificationsSettings,
});

function NotificationsSettings() {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <h2 className="font-serif text-xl">Notifications</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose when Taplo should ping you.
      </p>
      <ul className="mt-6 space-y-3">
        {[
          ["Interview reminders", "15 min before each scheduled session"],
          ["Analysis ready", "When a session transcript has been processed"],
          ["Weekly summary", "Every Monday at 8:00 AM"],
        ].map(([title, sub]) => (
          <li
            key={title}
            className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
          >
            <div>
              <div className="text-sm font-medium">{title}</div>
              <div className="text-xs text-muted-foreground">{sub}</div>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
          </li>
        ))}
      </ul>
    </section>
  );
}
