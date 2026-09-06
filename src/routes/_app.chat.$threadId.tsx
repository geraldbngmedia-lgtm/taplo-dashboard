import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowUp, Square, Sparkles } from "lucide-react";
import { chatStore, useChatThread } from "@/lib/chat-store";
import { captureStore } from "@/lib/capture-store";
import { SourceConnectChips } from "@/components/dashboard/SourceConnectChips";

export const Route = createFileRoute("/_app/chat/$threadId")({
  component: ChatThreadView,
});

function buildContext(): string {
  const { sessions } = captureStore.getSnapshot();
  if (sessions.length === 0) return "";
  return sessions
    .slice(0, 20)
    .map((s) => {
      const transcript = s.transcript
        .slice(0, 40)
        .map((l) => `${l.who}: ${l.line}`)
        .join("\n");
      return [
        `# ${s.candidate} — ${s.role}`,
        `Date: ${s.date} · Duration: ${s.duration}`,
        s.jd ? `Job description:\n${s.jd.slice(0, 800)}` : "",
        transcript ? `Transcript excerpt:\n${transcript}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n---\n\n");
}

function ChatThreadView() {
  const { threadId } = Route.useParams();
  const thread = useChatThread(threadId);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "streaming">("idle");
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [thread?.messages.length, status]);

  if (!thread) {
    return (
      <div className="flex flex-1 items-center justify-center text-[13px] text-[var(--ink-faint)]">
        Conversation not found.
      </div>
    );
  }

  const send = async () => {
    const text = input.trim();
    if (!text || status === "streaming") return;

    const userMsg = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content: text,
      createdAt: Date.now(),
    };
    chatStore.appendMessage(thread.id, userMsg);

    if (thread.messages.length === 0) {
      chatStore.updateThread(thread.id, {
        title: text.length > 48 ? text.slice(0, 48) + "…" : text,
      });
    }

    const assistantMsg = {
      id: crypto.randomUUID(),
      role: "assistant" as const,
      content: "",
      createdAt: Date.now(),
    };
    chatStore.appendMessage(thread.id, assistantMsg);

    setInput("");
    setStatus("streaming");

    const controller = new AbortController();
    abortRef.current = controller;

    const history = [...thread.messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, context: buildContext() }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const detail = await res.text().catch(() => "");
        chatStore.patchLastAssistant(thread.id, detail || `Something went wrong (${res.status}).`);
        setStatus("idle");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        chatStore.patchLastAssistant(thread.id, acc);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        chatStore.patchLastAssistant(thread.id, "Something went wrong while streaming the reply.");
      }
    } finally {
      setStatus("idle");
      abortRef.current = null;
      inputRef.current?.focus();
    }
  };

  const stop = () => {
    abortRef.current?.abort();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  const empty = thread.messages.length === 0;
  const suggestions = [
    "How many interviews did I have last week?",
    "Show candidates with more than five years of experience.",
    "Find candidates who discussed Azure and Kubernetes.",
    "Compare candidates interviewed for the Software Developer role.",
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {empty ? (
          <div className="mx-auto flex max-w-[680px] flex-col items-center px-6 pt-12 pb-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-[color:color-mix(in_oklab,var(--accent)_30%,var(--hairline))] bg-[color:color-mix(in_oklab,var(--accent)_10%,transparent)] text-[var(--accent)]">
              <Sparkles className="h-6 w-6" strokeWidth={1.7} />
            </div>
            <div className="mt-6 t-section" style={{ color: "var(--accent)" }}>
              Ask Taplo
            </div>
            <h2 className="mt-3 t-card-title">Ask across every interview</h2>
            <p className="mt-2 max-w-md t-body">
              Search roles, experience, transcripts, CVs, and scorecards. Every candidate claim
              stays connected to its source.
            </p>
            <div className="mt-8 grid w-full gap-2.5 sm:grid-cols-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="rounded-[12px] border border-[var(--hairline)] bg-[var(--bg)] px-4 py-3.5 text-left text-[13px] leading-[1.45] text-[var(--ink-muted)] transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-[color:color-mix(in_oklab,var(--accent)_30%,var(--hairline))] hover:text-[var(--ink)]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-[720px] space-y-8 px-6 py-8">
            {thread.messages.map((m) => (
              <Message key={m.id} role={m.role} content={m.content} />
            ))}
            {status === "streaming" &&
              thread.messages[thread.messages.length - 1]?.content === "" && (
                <p className="text-[13px] text-[var(--ink-faint)] animate-pulse">Thinking…</p>
              )}
          </div>
        )}
      </div>

      <div className="border-t border-[var(--hairline)] bg-[var(--surface)]">
        <div className="mx-auto max-w-[720px] px-6 py-4">
          <div className="relative flex items-end gap-2 rounded-[12px] border border-[var(--hairline)] bg-[var(--bg)] px-3 py-2.5 transition-colors duration-150 focus-within:border-[var(--accent)] focus-within:bg-[var(--surface)]">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Ask about candidates, roles, skills, or interview evidence…"
              className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-[14.5px] leading-[1.55] text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none"
            />
            {status === "streaming" ? (
              <button
                onClick={stop}
                aria-label="Stop"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[var(--ink)] text-[var(--bg)] transition-opacity duration-150 hover:opacity-90"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </button>
            ) : (
              <button
                onClick={() => void send()}
                disabled={!input.trim()}
                aria-label="Send"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[var(--accent)] text-white transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowUp className="h-4 w-4" strokeWidth={2.2} />
              </button>
            )}
          </div>
          <p className="mt-2 flex items-center justify-between px-1 text-[11px] text-[var(--ink-faint)]">
            <span>Shift+Enter for a new line</span>
            <span className="tabular-nums">{input.length} / 4,000</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function Message({ role, content }: { role: "user" | "assistant"; content: string }) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-[12px] bg-[var(--ink)] px-3.5 py-2.5 text-[14.5px] leading-[1.55] text-[var(--bg)]">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="prose prose-sm max-w-none text-[14.5px] leading-[1.6] text-[var(--ink)] [&_a]:text-[var(--accent)] [&_code]:rounded [&_code]:bg-[var(--hairline)] [&_code]:px-1 [&_code]:py-0.5 [&_h1]:text-[20px] [&_h1]:font-semibold [&_h2]:text-[17px] [&_h2]:font-semibold [&_h3]:font-semibold [&_p]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-[10px] [&_pre]:bg-[var(--hairline)] [&_pre]:p-3 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5">
        {content ? <ReactMarkdown>{content}</ReactMarkdown> : null}
      </div>
      {content ? <SourceConnectChips text={content} /> : null}
    </div>
  );
}
