import { createFileRoute } from "@tanstack/react-router";
import { isCsharpSourcingWriteup } from "@/lib/demo/csharp-sourcing";
import { buildMockAnswer, streamMockReply, type ChatMsg } from "@/lib/mock-chat";

function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as {
          messages?: ChatMsg[];
          context?: string;
        };
        const messages = Array.isArray(body.messages) ? body.messages : [];
        if (messages.length === 0) return new Response("Messages required", { status: 400 });

        const answer = buildMockAnswer(messages, body.context);
        if (isCsharpSourcingWriteup(answer)) {
          try {
            await wait(7000, request.signal);
          } catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
              return new Response(null, { status: 499 });
            }
            throw error;
          }
        }
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
