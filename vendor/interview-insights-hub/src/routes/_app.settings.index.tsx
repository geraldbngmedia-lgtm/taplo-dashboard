import { createFileRoute } from "@tanstack/react-router";
import { Check, Plug, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { integrationsStore, SOURCES, useConnectedSources } from "@/lib/integrations-store";

export const Route = createFileRoute("/_app/settings/")({
  component: ProfileSettings,
});

function ProfileSettings() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-serif text-xl">Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your personal details across Taplo.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Full name" value="Elena Marsh" />
          <Field label="Email" value="elena@hollowaytalent.com" />
          <Field label="Company" value="Holloway Talent" />
          <Field label="Role" value="Recruiter" />
        </div>
      </section>
      <ConnectedSources />
    </div>
  );
}

function ConnectedSources() {
  const connected = useConnectedSources();

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div>
        <h2 className="font-serif text-xl">Connected sources</h2>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Connect your ATS and LinkedIn so Taplo can use them when answering questions. This demo
          stores the connection state in this browser.
        </p>
      </div>
      <ul className="mt-6 divide-y divide-border">
        {SOURCES.map((source) => {
          const isConnected = connected.includes(source.id);
          return (
            <li key={source.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Plug className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{source.name}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {source.kind === "ats" ? "ATS" : "Professional network"}
                  </span>
                  {isConnected ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                      <Check className="size-3" /> Connected
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">{source.blurb}</p>
              </div>
              <Button
                type="button"
                variant={isConnected ? "outline" : "default"}
                size="sm"
                onClick={() =>
                  isConnected
                    ? integrationsStore.disconnect(source.id)
                    : integrationsStore.connect(source.id)
                }
              >
                {isConnected ? <Unplug className="size-3.5" /> : <Plug className="size-3.5" />}
                {isConnected ? "Disconnect" : "Connect"}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        defaultValue={value}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
    </label>
  );
}
