import { useSyncExternalStore } from "react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

export type ChatThread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
};

const KEY = "taplo.chat.threads.v1";

type State = { threads: ChatThread[] };
const serverSnapshot: State = { threads: [] };

function read(): State {
  if (typeof window === "undefined") return { threads: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { threads: [] };
    const parsed = JSON.parse(raw) as State;
    return { threads: Array.isArray(parsed.threads) ? parsed.threads : [] };
  } catch {
    return { threads: [] };
  }
}

let state: State = { threads: [] };
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
  state = read();
  hydrated = true;
}

export const chatStore = {
  getSnapshot: () => {
    ensureHydrated();
    return state;
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  createThread(): ChatThread {
    ensureHydrated();
    const t: ChatThread = {
      id: crypto.randomUUID(),
      title: "New chat",
      updatedAt: Date.now(),
      messages: [],
    };
    state = { threads: [t, ...state.threads] };
    persist();
    emit();
    return t;
  },
  deleteThread(id: string) {
    ensureHydrated();
    state = { threads: state.threads.filter((t) => t.id !== id) };
    persist();
    emit();
  },
  updateThread(id: string, patch: Partial<ChatThread>) {
    ensureHydrated();
    state = {
      threads: state.threads.map((t) =>
        t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t,
      ),
    };
    persist();
    emit();
  },
  appendMessage(id: string, msg: ChatMessage) {
    ensureHydrated();
    state = {
      threads: state.threads.map((t) =>
        t.id === id ? { ...t, messages: [...t.messages, msg], updatedAt: Date.now() } : t,
      ),
    };
    persist();
    emit();
  },
  patchLastAssistant(id: string, content: string) {
    ensureHydrated();
    state = {
      threads: state.threads.map((t) => {
        if (t.id !== id) return t;
        const msgs = [...t.messages];
        for (let i = msgs.length - 1; i >= 0; i--) {
          if (msgs[i].role === "assistant") {
            msgs[i] = { ...msgs[i], content };
            break;
          }
        }
        return { ...t, messages: msgs, updatedAt: Date.now() };
      }),
    };
    persist();
    emit();
  },
};

export function useChatThreads(): ChatThread[] {
  return useSyncExternalStore(
    chatStore.subscribe,
    () => chatStore.getSnapshot().threads,
    () => serverSnapshot.threads,
  );
}

export function useChatThread(id: string | undefined): ChatThread | undefined {
  const threads = useChatThreads();
  return threads.find((t) => t.id === id);
}
