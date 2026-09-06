import { useSyncExternalStore } from "react";
import { captureStore } from "@/lib/capture-store";
import { chatStore } from "@/lib/chat-store";
import { integrationsStore } from "@/lib/integrations-store";
import {
  DEMO_CAPTIONS,
  DEMO_CAPTURED_SESSION,
  DEMO_SESSION_ID,
  raviInterviewWriteup,
} from "@/lib/demo/fixtures";

export type DemoAct = 1 | 2 | 3 | undefined;

export type DemoSearch = {
  demo: boolean;
  act: DemoAct;
  captions: boolean;
};

export function parseDemoSearch(searchStr: string): DemoSearch {
  const raw = searchStr.startsWith("?") ? searchStr.slice(1) : searchStr;
  const params = new URLSearchParams(raw);
  const demoValue = params.get("demo");
  const actValue = params.get("act");
  const captionsValue = params.get("captions");
  const act: DemoAct =
    actValue === "1" ? 1 : actValue === "2" ? 2 : actValue === "3" ? 3 : undefined;
  return {
    demo: demoValue === "1" || demoValue === "true",
    act,
    captions: captionsValue !== "0",
  };
}

export function demoParamsFromSearch(searchStr: string): Record<string, string> {
  const parsed = parseDemoSearch(searchStr);
  if (!parsed.demo) return {};
  const out: Record<string, string> = { demo: "1" };
  if (parsed.act) out.act = String(parsed.act);
  if (!parsed.captions) out.captions = "0";
  return out;
}

export function demoSearchFromWindow(): Record<string, string> {
  if (typeof window === "undefined") return {};
  return demoParamsFromSearch(window.location.search);
}

export function preserveDemoSearch(
  prev: Record<string, unknown> | undefined,
): Record<string, unknown> {
  return { ...(prev ?? {}), ...demoSearchFromWindow() };
}

type OverlayState = {
  beat: number;
  captionsVisible: boolean;
  pillVisible: boolean;
};

const listeners = new Set<() => void>();
let overlay: OverlayState = {
  beat: 0,
  captionsVisible: true,
  pillVisible: true,
};

function emit() {
  for (const listener of listeners) listener();
}

export const demoOverlayStore = {
  getSnapshot: () => overlay,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  reset(captions: boolean) {
    overlay = {
      beat: 0,
      captionsVisible: captions,
      pillVisible: true,
    };
    emit();
  },
  next() {
    overlay = {
      ...overlay,
      beat: Math.min(overlay.beat + 1, DEMO_CAPTIONS.length - 1),
    };
    emit();
  },
  prev() {
    overlay = { ...overlay, beat: Math.max(overlay.beat - 1, 0) };
    emit();
  },
  hide() {
    if (overlay.captionsVisible) {
      overlay = { ...overlay, captionsVisible: false };
    } else {
      overlay = { ...overlay, pillVisible: false };
    }
    emit();
  },
  showCaptions() {
    overlay = { ...overlay, captionsVisible: true, pillVisible: true };
    emit();
  },
};

export function useDemoOverlay() {
  return useSyncExternalStore(
    demoOverlayStore.subscribe,
    demoOverlayStore.getSnapshot,
    () => overlay,
  );
}

let seeded = false;

export function seedDemo(act: DemoAct) {
  if (typeof window === "undefined" || seeded) return;
  seeded = true;

  const connectSources = act === 1 || act === 3;
  integrationsStore.setConnected(connectSources ? ["linkedin", "teamtailor"] : []);
  captureStore.ensure(DEMO_CAPTURED_SESSION);

  if (act === 1) {
    chatStore.ensureThread({
      id: "demo-thread-ravi",
      title: "Ravi Anand write-up",
      updatedAt: Date.now(),
      messages: [
        {
          id: "demo-msg-user",
          role: "user",
          content: "Bring back Ravi’s write-up",
          createdAt: Date.now() - 4000,
        },
        {
          id: "demo-msg-assistant",
          role: "assistant",
          content: raviInterviewWriteup(),
          createdAt: Date.now() - 1000,
        },
      ],
    });
  }
}

export { DEMO_SESSION_ID, DEMO_CAPTIONS };
