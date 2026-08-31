import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Bookmark, Check, Clock, MapPin, Star, Users } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { duration, EXPERIENCES, FARMERS, money } from "@/lib/domain";
import { useStore } from "@/lib/store";
import { SectionTitle, StatusPill } from "@/components/bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tourist/experience/$id")({
  loader: ({ params }) => {
    const exp = EXPERIENCES.find((e) => e.id === params.id);
    if (!exp) throw notFound();
    return { exp };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Experience unavailable" }, { name: "robots", content: "noindex" }] };
    const { exp } = loaderData;
    return {
      meta: [
        { title: `${exp.name} — The Zimbabwean Table` },
        { name: "description", content: exp.tagline },
        { property: "og:title", content: `${exp.name} — The Zimbabwean Table` },
        { property: "og:description", content: exp.tagline },
      ],
    };
  },
  component: ExperienceDetail,
});

function ExperienceDetail() {
  const { exp } = Route.useLoaderData();
  const { state, dispatch } = useStore();
  const saved = state.saved.includes(exp.id);
  const done = state.completed.includes(exp.id);
  const farmer = FARMERS.find((f) => f.id === exp.producerId);

  useEffect(() => {
    dispatch({ type: "view", id: exp.id });
  }, [dispatch, exp.id]);

  const stampsFor = () => {
    const ids = [exp.city.toLowerCase()];
    if (exp.categories.includes("traditional")) ids.push("sadza");
    if (exp.categories.includes("farm-to-table")) ids.push("farm");
    if (exp.categories.includes("heritage")) ids.push("heritage");
    if (exp.categories.includes("markets")) ids.push("market");
    if (exp.categories.includes("cooking")) ids.push("class");
    return ids;
  };

  const complete = () => {
    dispatch({ type: "complete", id: exp.id, label: `${exp.name} completed`, points: exp.points, stamps: stampsFor() });
    toast.success(`+${exp.points} culinary points earned`, { description: "Passport stamps updated." });
  };

  return (
    <div className="pb-4">
      <div className="relative -mx-4 -mt-4">
        <img src={exp.image} alt={exp.name} className="h-64 w-full object-cover md:h-80" width={1024} height={768} />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <Link
            to="/tourist/explore"
            aria-label="Back to explore"
            className="grid size-10 place-items-center rounded-full bg-background/85 backdrop-blur"
          >
            <ArrowLeft className="size-4" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={() => dispatch({ type: "toggleSave", id: exp.id })}
            aria-pressed={saved}
            aria-label={saved ? "Remove from saved" : "Save experience"}
            className="grid size-10 place-items-center rounded-full bg-background/85 backdrop-blur"
          >
            <Bookmark className={cn("size-4", saved && "fill-clay text-clay")} />
          </button>
        </div>
      </div>

      <div className="animate-rise mt-5">
        <div className="flex items-center gap-2">
          <StatusPill tone={exp.status === "Available today" ? "good" : "warn"}>{exp.status}</StatusPill>
          <StatusPill>{exp.authenticity}</StatusPill>
        </div>
        <h1 className="text-display mt-3 text-2xl leading-tight">{exp.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{exp.tagline}</p>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-4" aria-hidden /> {exp.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="size-4 fill-gold text-gold" aria-hidden /> {exp.rating} ({exp.reviews} reviews)
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-4" aria-hidden /> {duration(exp.durationMins)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-4" aria-hidden /> Hosted by {exp.host}
          </span>
        </div>

        <section className="mt-6">
          <SectionTitle title="The story" />
          <p className="text-sm leading-relaxed text-foreground/90">{exp.story}</p>
        </section>

        <section className="mt-6">
          <SectionTitle title="What's included" />
          <ul className="surface-card divide-y divide-border">
            {exp.includes.map((i) => (
              <li key={i} className="flex items-center gap-2 px-4 py-3 text-sm">
                <Check className="size-4 shrink-0 text-leaf" aria-hidden /> {i}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6">
          <SectionTitle title="On the plate" />
          <div className="space-y-3">
            {exp.dishes.map((d) => (
              <article key={d.name} className="surface-card p-4">
                <h3 className="text-display text-base">{d.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d.description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {d.ingredients.map((ing) => (
                    <span key={ing} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                      {ing}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {exp.heritage ? (
          <section className="mt-6">
            <SectionTitle title={`Heritage: ${exp.heritage.title}`} subtitle="Cultural context behind the dish" />
            <div className="surface-card space-y-3 p-4 text-sm">
              <p>
                <span className="text-display block text-xs tracking-wide uppercase">Cultural significance</span>
                {exp.heritage.significance}
              </p>
              <p>
                <span className="text-display block text-xs tracking-wide uppercase">Preparation</span>
                {exp.heritage.preparation}
              </p>
              <p>
                <span className="text-display block text-xs tracking-wide uppercase">Regional variations</span>
                {exp.heritage.regional}
              </p>
              <p>
                <span className="text-display block text-xs tracking-wide uppercase">How it's served</span>
                {exp.heritage.serving}
              </p>
            </div>
          </section>
        ) : null}

        {farmer ? (
          <section className="mt-6">
            <SectionTitle title="Where the food comes from" subtitle="Ecosystem provenance" />
            <div className="surface-card flex items-center gap-3 p-4">
              <span className="grid size-10 place-items-center rounded-full bg-leaf/15 text-lg" aria-hidden>
                🌾
              </span>
              <div className="min-w-0">
                <p className="text-display text-base">{farmer.farm}</p>
                <p className="text-sm text-muted-foreground">
                  {farmer.name} · {farmer.location} · farming since {farmer.since}
                </p>
              </div>
            </div>
          </section>
        ) : null}
      </div>

      <div className="sticky bottom-20 z-30 mt-8 md:bottom-4">
        <div className="surface-card flex items-center gap-3 p-3 shadow-lift">
          <div className="min-w-0">
            <p className="text-display text-lg">{money(exp.price)}</p>
            <p className="text-xs text-muted-foreground">per guest · earns {exp.points} points</p>
          </div>
          <button
            type="button"
            onClick={complete}
            disabled={done}
            className="ml-auto rounded-full bg-clay px-5 py-3 text-sm font-semibold text-clay-foreground transition-transform active:scale-95 disabled:opacity-60"
          >
            {done ? "Completed" : "Book & complete"}
          </button>
        </div>
      </div>
    </div>
  );
}
