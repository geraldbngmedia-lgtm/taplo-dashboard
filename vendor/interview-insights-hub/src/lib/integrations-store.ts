import { useSyncExternalStore } from "react";

export type SourceKind = "ats" | "network";

export type SourceDef = {
  id: string;
  name: string;
  kind: SourceKind;
  /** Extra words that should also match this source in assistant text. */
  aliases?: string[];
  blurb: string;
};

export const SOURCES: SourceDef[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    kind: "network",
    aliases: ["linked in"],
    blurb: "Profiles, work history, and shared connections for candidates you interview.",
  },
  {
    id: "teamtailor",
    name: "Teamtailor",
    kind: "ats",
    aliases: ["team tailor"],
    blurb: "Jobs, candidate pipelines, and application notes from your Teamtailor account.",
  },
  {
    id: "greenhouse",
    name: "Greenhouse",
    kind: "ats",
    blurb: "Openings, stages, and scorecards from your Greenhouse workspace.",
  },
  {
    id: "lever",
    name: "Lever",
    kind: "ats",
    blurb: "Opportunities, stages, and feedback from your Lever account.",
  },
  {
    id: "workable",
    name: "Workable",
    kind: "ats",
    blurb: "Requisitions and candidate profiles from Workable.",
  },
  {
    id: "ashby",
    name: "Ashby",
    kind: "ats",
    blurb: "Pipelines, interviews, and structured feedback from Ashby.",
  },
  {
    id: "smartrecruiters",
    name: "SmartRecruiters",
    kind: "ats",
    aliases: ["smart recruiters"],
    blurb: "Jobs and applicants from your SmartRecruiters account.",
  },
];

export function getSource(id: string): SourceDef | undefined {
  return SOURCES.find((s) => s.id === id);
}

const KEY = "taplo.integrations.v1";

type State = { connected: string[] };
const serverSnapshot: State = { connected: [] };

let state: State = { connected: [] };
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode — ignore */
  }
}

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as State;
    if (Array.isArray(parsed.connected)) {
      state = { connected: parsed.connected.filter((id) => SOURCES.some((s) => s.id === id)) };
    }
  } catch {
    /* corrupt payload — keep defaults */
  }
}

export const integrationsStore = {
  getSnapshot: () => {
    ensureHydrated();
    return state;
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  connect(id: string) {
    ensureHydrated();
    if (state.connected.includes(id)) return;
    state = { connected: [...state.connected, id] };
    persist();
    emit();
  },
  disconnect(id: string) {
    ensureHydrated();
    state = { connected: state.connected.filter((value) => value !== id) };
    persist();
    emit();
  },
};

export function useConnectedSources(): string[] {
  return useSyncExternalStore(
    integrationsStore.subscribe,
    () => integrationsStore.getSnapshot().connected,
    () => serverSnapshot.connected,
  );
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Sources named in a chunk of assistant text, deduped and in registry order. */
export function detectSources(text: string): SourceDef[] {
  if (!text) return [];
  return SOURCES.filter((source) => {
    const terms = [source.name, ...(source.aliases ?? [])];
    return terms.some((term) =>
      new RegExp(`(^|[^a-z0-9])${escapeRegex(term)}([^a-z0-9]|$)`, "i").test(text),
    );
  });
}
