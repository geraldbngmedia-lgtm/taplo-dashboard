import { useSyncExternalStore } from "react";

export type CapturedLine = {
  t: string;
  who: "Recruiter" | "Candidate";
  line: string;
};

export type CapturedSession = {
  id: string;
  candidate: string;
  role: string;
  date: string;
  duration: string;
  jd: string;
  transcript: CapturedLine[];
  /** Questions still OPEN when the interview ended, flagged as not asked. */
  notAsked?: string[];
};

type State = { sessions: CapturedSession[] };

let state: State = { sessions: [] };
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export const captureStore = {
  getSnapshot: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  add(session: CapturedSession) {
    state = { sessions: [session, ...state.sessions] };
    emit();
  },
};

export function useCapturedSessions() {
  return useSyncExternalStore(
    captureStore.subscribe,
    () => captureStore.getSnapshot().sessions,
    () => [],
  );
}

export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m} min ${s}s` : `${s}s`;
}

export function formatNow() {
  const d = new Date();
  return d.toLocaleString(undefined, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
