import { createFileRoute } from "@tanstack/react-router";
import { DashboardAssistant } from "@/components/dashboard/DashboardAssistant";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Taplo" },
      {
        name: "description",
        content: "Ask Taplo across interviews, candidates, scorecards, and today's schedule.",
      },
      { property: "og:title", content: "Dashboard — Taplo" },
      {
        property: "og:description",
        content:
          "Your AI interview intelligence workspace for candidates, scorecards, and meetings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Dashboard — Taplo" },
      {
        name: "twitter:description",
        content:
          "Your AI interview intelligence workspace for candidates, scorecards, and meetings.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="h-screen min-h-[680px] w-full overflow-hidden">
      <DashboardAssistant />
    </div>
  );
}
