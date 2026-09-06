import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  FloatingCompanion,
  type CompanionState,
  type CompanionTheme,
} from "@/components/companion/FloatingCompanion";

export const Route = createFileRoute("/companion-mock")({
  component: CompanionMock,
  head: () => ({
    meta: [
      { title: "Floating Companion Mock | Taplo" },
      {
        name: "description",
        content:
          "Visual prototype of the Taplo floating desktop companion: frosted-glass panel and rail for searching interviewed candidates, in warm and dark themes.",
      },
      { property: "og:title", content: "Floating Companion Mock | Taplo" },
      {
        property: "og:description",
        content:
          "Frosted-glass floating companion prototype for Taplo, showing the search-results and on-page states.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const SCENE = {
  warm: {
    base: "#ECE6DC",
    blobs: [
      { color: "#FF7A5C", opacity: 0.16, style: "left-[-10%] top-[-8%] h-[380px] w-[380px]" },
      { color: "#C9B88F", opacity: 0.28, style: "right-[-12%] top-[14%] h-[420px] w-[420px]" },
      { color: "#E9D9C4", opacity: 0.4, style: "left-[20%] bottom-[-16%] h-[400px] w-[460px]" },
    ],
  },
  dark: {
    base: "#201B17",
    blobs: [
      { color: "#FF7A5C", opacity: 0.18, style: "left-[-10%] top-[-8%] h-[380px] w-[380px]" },
      { color: "#6B5A3E", opacity: 0.3, style: "right-[-12%] top-[14%] h-[420px] w-[420px]" },
      { color: "#3A2E24", opacity: 0.45, style: "left-[20%] bottom-[-16%] h-[400px] w-[460px]" },
    ],
  },
} as const;

function CompanionMock() {
  const [theme, setTheme] = useState<CompanionTheme>("warm");
  const isWarm = theme === "warm";

  return (
    <main className="min-h-screen w-full bg-white px-8 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-start justify-between gap-6">
          <h1 className="text-[15px] font-medium text-[#2A211B]">
            Taplo floating companion — visual prototype
          </h1>

          <div className="flex items-center gap-1 rounded-full border border-[#E4DED4] bg-[#F7F4EE] p-1">
            {(["warm", "dark"] as const).map((t) => {
              const active = theme === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className="rounded-full px-3 py-1 text-[12px] font-medium capitalize transition-colors duration-150"
                  style={
                    active
                      ? { background: "#2A211B", color: "#F7F4EE" }
                      : { color: "#7A7168" }
                  }
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-start gap-8">
          <Scene theme={theme} state="search" caption="Answering a search" isWarm={isWarm} />
          <Scene theme={theme} state="onpage" caption="On a candidate's page" isWarm={isWarm} />
        </div>
      </div>
    </main>
  );
}

function Scene({
  theme,
  state,
  caption,
}: {
  theme: CompanionTheme;
  state: CompanionState;
  caption: string;
  isWarm: boolean;
}) {
  const scene = SCENE[theme];

  return (
    <div>
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[#7A7168]">
        {caption}
      </p>
      <div
        className="relative overflow-hidden rounded-[20px] p-10"
        style={{ background: scene.base }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {scene.blobs.map((b, i) => (
            <div
              key={i}
              className={`absolute rounded-full ${b.style}`}
              style={{ background: b.color, opacity: b.opacity, filter: "blur(48px)" }}
            />
          ))}
        </div>
        <div className="relative flex justify-center">
          <FloatingCompanion theme={theme} state={state} />
        </div>
      </div>
    </div>
  );
}
