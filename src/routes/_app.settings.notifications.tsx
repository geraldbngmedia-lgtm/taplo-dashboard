import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/settings/notifications")({
  component: NotificationsSettings,
});

function NotificationsSettings() {
  const [digestState, setDigestState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [digestError, setDigestError] = useState("");

  const sendDigest = async () => {
    setDigestState("sending");
    setDigestError("");
    try {
      const response = await fetch("/api/digest", { method: "POST" });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setDigestError(body.error || `Could not send (${response.status}).`);
        setDigestState("error");
        return;
      }
      setDigestState("sent");
    } catch {
      setDigestError("Could not reach the digest service.");
      setDigestState("error");
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <h2 className="font-serif text-xl">Notifications</h2>
      <p className="mt-1 text-sm text-muted-foreground">Choose when Taplo should ping you.</p>
      <ul className="mt-6 space-y-3">
        {[
          ["Interview reminders", "15 min before each scheduled session"],
          ["Analysis ready", "When a session transcript has been processed"],
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
        <li className="flex flex-col gap-3 rounded-xl border border-border bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-medium">Weekly summary</div>
            <div className="text-xs text-muted-foreground">Every Monday at 8:00 AM</div>
            {digestState === "sent" ? (
              <p className="mt-1 text-xs text-[var(--state-covered)]">Digest sent.</p>
            ) : null}
            {digestState === "error" ? (
              <p className="mt-1 text-xs text-destructive">{digestError}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
            <Button
              type="button"
              size="sm"
              disabled={digestState === "sending"}
              onClick={() => void sendDigest()}
            >
              {digestState === "sending" ? "Sending…" : "Send this week’s digest"}
            </Button>
          </div>
        </li>
      </ul>
    </section>
  );
}
