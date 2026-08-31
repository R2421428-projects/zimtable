import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleShell } from "@/components/role-shell";

export const Route = createFileRoute("/farmer")({
  head: () => ({
    meta: [
      { title: "Farmer — The Zimbabwean Table" },
      { name: "description", content: "List produce, receive orders from restaurants and track deliveries." },
      { property: "og:title", content: "Farmer — The Zimbabwean Table" },
      { property: "og:description", content: "Manage inventory and incoming orders from hospitality partners." },
    ],
  }),
  component: () => (
    <RoleShell role="farmer">
      <Outlet />
    </RoleShell>
  ),
});
