import { Link, useRouterState } from "@tanstack/react-router";
import {
  Briefcase,
  CalendarDays,
  FileText,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from "lucide-react";
import taploLogo from "@/assets/taplo-logo-v2.png.asset.json";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { meetings } from "@/lib/mock";
import { cn } from "@/lib/utils";

interface SideNavProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function SideNav({ collapsed, onCollapsedChange }: SideNavProps) {
  const path = useRouterState({ select: (r) => r.location.pathname });

  const todayNotStarted = meetings.filter((m) => m.status === "today").length;

  const nav = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, badge: 0 },
    { to: "/meetings", label: "Meetings", icon: CalendarDays, badge: todayNotStarted },
    { to: "/analysis", label: "Analysis", icon: FileText, badge: 0 },
    { to: "/usage", label: "Usage", icon: Briefcase, badge: 0 },
  ] as const;

  const navigationLink = (
    item:
      | (typeof nav)[number]
      | { to: "/settings"; label: "Settings"; icon: typeof Settings; badge: 0 },
  ) => {
    const active = path.startsWith(item.to);
    const Icon = item.icon;
    const link = (
      <Link
        to={item.to}
        aria-label={collapsed ? item.label : undefined}
        className={cn(
          "relative flex h-10 items-center rounded-[8px] border t-nav transition-[padding,gap,background-color,border-color,color] duration-200 ease-out",
          collapsed ? "justify-center px-0" : "gap-3 px-3",
          active
            ? "border-[var(--hairline)] bg-[var(--surface)] text-[var(--ink)]"
            : "border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]",
        )}
      >
        <Icon
          className={cn("h-4 w-4 shrink-0", active && "text-[var(--accent)]")}
          strokeWidth={active ? 2.1 : 1.7}
        />
        <span className={cn("flex-1 overflow-hidden whitespace-nowrap", collapsed && "sr-only")}>
          {item.label}
        </span>
        {item.badge > 0 && (
          <span
            className={cn(
              "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[11px] font-semibold leading-none text-primary-foreground tnum",
              collapsed && "absolute -right-1 -top-1 h-4 min-w-4 px-0 text-[9px]",
            )}
            aria-label={`${item.badge} unread`}
          >
            {item.badge}
          </span>
        )}
      </Link>
    );

    if (!collapsed) return link;

    return (
      <Tooltip key={item.to}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={10}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        data-collapsed={collapsed}
        className={cn(
          "relative hidden shrink-0 flex-col border-r border-[var(--hairline)] bg-[var(--bg)] transition-[width] duration-200 ease-out md:flex",
          collapsed ? "w-[68px]" : "w-64",
        )}
      >
        <div className={cn("pb-8 pt-7", collapsed ? "px-5" : "px-6")}>
          <Link
            to="/dashboard"
            aria-label="Taplo"
            className={cn("flex h-6 items-center overflow-hidden", collapsed && "w-6")}
          >
            <img
              src={taploLogo.url}
              alt="Taplo"
              className="h-6 w-auto max-w-none shrink-0 object-left"
            />
          </Link>
          {!collapsed && (
            <p className="mt-1 whitespace-nowrap text-[12px] font-medium text-[var(--ink-faint)]">
              Interview intelligence
            </p>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onCollapsedChange(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className={cn(
            "absolute z-10 text-[var(--ink-muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)]",
            collapsed ? "right-[18px] top-[58px]" : "right-3 top-6",
          )}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>

        <nav className="flex-1 px-3">
          <ul className="space-y-0.5">
            {nav.map((item) => (
              <li key={item.to}>{navigationLink(item)}</li>
            ))}
          </ul>

          <div className="mt-6 border-t border-[var(--hairline)] pt-4">
            {navigationLink({
              to: "/settings",
              label: "Settings",
              icon: Settings,
              badge: 0,
            })}
          </div>
        </nav>

        <div className={cn("pb-6 pt-4", collapsed ? "px-3" : "px-6")}>
          <div className="border-t border-[var(--hairline)] pt-4">
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="mx-auto flex h-8 w-8 items-center justify-center rounded-[8px] border border-[var(--hairline)] bg-[var(--surface)] text-[11px] font-semibold text-[var(--accent-ink)]"
                    aria-label="Pro plan"
                  >
                    P
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  Pro · Founding Offer
                </TooltipContent>
              </Tooltip>
            ) : (
              <>
                <p className="t-section">Pro · Founding Offer</p>
                <p className="mt-1 whitespace-nowrap text-[13px] text-[var(--ink-muted)]">
                  Unlimited interviews
                </p>
                <a
                  href="#"
                  className="mt-2 inline-block whitespace-nowrap text-[13px] text-[var(--ink)] no-underline hover:underline"
                >
                  Manage subscription
                </a>
              </>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
