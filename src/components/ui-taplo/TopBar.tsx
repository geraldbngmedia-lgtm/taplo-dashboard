import { Link } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { TaploLogo } from "@/components/ui-taplo/TaploLogo";

export function TopBar() {
  return (
    <div className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-[var(--hairline)] bg-[var(--bg)]/90 px-6 backdrop-blur-sm">
      <Link to="/dashboard" className="flex items-center" aria-label="Taplo">
        <TaploLogo variant="wordmark" className="h-5" />
      </Link>
      <Link
        to="/settings"
        aria-label="Settings"
        className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[var(--ink-muted)] hover:bg-[var(--hairline)]/60 hover:text-[var(--ink)] transition-colors duration-150 ease-out"
      >
        <Settings className="h-4 w-4" />
      </Link>
    </div>
  );
}
