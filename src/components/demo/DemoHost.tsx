import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  DEMO_CAPTIONS,
  demoOverlayStore,
  parseDemoSearch,
  seedDemo,
  useDemoOverlay,
} from "@/lib/demo/demo-mode";

export function useIsDemo() {
  const searchStr = useRouterState({ select: (r) => r.location.searchStr });
  const demo = parseDemoSearch(searchStr);
  if (demo.demo) seedDemo(demo.act);
  return demo;
}

export function DemoHost() {
  const demo = useIsDemo();

  useEffect(() => {
    if (!demo.demo) return;
    demoOverlayStore.reset(demo.captions);
  }, [demo.demo, demo.act, demo.captions]);

  useEffect(() => {
    if (!demo.demo) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (event.key === "n" || event.key === "N") {
        event.preventDefault();
        demoOverlayStore.next();
      } else if (event.key === "p" || event.key === "P") {
        event.preventDefault();
        demoOverlayStore.prev();
      } else if (event.key === "h" || event.key === "H") {
        event.preventDefault();
        demoOverlayStore.hide();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [demo.demo]);

  useEffect(() => {
    if (!demo.demo || !demo.captions) return;
    const id = window.setInterval(() => demoOverlayStore.next(), 12000);
    return () => window.clearInterval(id);
  }, [demo.demo, demo.captions]);

  if (!demo.demo) return null;

  return <DemoOverlay />;
}

function DemoOverlay() {
  const { beat, captionsVisible, pillVisible } = useDemoOverlay();
  const caption = DEMO_CAPTIONS[beat] ?? DEMO_CAPTIONS[0];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      {pillVisible ? (
        <span className="rounded-full border border-[var(--hairline)] bg-[var(--surface)]/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-faint)] shadow-[var(--shadow-overlay)] backdrop-blur-md">
          Demo · N next · P prev · H hide
        </span>
      ) : null}
      {captionsVisible ? (
        <div className="w-full max-w-[560px] rounded-[16px] border border-[var(--glass-border)] bg-[var(--dashboard-glass-strong)] px-4 py-3 text-center shadow-[var(--shadow-glass-overlay)] backdrop-blur-xl">
          <p
            className="text-[14px] font-semibold text-[var(--ink)]"
            style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
          >
            {caption.title}
          </p>
          <p className="mt-1 text-[12px] leading-5 text-[var(--ink-muted)]">{caption.line}</p>
        </div>
      ) : null}
    </div>
  );
}
