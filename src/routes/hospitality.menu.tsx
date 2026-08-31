import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ChefHat, Save, ShoppingBasket, WandSparkles, ArrowRight, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { aiGenerateMenu } from "@/lib/ai.functions";
import type { MenuResult } from "@/lib/ai.server";
import { PRODUCE, money } from "@/lib/domain";
import { useStore, type SavedMenu } from "@/lib/store";
import { EmptyState, LoadingLines, SectionTitle, StatusPill } from "@/components/bits";
import { PageHeader } from "@/components/role-shell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hospitality/menu")({
  head: () => ({
    meta: [
      { title: "AI Seasonal Menu — Hospitality — The Zimbabwean Table" },
      {
        name: "description",
        content: "Generate a Zimbabwean seasonal menu from live farmer produce.",
      },
      { property: "og:title", content: "AI Seasonal Menu — Hospitality — The Zimbabwean Table" },
      {
        property: "og:description",
        content: "Turn available produce into a culturally rooted tasting menu.",
      },
    ],
  }),
  component: AiMenu,
});

const SEASONS = ["Spring", "Summer", "Autumn", "Winter"];
const STYLES = ["Fine dining", "Casual bistro", "Tasting menu", "Family-style"];

function AiMenu() {
  const { state, dispatch } = useStore();
  const generate = useServerFn(aiGenerateMenu);
  const [season, setSeason] = useState("Autumn");
  const [style, setStyle] = useState("Tasting menu");
  const [audience, setAudience] = useState("Tourists seeking authentic Zimbabwean flavours");
  const [courses, setCourses] = useState(4);
  const [targetPrice, setTargetPrice] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MenuResult | null>(null);

  const usable = state.produce.filter((p) => p.status !== "out" && p.quantity > 0);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(
        await generate({
          data: {
            season,
            style,
            audience,
            courses,
            targetPrice,
            produce: usable.map((p) => ({
              name: p.name,
              quantity: p.quantity,
              unit: p.unit,
              price: p.price,
              status: p.status,
              harvest: p.harvest,
            })),
          },
        }),
      );
    } catch {
      setError("The menu generator couldn't respond. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveMenu = () => {
    if (!result) return;
    const menu: SavedMenu = {
      id: `menu-${Date.now()}`,
      title: result.title,
      season,
      createdAt: new Date().toLocaleDateString(),
      courses: result.courses,
    };
    dispatch({ type: "saveMenu", menu });
  };

  const orderFromMenu = () => {
    if (!result) return;
    const items = result.courses
      .flatMap((c) => c.produceUsed)
      .reduce<Record<string, number>>((acc, name) => {
        const p = state.produce.find((x) => x.name.toLowerCase() === name.toLowerCase());
        if (!p) return acc;
        acc[p.id] = (acc[p.id] ?? 0) + 1;
        return acc;
      }, {});
    const orderItems = Object.entries(items)
      .map(([id, qty]) => {
        const p = state.produce.find((x) => x.id === id);
        if (!p) return null;
        return {
          produceId: p.id,
          name: p.name,
          quantity: qty,
          unit: p.unit as string,
          price: p.price,
        };
      })
      .filter(Boolean) as {
      produceId: string;
      name: string;
      quantity: number;
      unit: string;
      price: number;
    }[];
    if (orderItems.length) dispatch({ type: "placeOrder", items: orderItems });
  };

  return (
    <div>
      <PageHeader
        eyebrow="AI menu planner"
        title="Seasonal menu generator"
        subtitle="Build a Zimbabwean menu from live produce"
      />

      <div className="surface-card p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Season
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="mt-1 w-full rounded-xl border border-input bg-background p-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {SEASONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Style
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-input bg-background p-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {STYLES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            Audience
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="mt-1 w-full rounded-xl border border-input bg-background p-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="text-sm font-medium">
            Courses
            <div className="mt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCourses((c) => Math.max(2, c - 1))}
                className="grid size-9 place-items-center rounded-full border border-border"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-6 text-center">{courses}</span>
              <button
                type="button"
                onClick={() => setCourses((c) => Math.min(6, c + 1))}
                className="grid size-9 place-items-center rounded-full border border-border"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </label>
          <label className="text-sm font-medium">
            Target price per course
            <input
              type="range"
              min={4}
              max={30}
              step={1}
              value={targetPrice}
              onChange={(e) => setTargetPrice(Number(e.target.value))}
              className="mt-3 w-full accent-clay"
            />
            <span className="text-xs text-muted-foreground">{money(targetPrice)}</span>
          </label>
        </div>

        <button
          type="button"
          onClick={() => void run()}
          disabled={loading || usable.length === 0}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-clay px-5 py-3 text-sm font-semibold text-clay-foreground transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          <WandSparkles className="size-4" aria-hidden />
          {loading ? "Designing your menu…" : "Generate seasonal menu"}
        </button>
      </div>

      {usable.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            emoji="🌾"
            title="No produce available"
            body="Check the produce page or wait for farmer inventory to refresh."
            action={
              <Link to="/hospitality/produce" className="text-sm font-semibold text-clay">
                Browse produce
              </Link>
            }
          />
        </div>
      ) : null}

      <div className="mt-6">
        {loading ? <LoadingLines lines={4} label="AI is designing a Zimbabwean menu…" /> : null}
        {error ? <p className="surface-card p-4 text-sm text-destructive">{error}</p> : null}

        {result && !loading ? (
          <div className="animate-rise">
            <SectionTitle
              title={result.title}
              action={
                <StatusPill tone={result.source === "ai" ? "good" : "warn"}>
                  {result.source === "ai" ? "AI generated" : "Offline menu"}
                </StatusPill>
              }
              subtitle={result.note}
            />
            <div className="space-y-3">
              {result.courses.map((c, i) => (
                <article key={i} className="surface-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold tracking-widest text-clay uppercase">
                        {c.course}
                      </p>
                      <h3 className="text-display text-base">{c.dish}</h3>
                    </div>
                    <span className="text-display text-sm text-clay">{money(c.price)}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {c.produceUsed.map((name) => (
                      <span
                        key={name}
                        className="rounded-full bg-leaf/10 px-2.5 py-1 text-xs font-medium text-leaf"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-xs italic text-muted-foreground">{c.culture}</p>
                </article>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={saveMenu}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium"
              >
                <Save className="size-4" aria-hidden /> Save menu
              </button>
              <button
                type="button"
                onClick={orderFromMenu}
                className="inline-flex items-center gap-2 rounded-full bg-clay px-4 py-2 text-sm font-semibold text-clay-foreground"
              >
                <ShoppingBasket className="size-4" aria-hidden /> Order produce
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {state.menus.length > 0 ? (
        <section className="mt-8">
          <SectionTitle title="Saved menus" />
          <div className="grid gap-3 sm:grid-cols-2">
            {state.menus.map((m) => (
              <article key={m.id} className="surface-card p-4">
                <p className="text-[11px] font-semibold tracking-widest text-clay uppercase">
                  {m.season}
                </p>
                <h3 className="text-display text-base">{m.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {m.courses.length} courses · {m.createdAt}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <Link
        to="/hospitality/orders"
        className="surface-card mt-6 flex items-center gap-3 p-4 transition-shadow hover:shadow-lift"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
          <ShoppingBasket className="size-5" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="text-display block text-base">View orders</span>
          <span className="block text-sm text-muted-foreground">
            Track status from accepted to delivered.
          </span>
        </span>
        <ArrowRight className="ml-auto size-4 shrink-0 text-clay" aria-hidden />
      </Link>
    </div>
  );
}
