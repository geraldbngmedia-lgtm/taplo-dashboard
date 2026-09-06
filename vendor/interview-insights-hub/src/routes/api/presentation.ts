import { createFileRoute } from "@tanstack/react-router";

type Competency = { title: string; description: string };
type Presentation = {
  background: string[]; // paragraphs
  competencies: Competency[];
  why: string[]; // paragraphs
  practical: {
    location: string;
    salary: string;
    noticePeriod: string;
  };
};

const empty: Presentation = {
  background: [],
  competencies: [],
  why: [],
  practical: { location: "", salary: "", noticePeriod: "" },
};

export const Route = createFileRoute("/api/presentation")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return Response.json({ error: "Missing LOVABLE_API_KEY" }, { status: 500 });

        const body = (await request.json().catch(() => ({}))) as {
          jd?: string;
          transcript?: string;
          candidate?: string;
        };
        const jd = (body.jd ?? "").trim();
        const transcript = (body.transcript ?? "").trim();
        const candidate = (body.candidate ?? "the candidate").trim();

        if (!transcript) return Response.json({ error: "Nothing captured yet" }, { status: 400 });

        const system =
          "You are a senior recruiter writing a client-ready candidate presentation. " +
          "Use ONLY facts from the transcript; if a fact is missing, leave the field empty rather than inventing it. " +
          "Write in a confident, professional, third-person narrative voice (refer to the candidate by first name). " +
          "Match the language of the transcript. " +
          "Output strictly this JSON shape:\n" +
          `{
  "background": string[],          // 3–4 paragraphs covering experience, current role, technical depth, and how they work with stakeholders
  "competencies": [                // 3–5 items, each a category derived from the JD/transcript
    { "title": string, "description": string }
  ],
  "why": string[],                 // 1–2 paragraphs starting with "Why <FirstName>?" reasoning — the FIRST paragraph must explain the candidate's strengths/fit, the SECOND (if any) covers motivation and what they're looking for
  "practical": {
    "location": string,            // city or "" if not mentioned
    "salary": string,              // e.g. "60,000 SEK/month" or "" if not mentioned
    "noticePeriod": string         // e.g. "3 months" or "" if not mentioned
  }
}\n` +
          "Do NOT wrap in markdown. Return ONLY the JSON object.";

        const user = `CANDIDATE: ${candidate}\n\nJOB DESCRIPTION:\n${jd || "(not provided)"}\n\nTRANSCRIPT:\n${transcript}`;

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
          return Response.json(
            { error: `Presentation failed: ${res.status}`, detail },
            { status: res.status },
          );
        }

        const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        const content = data.choices?.[0]?.message?.content ?? "{}";

        let parsed: Presentation = empty;
        try {
          const obj = JSON.parse(content) as Partial<Presentation> & {
            practical?: Partial<Presentation["practical"]>;
          };
          parsed = {
            background: Array.isArray(obj.background)
              ? obj.background.filter((s): s is string => typeof s === "string" && s.trim() !== "")
              : [],
            competencies: Array.isArray(obj.competencies)
              ? obj.competencies.filter(
                  (c): c is Competency =>
                    !!c && typeof c.title === "string" && typeof c.description === "string",
                )
              : [],
            why: Array.isArray(obj.why)
              ? obj.why.filter((s): s is string => typeof s === "string" && s.trim() !== "")
              : [],
            practical: {
              location: typeof obj.practical?.location === "string" ? obj.practical.location : "",
              salary: typeof obj.practical?.salary === "string" ? obj.practical.salary : "",
              noticePeriod:
                typeof obj.practical?.noticePeriod === "string" ? obj.practical.noticePeriod : "",
            },
          };
        } catch {
          // empty
        }

        return Response.json(parsed);
      },
    },
  },
});
