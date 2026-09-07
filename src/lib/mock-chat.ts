import { sessions, type Session } from "@/lib/mock";
import { mentionedSourcesInText } from "@/lib/integrations-store";
import { csharpSourcingWriteup } from "@/lib/demo/csharp-sourcing";
import {
  DEMO_CANDIDATE,
  RAVI_ATS_WRITEUP,
  RAVI_ATS_WRITEUP_SV,
  RAVI_LINKEDIN_WRITEUP,
  RAVI_LINKEDIN_WRITEUP_SV,
  raviInterviewWriteup,
} from "@/lib/demo/fixtures";

export type ChatMsg = { role: "user" | "assistant" | "system"; content: string };
export type ReplyLocale = "en" | "sv";

const SV_WORDS =
  /\b(och|att|det|som|för|vilka|vem|vad|hur|var|när|sammanfatta|jämför|kandidat|kandidater|intervju|intervjuer|senaste|prata|pratat|månad|kompetens|intresserad|hitta|designer|utvecklare|underlag|skriv|mina|mig|en|ett)\b/gi;
const EN_WORDS =
  /\b(the|and|who|what|which|how|when|where|summarise|summarize|compare|candidate|interview|recent|talked|month|find|strong)\b/gi;

export function replyLocale(question: string): ReplyLocale {
  const q = question.toLowerCase();
  if (/[åäö]/.test(q)) return "sv";
  const sv = q.match(SV_WORDS)?.length ?? 0;
  const en = q.match(EN_WORDS)?.length ?? 0;
  return sv > en ? "sv" : "en";
}

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

function fitLabel(fit: Session["fit"], locale: ReplyLocale) {
  if (locale === "en") return fit;
  return fit === "Strong" ? "Stark" : fit === "Moderate" ? "Måttlig" : "Svag";
}

function sessionLine(session: Session, locale: ReplyLocale) {
  return `**${session.candidate}** — ${session.role} (${fitLabel(session.fit, locale)}, ${session.date}). ${session.summary}`;
}

function isRaviAsk(q: string) {
  return (
    q.includes("ravi") ||
    q.includes("write-up") ||
    q.includes("writeup") ||
    q.includes("bring back") ||
    q.includes("underlag") ||
    q.includes("hämta")
  );
}

function hasLinkedinCue(question: string, mentionedLinkedin: boolean) {
  return mentionedLinkedin || /\blinkedin\b/i.test(question);
}

function hasTeamtailorCue(question: string, mentionedAts: boolean) {
  return mentionedAts || /\bteam[\s-]?tailor\b/i.test(question);
}

function isSummaryAsk(q: string) {
  return (
    q.includes("summar") ||
    q.includes("recent interview") ||
    q.includes("sammanfatta") ||
    q.includes("senaste intervju")
  );
}

function isCompareAsk(q: string) {
  return q.includes("compare") || q.includes("evidence") || q.includes("jämför") || q.includes("evidens");
}

function isPlatformAsk(q: string) {
  return (
    q.includes("strong platform") ||
    (q.includes("platform") && q.includes("candidate")) ||
    (q.includes("plattform") && (q.includes("kandidat") || q.includes("stark")))
  );
}

export function isCsharpSourcingAsk(
  question: string,
  mentionedLinkedin: boolean,
  mentionedAts: boolean,
) {
  const linkedin = hasLinkedinCue(question, mentionedLinkedin);
  const teamtailor = hasTeamtailorCue(question, mentionedAts);
  if (!linkedin || !teamtailor) return false;
  const csharp = /c#|c sharp|csharp|\.net\b/i.test(question);
  if (!csharp) return false;
  if (mentionedLinkedin && mentionedAts) return true;
  const outreach =
    /month|talked|spoken|conversation|competence|interested|månad|prata|pratat|samtal|kompetens|intresserad/i.test(
      question,
    );
  return outreach;
}

export function isCsharpSourcingQuestion(question: string) {
  const mentioned = mentionedSourcesInText(question);
  return isCsharpSourcingAsk(
    question,
    mentioned.some((source) => source.id === "linkedin"),
    mentioned.some((source) => source.id === "teamtailor"),
  );
}

type RoleFamily = "frontend" | "backend" | "fullstack" | "designer" | "manager" | "data" | "platform" | "general";
type HitSource = "interview" | "linkedin" | "teamtailor";
type Seniority = "senior" | "junior" | "lead";

type ParsedAsk = {
  skill: string;
  family: RoleFamily;
  city: string;
  seniority?: Seniority;
  sources: HitSource[];
};

type GeneratedHit = {
  name: string;
  href: string;
  role: string;
  note: string;
  noteSv: string;
};

const FIRST_NAMES = [
  "Alva",
  "Elias",
  "Vera",
  "Oscar",
  "Freja",
  "Isak",
  "Ellen",
  "Viktor",
  "Klara",
  "Hugo",
  "Astrid",
  "Felix",
  "Liv",
  "Nils",
  "Ida",
  "Theo",
  "Saga",
  "Anton",
  "Maja",
  "Wilmer",
];

const LAST_NAMES = [
  "Lindqvist",
  "Berg",
  "Svensson",
  "Ek",
  "Holm",
  "Nyström",
  "Åberg",
  "Dahl",
  "Forsberg",
  "Hagström",
  "Blom",
  "Sandberg",
  "Öberg",
  "Kjellberg",
  "Malm",
  "Ivarsson",
  "Boman",
  "Hedlund",
];

const CITY_NEEDLES: [string[], string][] = [
  [["stockholm"], "Stockholm"],
  [["göteborg", "goteborg"], "Göteborg"],
  [["malmö", "malmo"], "Malmö"],
  [["växjö", "vaxjo"], "Växjö"],
  [["uppsala"], "Uppsala"],
  [["lund"], "Lund"],
  [["umeå", "umea"], "Umeå"],
  [["helsingborg"], "Helsingborg"],
];

function hasTerm(haystack: string, term: string) {
  const index = haystack.indexOf(term);
  if (index < 0) return false;
  const before = index === 0 ? "" : haystack[index - 1] ?? "";
  const after = haystack[index + term.length] ?? "";
  const isLetter = (char: string) => /[a-zåäö]/i.test(char);
  return !isLetter(before) && !isLetter(after);
}

const SKILL_PATTERNS: [RegExp, string][] = [
  [/\breact native\b/i, "React Native"],
  [/\breact\b/i, "React"],
  [/\bvue\b/i, "Vue"],
  [/\bangular\b/i, "Angular"],
  [/\bpython\b/i, "Python"],
  [/\bjava\b/i, "Java"],
  [/\bkotlin\b/i, "Kotlin"],
  [/\bdev\s*ops\b|\bdevops\b/i, "DevOps"],
  [/\bsre\b|\bsite reliability\b/i, "SRE"],
  [/\bterraform\b/i, "Terraform"],
  [/\bdocker\b/i, "Docker"],
  [/\bci\s*\/\s*cd\b|\bci-cd\b/i, "CI/CD"],
  [/\bansible\b/i, "Ansible"],
  [/\bgolang\b|\bgo\b/i, "Go"],
  [/\brust\b/i, "Rust"],
  [/\bc#|c sharp|csharp|\.net\b/i, "C#"],
  [/\bazure\b/i, "Azure"],
  [/\baws\b/i, "AWS"],
  [/\bkubernetes|\bk8s\b/i, "Kubernetes"],
  [/\bsql\b/i, "SQL"],
  [/\btypescript\b/i, "TypeScript"],
  [/\bjavascript|\bjs\b/i, "JavaScript"],
  [/\bfigma\b/i, "Figma"],
  [/\bphp\b/i, "PHP"],
  [/\bruby\b/i, "Ruby"],
  [/\bswift\b/i, "Swift"],
  [/\bnode(\.?js)?\b/i, "Node.js"],
  [/\bux\b/i, "UX"],
];

const PLATFORM_SKILLS = new Set(["DevOps", "SRE", "Terraform", "Docker", "CI/CD", "Ansible", "Kubernetes"]);

function stripSourceMentions(question: string) {
  return question.replace(/@[A-Za-z][A-Za-z0-9-]*/g, " ").replace(/\s+/g, " ").trim();
}

function askNamesRoleOrStack(question: string) {
  const q = stripSourceMentions(question);
  if (!q) return false;
  if (SKILL_PATTERNS.some(([pattern]) => pattern.test(q))) return true;
  return /\b(dev\s*ops|devops|sre|site reliability|terraform|docker|ansible|ci\s*\/\s*cd|design(?:er)?|frontend|front-end|backend|back-end|full[\s-]?stack|data|analytics|analyst|platform|plattform|manager|chef|ledare|utvecklare|developer|engineer|ingenjör)\b/i.test(
    q,
  );
}

const FAMILY_DEFAULT_SKILL: Record<RoleFamily, string[]> = {
  frontend: ["React", "TypeScript", "Vue"],
  backend: ["Python", "Java", "Go"],
  fullstack: ["TypeScript", "Java", "Python"],
  designer: ["UX", "Figma", "Product design"],
  manager: ["Engineering management", "People leadership", "Delivery"],
  data: ["SQL", "Python", "Analytics"],
  platform: ["Kubernetes", "Observability", "AWS"],
  general: ["TypeScript", "Python", "Product", "Java"],
};

const DEFAULT_CITIES = ["Stockholm", "Göteborg", "Malmö", "Växjö"];

function hashString(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pickAt<T>(items: T[], seed: number, salt: number) {
  return items[(seed + salt * 19) % items.length];
}

function parseAsk(
  question: string,
  mentioned: ReturnType<typeof mentionedSourcesInText>,
): ParsedAsk {
  const q = question.toLowerCase();
  const city = CITY_NEEDLES.find(([needles]) => needles.some((needle) => hasTerm(q, needle)))?.[1];
  const skill = SKILL_PATTERNS.find(([pattern]) => pattern.test(q))?.[1];
  const seniority: Seniority | undefined = /\bjunior\b/i.test(q)
    ? "junior"
    : /\blead\b|\bstaff\b/i.test(q)
      ? "lead"
      : /\bsenior\b/i.test(q)
        ? "senior"
        : undefined;

  let family: RoleFamily = "general";
  if (/\bdesign(er)?\b|\bux\b|\bfigma\b/i.test(q)) family = "designer";
  else if (/\bfrontend|front-end\b/i.test(q)) family = "frontend";
  else if (/\bbackend|back-end\b/i.test(q)) family = "backend";
  else if (/\bfull[\s-]?stack\b/i.test(q)) family = "fullstack";
  else if (/\b(data|analytics|analyst)\b/i.test(q)) family = "data";
  else if (/\bdev\s*ops\b|\bdevops\b|\bsre\b|\bsite reliability\b/i.test(q)) family = "platform";
  else if (/\bplatform|plattform\b/i.test(q)) family = "platform";
  else if (/\bmanager|chef|ledare\b/i.test(q)) family = "manager";
  else if (/\butvecklare|developer|engineer|ingenjör\b/i.test(q)) family = "fullstack";

  if (skill === "React" || skill === "Vue" || skill === "Angular" || skill === "React Native") {
    if (family === "general") family = "frontend";
  }
  if (skill === "Python" || skill === "Java" || skill === "Go" || skill === "C#" || skill === "SQL") {
    if (family === "general") family = "backend";
  }
  if (skill === "UX" || skill === "Figma") {
    family = "designer";
  }
  if (skill && PLATFORM_SKILLS.has(skill)) family = "platform";

  const sources: HitSource[] = [];
  if (mentioned.some((source) => source.id === "linkedin") || /\blinkedin\b/i.test(question)) {
    sources.push("linkedin");
  }
  if (mentioned.some((source) => source.kind === "ats") || /\bteam[\s-]?tailor\b/i.test(question)) {
    sources.push("teamtailor");
  }
  if (/\binterview|intervju\b/i.test(question)) sources.push("interview");

  const seed = hashString(q);
  return {
    skill: skill ?? pickAt(FAMILY_DEFAULT_SKILL[family], seed, 3),
    family,
    city: city ?? pickAt(DEFAULT_CITIES, seed, 5),
    seniority,
    sources,
  };
}

function roleTitle(parsed: ParsedAsk) {
  const senior =
    parsed.seniority === "lead" ? "Lead " : parsed.seniority === "junior" ? "Junior " : parsed.seniority === "senior" ? "Senior " : "";
  if (parsed.family === "designer") {
    const label = parsed.skill === "Figma" || parsed.skill === "Product design" ? "Product designer" : `${parsed.skill} designer`;
    return `${senior}${label}`.replace(/\s+/g, " ").trim();
  }
  if (parsed.family === "manager") return `${senior}${parsed.skill} manager`.trim();
  if (parsed.family === "data") return `${senior}${parsed.skill} data engineer`.trim();
  if (parsed.family === "platform") {
    if (parsed.skill === "DevOps" || parsed.skill === "SRE") {
      return `${senior}${parsed.skill} engineer`.trim();
    }
    return `${senior}${parsed.skill} platform engineer`.trim();
  }
  if (parsed.family === "frontend") return `${senior}${parsed.skill} frontend developer`.trim();
  if (parsed.family === "backend") return `${senior}${parsed.skill} backend developer`.trim();
  if (parsed.family === "fullstack") return `${senior}${parsed.skill} fullstack developer`.trim();
  return `${senior}${parsed.skill} specialist`.trim();
}

function slugName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateMockHits(question: string, mentioned: ReturnType<typeof mentionedSourcesInText>): GeneratedHit[] {
  const parsed = parseAsk(question, mentioned);
  const seed = hashString(question.toLowerCase());
  const rotation: HitSource[] =
    parsed.sources.length > 0
      ? [...parsed.sources, "interview", "linkedin", "teamtailor"]
      : ["interview", "linkedin", "teamtailor"];
  const count = question.length > 48 ? 4 : 3;
  const used = new Set<string>();
  const hits: GeneratedHit[] = [];

  for (let i = 0; i < count; i++) {
    let first = pickAt(FIRST_NAMES, seed, 7 + i * 3);
    let last = pickAt(LAST_NAMES, seed, 11 + i * 5);
    let name = `${first} ${last}`;
    if (used.has(name)) {
      first = pickAt(FIRST_NAMES, seed, 23 + i * 8);
      last = pickAt(LAST_NAMES, seed, 29 + i * 4);
      name = `${first} ${last}`;
    }
    used.add(name);

    const source = rotation[i % rotation.length];
    const slug = slugName(name);
    const href =
      source === "linkedin"
        ? `https://www.linkedin.com/in/${slug}-taplo`
        : source === "teamtailor"
          ? `https://app.teamtailor.com/candidates/${slug}-taplo`
          : "/analysis";
    const role = `${roleTitle(parsed)}, ${parsed.city}`;
    const skill = parsed.skill;
    const city = parsed.city;

    const note =
      source === "linkedin"
        ? `LinkedIn, ${city}. Spoken with last month — asked you to come back later.`
        : source === "teamtailor"
          ? `Teamtailor. ${skill} on a similar role; still on the project.`
          : `Taplo interview 2 weeks ago. ${skill} held up on the call.`;
    const noteSv =
      source === "linkedin"
        ? `LinkedIn, ${city}. Pratade förra månaden — bad dig återkomma senare.`
        : source === "teamtailor"
          ? `Teamtailor. ${skill} på en liknande roll; kvar på projektet.`
          : `Taplo-intervju för 2 veckor sedan. ${skill} höll i samtalet.`;

    hits.push({ name, href, role, note, noteSv });
  }

  return hits;
}

function sourceLine(
  locale: ReplyLocale,
  mentioned: ReturnType<typeof mentionedSourcesInText>,
  question: string,
) {
  const names = mentioned.map((source) => source.name);
  if (/\blinkedin\b/i.test(question) && !names.includes("LinkedIn")) names.push("LinkedIn");
  if (/\bteam[\s-]?tailor\b/i.test(question) && !names.includes("Teamtailor")) names.push("Teamtailor");
  if (locale === "sv") {
    return names.length
      ? `Källa: ${names.join(", ")} och Taplo-intervjuer.`
      : "Källa: intervjunoter i Taplo (det de sa — inte CV:t).";
  }
  return names.length
    ? `Source: ${names.join(", ")} plus interview notes.`
    : "Source: interview notes in Taplo (what they said — not the CV).";
}

function mockResultsForAsk(
  question: string,
  locale: ReplyLocale,
  mentioned: ReturnType<typeof mentionedSourcesInText>,
) {
  const hits = generateMockHits(question, mentioned);
  const lead = mentioned.length
    ? locale === "sv"
      ? [`Använder ${mentioned.map((source) => `**@${source.name}**`).join(", ")} plus dina intervjunoter.`, ""]
      : [`Using ${mentioned.map((source) => `**@${source.name}**`).join(", ")} plus your interview notes.`, ""]
    : [];

  const lines = hits.map((hit) => {
    const note = locale === "sv" ? hit.noteSv : hit.note;
    return `- [${hit.name}](${hit.href}) — ${hit.role}. ${note}`;
  });

  if (locale === "sv") {
    return [
      ...lead,
      question ? `På “${question}” — det här är vad Taplo har i databasen just nu.` : "Det här är vad Taplo har i databasen just nu.",
      "",
      ...lines,
      "",
      "Värt att följa upp med den som matchar briefen bäst.",
      "",
      sourceLine(locale, mentioned, question),
    ].join("\n");
  }

  return [
    ...lead,
    question
      ? `On “${question}” — here’s what Taplo has in the database right now.`
      : "Here’s what Taplo has in the database right now.",
    "",
    ...lines,
    "",
    "Worth a follow-up with whoever fits the brief closest.",
    "",
    sourceLine(locale, mentioned, question),
  ].join("\n");
}

export function buildMockAnswer(messages: ChatMsg[], context?: string): string {
  const question = lastUserQuestion(messages);
  const q = question.toLowerCase();
  const locale = replyLocale(question);
  const captured = context?.trim();
  const named = namedSession(question);
  const mentioned = mentionedSourcesInText(question);
  const ats = mentioned.some((source) => source.kind === "ats");
  const linkedin = mentioned.some((source) => source.id === "linkedin");
  const teamtailor = mentioned.some((source) => source.id === "teamtailor");
  const lead =
    mentioned.length === 0
      ? []
      : locale === "sv"
        ? [`Använder ${mentioned.map((source) => `**@${source.name}**`).join(", ")} plus dina intervjunoter.`, ""]
        : [`Using ${mentioned.map((source) => `**@${source.name}**`).join(", ")} plus your interview notes.`, ""];

  if (isCsharpSourcingAsk(question, linkedin, teamtailor)) {
    return csharpSourcingWriteup(locale);
  }

  const namedRole = askNamesRoleOrStack(question);
  const raviSourceShortcut =
    isRaviAsk(q) || ((!named || named.candidate === DEMO_CANDIDATE) && !namedRole);

  if (ats && raviSourceShortcut) {
    return locale === "sv" ? RAVI_ATS_WRITEUP_SV : RAVI_ATS_WRITEUP;
  }

  if (linkedin && raviSourceShortcut) {
    return locale === "sv" ? RAVI_LINKEDIN_WRITEUP_SV : RAVI_LINKEDIN_WRITEUP;
  }

  if (isRaviAsk(q) || named?.candidate === DEMO_CANDIDATE) {
    return raviInterviewWriteup(locale);
  }

  if (named) {
    const rec =
      named.fit === "Weak"
        ? locale === "sv"
          ? "Rekommendation: gå inte vidare utan en uppföljning som testar hands-on ledarskap de första 90 dagarna."
          : "Recommendation: do not advance without a follow-up that tests hands-on leadership in the first 90 days."
        : named.fit === "Moderate"
          ? locale === "sv"
            ? "Rekommendation: behåll i process, men prova gapet i nästa runda innan du säljer in till kunden."
            : "Recommendation: keep in process, but probe the gap in the next round before you sell the client."
          : locale === "sv"
            ? "Rekommendation: tillräckligt stark för shortlist. Bekräfta resterande gap innan offer."
            : "Recommendation: strong enough to shortlist. Confirm remaining gaps before offer.";

    return [
      ...lead,
      locale === "sv"
        ? `Så här stöder intervjun **${named.candidate}**.`
        : `Here’s what the interview record supports for **${named.candidate}**.`,
      "",
      locale === "sv" ? `- Roll: ${named.role}` : `- Role: ${named.role}`,
      locale === "sv"
        ? `- Intervju: ${named.date} · ${named.duration}`
        : `- Interview: ${named.date} · ${named.duration}`,
      `- Fit: **${fitLabel(named.fit, locale)}**`,
      locale === "sv" ? `- Evidens: ${named.summary}` : `- Evidence: ${named.summary}`,
      "",
      captured
        ? locale === "sv"
          ? "Grundat i den sparade intervjusammanfattningen — det de sa, inte CV:t."
          : "This is grounded in the stored interview summary — what they said, not the CV."
        : locale === "sv"
          ? "Grundat i den sparade intervjusammanfattningen."
          : "Grounded in the stored interview summary only.",
      "",
      rec,
    ].join("\n");
  }

  if (isPlatformAsk(q)) {
    const platform = sessions.find((s) => s.id === "s1")!;
    const noah = sessions.find((s) => s.id === "s3")!;
    if (locale === "sv") {
      return [
        ...lead,
        "Från dina senaste intervjuer är den starkaste **plattformsformade** signalen:",
        "",
        `- ${sessionLine(platform, locale)}`,
        `- ${sessionLine(noah, locale)} — inte en plattformsanställning, men den renaste “shippar system”-evidensen om du tänjer briefen.`,
        "",
        "Om briefen är Kubernetes + observability i skala, **led med Ravi Anand**. Gapet att stänga är molnkostnad — FinOps låg bredvid, inte ägt.",
        "",
        mentioned.length > 0
          ? `Källa: ${mentioned.map((source) => source.name).join(", ")} plus intervju-scorecards.`
          : "Källa: intervju-scorecards i Taplo (det de sa — inte CV:t).",
      ].join("\n");
    }
    return [
      ...lead,
      "From your recent interviews, the strongest **platform-shaped** signal is:",
      "",
      `- ${sessionLine(platform, locale)}`,
      `- ${sessionLine(noah, locale)} — not a platform hire, but the cleanest “ships systems” evidence if you stretch the brief.`,
      "",
      "If the brief is Kubernetes + observability at scale, **lead with Ravi Anand**. The gap to close is cloud cost ownership — FinOps was adjacent, not owned.",
      "",
      mentioned.length > 0
        ? `Source: ${mentioned.map((source) => source.name).join(", ")} plus interview scorecards.`
        : "Source: interview scorecards in Taplo (what they said — not the CV).",
    ].join("\n");
  }

  if (isSummaryAsk(q)) {
    if (locale === "sv") {
      return [
        ...lead,
        "Här är en kort läsning av dina senaste intervjuer:",
        "",
        ...sessions.map((session) => `- ${sessionLine(session, locale)}`),
        "",
        "**Mönster:** två Stark (plattform + frontend), en Måttlig (design / enterprise-gap), en Svag (ledningsstil mismatch).",
        "",
        "Dagens kalender har fortfarande Amara Okafor (backend) och Léa Berger (design) om du vill hålla pipen igång.",
      ].join("\n");
    }
    return [
      ...lead,
      "Here’s a tight read of your latest interviews:",
      "",
      ...sessions.map((session) => `- ${sessionLine(session, locale)}`),
      "",
      "**Pattern:** two Strong (platform + frontend), one Moderate (design / enterprise gap), one Weak (management style mismatch).",
      "",
      "Today’s calendar still has Amara Okafor (backend) and Léa Berger (design) if you want to keep the pipeline moving.",
    ].join("\n");
  }

  if (isCompareAsk(q)) {
    const ravi = sessions.find((s) => s.id === "s1")!;
    const noah = sessions.find((s) => s.id === "s3")!;
    const sienna = sessions.find((s) => s.id === "s2")!;
    if (locale === "sv") {
      return [
        ...lead,
        "Sida vid sida på evidenskvalitet, inte magkänsla:",
        "",
        `| Kandidat | Fit | Vad höll | Vad höll inte |`,
        `|---|---|---|---|`,
        `| ${ravi.candidate} | ${fitLabel(ravi.fit, locale)} | K8s-migrering av 200+ tjänster; OpenTelemetry | Molnkostnad |`,
        `| ${noah.candidate} | ${fitLabel(noah.fit, locale)} | Designsystem över 4 ytor; React-djup | Flytt-timing (Q3) |`,
        `| ${sienna.candidate} | ${fitLabel(sienna.fit, locale)} | Craft + systemtänk | Enterprise-flöden |`,
        "",
        "**Call:** Ravi är det renaste plattformspaketet. Noah om briefen tänjs mot frontend. Sienna behöver ett avgränsat enterprise-case.",
      ].join("\n");
    }
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

  return mockResultsForAsk(question, locale, mentioned);
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
