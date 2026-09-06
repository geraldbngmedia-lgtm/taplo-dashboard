import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { CalendarDays, User, Bell } from "lucide-react";
import { preserveDemoSearch } from "@/lib/demo/demo-mode";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Taplo" }] }),
  component: SettingsLayout,
});

const tabs: { to: string; label: string; icon: typeof User; exact?: boolean }[] = [
  { to: "/settings", label: "Profile", icon: User, exact: true },
  { to: "/settings/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/settings/notifications", label: "Notifications", icon: Bell },
];

function SettingsLayout() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-28 sm:px-6 lg:px-10 lg:py-10">
      <header>
        <h1 className="font-serif text-4xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your workspace, connections, and preferences.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
        <nav className="space-y-1">
          {tabs.map((t) => {
            const active = t.exact ? path === t.to : path.startsWith(t.to);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to as "/settings"}
                search={preserveDemoSearch as never}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
                {t.label}
              </Link>
            );
          })}
        </nav>
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
