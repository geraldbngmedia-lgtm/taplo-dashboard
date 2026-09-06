import { createFileRoute, Navigate } from "@tanstack/react-router";
import { z } from "zod";

const demoQuery = z.object({
  demo: z.string().optional(),
  act: z.string().optional(),
  captions: z.string().optional(),
});

export const Route = createFileRoute("/")({
  validateSearch: demoQuery,
  component: HomeRedirect,
});

function HomeRedirect() {
  const search = Route.useSearch();
  return <Navigate to="/dashboard" search={search} />;
}
