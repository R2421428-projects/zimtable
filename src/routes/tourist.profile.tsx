import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, MapPin, Sparkles, Trophy } from "lucide-react";
import { EXPERIENCES, tierFor } from "@/lib/domain";
import { useStore } from "@/lib/store";
import { EmptyState, SectionTitle, StatCard } from "@/components/bits";
import { ExperienceCard } from "@/components/experience-card";
import { PageHeader } from "@/components/role-shell";

export const Route = createFileRoute("/tourist/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — The Zimbabwean Table" },
      {
        name: "description",
        content: "Saved tables, completed experiences and your Zimbabwean taste profile.",
      },
      { property: "og:title", content: "Your Profile — The Zimbabwean Table" },
      {
        property: "og:description",
        content: "Your saved experiences, tastes and culinary milestones.",
      },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { state, savedExperiences } = useStore();
  const completed = state.completed
    .map((id) => EXPERIENCES.find((e) => e.id === id))
    .filter((e): e is (typeof EXPERIENCES)[number] => Boolean(e));

  return (
    <div>
      <PageHeader eyebrow="Profile" title="Your taste profile" subtitle="Demo traveller account" />

      <div className="surface-card flex items-center gap-4 p-4">
        <span
          className="bg-ember grid size-14 place-items-center rounded-full text-xl text-clay-foreground"
          aria-hidden
        >
          🇿🇼
        </span>
        <div>
          <p className="text-display text-lg">Demo Traveller</p>
          <p className="text-sm text-muted-foreground">
            {tierFor(state.points)} tier · {state.points.toLocaleString()} points
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <StatCard
          label="Saved"
          value={savedExperiences.length}
          icon={<Bookmark className="size-4" />}
        />
        <StatCard
          label="Done"
          value={completed.length}
          icon={<Trophy className="size-4" />}
          tone="gold"
        />
        <StatCard
          label="Stamps"
          value={state.passport.filter((p) => p.earned).length}
          icon={<MapPin className="size-4" />}
          tone="leaf"
        />
      </div>

      <section className="mt-8">
        <SectionTitle title="Saved tables" />
        {savedExperiences.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {savedExperiences.map((e) => (
              <ExperienceCard key={e.id} exp={e} />
            ))}
          </div>
        ) : (
          <EmptyState
            emoji="🔖"
            title="Nothing saved yet"
            body="Tap the bookmark on any experience to keep it here for later."
            action={
              <Link to="/tourist/explore" className="text-sm font-semibold text-clay">
                Explore experiences
              </Link>
            }
          />
        )}
      </section>

      <section className="mt-8">
        <SectionTitle title="Completed experiences" />
        {completed.length ? (
          <ul className="surface-card divide-y divide-border">
            {completed.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{e.name}</p>
                  <p className="text-xs text-muted-foreground">{e.city}</p>
                </div>
                <span className="text-display text-sm text-leaf">+{e.points}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            emoji="🍽️"
            title="No experiences yet"
            body="Book your first table to start the passport."
          />
        )}
      </section>

      {state.tastePrompts.length ? (
        <section className="mt-8">
          <SectionTitle
            title="What you've asked the AI"
            subtitle="Signals shared with hospitality partners"
          />
          <ul className="surface-card divide-y divide-border">
            {state.tastePrompts.map((p, i) => (
              <li key={`${p}-${i}`} className="flex items-start gap-2 px-4 py-3 text-sm">
                <Sparkles className="mt-0.5 size-3.5 shrink-0 text-clay" aria-hidden /> {p}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
