import { createFileRoute } from "@tanstack/react-router";
import { Package, Save } from "lucide-react";
import { useState } from "react";
import { ACTIVE_FARMER_ID, PRODUCE, type ProduceStatus } from "@/lib/domain";
import { useStore } from "@/lib/store";
import { EmptyState, SectionTitle, StatusPill } from "@/components/bits";
import { PageHeader } from "@/components/role-shell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/farmer/produce")({
  head: () => ({
    meta: [
      { title: "Produce — Farmer — The Zimbabwean Table" },
      { name: "description", content: "Update farm inventory and availability." },
      { property: "og:title", content: "Produce — Farmer — The Zimbabwean Table" },
      { property: "og:description", content: "Manage what's available, low or out of stock." },
    ],
  }),
  component: FarmerProduce,
});

const STATUS_TONE: Record<ProduceStatus, "good" | "warn" | "bad" | "neutral"> = {
  available: "good",
  seasonal: "warn",
  low: "warn",
  out: "bad",
};

function FarmerProduce() {
  const { state, dispatch } = useStore();
  const myProduce = state.produce.filter((p) => p.farmerId === ACTIVE_FARMER_ID);
  const [edits, setEdits] = useState<Record<string, { quantity: number; status: ProduceStatus }>>(
    {},
  );

  const update = (id: string, patch: Partial<{ quantity: number; status: ProduceStatus }>) => {
    setEdits((prev) => {
      const current = prev[id] ?? {
        quantity: myProduce.find((p) => p.id === id)?.quantity ?? 0,
        status: myProduce.find((p) => p.id === id)?.status ?? "available",
      };
      return { ...prev, [id]: { ...current, ...patch } };
    });
  };

  const save = (id: string) => {
    const p = myProduce.find((x) => x.id === id);
    const patch = edits[id];
    if (!p || !patch) return;
    dispatch({ type: "upsertProduce", produce: { ...p, ...patch } });
    setEdits((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Inventory"
        title="Your produce"
        subtitle="Update quantities and availability"
      />

      {myProduce.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {myProduce.map((p) => {
            const edit = edits[p.id];
            const quantity = edit?.quantity ?? p.quantity;
            const status = edit?.status ?? p.status;
            const dirty = edit !== undefined;
            return (
              <article key={p.id} className="surface-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden>
                      {p.emoji}
                    </span>
                    <div>
                      <h3 className="text-display text-base">{p.name}</h3>
                      <p className="text-xs text-muted-foreground">{p.category}</p>
                    </div>
                  </div>
                  <StatusPill tone={STATUS_TONE[status]}>{status}</StatusPill>
                </div>

                <label className="mt-3 block text-xs font-medium text-muted-foreground">
                  Quantity ({p.unit})
                  <input
                    type="number"
                    min={0}
                    value={quantity}
                    onChange={(e) =>
                      update(p.id, { quantity: Math.max(0, Number(e.target.value)) })
                    }
                    className="mt-1 w-full rounded-xl border border-input bg-background p-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </label>

                <label className="mt-3 block text-xs font-medium text-muted-foreground">
                  Status
                  <select
                    value={status}
                    onChange={(e) => update(p.id, { status: e.target.value as ProduceStatus })}
                    className="mt-1 w-full rounded-xl border border-input bg-background p-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="available">Available</option>
                    <option value="seasonal">Seasonal</option>
                    <option value="low">Low</option>
                    <option value="out">Out of stock</option>
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() => save(p.id)}
                  disabled={!dirty}
                  className={cn(
                    "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    dirty ? "bg-leaf text-leaf-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  <Save className="size-4" aria-hidden /> Save
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          emoji="🌾"
          title="No produce listed"
          body="Your farm inventory appears here once seeded."
        />
      )}

      <div className="surface-card mt-6 flex items-center gap-3 p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
          <Package className="size-5" aria-hidden />
        </span>
        <p className="text-sm text-muted-foreground">
          When hospitality orders are marked delivered, your quantities update automatically.
        </p>
      </div>
    </div>
  );
}
