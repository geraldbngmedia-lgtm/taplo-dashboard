import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, Check, Loader2, Plug, Unplug } from "lucide-react";

export const Route = createFileRoute("/_app/settings/calendar")({
  head: () => ({ meta: [{ title: "Calendar — Settings — Taplo" }] }),
  component: CalendarSettings,
});

type Status = "disconnected" | "connecting" | "connected";

const providers = [
  {
    id: "google",
    name: "Google Calendar",
    description: "Sync interviews from your Google account.",
    accent: "from-[#4285F4] via-[#EA4335] to-[#FBBC05]",
  },
  {
    id: "outlook",
    name: "Microsoft Outlook",
    description: "Pull meetings from Outlook and Teams.",
    accent: "from-[#0078D4] to-[#00B7C3]",
  },
  {
    id: "apple",
    name: "Apple Calendar",
    description: "Connect via iCloud calendar sharing.",
    accent: "from-zinc-700 to-zinc-900",
  },
] as const;

function CalendarSettings() {
  const [statuses, setStatuses] = useState<Record<string, Status>>({
    google: "disconnected",
    outlook: "disconnected",
    apple: "disconnected",
  });
  const [account, setAccount] = useState<Record<string, string>>({});

  const toggle = (id: string) => {
    const current = statuses[id];
    if (current === "connected") {
      setStatuses((s) => ({ ...s, [id]: "disconnected" }));
      setAccount((a) => {
        const { [id]: _, ...rest } = a;
        return rest;
      });
      return;
    }
    setStatuses((s) => ({ ...s, [id]: "connecting" }));
    setTimeout(() => {
      setStatuses((s) => ({ ...s, [id]: "connected" }));
      setAccount((a) => ({
        ...a,
        [id]: "elena@hollowaytalent.com",
      }));
    }, 1200);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl">Calendar connections</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Mock-connect your calendar so Taplo can detect interviews and prep notes
              automatically. No data is actually fetched.
            </p>
          </div>
        </div>
      </div>

      <ul className="space-y-3">
        {providers.map((p) => {
          const status = statuses[p.id];
          const connected = status === "connected";
          const connecting = status === "connecting";
          return (
            <li
              key={p.id}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white ${p.accent}`}
              >
                <CalendarDays className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{p.name}</span>
                  {connected && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                      <Check className="h-3 w-3" /> Connected
                    </span>
                  )}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {connected ? account[p.id] : p.description}
                </div>
              </div>
              <button
                onClick={() => toggle(p.id)}
                disabled={connecting}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  connected
                    ? "border border-border bg-background text-foreground hover:bg-muted"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                } disabled:opacity-60`}
              >
                {connecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Connecting…
                  </>
                ) : connected ? (
                  <>
                    <Unplug className="h-4 w-4" /> Disconnect
                  </>
                ) : (
                  <>
                    <Plug className="h-4 w-4" /> Connect
                  </>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-muted-foreground">
        This is a mock integration for demo purposes — no calendars are actually accessed.
      </p>
    </section>
  );
}
