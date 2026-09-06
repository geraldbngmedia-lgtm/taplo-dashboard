import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  CalendarDays,
  FileText,
  Receipt,
  Settings,
  Sparkles,
} from "lucide-react";
import { TaploLogo } from "@/components/ui-taplo/TaploLogo";

const nav = [
  { to: "/dashboard", label: "Home", icon: Home, hint: "⌘1" },
  { to: "/meetings", label: "Meetings", icon: CalendarDays, hint: "⌘2" },
  { to: "/analysis", label: "Analysis", icon: FileText, hint: "⌘3" },
  { to: "/usage", label: "Usage", icon: Receipt, hint: "⌘4" },
  { to: "/companion-mock", label: "Companion", icon: Sparkles, hint: "⌘5" },
] as const;

export function Sidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });

  return (
    <aside className="mac-vibrancy hidden w-60 shrink-0 flex-col border-r border-sidebar-border lg:flex">
      <div className="flex h-11 items-center px-4" />
      <div className="px-4 pb-5">
        <Link to="/dashboard" className="flex items-center">
          <TaploLogo variant="wordmark" />
        </Link>
      </div>

      <nav className="flex-1 px-2">
        <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
          Workspace
        </div>
        <ul className="space-y-0.5">
          {nav.map((item) => {
            const active = path.startsWith(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors ${
                    active
                      ? "bg-primary/12 text-foreground"
                      : "text-foreground/75 hover:bg-sidebar-accent hover:text-foreground"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.to === "/meetings" && (
                    <span className="rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">
                      2
                    </span>
                  )}
                  <span className="text-[10px] tabular-nums text-muted-foreground/60">
                    {item.hint}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <Link
          to="/settings"
          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors ${
            path.startsWith("/settings")
              ? "bg-primary/12 text-foreground"
              : "text-foreground/75 hover:bg-sidebar-accent hover:text-foreground"
          }`}
        >
          <Settings className={`h-4 w-4 ${path.startsWith("/settings") ? "text-primary" : "text-muted-foreground"}`} />
          <span className="flex-1">Settings</span>
          <span className="text-[10px] tabular-nums text-muted-foreground/60">⌘,</span>
        </Link>
        <div className="mt-2 flex items-center gap-2.5 rounded-lg px-2 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
            EM
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-medium">Elena Marsh</div>
            <div className="truncate text-[10px] text-muted-foreground">Holloway Talent</div>
          </div>
          <span className="text-[10px] tabular-nums text-muted-foreground/60">⌃⌘Q</span>
        </div>
      </div>
    </aside>
  );
}
