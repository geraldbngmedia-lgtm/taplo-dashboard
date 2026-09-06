import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { chatStore } from "@/lib/chat-store";

export const Route = createFileRoute("/_app/chat/")({
  component: ChatIndex,
});

function ChatIndex() {
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const { threads } = chatStore.getSnapshot();
    const target = threads[0] ?? chatStore.createThread();
    navigate({ to: "/chat/$threadId", params: { threadId: target.id }, replace: true });
  }, [navigate]);

  return (
    <div className="flex flex-1 items-center justify-center text-[13px] text-[var(--ink-faint)]">
      Opening chat…
    </div>
  );
}
