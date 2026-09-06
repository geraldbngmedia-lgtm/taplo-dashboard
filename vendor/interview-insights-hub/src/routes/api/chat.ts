import { createFileRoute } from "@tanstack/react-router";
import { buildMockAnswer, streamMockReply, type ChatMsg } from "@/lib/mock-chat";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as {
          messages?: ChatMsg[];
        };
        const messages = Array.isArray(body.messages) ? body.messages : [];
        if (messages.length === 0) return new Response("Messages required", { status: 400 });

        const answer = buildMockAnswer(messages);
        const stream = streamMockReply(answer, request.signal);

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});
