import { createFileRoute, Link, Outlet, useNavigate, useParams, useRouterState } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { chatStore, useChatThreads } from "@/lib/chat-store";
import { PageHeader } from "@/components/ui-taplo/PageHeader";

export const Route = createFileRoute("/_app/chat")({
  head: () => ({ meta: [{ title: "Ask Taplo" }] }),
  component: ChatLayout,
});

function ChatLayout() {
  const threads = useChatThreads();
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const params = useParams({ strict: false }) as { threadId?: string };
  const activeId = params.threadId;

  const onNew = () => {
    const t = chatStore.createThread();
    navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
  };

  const onDelete = (id: string) => {
    chatStore.deleteThread(id);
    if (id === activeId) navigate({ to: "/chat" });
  };

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col px-10 pt-10 pb-6">
      <PageHeader title="Ask Taplo" />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 md:grid-cols-[260px_1fr]">
        <aside className="hidden overflow-hidden rounded-[14px] border border-[var(--hairline)] bg-[var(--surface)] md:flex md:flex-col">
          <div className="p-3">
            <button
              onClick={onNew}
              className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-[color:color-mix(in_oklab,var(--accent)_30%,var(--hairline))] bg-[color:color-mix(in_oklab,var(--accent)_8%,transparent)] px-3 py-2 text-[13px] font-semibold text-[var(--accent)] transition-colors duration-150 hover:bg-[color:color-mix(in_oklab,var(--accent)_14%,transparent)]"
            >
              <Plus className="h-4 w-4" strokeWidth={2.2} />
              New chat
            </button>
          </div>

          <div className="flex items-center justify-between px-4 pt-2 pb-1">
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]"
              style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
            >
              Recent
            </span>
            <span className="text-[11px] tabular-nums text-[var(--ink-faint)]">
              {threads.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-3">
            {threads.length === 0 ? (
              <p className="px-3 py-2 text-[12px] text-[var(--ink-faint)]">
                No conversations yet.
              </p>
            ) : (
              <ul className="space-y-0.5">
                {threads.map((t) => {
                  const active = t.id === activeId || path.endsWith(t.id);
                  const when = new Date(t.updatedAt ?? Date.now());
                  const label = sameDay(when, new Date())
                    ? when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : when.toLocaleDateString([], { day: "numeric", month: "short" });
                  return (
                    <li key={t.id} className="group relative">
                      <Link
                        to="/chat/$threadId"
                        params={{ threadId: t.id }}
                        className={`block rounded-[10px] px-3 py-2 pr-8 transition-colors duration-150 ease-out ${
                          active
                            ? "bg-[color:color-mix(in_oklab,var(--accent)_8%,transparent)] text-[var(--ink)]"
                            : "text-[var(--ink-muted)] hover:bg-[var(--bg)] hover:text-[var(--ink)]"
                        }`}
                      >
                        <div className="truncate text-[13px] font-semibold">
                          {t.title || "New chat"}
                        </div>
                        <div className="mt-0.5 text-[11px] text-[var(--ink-faint)]">
                          {label}
                        </div>
                      </Link>
                      <button
                        aria-label="Delete chat"
                        onClick={(e) => {
                          e.preventDefault();
                          onDelete(t.id);
                        }}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--ink-faint)] opacity-0 transition-opacity duration-150 hover:bg-[var(--hairline)] hover:text-[var(--ink)] group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-[14px] border border-[var(--hairline)] bg-[var(--surface)]">
          <Outlet />
        </section>
      </div>
    </div>
  );
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
