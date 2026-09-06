import { sessions, type Session } from "@/lib/mock";
import { mentionedSourcesInText } from "@/lib/integrations-store";
import { CSHARP_SOURCING_WRITEUP } from "@/lib/demo/csharp-sourcing";
import {
  DEMO_CANDIDATE,
  RAVI_ATS_WRITEUP,
  RAVI_LINKEDIN_WRITEUP,
  raviInterviewWriteup,
} from "@/lib/demo/fixtures";

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

function isRaviAsk(q: string) {
  return (
    q.includes("ravi") ||
    q.includes("write-up") ||
    q.includes("writeup") ||
    q.includes("bring back")
  );
}

function hasLinkedinCue(question: string, mentionedLinkedin: boolean) {
  return mentionedLinkedin || /\blinkedin\b/i.test(question);
}

function hasTeamtailorCue(question: string, mentionedAts: boolean) {
  return mentionedAts || /\bteam[\s-]?tailor\b/i.test(question);
}

export function isCsharpSourcingAsk(
  question: string,
  mentionedLinkedin: boolean,
  mentionedAts: boolean,
) {
  const linkedin = hasLinkedinCue(question, mentionedLinkedin);
  const teamtailor = hasTeamtailorCue(question, mentionedAts);
  if (mentionedLinkedin && mentionedAts) return true;
  if (!linkedin || !teamtailor) return false;
  const csharp = /c#|c sharp|csharp|\.net\b/i.test(question);
  const outreach = /month|talked|spoken|conversation|competence|interested/i.test(question);
  return csharp && outreach;
}

export function isCsharpSourcingQuestion(question: string) {
  const mentioned = mentionedSourcesInText(question);
  return isCsharpSourcingAsk(
    question,
    mentioned.some((source) => source.id === "linkedin"),
    mentioned.some((source) => source.id === "teamtailor"),
  );
}

export function buildMockAnswer(messages: ChatMsg[], context?: string): string {
  const question = lastUserQuestion(messages);
  const q = question.toLowerCase();
  const captured = context?.trim();
  const named = namedSession(question);
  const mentioned = mentionedSourcesInText(question);
  const ats = mentioned.some((source) => source.kind === "ats");
  const linkedin = mentioned.some((source) => source.id === "linkedin");
  const teamtailor = mentioned.some((source) => source.id === "teamtailor");
  const lead = mentioned.length
    ? [`Using ${mentioned.map((source) => `**@${source.name}**`).join(", ")} plus your interview notes.`, ""]
    : [];

  if (isCsharpSourcingAsk(question, linkedin, teamtailor)) {
    return CSHARP_SOURCING_WRITEUP;
  }

  if (ats && (isRaviAsk(q) || !named || named.candidate === DEMO_CANDIDATE)) {
    return RAVI_ATS_WRITEUP;
  }

  if (linkedin && (isRaviAsk(q) || !named || named.candidate === DEMO_CANDIDATE)) {
    return RAVI_LINKEDIN_WRITEUP;
  }

  if (isRaviAsk(q) || named?.candidate === DEMO_CANDIDATE) {
    return raviInterviewWriteup();
  }

  if (named) {
    return [
      ...lead,
      `Here’s what the interview record supports for **${named.candidate}**.`,
      "",
      `- Role: ${named.role}`,
      `- Interview: ${named.date} · ${named.duration}`,
      `- Fit: **${named.fit}**`,
      `- Evidence: ${named.summary}`,
      "",
      captured
        ? "This is grounded in the stored interview summary — what they said, not the CV."
        : "Grounded in the stored interview summary only.",
      "",
      named.fit === "Weak"
        ? "Recommendation: do not advance without a follow-up that tests hands-on leadership in the first 90 days."
        : named.fit === "Moderate"
          ? "Recommendation: keep in process, but probe the gap in the next round before you sell the client."
          : "Recommendation: strong enough to shortlist. Confirm remaining gaps before offer.",
    ].join("\n");
  }

  if (q.includes("strong platform") || (q.includes("platform") && q.includes("candidate"))) {
    const platform = sessions.find((s) => s.id === "s1")!;
    const noah = sessions.find((s) => s.id === "s3")!;
    return [
      ...lead,
      "From your recent interviews, the strongest **platform-shaped** signal is:",
      "",
      `- ${sessionLine(platform)}`,
      `- ${sessionLine(noah)} — not a platform hire, but the cleanest “ships systems” evidence if you stretch the brief.`,
      "",
      "If the brief is Kubernetes + observability at scale, **lead with Ravi Anand**. The gap to close is cloud cost ownership — FinOps was adjacent, not owned.",
      "",
      mentioned.length > 0
        ? `Source: ${mentioned.map((source) => source.name).join(", ")} plus interview scorecards.`
        : "Source: interview scorecards in Taplo (what they said — not the CV).",
    ].join("\n");
  }

  if (q.includes("summar") || q.includes("recent interview")) {
    return [
      ...lead,
      "Here’s a tight read of your latest interviews:",
      "",
      ...sessions.map((session) => `- ${sessionLine(session)}`),
      "",
      "**Pattern:** two Strong (platform + frontend), one Moderate (design / enterprise gap), one Weak (management style mismatch).",
      "",
      "Today’s calendar still has Amara Okafor (backend) and Léa Berger (design) if you want to keep the pipeline moving.",
    ].join("\n");
  }

  if (q.includes("compare") || q.includes("evidence")) {
    const ravi = sessions.find((s) => s.id === "s1")!;
    const noah = sessions.find((s) => s.id === "s3")!;
    const sienna = sessions.find((s) => s.id === "s2")!;
    return [
      ...lead,
      "Side-by-side on evidence quality, not vibes:",
      "",
      `| Candidate | Fit | What held up | What didn’t |`,
      `|---|---|---|---|`,
      `| ${ravi.candidate} | ${ravi.fit} | K8s migration of 200+ services; OpenTelemetry | Cloud cost ownership |`,
      `| ${noah.candidate} | ${noah.fit} | Design system shipped across 4 surfaces; React depth | Relocation timing (Q3) |`,
      `| ${sienna.candidate} | ${sienna.fit} | Craft + systems thinking | Enterprise workflow exposure |`,
      "",
      "**Call:** Ravi is the cleanest platform evidence pack. Noah if the brief stretches frontend. Sienna needs a scoped enterprise case study.",
    ].join("\n");
  }

  const highlights = sessions
    .filter((session) => session.fit === "Strong")
    .map((session) => `- ${session.candidate} (${session.role}): ${session.summary}`)
    .join("\n");

  return [
    ...lead,
    question
      ? `On “${question}” — here’s a grounded take from your Taplo workspace.`
      : "Here’s a grounded take from your Taplo workspace.",
    "",
    "Strongest recent interviews:",
    highlights,
    "",
    captured
      ? "I also have captured session notes in context. If you name a candidate, I can pull the same write-up Analysis stores."
      : "Ask about a candidate by name, or use @LinkedIn / @Teamtailor to pull profile or pipeline context.",
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
