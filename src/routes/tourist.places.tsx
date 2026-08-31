import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { MapPin, Search, ExternalLink, Sparkles, Check } from "lucide-react";
import { useState } from "react";
import { placesSearch, getHeritageFunction } from "@/lib/ai.functions";
import type { Place } from "@/lib/places-engine.server";
import { LoadingLines, SectionTitle, StatusPill } from "@/components/bits";
import { PageHeader } from "@/components/role-shell";

export const Route = createFileRoute("/tourist/places")({
  head: () => ({
    meta: [
      { title: "Discover Zimbabwe — The Zimbabwean Table" },
      {
        name: "description",
        content: "Discover real restaurants, heritage sites, and cultural attractions across Zimbabwe.",
      },
      { property: "og:title", content: "Discover Zimbabwe — The Zimbabwean Table" },
      { property: "og:description", content: "Multi-source database of verified Zimbabwe places." },
    ],
  }),
  component: RealPlaces,
});

const CITIES = ["Harare", "Bulawayo", "Victoria Falls", "Mutare", "Gweru", "Masvingo"];
const CATEGORIES = [
  { value: "restaurant", label: "Restaurants" },
  { value: "cafe", label: "Cafes" },
  { value: "market", label: "Markets" },
  { value: "heritage_site", label: "Heritage Sites" },
  { value: "accommodation", label: "Accommodation" },
  { value: "cultural_center", label: "Cultural Centers" },
] as const;

function RealPlaces() {
  const search = useServerFn(placesSearch);
  const getHeritage = useServerFn(getHeritageFunction);
  const [region, setRegion] = useState("Harare");
  const [category, setCategory] = useState<string>("");
  const [query, setQuery] = useState("");
  const [heritage, setHeritage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);

  const runSearch = async () => {
    setLoading(true);
    try {
      const results = await search({
        data: {
          query: query || undefined,
          category: category as any || undefined,
          region: region as any,
          heritage: heritage || undefined,
          verified: undefined,
          limit: 30,
        },
      });
      setPlaces(results);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const showHeritage = async () => {
    setLoading(true);
    try {
      const results = await getHeritage({ data: { city: region } });
      setPlaces(results);
      setHeritage(true);
    } catch (err) {
      console.error("Heritage fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Real-time discovery"
        title="Discover Zimbabwe"
        subtitle="Restaurants, heritage sites, markets and more from Foursquare Places API"
      />

      <div className="surface-card p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium">
            City/Region
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="mt-1 w-full rounded-xl border border-input bg-background p-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium">
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-xl border border-input bg-background p-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-3 block text-sm font-medium">
          Search
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="traditional food, museum, market..."
            className="mt-1 w-full rounded-xl border border-input bg-background p-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void runSearch()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-clay px-5 py-2.5 text-sm font-semibold text-clay-foreground transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            <Search className="size-4" aria-hidden />
            {loading ? "Searching..." : "Search All Sources"}
          </button>
          
          <button
            type="button"
            onClick={() => void showHeritage()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            <Sparkles className="size-4" aria-hidden />
            Heritage Sites
          </button>
        </div>
      </div>

      <div className="mt-6">
        {loading ? <LoadingLines lines={3} label="Searching multiple sources..." /> : null}

        {!loading && places.length > 0 ? (
          <div className="animate-rise">
            <SectionTitle 
              title={`${places.length} places found`} 
              subtitle="Real-time data from Foursquare Places API"
            />
            <div className="space-y-3">
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </div>
        ) : null}

        {!loading && places.length === 0 && region ? (
          <div className="surface-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No places found. Try a different search or browse heritage sites.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PlaceCard({ place }: { place: Place }) {
  const sourceLabel: Record<typeof place.source, string> = {
    curated: "Verified Local",
    foursquare: "Foursquare",
    google: "Google Places",
    osm: "OpenStreetMap",
    wikidata: "Wikidata Heritage",
  };

  const categoryLabel: Record<typeof place.category, string> = {
    restaurant: "Restaurant",
    cafe: "Cafe",
    market: "Market",
    heritage_site: "Heritage Site",
    accommodation: "Accommodation",
    cultural_center: "Cultural Center",
    farm: "Farm",
    attraction: "Attraction",
    activity: "Activity",
  };

  const hasPhoto = place.photos && place.photos.length > 0;

  return (
    <article className="surface-card overflow-hidden">
      {hasPhoto && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={place.photos![0]}
            alt={place.name}
            className="size-full object-cover transition-transform hover:scale-105"
            loading="lazy"
          />
          {place.verified && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-leaf/90 px-2.5 py-1 text-xs font-semibold text-leaf-foreground backdrop-blur-sm">
              <Check className="size-3" aria-hidden /> Verified
            </span>
          )}
          {place.heritage && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-gold/90 px-2.5 py-1 text-xs font-semibold text-gold-foreground backdrop-blur-sm">
              <Sparkles className="size-3" aria-hidden /> Heritage
            </span>
          )}
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-display text-base leading-snug">{place.name}</h3>
              {!hasPhoto && place.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-leaf/10 px-2 py-0.5 text-xs font-medium text-leaf">
                  <Check className="size-3" aria-hidden /> Verified
                </span>
              )}
              {!hasPhoto && place.heritage && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold-foreground">
                  <Sparkles className="size-3" aria-hidden /> Heritage
                </span>
              )}
            </div>

            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" aria-hidden />
              {place.location.address || `${place.location.city}, ${place.location.region}`}
            </p>

            {place.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{place.description}</p>
            )}

            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                {categoryLabel[place.category]}
              </span>
              <span className="rounded-full bg-secondary/60 px-2.5 py-1 text-xs text-secondary-foreground">
                {sourceLabel[place.source]}
              </span>
              {place.rating && (
                <span className="rounded-full bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold-foreground">
                  ★ {place.rating}
                </span>
              )}
              {place.priceRange && (
                <span className="rounded-full bg-clay/10 px-2.5 py-1 text-xs font-medium text-clay">
                  {place.priceRange}
                </span>
              )}
            </div>

            {place.features && place.features.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {place.features.slice(0, 4).map((feature) => (
                  <span
                    key={feature}
                    className="text-xs text-muted-foreground"
                  >
                    • {feature}
                  </span>
                ))}
              </div>
            )}

            {place.culture && place.culture.length > 0 && (
              <p className="mt-2 text-xs italic text-muted-foreground">
                Culture: {place.culture.join(", ")}
              </p>
            )}
          </div>
        </div>

        {place.location.coordinates && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${place.location.coordinates.lat},${place.location.coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-clay hover:underline"
          >
            View on map <ExternalLink className="size-3" aria-hidden />
          </a>
        )}
      </div>
    </article>
  );
}
