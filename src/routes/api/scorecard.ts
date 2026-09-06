import { createFileRoute } from "@tanstack/react-router";

type ScorecardItem = {
  category: string;
  score: number; // 1-5
  note: string;
};

type Scorecard = {
  overall: number; // 0-100
  verdict: string;
  items: ScorecardItem[];
};

export const Route = createFileRoute("/api/scorecard")({
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
          candidate?: string;
        };
        const jd = (body.jd ?? "").trim();
        const transcript = (body.transcript ?? "").trim();
        const candidate = (body.candidate ?? "the candidate").trim();

        if (!transcript)
          return Response.json({ error: "Nothing captured yet" }, { status: 400 });
        if (!jd)
          return Response.json(
            { error: "Add a job description first — the scorecard is built from it." },
            { status: 400 },
          );

        const system =
          "You are a senior recruiter. Build a scorecard that is SPECIFIC to the supplied job description. " +
          "Step 1: Extract 4–7 of the most important requirements/qualifications from the JD (skills, experience, domain, soft skills). " +
          "Use these extracted requirements as the scorecard categories — DO NOT use generic categories like 'Communication' unless the JD explicitly calls for it. " +
          "Step 2: For each category, score the candidate 1–5 (5=clear evidence of strong match, 3=partial/unclear, 1=missing or contradicted) using ONLY what appears in the transcript. " +
          "Step 3: For each category, write a one-sentence note that quotes or paraphrases the transcript evidence; if there is no evidence, say 'Not discussed' and score 1. " +
          "Step 4: Compute an overall score 0–100 weighted by how central each requirement is to the JD, plus a one-sentence verdict referencing the JD. " +
          'Return ONLY JSON of shape: {"overall": number, "verdict": string, "items": [{"category": string, "score": number, "note": string}]}';

        const user = `CANDIDATE: ${candidate}\n\nJOB DESCRIPTION:\n${jd}\n\nTRANSCRIPT:\n${transcript}`;

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
            { error: `Scorecard failed: ${res.status}`, detail },
            { status: res.status },
          );
        }

        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const content = data.choices?.[0]?.message?.content ?? "{}";
        let parsed: Scorecard = {
          overall: 0,
          verdict: "",
          items: [],
        };
        try {
          const obj = JSON.parse(content) as Partial<Scorecard>;
          parsed = {
            overall: typeof obj.overall === "number" ? Math.max(0, Math.min(100, obj.overall)) : 0,
            verdict: typeof obj.verdict === "string" ? obj.verdict : "",
            items: Array.isArray(obj.items)
              ? obj.items.filter(
                  (it): it is ScorecardItem =>
                    typeof it?.category === "string" &&
                    typeof it?.score === "number" &&
                    typeof it?.note === "string",
                )
              : [],
          };
        } catch {
          // fall through
        }

        return Response.json(parsed);
      },
    },
  },
});
