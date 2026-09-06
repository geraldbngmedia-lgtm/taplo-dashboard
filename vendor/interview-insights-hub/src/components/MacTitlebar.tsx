import { useRouterState } from "@tanstack/react-router";

function sectionFor(path: string): { title: string; subtitle: string } {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  if (path.startsWith("/dashboard")) return { title: "Dashboard", subtitle: today };
  if (path.startsWith("/meetings")) return { title: "Meetings", subtitle: today };
  if (path.startsWith("/analysis")) return { title: "Analysis", subtitle: today };
  if (path.startsWith("/ask")) return { title: "Ask Taplo", subtitle: today };
  if (path.startsWith("/usage")) return { title: "Usage", subtitle: today };
  if (path.startsWith("/settings")) return { title: "Settings", subtitle: today };
  return { title: "Taplo", subtitle: today };
}

export function MacTitlebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { title, subtitle } = sectionFor(path);
  return (
    <div className="mac-titlebar sticky top-0 z-30 flex h-11 items-center px-4">
      <div className="flex items-center gap-2" aria-hidden>
        <span className="h-3 w-3 rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)]" />
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="text-[13px] font-semibold leading-none text-foreground/85">{title}</div>
        <div className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {subtitle}
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/50 px-2.5 py-1 text-[11px] font-medium text-foreground/80 shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.06)] dark:bg-white/10">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Ready
        </span>
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
          EM
        </span>
      </div>
    </div>
  );
}
