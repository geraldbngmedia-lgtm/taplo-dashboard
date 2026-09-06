import { createFileRoute } from "@tanstack/react-router";

type Coverage = { covered: string[]; missing: string[] };

export const Route = createFileRoute("/api/coverage")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return Response.json({ error: "Missing LOVABLE_API_KEY" }, { status: 500 });
        }

        const body = (await request.json().catch(() => ({}))) as {
          jd?: string;
          transcript?: string;
        };
        const jd = (body.jd ?? "").trim();
        const transcript = (body.transcript ?? "").trim();

        if (!jd) return Response.json({ error: "Job description is empty" }, { status: 400 });
        if (!transcript)
          return Response.json({ error: "Nothing captured yet" }, { status: 400 });

        const system =
          "You analyze interview transcripts against a job description. " +
          "Extract the concrete qualifications/requirements from the JD, then decide " +
          "which have been demonstrably addressed in the transcript and which have not. " +
          "Be concise. Each item must be a short phrase (max ~8 words). " +
          "Return ONLY JSON: {\"covered\": string[], \"missing\": string[]}.";

        const user = `JOB DESCRIPTION:\n${jd}\n\nTRANSCRIPT:\n${transcript}`;

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
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
          return Response.json(
            { error: `Coverage failed: ${res.status}`, detail },
            { status: res.status },
          );
        }

        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const content = data.choices?.[0]?.message?.content ?? "{}";
        let parsed: Coverage = { covered: [], missing: [] };
        try {
          const obj = JSON.parse(content) as Partial<Coverage>;
          parsed = {
            covered: Array.isArray(obj.covered) ? obj.covered.filter((s) => typeof s === "string") : [],
            missing: Array.isArray(obj.missing) ? obj.missing.filter((s) => typeof s === "string") : [],
          };
        } catch {
          // fall through with empty arrays
        }

        return Response.json(parsed);
      },
    },
  },
});
