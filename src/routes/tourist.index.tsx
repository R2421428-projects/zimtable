import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, Sparkles, Trophy } from "lucide-react";
import { CATEGORIES, EXPERIENCES, nextTier } from "@/lib/domain";
import { useStore } from "@/lib/store";
import { AnimatedNumber, SectionTitle, StatCard } from "@/components/bits";
import { ExperienceCard } from "@/components/experience-card";
import { PageHeader } from "@/components/role-shell";

export const Route = createFileRoute("/tourist/")({
  head: () => ({
    meta: [
      { title: "Your Culinary Journey — The Zimbabwean Table" },
      { name: "description", content: "Your Zimbabwean food journey: points, passport stamps and today's tables." },
      { property: "og:title", content: "Your Culinary Journey — The Zimbabwean Table" },
      { property: "og:description", content: "Track points, stamps and discover today's authentic Zimbabwean tables." },
    ],
  }),
  component: TouristHome,
});

function TouristHome() {
  const { state, tier } = useStore();
  const next = nextTier(state.points);
  const stamps = state.passport.filter((p) => p.earned).length;
  const recent = state.recentlyViewed
    .map((id) => EXPERIENCES.find((e) => e.id === id))
    .filter((e): e is (typeof EXPERIENCES)[number] => Boolean(e));

  return (
    <div>
      <PageHeader eyebrow="Mhoro, traveller" title="Discover Zimbabwe through food" subtitle="Harare · today" />

      <div className="bg-ember animate-rise rounded-3xl p-5 text-clay-foreground shadow-lift">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase opacity-85">Culinary points</p>
            <p className="text-display text-3xl">
              <AnimatedNumber value={state.points} />
            </p>
          </div>
          <span className="rounded-full bg-background/20 px-3 py-1 text-xs font-semibold">{tier} tier</span>
        </div>
        {next ? (
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-background/25">
              <div
                className="h-full rounded-full bg-background transition-[width] duration-700"
                style={{ width: `${Math.min(100, Math.round((state.points / next.min) * 100))}%` }}
              />
            </div>
            <p className="mt-2 text-xs opacity-90">
              {next.min - state.points} points to {next.tier}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-xs opacity-90">Platinum reached — the highest table.</p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatCard label="Passport stamps" value={`${stamps}/${state.passport.length}`} icon={<MapPin className="size-4" />} tone="leaf" />
        <StatCard label="Experiences" value={state.completed.length} hint="completed" icon={<Trophy className="size-4" />} tone="gold" />
      </div>

      <Link
        to="/tourist/ai"
        className="surface-card mt-4 flex items-center gap-3 p-4 transition-shadow hover:shadow-lift"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-clay text-clay-foreground">
          <Sparkles className="size-5" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="text-display block text-base">Ask the AI concierge</span>
          <span className="block text-sm text-muted-foreground">
            "I want traditional food in Harare under $30"
          </span>
        </span>
        <ArrowRight className="ml-auto size-4 shrink-0 text-clay" aria-hidden />
      </Link>

      <section className="mt-8">
        <SectionTitle title="Browse by taste" subtitle="Ten categories of Zimbabwean food culture" />
        <div className="scroll-row no-bar">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to="/tourist/explore"
              search={{ category: c.id }}
              className="surface-card shrink-0 snap-start px-4 py-2.5 text-sm font-medium whitespace-nowrap"
            >
              <span aria-hidden>{c.emoji}</span> {c.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle
          title="Featured today"
          action={
            <Link to="/tourist/explore" className="text-sm font-semibold text-clay">
              See all
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {EXPERIENCES.slice(0, 4).map((e) => (
            <ExperienceCard key={e.id} exp={e} />
          ))}
        </div>
      </section>

      {recent.length ? (
        <section className="mt-8">
          <SectionTitle title="Recently viewed" />
          <div className="scroll-row no-bar">
            {recent.map((e) => (
              <ExperienceCard key={e.id} exp={e} compact />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
