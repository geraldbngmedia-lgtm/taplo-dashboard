import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { WEEKLY_DIGEST_SUBJECT, weeklyDigestHtml, weeklyDigestText } from "../src/lib/demo/weekly-digest.ts";
import { weeklyDigestLogoAttachment } from "../src/lib/demo/weekly-digest-logo.ts";

function loadLocalEnv() {
  const path = resolve(process.cwd(), ".env.local");
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadLocalEnv();

const apiKey = process.env.RESEND_API_KEY?.trim();
const to = process.env.TAPLO_DIGEST_TO?.trim();
const from = process.env.TAPLO_DIGEST_FROM?.trim() || "Taplo <onboarding@resend.dev>";

if (!apiKey) {
  console.error("Missing RESEND_API_KEY");
  process.exit(1);
}
if (!to) {
  console.error("Missing TAPLO_DIGEST_TO");
  process.exit(1);
}

const response = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from,
    to,
    subject: WEEKLY_DIGEST_SUBJECT,
    html: weeklyDigestHtml(),
    text: weeklyDigestText(),
    attachments: [weeklyDigestLogoAttachment()],
  }),
});

const body = (await response.json()) as { id?: string; message?: string; error?: { message?: string } };
if (!response.ok) {
  console.error(body.error?.message || body.message || `Resend ${response.status}`);
  process.exit(1);
}
console.log(`Sent to ${to}${body.id ? ` (${body.id})` : ""}`);
