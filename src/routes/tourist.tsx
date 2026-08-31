import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleShell } from "@/components/role-shell";

export const Route = createFileRoute("/tourist")({
  head: () => ({
    meta: [
      { title: "Traveller — The Zimbabwean Table" },
      {
        name: "description",
        content: "Discover, book and collect authentic Zimbabwean food experiences.",
      },
      { property: "og:title", content: "Traveller — The Zimbabwean Table" },
      {
        property: "og:description",
        content: "Discover Zimbabwe through food with AI-guided culinary experiences.",
      },
    ],
  }),
  component: () => (
    <RoleShell role="tourist">
      <Outlet />
    </RoleShell>
  ),
});
