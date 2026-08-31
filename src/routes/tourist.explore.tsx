import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { CATEGORIES, EXPERIENCES, type CategoryId } from "@/lib/domain";
import { EmptyState, SectionTitle } from "@/components/bits";
import { ExperienceCard } from "@/components/experience-card";
import { PageHeader } from "@/components/role-shell";
import { cn } from "@/lib/utils";

const SearchSchema = z.object({ category: z.string().optional() });

export const Route = createFileRoute("/tourist/explore")({
  validateSearch: (search: Record<string, unknown>) => SearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Explore Experiences — The Zimbabwean Table" },
      { name: "description", content: "Filter authentic Zimbabwean food experiences by category, city and price." },
      { property: "og:title", content: "Explore Experiences — The Zimbabwean Table" },
      { property: "og:description", content: "Traditional meals, farm-to-table lunches, market walks and chef's tables." },
    ],
  }),
  component: Explore,
});

const SORTS = [
  { id: "recommended", label: "Recommended" },
  { id: "price", label: "Price" },
  { id: "rating", label: "Rating" },
] as const;

function Explore() {
  const { category } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [query, setQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(60);
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("recommended");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = EXPERIENCES.filter((e) => {
      if (category && !e.categories.includes(category as CategoryId)) return false;
      if (e.price > maxPrice) return false;
      if (!q) return true;
      return `${e.name} ${e.city} ${e.tagline} ${e.keyDish} ${e.host}`.toLowerCase().includes(q);
    });
    if (sort === "price") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "rating") return [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [category, query, maxPrice, sort]);

  const setCategory = (id?: string) => navigate({ search: id ? { category: id } : {} });

  return (
    <div>
      <PageHeader eyebrow="Explore" title="Find your next table" subtitle={`${results.length} experiences match`} />

      <div className="surface-card p-4">
        <label className="relative block">
          <span className="sr-only">Search experiences</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes, cities, hosts"
            className="w-full rounded-full border border-input bg-background py-2.5 pr-4 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <div className="scroll-row no-bar mt-3">
          <button
            type="button"
            onClick={() => setCategory(undefined)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium whitespace-nowrap",
              !category ? "border-clay bg-clay text-clay-foreground" : "border-border",
            )}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium whitespace-nowrap",
                category === c.id ? "border-clay bg-clay text-clay-foreground" : "border-border",
              )}
            >
              <span aria-hidden>{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="flex-1 text-xs font-medium text-muted-foreground">
            Max price: <span className="text-foreground">${maxPrice}</span>
            <input
              type="range"
              min={10}
              max={60}
              step={1}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="mt-1 w-full accent-clay"
            />
          </label>
          <div className="flex gap-1 rounded-full bg-secondary p-1">
            {SORTS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSort(s.id)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  sort === s.id ? "bg-card text-foreground shadow-soft" : "text-muted-foreground",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <SectionTitle title="Results" />
        {results.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {results.map((e) => (
              <ExperienceCard key={e.id} exp={e} />
            ))}
          </div>
        ) : (
          <EmptyState
            emoji="🍲"
            title="No tables match yet"
            body="Try widening the price range or clearing the category filter."
            action={
              <Link to="/tourist/ai" className="text-sm font-semibold text-clay">
                Ask the AI concierge instead
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
