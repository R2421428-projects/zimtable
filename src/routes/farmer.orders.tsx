import { createFileRoute } from "@tanstack/react-router";
import { Check, Clock, PackageCheck, RotateCcw, ShoppingBasket, Truck, X } from "lucide-react";
import { ACTIVE_FARMER_ID, ORDER_LABEL, type OrderStatus } from "@/lib/domain";
import { useStore } from "@/lib/store";
import { EmptyState, SectionTitle, StatusPill } from "@/components/bits";
import { PageHeader } from "@/components/role-shell";

export const Route = createFileRoute("/farmer/orders")({
  head: () => ({
    meta: [
      { title: "Orders — Farmer — The Zimbabwean Table" },
      { name: "description", content: "Accept and track hospitality orders." },
      { property: "og:title", content: "Orders — Farmer — The Zimbabwean Table" },
      {
        property: "og:description",
        content: "Manage incoming orders from restaurants and hotels.",
      },
    ],
  }),
  component: FarmerOrders,
});

const STATUS_ICON: Record<OrderStatus, typeof Check> = {
  new: ShoppingBasket,
  accepted: Check,
  ready: PackageCheck,
  delivered: Truck,
  completed: Clock,
};

const STATUS_TONE: Record<OrderStatus, "neutral" | "good" | "warn" | "bad"> = {
  new: "neutral",
  accepted: "warn",
  ready: "warn",
  delivered: "good",
  completed: "good",
};

function FarmerOrders() {
  const { state, advanceOrder, dispatch } = useStore();
  const myOrders = state.orders.filter((o) => o.farmerId === ACTIVE_FARMER_ID && !o.declined);

  return (
    <div>
      <PageHeader
        eyebrow="Incoming orders"
        title="Orders from kitchens"
        subtitle="Accept, prepare and deliver"
      />

      {myOrders.length ? (
        <div className="space-y-3">
          {myOrders.map((order) => {
            const Icon = STATUS_ICON[order.status];
            return (
              <article key={order.id} className="surface-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-full bg-secondary text-secondary-foreground">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div>
                      <h3 className="text-display text-base">{order.businessName}</h3>
                      <p className="text-xs text-muted-foreground">
                        Order {order.id} · {order.createdAt}
                      </p>
                    </div>
                  </div>
                  <StatusPill tone={STATUS_TONE[order.status]}>
                    {ORDER_LABEL[order.status]}
                  </StatusPill>
                </div>

                {order.note ? (
                  <p className="mt-2 text-xs text-muted-foreground">{order.note}</p>
                ) : null}

                <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
                  {order.items.map((item) => (
                    <li
                      key={item.produceId}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                    >
                      <span>{item.name}</span>
                      <span className="text-muted-foreground">
                        {item.quantity} {item.unit}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-display text-sm text-clay">${order.total.toFixed(2)}</p>
                  <div className="flex gap-2">
                    {order.status !== "completed" ? (
                      <button
                        type="button"
                        onClick={() => advanceOrder(order.id)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-clay px-3 py-1.5 text-xs font-semibold text-clay-foreground"
                      >
                        <RotateCcw className="size-3.5" aria-hidden /> Advance
                      </button>
                    ) : null}
                    {order.status === "new" ? (
                      <button
                        type="button"
                        onClick={() => dispatch({ type: "declineOrder", id: order.id })}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium"
                      >
                        <X className="size-3.5" aria-hidden /> Decline
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          emoji="📦"
          title="No orders yet"
          body="Hospitality partners will place orders from your produce listings."
        />
      )}
    </div>
  );
}
