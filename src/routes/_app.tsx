import { useEffect, useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { DemoHost } from "@/components/demo/DemoHost";
import { SideNav } from "@/components/ui-taplo/SideNav";
import { TaploLogo } from "@/components/ui-taplo/TaploLogo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => typeof window !== "undefined" && !window.matchMedia("(min-width: 1024px)").matches,
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const wideSidebar = window.matchMedia("(min-width: 1024px)");
    setSidebarCollapsed(!wideSidebar.matches);
  }, []);

  return (
    <div className="flex h-dvh min-h-0 w-full min-w-0 flex-col bg-[var(--bg)] text-[var(--ink)] md:flex-row">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--hairline)] px-3 md:hidden">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Open navigation"
          onClick={() => setMobileNavOpen(true)}
          className="text-[var(--ink-muted)] hover:text-[var(--ink)]"
        >
          <Menu className="size-5" />
        </Button>
        <TaploLogo variant="mark" className="h-8 w-8" />
        <span className="w-8" aria-hidden />
      </header>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          className="flex w-[min(18rem,86vw)] flex-col bg-[var(--bg)] p-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Taplo workspace pages</SheetDescription>
          </SheetHeader>
          <SideNav
            collapsed={false}
            onCollapsedChange={() => undefined}
            className="flex h-full w-full border-r-0"
            showCollapseToggle={false}
            onNavigate={() => setMobileNavOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <SideNav collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />

      <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
        <Outlet />
      </main>
      <DemoHost />
    </div>
  );
}
