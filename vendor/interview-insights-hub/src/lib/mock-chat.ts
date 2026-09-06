import { sessions, type Session } from "@/lib/mock";

export type ChatMsg = { role: "user" | "assistant" | "system"; content: string };

function lastUserQuestion(messages: ChatMsg[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.role === "user" && messages[i].content.trim()) {
      return messages[i].content.trim();
    }
  }
  return "";
}

function namedSession(question: string): Session | undefined {
  const q = question.toLowerCase();
  return sessions.find((session) => {
    const name = session.candidate.toLowerCase();
    if (name.length < 3) return false;
    return q.includes(name) || name.split(" ").some((part) => part.length > 2 && q.includes(part));
  });
}

function sessionLine(session: Session) {
  return `**${session.candidate}** — ${session.role} (${session.fit}, ${session.date}). ${session.summary}`;
}

const platform = () => sessions.find((s) => s.id === "s1")!;

function interviewWriteup(): string {
  const hire = platform();
  return [
    `Here’s what the interview record supports for the **${hire.role}**.`,
    "",
    `- Role: ${hire.role}`,
    `- Interview: ${hire.date} · ${hire.duration}`,
    `- Fit: **${hire.fit}**`,
    `- Evidence: ${hire.summary}`,
    "- Gap: Cloud cost ownership — FinOps was adjacent, not owned.",
    "",
    "That write-up is grounded in what the candidate said on the call — not the CV.",
    "",
    "Recommendation: strong enough to shortlist. Confirm remaining gaps before offer.",
  ].join("\n");
}

export function buildMockAnswer(messages: ChatMsg[]): string {
  const question = lastUserQuestion(messages);
  const q = question.toLowerCase();
  const named = namedSession(question);
  const hire = platform();

  if (q.includes("@teamtailor") || (q.includes("teamtailor") && q.includes("platform"))) {
    return [
      "Using **@Teamtailor** plus your interview notes.",
      "",
      `The **${hire.role}** is in Teamtailor on that req.`,
      "",
      "- Stage: On-site / technical",
      "- Last ATS note: “Strong platform signal — waiting on scorecard.”",
      "",
      `Interview evidence: ${hire.summary}`,
      "",
      "The scorecard that belongs on this card is what they said in the interview — not the uploaded CV.",
    ].join("\n");
  }

  if (q.includes("@linkedin") || q.includes("linkedin")) {
    return [
      "Using **@LinkedIn** plus your interview notes.",
      "",
      `**${hire.role}** — platform engineering, Kubernetes, observability.`,
      "",
      "- Tenure: 8 years in platform / infrastructure roles",
      "- LinkedIn is the profile. What you can search later is what they said on the call: 200+ services, observability, cost not owned.",
    ].join("\n");
  }

  if (
    q.includes("write-up") ||
    q.includes("writeup") ||
    q.includes("bring back") ||
    named?.id === "s1"
  ) {
    return interviewWriteup();
  }

  if (named) {
    return [
      `Here’s what the interview record supports for **${named.candidate}**.`,
      "",
      `- Role: ${named.role}`,
      `- Interview: ${named.date} · ${named.duration}`,
      `- Fit: **${named.fit}**`,
      `- Evidence: ${named.summary}`,
      "",
      "Grounded in the stored interview summary — what they said, not the CV.",
    ].join("\n");
  }

  if (q.includes("platform") || q.includes("strong")) {
    const noah = sessions.find((s) => s.id === "s3")!;
    return [
      "From your recent interviews, the strongest **platform-shaped** signal is:",
      "",
      `- ${sessionLine(hire)}`,
      `- ${sessionLine(noah)} — not a platform hire, but the cleanest “ships systems” evidence if you stretch the brief.`,
      "",
      "Source: interview scorecards in Taplo (what they said — not the CV).",
    ].join("\n");
  }

  return [
    "Here’s a grounded take from your Taplo workspace.",
    "",
    ...sessions.filter((s) => s.fit === "Strong").map((s) => `- ${sessionLine(s)}`),
    "",
    "Ask about a candidate by name, or use @LinkedIn / @Teamtailor.",
  ].join("\n");
}

export function streamMockReply(answer: string, signal?: AbortSignal): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const chunks: string[] = [];
  for (let i = 0; i < answer.length; i += 12) {
    chunks.push(answer.slice(i, i + 12));
  }

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for (const chunk of chunks) {
          if (signal?.aborted) {
            controller.close();
            return;
          }
          controller.enqueue(encoder.encode(chunk));
          await new Promise((resolve) => setTimeout(resolve, 18));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
    cancel() {
      /* client aborted */
    },
  });
}
