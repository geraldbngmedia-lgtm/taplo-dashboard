import { useState } from "react";
import { Check, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SourceConnectDialog } from "@/components/dashboard/SourceMentionMenu";
import { detectSources, useConnectedSources, type SourceDef } from "@/lib/integrations-store";

export function SourceConnectChips({ text }: { text: string }) {
  const connected = useConnectedSources();
  const [pending, setPending] = useState<SourceDef | null>(null);
  const sources = detectSources(text);

  if (sources.length === 0) return null;

  return (
    <>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {sources.map((source) => {
          const isConnected = connected.includes(source.id);
          if (isConnected) {
            return (
              <span
                key={source.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border-subtle)] bg-[var(--dashboard-glass-soft)] px-3 py-1.5 text-[11px] font-medium text-[var(--ink-secondary)] backdrop-blur-xl"
              >
                <Check className="size-3 text-[var(--state-covered)]" />
                {source.name} connected
              </span>
            );
          }
          return (
            <Button
              key={source.id}
              type="button"
              variant="outline"
              onClick={() => setPending(source)}
              className="h-auto rounded-full border-[var(--glass-border)] bg-[var(--dashboard-glass-soft)] px-3 py-1.5 text-[11px] font-medium text-[var(--ink)] shadow-[var(--shadow-glass-control)] backdrop-blur-xl hover:border-[var(--accent)] hover:text-[var(--accent-ink)]"
            >
              <Plug className="size-3 text-[var(--accent)]" />
              Connect {source.name}
            </Button>
          );
        })}
      </div>

      <SourceConnectDialog source={pending} onClose={() => setPending(null)} />
    </>
  );
}
