import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Utensils, Wheat } from "lucide-react";
import heroTable from "@/assets/hero-table.jpg";
import { CATEGORIES, EXPERIENCES } from "@/lib/domain";
import { ExperienceCard } from "@/components/experience-card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Zimbabwean Table — Discover Zimbabwe Through Food" },
      {
        name: "description",
        content:
          "Book authentic Zimbabwean food experiences, connect kitchens to local farmers, and let AI plan seasonal menus and culinary journeys.",
      },
      { property: "og:title", content: "The Zimbabwean Table — Discover Zimbabwe Through Food" },
      {
        property: "og:description",
        content:
          "Culinary tourism, hospitality sourcing and farmer supply — one Zimbabwean food ecosystem.",
      },
    ],
  }),
  component: Landing,
});

const ROLES = [
  {
    to: "/tourist" as const,
    icon: Sparkles,
    label: "I'm a traveller",
    body: "Discover experiences with AI, collect a culinary passport and earn points.",
  },
  {
    to: "/hospitality" as const,
    icon: Utensils,
    label: "I run a kitchen",
    body: "See tourist demand, source produce locally and build AI seasonal menus.",
  },
  {
    to: "/farmer" as const,
    icon: Wheat,
    label: "I grow food",
    body: "List produce, receive orders from restaurants and track deliveries.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative isolate overflow-hidden">
        <img
          src={heroTable}
          alt="A shared Zimbabwean table set with sadza, relishes and seasonal produce"
          className="absolute inset-0 size-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/80 via-foreground/70 to-foreground/90" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center md:py-28">
          <p className="text-[11px] font-semibold tracking-[0.35em] text-gold uppercase">
            Zimbabwe · Culinary Tourism
          </p>
          <h1 className="text-display mt-4 text-4xl leading-tight text-background md:text-6xl">
            The Zimbabwean Table
          </h1>
          <p className="mt-3 text-lg text-background/85 md:text-xl">
            Discover Zimbabwe through food.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm text-background/75">
            One ecosystem linking travellers, hospitality kitchens and the farmers who grow the
            ingredients — with AI guiding discovery and seasonal menus.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/tourist/ai"
              className="inline-flex items-center gap-2 rounded-full bg-clay px-6 py-3 text-sm font-semibold text-clay-foreground shadow-lift transition-transform active:scale-95"
            >
              Try AI discovery <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              to="/tourist/explore"
              className="inline-flex items-center gap-2 rounded-full border border-background/40 px-6 py-3 text-sm font-semibold text-background"
            >
              Browse experiences
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-display text-xl">Choose how you enter the ecosystem</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Demo mode — switch between all three roles at any time from the bar at the top.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {ROLES.map((role) => (
            <Link
              key={role.to}
              to={role.to}
              className="surface-card animate-rise p-5 transition-shadow hover:shadow-lift"
            >
              <span className="grid size-10 place-items-center rounded-full bg-secondary text-secondary-foreground">
                <role.icon className="size-5" aria-hidden />
              </span>
              <h3 className="text-display mt-3 text-base">{role.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{role.body}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-clay">
                Enter <ArrowRight className="size-4" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-6">
        <h2 className="text-display text-xl">Ten ways to taste Zimbabwe</h2>
        <div className="scroll-row no-bar mt-4">
          {CATEGORIES.map((c) => (
            <span
              key={c.id}
              className="surface-card shrink-0 snap-start px-4 py-2.5 text-sm font-medium"
            >
              <span aria-hidden>{c.emoji}</span> {c.label}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <h2 className="text-display text-xl">Featured tables</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EXPERIENCES.slice(0, 3).map((e) => (
            <ExperienceCard key={e.id} exp={e} />
          ))}
        </div>
      </section>

      <footer className="border-t border-border bg-secondary/40 py-8 text-center text-xs text-muted-foreground">
        The Zimbabwean Table — demonstration build. Hosts, farms and businesses shown are
        illustrative demo data.
      </footer>
    </div>
  );
}
