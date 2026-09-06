import { useState } from "react";
import { Check, Link2, Plug } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  detectSources,
  integrationsStore,
  useConnectedSources,
  type SourceDef,
} from "@/lib/integrations-store";

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

      <Dialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent className="max-w-[420px] rounded-[20px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[16px]">
              <Link2 className="size-4 text-[var(--accent)]" />
              Connect {pending?.name} to Taplo
            </DialogTitle>
            <DialogDescription className="text-[13px] leading-6">
              {pending?.blurb} Taplo will use this alongside your interview transcripts when
              answering questions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setPending(null)}>
              Not now
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (pending) integrationsStore.connect(pending.id);
                setPending(null);
              }}
            >
              Connect {pending?.name}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
