import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBasket, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { FARMERS, PRODUCE, type OrderItem, type ProduceStatus, money } from "@/lib/domain";
import { useStore } from "@/lib/store";
import { EmptyState, SectionTitle, StatusPill } from "@/components/bits";
import { PageHeader } from "@/components/role-shell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hospitality/produce")({
  head: () => ({
    meta: [
      { title: "Source Produce — Hospitality — The Zimbabwean Table" },
      { name: "description", content: "Browse and order fresh produce directly from partner farmers." },
      { property: "og:title", content: "Source Produce — Hospitality — The Zimbabwean Table" },
      { property: "og:description", content: "Local sourcing from Zimbabwean smallholder farmers." },
    ],
  }),
  component: HospitalityProduce,
});

const STATUS_TONE: Record<ProduceStatus, "good" | "warn" | "bad" | "neutral"> = {
  available: "good",
  seasonal: "warn",
  low: "warn",
  out: "bad",
};

function HospitalityProduce() {
  const { state, dispatch } = useStore();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<string>("all");

  const categories = Array.from(new Set(PRODUCE.map((p) => p.category)));
  const filtered = PRODUCE.filter((p) => (filter === "all" ? true : p.category === filter));

  const updateCart = (id: string, delta: number) => {
    setCart((prev) => {
      const next = { ...prev, [id]: Math.max(0, (prev[id] ?? 0) + delta) };
      if (next[id] === 0) delete next[id];
      return next;
    });
  };

  const placeOrder = () => {
    const items: OrderItem[] = Object.entries(cart)
      .map(([id, qty]) => {
        const p = PRODUCE.find((x) => x.id === id);
        if (!p || qty <= 0) return null;
        return { produceId: p.id, name: p.name, quantity: qty, unit: p.unit as string, price: p.price };
      })
      .filter((i): i is OrderItem => Boolean(i));
    if (!items.length) return;
    dispatch({ type: "placeOrder", items });
    setCart({});
  };

  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = PRODUCE.find((x) => x.id === id);
    return sum + (p ? p.price * qty : 0);
  }, 0);

  return (
    <div>
      <PageHeader eyebrow="Local sourcing" title="Source from farmers" subtitle="Fresh produce available this week" />

      <div className="surface-card p-4">
        <div className="scroll-row no-bar">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium whitespace-nowrap",
              filter === "all" ? "border-clay bg-clay text-clay-foreground" : "border-border",
            )}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium whitespace-nowrap",
                filter === c ? "border-clay bg-clay text-clay-foreground" : "border-border",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <section className="mt-6">
        <SectionTitle title="Available produce" subtitle={`${filtered.length} lines from partner farms`} />
        {filtered.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((p) => {
              const farmer = FARMERS.find((f) => f.id === p.farmerId);
              const qty = cart[p.id] ?? 0;
              return (
                <article key={p.id} className="surface-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" aria-hidden>
                        {p.emoji}
                      </span>
                      <div>
                        <h3 className="text-display text-base">{p.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {farmer?.farm ?? "Partner farm"} · {p.location}
                        </p>
                      </div>
                    </div>
                    <StatusPill tone={STATUS_TONE[p.status]}>{p.status}</StatusPill>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <span className="text-clay font-semibold">{money(p.price)}</span>
                    <span className="text-muted-foreground">per {p.unit}</span>
                    <span className="text-muted-foreground">· {p.quantity} {p.unit} available</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{p.harvest}</p>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateCart(p.id, -1)}
                      disabled={qty === 0}
                      className="grid size-8 place-items-center rounded-full border border-border disabled:opacity-40"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{qty}</span>
                    <button
                      type="button"
                      onClick={() => updateCart(p.id, 1)}
                      disabled={p.status === "out" || qty >= p.quantity}
                      className="grid size-8 place-items-center rounded-full border border-border disabled:opacity-40"
                    >
                      <Plus className="size-4" />
                    </button>
                    {qty > 0 ? (
                      <button
                        type="button"
                        onClick={() => updateCart(p.id, -qty)}
                        className="ml-auto text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState emoji="🌾" title="No produce matches" body="Try a different category filter." />
        )}
      </section>

      {Object.keys(cart).length > 0 ? (
        <div className="surface-card fixed right-4 bottom-20 left-4 z-30 mx-auto max-w-5xl p-4 md:static md:mt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Order preview</p>
              <p className="text-xs text-muted-foreground">
                {Object.values(cart).reduce((a, b) => a + b, 0)} items · {money(cartTotal)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCart({})}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={placeOrder}
                className="inline-flex items-center gap-2 rounded-full bg-clay px-4 py-2 text-sm font-semibold text-clay-foreground"
              >
                Place order <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>
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
          <span className="block text-sm text-muted-foreground">Track status from accepted to delivered.</span>
        </span>
        <ArrowRight className="ml-auto size-4 shrink-0 text-clay" aria-hidden />
      </Link>
    </div>
  );
}
