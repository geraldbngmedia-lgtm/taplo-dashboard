import { createFileRoute } from "@tanstack/react-router";

export type InterviewQuestion = {
  id: string;
  requirement: string;
  question: string;
  probe?: string;
  category?: "background" | "qualifications" | "working_style" | "practical";
};

export const Route = createFileRoute("/api/questions")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return Response.json({ error: "Missing LOVABLE_API_KEY" }, { status: 500 });

        const body = (await request.json().catch(() => ({}))) as { jd?: string };
        const jd = (body.jd ?? "").trim();
        if (!jd) return Response.json({ error: "Job description is empty" }, { status: 400 });

        const system =
          "You generate a focused interview question set from a job description. " +
          "Extract 6–8 concrete requirements. For each: a SHORT uppercase label (1–3 words, e.g. 'PAYMENTS DOMAIN'), " +
          "ONE open-ended interview question (max ~18 words), and a ONE-sentence probe the interviewer could use if the answer stays shallow. " +
          "Also classify each question into exactly one category: \"background\", \"qualifications\", \"working_style\" or \"practical\". Cover all four categories. " +
          "Return ONLY JSON: {\"questions\":[{\"id\":string,\"requirement\":string,\"question\":string,\"probe\":string,\"category\":string}]}. " +
          "Also return {\"role\":string} — a short role name derived from the JD.";

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: system },
              { role: "user", content: `JOB DESCRIPTION:\n${jd}` },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          return Response.json({ error: `Questions failed: ${res.status}`, detail }, { status: res.status });
        }

        const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        const content = data.choices?.[0]?.message?.content ?? "{}";
        try {
          const obj = JSON.parse(content) as {
            questions?: InterviewQuestion[];
            role?: string;
          };
          const questions = (obj.questions ?? [])
            .filter((q) => q && q.question && q.requirement)
            .map((q, i) => ({
              id: q.id || `q-${i}`,
              requirement: q.requirement.toUpperCase(),
              question: q.question,
              probe: q.probe ?? "",
              category: (["background", "qualifications", "working_style", "practical"] as const).includes(
                q.category as never,
              )
                ? q.category
                : "qualifications",
            }));
          return Response.json({ questions, role: obj.role ?? "" });
        } catch {
          return Response.json({ questions: [], role: "" });
        }
      },
    },
  },
});
