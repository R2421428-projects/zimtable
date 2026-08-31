import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, WandSparkles } from "lucide-react";
import { useState } from "react";
import { aiDiscover } from "@/lib/ai.functions";
import type { DiscoveryResult } from "@/lib/ai.server";
import { EXPERIENCES, money } from "@/lib/domain";
import { useStore } from "@/lib/store";
import { LoadingLines, SectionTitle, StatusPill } from "@/components/bits";
import { PageHeader } from "@/components/role-shell";

export const Route = createFileRoute("/tourist/ai")({
  head: () => ({
    meta: [
      { title: "AI Culinary Concierge — The Zimbabwean Table" },
      {
        name: "description",
        content: "Describe your taste and budget; AI matches you with authentic Zimbabwean food experiences.",
      },
      { property: "og:title", content: "AI Culinary Concierge — The Zimbabwean Table" },
      { property: "og:description", content: "AI-matched Zimbabwean food experiences, grounded in real partner tables." },
    ],
  }),
  component: AiDiscovery,
});

const PROMPTS = [
  "I want traditional food in Harare under $30",
  "Show me a farm-to-table lunch outside the city",
  "I'm curious about indigenous ingredients and desserts",
  "A hands-on cooking class in Bulawayo",
];

function AiDiscovery() {
  const { dispatch } = useStore();
  const discover = useServerFn(aiDiscover);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiscoveryResult | null>(null);

  const run = async (text: string) => {
    const q = text.trim();
    if (q.length < 3) return;
    setQuery(q);
    setLoading(true);
    setError(null);
    dispatch({ type: "prompt", text: q });
    try {
      setResult(await discover({ data: { query: q } }));
    } catch {
      setError("The concierge couldn't answer just now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="AI concierge"
        title="Tell us how you want to eat"
        subtitle="Answers come only from verified partner tables — never invented."
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run(query);
        }}
        className="surface-card p-4"
      >
        <label htmlFor="ai-query" className="text-sm font-medium">
          What are you in the mood for?
        </label>
        <textarea
          id="ai-query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={3}
          placeholder="I want traditional food in Harare under $30"
          className="mt-2 w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="submit"
          disabled={loading || query.trim().length < 3}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-clay px-5 py-3 text-sm font-semibold text-clay-foreground transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          <WandSparkles className="size-4" aria-hidden />
          {loading ? "Finding your table…" : "Find my experience"}
        </button>
      </form>

      <div className="scroll-row no-bar mt-3">
        {PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => void run(p)}
            className="shrink-0 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium whitespace-nowrap"
          >
            {p}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? <LoadingLines lines={4} label="Matching you with Zimbabwean tables…" /> : null}
        {error ? <p className="surface-card p-4 text-sm text-destructive">{error}</p> : null}

        {result && !loading ? (
          <div className="animate-rise">
            <SectionTitle
              title="Your matches"
              action={
                <StatusPill tone={result.source === "ai" ? "good" : "warn"}>
                  {result.source === "ai" ? "AI matched" : "Offline matching"}
                </StatusPill>
              }
            />
            <p className="mb-4 text-sm text-muted-foreground">{result.intro}</p>
            <div className="space-y-4">
              {result.matches.map((m) => {
                const exp = EXPERIENCES.find((e) => e.id === m.experienceId);
                if (!exp) return null;
                return (
                  <article key={m.experienceId} className="surface-card overflow-hidden">
                    <div className="flex gap-3 p-3">
                      <img
                        src={exp.image}
                        alt={exp.name}
                        loading="lazy"
                        className="size-24 shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0">
                        <h3 className="text-display text-base leading-snug">{m.headline}</h3>
                        <p className="text-xs text-muted-foreground">
                          {exp.city} · {money(exp.price)} · {exp.rating}★
                        </p>
                        <ul className="mt-2 space-y-1">
                          {m.reasons.slice(0, 4).map((r) => (
                            <li key={r} className="flex items-center gap-1.5 text-xs text-foreground">
                              <Sparkles className="size-3 text-clay" aria-hidden /> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <Link
                      to="/tourist/experience/$id"
                      params={{ id: exp.id }}
                      className="block border-t border-border px-4 py-3 text-sm font-semibold text-clay"
                    >
                      View this experience
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
