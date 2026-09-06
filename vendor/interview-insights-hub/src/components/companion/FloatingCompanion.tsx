import type { CSSProperties, ReactNode } from "react";
import {
  ArrowRight,
  ArrowUp,
  ChevronDown,
  Clock,
  FilePlus2,
  Mic,
  Search,
  Sparkles,
  X,
} from "lucide-react";

export type CompanionTheme = "warm" | "dark";
export type CompanionState = "search" | "onpage";

type Tokens = CSSProperties & Record<string, string>;

const WARM: Tokens = {
  "--c-glass": "rgba(255,253,249,0.68)",
  "--c-card": "rgba(255,255,255,0.52)",
  "--c-edge": "rgba(255,255,255,0.6)",
  "--c-hairline": "rgba(42,33,27,0.10)",
  "--c-ink": "#2A211B",
  "--c-muted": "#7A7168",
  "--c-coral": "#FF7A5C",
  "--c-btn-bg": "#2A211B",
  "--c-btn-ink": "#F7F4EE",
  "--c-shadow": "0 22px 54px rgba(42,33,27,0.20)",
};

const DARK: Tokens = {
  "--c-glass": "rgba(38,32,27,0.62)",
  "--c-card": "rgba(58,49,41,0.5)",
  "--c-edge": "rgba(255,255,255,0.12)",
  "--c-hairline": "rgba(255,255,255,0.08)",
  "--c-ink": "#F1EBE2",
  "--c-muted": "#A79C90",
  "--c-coral": "#FF7A5C",
  "--c-btn-bg": "#F1EBE2",
  "--c-btn-ink": "#201B17",
  "--c-shadow": "0 22px 54px rgba(0,0,0,0.45)",
};

export function FloatingCompanion({
  theme,
  state,
}: {
  theme: CompanionTheme;
  state: CompanionState;
}) {
  const tokens = theme === "warm" ? WARM : DARK;

  return (
    <div style={tokens} className="flex items-stretch rounded-[14px]">
      {/* PANEL */}
      <div
        className="flex w-[300px] flex-col rounded-l-[14px] border border-r-0 p-4"
        style={{
          background: "var(--c-glass)",
          backdropFilter: "blur(22px)",
          borderColor: "var(--c-edge)",
          boxShadow: "var(--c-shadow)",
          color: "var(--c-ink)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span
            className="text-[17px] leading-none"
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 600 }}
          >
            taplo
          </span>
          <div className="flex items-center gap-2" style={{ color: "var(--c-muted)" }}>
            <Clock className="h-[15px] w-[15px]" strokeWidth={1.75} />
            <X className="h-[15px] w-[15px]" strokeWidth={1.75} />
          </div>
        </div>

        {state === "search" ? <SearchState /> : <OnPageState />}
      </div>

      {/* RAIL */}
      <div
        className="flex w-[46px] flex-col items-center gap-5 rounded-r-[14px] border py-4"
        style={{
          background: "var(--c-glass)",
          backdropFilter: "blur(22px)",
          borderColor: "var(--c-edge)",
          borderLeftColor: "var(--c-hairline)",
          boxShadow: "var(--c-shadow)",
        }}
      >
        <div className="relative">
          <span className="block h-6 w-6 rounded-[8px]" style={{ background: "var(--c-ink)" }} />
          <span
            className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full"
            style={{ background: "var(--c-coral)" }}
          />
        </div>
        <Search className="h-[16px] w-[16px]" strokeWidth={1.75} style={{ color: "var(--c-muted)" }} />
        <FilePlus2 className="h-[16px] w-[16px]" strokeWidth={1.75} style={{ color: "var(--c-muted)" }} />
        <Clock className="h-[16px] w-[16px]" strokeWidth={1.75} style={{ color: "var(--c-muted)" }} />
      </div>
    </div>
  );
}

/* ---------------- State A: search results ---------------- */

function SearchState() {
  return (
    <>
      <p className="mt-4 text-[11px]" style={{ color: "var(--c-muted)" }}>
        12 people match · showing the 4 strongest
      </p>

      <div
        className="mt-2.5 flex items-start gap-2 rounded-[11px] border px-3 py-2"
        style={{
          background: "var(--c-card)",
          backdropFilter: "blur(8px)",
          borderColor: "var(--c-edge)",
        }}
      >
        <Sparkles
          className="mt-[1px] h-[13px] w-[13px] shrink-0"
          strokeWidth={1.75}
          style={{ color: "var(--c-coral)" }}
        />
        <span className="text-[11.5px] leading-[1.45]" style={{ color: "var(--c-muted)" }}>
          Lots of matches. Add a skill or role to sharpen.
        </span>
      </div>

      <div className="mt-3">
        <ResultRow
          name="Johan Berg"
          meta="Interviewed 4 Aug · Platform role"
          quote="Ran Kubernetes in prod three years, moved us off ECS single-handedly."
        />
        <ResultRow
          name="Amina Okafor"
          meta="Interviewed 28 Jul · SRE"
          quote="On-call lead, ran our k8s clusters, cut incident MTTR in half."
        />
        <ResultRow
          name="Sara Lindqvist"
          meta="Interviewed 12 Aug · Backend"
          quote="Owned the payments migration, deployed on Kubernetes end to end."
        />
      </div>

      <SectionLabel>Also relevant</SectionLabel>

      <div className="mt-1.5">
        <TailRow name="Erik Ström" right="21 Jul · Backend" />
        <TailRow name="Priya Nair" right="9 Jul · DevOps" />
      </div>

      <div
        className="mt-3 flex items-center justify-center gap-1.5 rounded-[11px] border py-2 text-[12px] font-medium"
        style={{ borderColor: "var(--c-hairline)", color: "var(--c-muted)" }}
      >
        Show 8 more
        <ChevronDown className="h-[13px] w-[13px]" strokeWidth={1.75} />
      </div>

      <AskBar value="Backend engineers who've run Kubernetes" typed />
    </>
  );
}

/* ---------------- State B: on a candidate's page ---------------- */

function OnPageState() {
  return (
    <>
      <div
        className="mt-4 rounded-[12px] border p-3"
        style={{
          background: "var(--c-card)",
          backdropFilter: "blur(8px)",
          borderColor: "var(--c-edge)",
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--c-coral)" }} />
          <span
            className="text-[11px] font-medium tracking-[0.02em]"
            style={{ color: "var(--c-coral)" }}
          >
            On this page
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[14px] font-medium">Sara Lindqvist</span>
          <ArrowRight
            className="h-[14px] w-[14px] shrink-0"
            strokeWidth={1.75}
            style={{ color: "var(--c-muted)" }}
          />
        </div>
        <p className="mt-0.5 text-[12px]" style={{ color: "var(--c-muted)" }}>
          Interviewed 12 Aug · Backend Engineer
        </p>
        <p className="mt-2 text-[12px] leading-[1.55]" style={{ color: "var(--c-muted)" }}>
          &ldquo;Led the payments migration end to end, owned the on-call rota.&rdquo;
        </p>

        <div
          className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-[10px] text-[13px] font-medium"
          style={{ background: "var(--c-btn-bg)", color: "var(--c-btn-ink)" }}
        >
          <FilePlus2 className="h-[14px] w-[14px]" strokeWidth={1.75} />
          Add summary to this card
        </div>
      </div>

      <SectionLabel>Also worth a look</SectionLabel>

      <div className="mt-1.5">
        <ResultRow
          name="Johan Berg"
          meta="Interviewed 4 Aug · Platform"
          quote="Ran Kubernetes in prod three years, moved us off ECS."
        />
        <TailRow name="Amina Okafor" right="28 Jul · SRE" />
      </div>

      <AskBar value="Ask who you've spoken with..." />
    </>
  );
}

/* ---------------- shared bits ---------------- */

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      className="mt-4 text-[11px] font-medium uppercase tracking-[0.08em]"
      style={{ color: "var(--c-muted)" }}
    >
      {children}
    </p>
  );
}

function ResultRow({ name, meta, quote }: { name: string; meta: string; quote: string }) {
  return (
    <div
      className="border-t py-2.5 first:border-t-0 first:pt-0"
      style={{ borderColor: "var(--c-hairline)" }}
    >
      <p className="text-[13.5px] font-medium">{name}</p>
      <p className="mt-0.5 text-[11.5px]" style={{ color: "var(--c-muted)" }}>
        {meta}
      </p>
      <p className="mt-1 text-[12px] leading-[1.5]" style={{ color: "var(--c-muted)" }}>
        &ldquo;{quote}&rdquo;
      </p>
    </div>
  );
}

function TailRow({ name, right }: { name: string; right: string }) {
  return (
    <div
      className="flex items-center justify-between border-t py-2 first:border-t-0"
      style={{ borderColor: "var(--c-hairline)", opacity: 0.6 }}
    >
      <span className="text-[13px] font-medium">{name}</span>
      <span className="text-[11.5px]" style={{ color: "var(--c-muted)" }}>
        {right}
      </span>
    </div>
  );
}

function AskBar({ value, typed = false }: { value: string; typed?: boolean }) {
  return (
    <div
      className="mt-4 flex items-center gap-2 rounded-[12px] border p-2 pl-3"
      style={{
        background: "var(--c-card)",
        backdropFilter: "blur(8px)",
        borderColor: "var(--c-edge)",
      }}
    >
      <span
        className="flex-1 truncate text-[12.5px]"
        style={{ color: typed ? "var(--c-ink)" : "var(--c-muted)" }}
      >
        {value}
      </span>
      <Mic className="h-[15px] w-[15px]" strokeWidth={1.75} style={{ color: "var(--c-muted)" }} />
      <span
        className="flex h-7 w-7 items-center justify-center rounded-[8px]"
        style={{ background: "var(--c-btn-bg)", color: "var(--c-btn-ink)" }}
      >
        <ArrowUp className="h-[14px] w-[14px]" strokeWidth={2} />
      </span>
    </div>
  );
}
