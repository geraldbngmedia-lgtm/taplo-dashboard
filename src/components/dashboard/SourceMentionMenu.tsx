import { useEffect, useState, type KeyboardEvent, type RefObject } from "react";
import { Check, Link2, X } from "lucide-react";
import { SourceGlyph } from "@/components/dashboard/SourceGlyph";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  filterSourcesForMention,
  getActiveMention,
  insertSourceMention,
  integrationsStore,
  mentionedSourcesInText,
  removeSourceMention,
  useConnectedSources,
  type SourceDef,
} from "@/lib/integrations-store";
import { cn } from "@/lib/utils";

export function SourceConnectDialog({
  source,
  onClose,
}: {
  source: SourceDef | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={source !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[420px] rounded-[20px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[16px]">
            <Link2 className="size-4 text-[var(--accent)]" />
            Connect {source?.name} to Taplo
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-6">
            {source?.blurb} Taplo will use this alongside your interview transcripts when answering
            questions.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Not now
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (source) integrationsStore.connect(source.id);
              onClose();
            }}
          >
            Connect {source?.name}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SourceMentionChips({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const mentioned = mentionedSourcesInText(value);
  const connected = useConnectedSources();
  if (mentioned.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 px-4 pt-3 sm:px-5">
      {mentioned.map((source) => (
        <span
          key={source.id}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--dashboard-glass-strong)] py-1 pl-1.5 pr-1 text-[11px] font-medium text-[var(--ink)] shadow-[var(--shadow-glass-control)]"
        >
          <SourceGlyph source={source} className="size-4 text-[8px]" />
          {source.name}
          {connected.includes(source.id) ? (
            <Check className="size-3 text-[var(--state-covered)]" />
          ) : null}
          <button
            type="button"
            aria-label={`Remove ${source.name}`}
            className="rounded-full p-0.5 text-[var(--ink-faint)] hover:bg-[var(--surface-sunken)] hover:text-[var(--ink)]"
            onClick={() => onChange(removeSourceMention(value, source))}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

export function useSourceMention({
  value,
  caret,
  textareaRef,
  onChange,
}: {
  value: string;
  caret: number;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onChange: (next: string, caret: number) => void;
}) {
  const connected = useConnectedSources();
  const mention = getActiveMention(value, caret);
  const matches = mention ? filterSourcesForMention(mention.query, mention.at) : [];
  const [index, setIndex] = useState(0);
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const [pending, setPending] = useState<SourceDef | null>(null);

  const open = Boolean(mention && matches.length > 0 && dismissedKey !== mention?.key);

  useEffect(() => {
    setIndex(0);
  }, [mention?.key]);

  const insert = (source: SourceDef) => {
    if (!mention) return;
    const next = insertSourceMention(value, mention, source);
    const nextCaret = mention.start + source.name.length + 2;
    onChange(next, nextCaret);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(nextCaret, nextCaret);
    });
    if (!connected.includes(source.id)) setPending(source);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!open) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIndex((current) => (current + 1) % matches.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIndex((current) => (current - 1 + matches.length) % matches.length);
      return;
    }
    if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      const source = matches[index] ?? matches[0];
      if (source) insert(source);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setDismissedKey(mention?.key ?? null);
    }
  };

  return {
    open,
    onKeyDown,
    menu:
      open && mention ? (
        <div
          className="absolute bottom-[calc(100%-4px)] left-3 right-3 z-30 overflow-hidden rounded-[14px] border border-[var(--glass-border)] bg-[var(--dashboard-glass-strong)] shadow-[var(--shadow-glass-overlay)] backdrop-blur-2xl"
          role="listbox"
          aria-label="Add a source to this question"
        >
          <p className="px-3 pb-1 pt-2 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--ink-faint)]">
            Add source
          </p>
          <ul className="max-h-56 overflow-y-auto p-1">
            {matches.map((source, i) => {
              const isConnected = connected.includes(source.id);
              const active = i === index;
              return (
                <li key={source.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left",
                      active ? "bg-[var(--surface-sunken)]" : "hover:bg-[var(--surface-page)]",
                    )}
                    onMouseEnter={() => setIndex(i)}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      insert(source);
                    }}
                  >
                    <SourceGlyph source={source} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold text-[var(--ink)]">
                        {source.name}
                      </span>
                      <span className="block text-[10px] text-[var(--ink-faint)]">
                        {source.kind === "ats" ? "ATS" : "Network"}
                      </span>
                    </span>
                    {isConnected ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--state-covered)]">
                        <Check className="size-3" />
                        Connected
                      </span>
                    ) : (
                      <span className="text-[10px] text-[var(--ink-faint)]">Add to query</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null,
    dialog: <SourceConnectDialog source={pending} onClose={() => setPending(null)} />,
  };
}
