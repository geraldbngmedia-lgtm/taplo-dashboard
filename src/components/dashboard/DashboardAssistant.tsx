import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Clock3, History, MessageSquareText, Plus, Search, Trash2 } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TaploLogo } from "@/components/ui-taplo/TaploLogo";
import { SourceConnectChips } from "@/components/dashboard/SourceConnectChips";
import { SourceMentionChips, useSourceMention } from "@/components/dashboard/SourceMentionMenu";
import { captureStore } from "@/lib/capture-store";
import { chatStore, type ChatThread, useChatThreads } from "@/lib/chat-store";
import { isCsharpSourcingQuestion } from "@/lib/mock-chat";

type ChatStatus = "ready" | "submitted" | "streaming" | "error";

const suggestions = [
  { icon: Search, label: "Find strong platform candidates" },
  { icon: Clock3, label: "Summarise my recent interviews" },
  { icon: MessageSquareText, label: "Compare candidate evidence" },
];

function buildContext(): string {
  const { sessions } = captureStore.getSnapshot();
  if (sessions.length === 0) return "";
  return sessions
    .slice(0, 20)
    .map((session) => {
      const transcript = session.transcript
        .slice(0, 40)
        .map((line) => `${line.who}: ${line.line}`)
        .join("\n");
      return [
        `# ${session.candidate} — ${session.role}`,
        `Date: ${session.date} · Duration: ${session.duration}`,
        session.jd ? `Job description:\n${session.jd.slice(0, 800)}` : "",
        transcript ? `Transcript excerpt:\n${transcript}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n---\n\n");
}

function formatThreadTime(updatedAt: number) {
  const date = new Date(updatedAt);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { day: "numeric", month: "short" });
}

export function DashboardAssistant() {
  const threads = useChatThreads();
  const [activeId, setActiveId] = useState<string>();
  const [input, setInput] = useState("");
  const [caret, setCaret] = useState(0);
  const [status, setStatus] = useState<ChatStatus>("ready");
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const createdInitialThread = useRef(false);

  const mention = useSourceMention({
    value: input,
    caret,
    textareaRef,
    onChange: (next, nextCaret) => {
      setInput(next.slice(0, 4000));
      setCaret(nextCaret);
    },
  });

  useEffect(() => {
    if (activeId || createdInitialThread.current) return;
    createdInitialThread.current = true;
    const thread = threads[0] ?? chatStore.createThread();
    setActiveId(thread.id);
  }, [activeId, threads]);

  const activeThread = threads.find((thread) => thread.id === activeId);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const nextHeight = Math.min(textarea.scrollHeight, 168);
    textarea.style.height = `${Math.max(nextHeight, 58)}px`;
    textarea.style.overflowY = textarea.scrollHeight > 168 ? "auto" : "hidden";
  }, [input, activeId]);

  const createThread = () => {
    const thread = chatStore.createThread();
    setActiveId(thread.id);
    setInput("");
    setStatus("ready");
  };

  const deleteThread = (thread: ChatThread) => {
    chatStore.deleteThread(thread.id);
    if (thread.id === activeId) {
      const next = threads.find((candidate) => candidate.id !== thread.id);
      if (next) setActiveId(next.id);
      else createThread();
    }
  };

  const send = async (textValue?: string) => {
    const text = (textValue ?? input).trim();
    if (!text || !activeThread || status === "streaming" || status === "submitted") return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content: text,
      createdAt: Date.now(),
    };
    chatStore.appendMessage(activeThread.id, userMessage);
    if (activeThread.messages.length === 0) {
      chatStore.updateThread(activeThread.id, {
        title: text.length > 48 ? `${text.slice(0, 48)}…` : text,
      });
    }

    chatStore.appendMessage(activeThread.id, {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      createdAt: Date.now(),
    });
    setInput("");
    setStatus("submitted");

    const controller = new AbortController();
    abortRef.current = controller;
    const history = [...activeThread.messages, userMessage].map((message) => ({
      role: message.role,
      content: message.content,
    }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, context: buildContext() }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        const detail = await response.text().catch(() => "");
        chatStore.patchLastAssistant(
          activeThread.id,
          detail || `Taplo could not answer that request (${response.status}).`,
        );
        setStatus("error");
        return;
      }

      setStatus("streaming");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        chatStore.patchLastAssistant(activeThread.id, answer);
      }
      setStatus("ready");
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        chatStore.patchLastAssistant(
          activeThread.id,
          "Taplo lost the connection while answering. Please try again.",
        );
        setStatus("error");
      } else {
        setStatus("ready");
      }
    } finally {
      abortRef.current = null;
    }
  };

  const isEmpty = !activeThread || activeThread.messages.length === 0;

  const composer = (
    <div className="relative w-full min-w-0 max-w-[720px]">
      {mention.menu}
      <PromptInput
        onSubmit={(message) => void send(message.text)}
        className="dashboard-composer rounded-[20px] border-[var(--glass-border)] bg-[var(--dashboard-glass)] shadow-[var(--shadow-composer)] backdrop-blur-[24px] sm:rounded-[28px]"
      >
        <SourceMentionChips
          value={input}
          onChange={(next) => {
            setInput(next.slice(0, 4000));
          }}
        />
        <PromptInputTextarea
          ref={textareaRef}
          value={input}
          onChange={(event) => {
            const next = event.target.value.slice(0, 4000);
            setInput(next);
            setCaret(event.target.selectionStart ?? next.length);
          }}
          onClick={(event) => setCaret(event.currentTarget.selectionStart ?? 0)}
          onKeyUp={(event) => setCaret(event.currentTarget.selectionStart ?? 0)}
          onSelect={(event) => setCaret(event.currentTarget.selectionStart ?? 0)}
          onKeyDown={mention.onKeyDown}
          placeholder="Ask Taplo anything…"
          rows={1}
          className="min-h-[52px] resize-none px-4 pt-3 text-[15px] leading-6 text-[var(--ink)] placeholder:text-[var(--ink-faint)] sm:min-h-[58px] sm:px-5 sm:pt-4"
        />
        <PromptInputFooter className="px-4 pb-3 pt-0 sm:px-5">
          <span className="flex items-center gap-2 text-[11px] text-[var(--ink-faint)]">
            <span className="size-1.5 rounded-full bg-[var(--state-covered)]" />
            Grounded in your conversations
          </span>
          <PromptInputSubmit
            status={status}
            onStop={() => abortRef.current?.abort()}
            disabled={!input.trim() && status !== "streaming" && status !== "submitted"}
            className="size-9 rounded-full bg-[var(--accent)] text-[var(--primary-foreground)] shadow-none hover:bg-[var(--accent)] hover:opacity-90"
          />
        </PromptInputFooter>
      </PromptInput>
      {mention.dialog}
      {!isEmpty && (
        <p className="mt-2 text-center text-[10px] text-[var(--ink-faint)]">
          Taplo uses only the interview context available in your workspace.
        </p>
      )}
    </div>
  );

  const toolbar = (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={createThread}
        aria-label="New conversation"
        title="New conversation"
        className="dashboard-toolbar-button rounded-full border border-[var(--glass-border)] bg-[var(--dashboard-glass-strong)] text-[var(--ink-secondary)] shadow-[var(--shadow-glass-control)] backdrop-blur-xl"
      >
        <Plus className="size-4" />
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Conversation history"
            title="Conversation history"
            className="dashboard-toolbar-button rounded-full border border-[var(--glass-border)] bg-[var(--dashboard-glass-strong)] text-[var(--ink-secondary)] shadow-[var(--shadow-glass-control)] backdrop-blur-xl"
          >
            <History className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-[min(310px,calc(100vw-2rem))] rounded-[16px] border-[var(--glass-border)] bg-[var(--dashboard-glass-strong)] p-2 shadow-[var(--shadow-glass-overlay)] backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between px-2 pb-2 pt-1">
            <span className="text-[12px] font-semibold text-[var(--ink)]">Recent conversations</span>
            <span className="text-[10px] tabular-nums text-[var(--ink-faint)]">{threads.length}</span>
          </div>
          <ul className="scroll-quiet max-h-[320px] space-y-1 overflow-y-auto">
            {threads.map((thread) => {
              const active = thread.id === activeId;
              return (
                <li key={thread.id} className="group relative">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setActiveId(thread.id)}
                    className={`h-auto w-full justify-start rounded-[10px] px-3 py-2.5 pr-10 text-left shadow-none ${active ? "bg-[var(--surface-sunken)] text-[var(--ink)]" : "text-[var(--ink-secondary)] hover:bg-[var(--surface-page)]"}`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-semibold">{thread.title}</span>
                      <span className="mt-0.5 block text-[10px] font-normal text-[var(--ink-faint)]">
                        {formatThreadTime(thread.updatedAt)}
                      </span>
                    </span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete ${thread.title}`}
                    onClick={() => deleteThread(thread)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full text-[var(--ink-faint)] opacity-0 shadow-none hover:bg-[var(--accent-wash)] hover:text-[var(--accent-ink)] group-hover:opacity-100 group-focus-within:opacity-100"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <section className="dashboard-chat-canvas relative flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden">
      <header className="flex h-14 shrink-0 items-center gap-3 px-4 sm:px-6">
        <div className="min-w-0 flex-1">
          {!isEmpty && (
            <>
              <p className="truncate text-[13px] font-semibold text-[var(--ink)]">
                {activeThread?.title ?? "Ask Taplo"}
              </p>
              <p className="mt-0.5 text-[10px] text-[var(--ink-faint)]">Interview-grounded answer</p>
            </>
          )}
        </div>
        {toolbar}
      </header>

      {isEmpty ? (
        <div className="dashboard-empty-state flex min-h-0 w-full min-w-0 flex-1 flex-col items-center justify-center px-4 pb-8 pt-2 sm:px-10">
          <TaploLogo variant="mark" className="mb-5 h-14 w-14" />
          <div className="w-full min-w-0 max-w-[680px] text-center">
            <h1 className="text-balance break-words font-[Plus_Jakarta_Sans] text-[clamp(26px,8vw,48px)] font-medium leading-[1.12] text-[var(--ink)]">
              What would you like to know?
            </h1>
            <p className="mt-3 text-pretty text-[15px] leading-6 text-[var(--ink-secondary)]">
              Ask Taplo about your interviews, candidates, and hiring decisions.
            </p>
          </div>

          <div className="mt-6 grid w-full min-w-0 max-w-[680px] grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-3">
            {suggestions.map(({ icon: Icon, label }) => (
              <Button
                key={label}
                type="button"
                variant="outline"
                onClick={() => void send(label)}
                className="dashboard-suggestion h-auto min-h-[66px] w-full min-w-0 justify-start whitespace-normal rounded-[16px] border-[var(--glass-border)] bg-[var(--dashboard-glass-soft)] p-3 text-left text-[13px] font-medium leading-5 text-[var(--ink)] shadow-[var(--shadow-glass-control)] backdrop-blur-xl sm:min-h-[76px] sm:p-4"
              >
                <span className="flex flex-col items-start gap-2 sm:gap-3">
                  <Icon className="size-4 text-[var(--accent)]" />
                  {label}
                </span>
              </Button>
            ))}
          </div>

          <div className="mt-5 flex w-full min-w-0 max-w-[680px] justify-center sm:mt-7">{composer}</div>
        </div>
      ) : (
        <>
          <Conversation className="min-h-0">
            <ConversationContent className="dashboard-conversation-column w-full gap-9 px-4 pb-44 pt-8 sm:px-8">
              {activeThread?.messages.map((message, index) => {
                const isLast = index === activeThread.messages.length - 1;
                const lastUser = [...activeThread.messages]
                  .reverse()
                  .find((item) => item.role === "user");
                const sourcingWait = Boolean(lastUser && isCsharpSourcingQuestion(lastUser.content));
                return (
                  <Message
                    key={message.id}
                    from={message.role}
                    className="animate-message-in max-w-full"
                  >
                    <MessageContent
                      className={
                        message.role === "user"
                          ? "max-w-[min(82%,36rem)] rounded-[18px] border border-[var(--glass-border-subtle)] bg-[var(--chat-user-soft)] px-4 py-3 text-[14px] leading-6 text-[var(--ink)] shadow-[var(--shadow-message)] backdrop-blur-lg"
                          : "w-full bg-transparent p-0 text-[15px] leading-7 text-[var(--ink)]"
                      }
                    >
                      {message.role === "assistant" &&
                      !message.content &&
                      isLast &&
                      (status === "submitted" || status === "streaming") ? (
                        sourcingWait ? (
                          <div className="flex items-center gap-2.5">
                            <TaploLogo variant="mark" className="h-6 w-6 animate-pulse" />
                            <p className="text-[14px] text-[var(--ink-muted)]">
                              Searching LinkedIn, Teamtailor, and interviews…
                            </p>
                          </div>
                        ) : (
                          <Shimmer className="text-[14px]">Thinking with your interview data…</Shimmer>
                        )
                      ) : message.role === "assistant" ? (
                        <MessageResponse isAnimating={isLast && status === "streaming"}>
                          {message.content}
                        </MessageResponse>
                      ) : (
                        message.content
                      )}
                      {message.role === "assistant" &&
                      message.content &&
                      !(isLast && (status === "submitted" || status === "streaming")) ? (
                        <SourceConnectChips text={message.content} />
                      ) : null}
                    </MessageContent>
                  </Message>
                );
              })}
            </ConversationContent>
            <ConversationScrollButton className="bottom-36 border-[var(--glass-border)] bg-[var(--dashboard-glass-strong)] text-[var(--ink)] shadow-[var(--shadow-glass-control)] backdrop-blur-xl" />
          </Conversation>

          <div className="dashboard-composer-dock absolute inset-x-0 bottom-0 z-10 flex justify-center bg-[var(--composer-dock)] px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-12 sm:px-8 sm:pb-7">
            <div className="flex w-full max-w-[680px] justify-center">{composer}</div>
          </div>
        </>
      )}
    </section>
  );
}
