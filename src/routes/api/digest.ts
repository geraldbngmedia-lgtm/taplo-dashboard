/**
 * Weekly digest send.
 * Set RESEND_API_KEY and TAPLO_DIGEST_TO in local env (never commit them).
 * Optional: TAPLO_DIGEST_FROM (defaults to Taplo <onboarding@resend.dev>).
 */
import { createFileRoute } from "@tanstack/react-router";
import { WEEKLY_DIGEST_SUBJECT, weeklyDigestHtml, weeklyDigestText } from "@/lib/demo/weekly-digest";
import { weeklyDigestLogoAttachment } from "@/lib/demo/weekly-digest-logo";

export const Route = createFileRoute("/api/digest")({
  server: {
    handlers: {
      POST: async () => {
        const apiKey = process.env.RESEND_API_KEY?.trim();
        const to = process.env.TAPLO_DIGEST_TO?.trim();
        const from = process.env.TAPLO_DIGEST_FROM?.trim() || "Taplo <onboarding@resend.dev>";

        if (!apiKey) {
          return Response.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });
        }
        if (!to) {
          return Response.json({ error: "Missing TAPLO_DIGEST_TO" }, { status: 500 });
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

        const body = (await response.json().catch(() => ({}))) as {
          id?: string;
          message?: string;
          error?: { message?: string };
        };

        if (!response.ok) {
          return Response.json(
            { error: body.error?.message || body.message || `Resend ${response.status}` },
            { status: 502 },
          );
        }
        return Response.json({ ok: true, id: body.id ?? null });
      },
    },
  },
});
