import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LiveQuestionPanel } from "@/components/capture/LiveQuestionPanel";
import {
  LIVE_PANEL_QUESTIONS,
  LIVE_PANEL_DEMO_QUESTION_ID,
  LIVE_PANEL_DEMO_DELAY_MS,
} from "@/lib/question-fixtures";

export const Route = createFileRoute("/panel-preview")({
  component: PanelPreview,
  head: () => ({
    meta: [
      { title: "Live Interview Panel Preview | Taplo" },
      {
        name: "description",
        content:
          "Preview of the Taplo live interview side panel, showing auto-detected question coverage, the active question cue, and the completion pulse.",
      },
      { property: "og:title", content: "Live Interview Panel Preview | Taplo" },
      {
        property: "og:description",
        content:
          "Preview of the Taplo live interview side panel with auto-detected question coverage and coaching cues.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function PanelPreview() {
  // Demo: a thin question auto-resolves to confirmed once a solid answer lands.
  const [resolved, setResolved] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setResolved(true), LIVE_PANEL_DEMO_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  const questions = resolved
    ? LIVE_PANEL_QUESTIONS.map((q) =>
        q.id === LIVE_PANEL_DEMO_QUESTION_ID ? { ...q, state: "confirmed" as const } : q,
      )
    : LIVE_PANEL_QUESTIONS;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--surface-sunken)] p-8">
      <h1 className="sr-only">Taplo live interview panel preview</h1>
      <div className="h-[680px] shadow-[0_24px_60px_rgba(42,33,27,0.18)] rounded-[14px]">
        <LiveQuestionPanel questions={questions} />
      </div>
    </main>
  );
}
