import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleShell } from "@/components/role-shell";

export const Route = createFileRoute("/hospitality")({
  head: () => ({
    meta: [
      { title: "Hospitality — The Zimbabwean Table" },
      { name: "description", content: "Demand insights, local sourcing and AI seasonal menus for hospitality kitchens." },
      { property: "og:title", content: "Hospitality — The Zimbabwean Table" },
      { property: "og:description", content: "See tourist demand, source produce locally and build AI seasonal menus." },
    ],
  }),
  component: () => (
    <RoleShell role="hospitality">
      <Outlet />
    </RoleShell>
  ),
});
