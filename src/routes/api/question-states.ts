import { createFileRoute } from "@tanstack/react-router";

type QState = "covered" | "weak" | "untouched";

export const Route = createFileRoute("/api/question-states")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return Response.json({ error: "Missing LOVABLE_API_KEY" }, { status: 500 });

        const body = (await request.json().catch(() => ({}))) as {
          questions?: { id: string; question: string; requirement: string }[];
          transcript?: string;
        };
        const questions = body.questions ?? [];
        const transcript = (body.transcript ?? "").trim();
        if (questions.length === 0)
          return Response.json({ error: "No questions provided" }, { status: 400 });
        if (!transcript)
          return Response.json({ error: "Nothing captured yet" }, { status: 400 });

        const system =
          "You score interview coverage. For each question decide: " +
          "'covered' (transcript demonstrably answers it with specifics), " +
          "'weak' (touched but shallow / lacks depth or examples), " +
          "'untouched' (not addressed, OR you are unsure). " +
          "Be conservative: only mark 'covered' when the transcript clearly contains a solid, specific answer. " +
          "When in doubt, return 'untouched'. A false 'covered' hides a real gap and is the worst error. " +
          "Return ONLY JSON: {\"states\":{<id>:\"covered\"|\"weak\"|\"untouched\"}}.";

        const user = `QUESTIONS:\n${JSON.stringify(questions)}\n\nTRANSCRIPT:\n${transcript}`;

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          return Response.json({ error: `States failed: ${res.status}`, detail }, { status: res.status });
        }

        const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        const content = data.choices?.[0]?.message?.content ?? "{}";
        let states: Record<string, QState> = {};
        try {
          const obj = JSON.parse(content) as { states?: Record<string, QState> };
          const raw = obj.states ?? {};
          for (const [k, v] of Object.entries(raw)) {
            if (v === "covered" || v === "weak" || v === "untouched") states[k] = v;
          }
        } catch {
          states = {};
        }
        return Response.json({ states });
      },
    },
  },
});
