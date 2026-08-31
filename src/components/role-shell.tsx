import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Compass,
  Home,
  LayoutDashboard,
  ListChecks,
  type LucideIcon,
  MapPin,
  Package,
  RotateCcw,
  Sparkles,
  Trophy,
  User,
  Utensils,
  Wheat,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { type Role } from "@/lib/domain";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: LucideIcon };

const NAV: Record<Role, NavItem[]> = {
  tourist: [
    { to: "/tourist", label: "Home", icon: Home },
    { to: "/tourist/explore", label: "Explore", icon: Compass },
    { to: "/tourist/ai", label: "AI", icon: Sparkles },
    { to: "/tourist/places", label: "Places", icon: MapPin },
    { to: "/tourist/rewards", label: "Rewards", icon: Trophy },
    { to: "/tourist/profile", label: "Profile", icon: User },
  ],
  hospitality: [
    { to: "/hospitality", label: "Overview", icon: LayoutDashboard },
    { to: "/hospitality/produce", label: "Produce", icon: Wheat },
    { to: "/hospitality/menu", label: "AI Menu", icon: Utensils },
    { to: "/hospitality/orders", label: "Orders", icon: ListChecks },
  ],
  farmer: [
    { to: "/farmer", label: "Home", icon: Home },
    { to: "/farmer/produce", label: "Produce", icon: Package },
    { to: "/farmer/orders", label: "Orders", icon: ListChecks },
  ],
};

const ROLE_META: Record<Role, { label: string; home: string; context: string }> = {
  tourist: { label: "Tourist", home: "/tourist", context: "Discover Zimbabwe through food" },
  hospitality: { label: "Hospitality", home: "/hospitality", context: "Demo — Zambezi House Hotel" },
  farmer: { label: "Farmer", home: "/farmer", context: "Ruwa Green Beds" },
};

export function DemoBar() {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const switchTo = (role: Role) => {
    dispatch({ type: "role", role });
    navigate({ to: ROLE_META[role].home });
    toast.success(`Switched to ${ROLE_META[role].label} view`);
  };

  return (
    <div className="border-b border-border bg-night text-primary-foreground">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-2">
        <span className="text-[11px] font-semibold tracking-widest uppercase opacity-70">Demo mode</span>
        <div className="ml-auto flex items-center gap-1 rounded-full bg-background/10 p-1">
          {(Object.keys(ROLE_META) as Role[]).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => switchTo(role)}
              aria-current={state.role === role}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                state.role === role ? "bg-gold text-gold-foreground" : "opacity-80 hover:opacity-100",
              )}
            >
              {ROLE_META[role].label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ml-1 inline-flex items-center gap-1 rounded-full border border-background/20 px-2.5 py-1 text-xs font-medium"
        >
          <RotateCcw className="size-3.5" aria-hidden /> Reset
        </button>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Reset demo"
        >
          <div className="surface-card w-full max-w-sm p-5 text-foreground">
            <h2 className="text-display text-lg">Reset the demo?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Points, orders, produce levels, saved experiences and menus return to the seeded state.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: "reset" });
                  setOpen(false);
                  navigate({ to: "/" });
                }}
                className="flex-1 rounded-full bg-clay px-4 py-2.5 text-sm font-semibold text-clay-foreground"
              >
                Reset demo
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function RoleShell({ role, children }: { role: Role; children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = NAV[role];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DemoBar />
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 pt-4 pb-28 md:pb-10">
        <div className="md:flex md:gap-8">
          <nav aria-label="Sections" className="hidden md:block md:w-52 md:shrink-0">
            <div className="surface-card sticky top-4 space-y-1 p-2">
              {items.map((item) => {
                const active = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active ? "bg-clay text-clay-foreground" : "text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    <item.icon className="size-4" aria-hidden /> {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))]">
          {items.map((item) => {
            const active = pathname === item.to;
            return (
              <li key={item.to} className="flex-1">
                <Link
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium transition-colors",
                    active ? "text-clay" : "text-muted-foreground",
                  )}
                >
                  <item.icon className={cn("size-5 transition-transform", active && "scale-110")} aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <header className="animate-rise mb-5">
      {eyebrow ? (
        <p className="text-[11px] font-semibold tracking-widest text-clay uppercase">{eyebrow}</p>
      ) : null}
      <h1 className="text-display text-2xl leading-tight">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
    </header>
  );
}
