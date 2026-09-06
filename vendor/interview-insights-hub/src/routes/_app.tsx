import { useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CapturePanel } from "@/components/CapturePanel";
import { SideNav } from "@/components/ui-taplo/SideNav";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-[var(--bg)] text-[var(--ink)]">
      <SideNav collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
      <CapturePanel />
    </div>
  );
}
