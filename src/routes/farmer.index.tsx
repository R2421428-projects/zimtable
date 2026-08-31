import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Package, ListChecks, Sprout, TrendingUp } from "lucide-react";
import { ACTIVE_FARMER_ID, FARMERS, PRODUCE } from "@/lib/domain";
import { useStore } from "@/lib/store";
import { AnimatedNumber, SectionTitle, StatCard } from "@/components/bits";
import { PageHeader } from "@/components/role-shell";

export const Route = createFileRoute("/farmer/")({
  head: () => ({
    meta: [
      { title: "Home — Farmer — The Zimbabwean Table" },
      { name: "description", content: "Farmer dashboard for produce inventory and incoming orders." },
      { property: "og:title", content: "Home — Farmer — The Zimbabwean Table" },
      { property: "og:description", content: "Manage your farm inventory and hospitality orders." },
    ],
  }),
  component: FarmerHome,
});

function FarmerHome() {
  const { state } = useStore();
  const farmer = FARMERS.find((f) => f.id === ACTIVE_FARMER_ID)!;
  const myProduce = state.produce.filter((p) => p.farmerId === ACTIVE_FARMER_ID);
  const myOrders = state.orders.filter((o) => o.farmerId === ACTIVE_FARMER_ID && !o.declined);
  const totalKg = myProduce.reduce((sum, p) => sum + (p.unit === "kg" ? p.quantity : 0), 0);

  return (
    <div>
      <PageHeader eyebrow={farmer.farm} title="Farmer dashboard" subtitle={farmer.location} />

      <div className="surface-card flex items-center gap-4 p-4">
        <span className="bg-ember grid size-14 place-items-center rounded-full text-xl text-clay-foreground" aria-hidden>
          🌾
        </span>
        <div>
          <p className="text-display text-lg">{farmer.name}</p>
          <p className="text-sm text-muted-foreground">
            Growing since {farmer.since} · {myProduce.length} produce lines
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Produce lines" value={<AnimatedNumber value={myProduce.length} />} icon={<Sprout className="size-4" />} tone="leaf" />
        <StatCard label="Open orders" value={myOrders.filter((o) => o.status !== "completed").length} icon={<ListChecks className="size-4" />} />
        <StatCard label="Total kg listed" value={<AnimatedNumber value={totalKg} />} icon={<Package className="size-4" />} tone="gold" />
        <StatCard label="Completed orders" value={myOrders.filter((o) => o.status === "completed").length} icon={<TrendingUp className="size-4" />} tone="leaf" />
      </div>

      <section className="mt-8">
        <SectionTitle title="Your produce this week" action={<Link to="/farmer/produce" className="text-sm font-semibold text-clay">Manage inventory</Link>} />
        <div className="grid gap-3 sm:grid-cols-2">
          {myProduce.map((p) => (
            <article key={p.id} className="surface-card p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden>{p.emoji}</span>
                <div>
                  <h3 className="text-display text-base">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{p.quantity} {p.unit} · {p.status}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Link to="/farmer/orders" className="surface-card mt-6 flex items-center gap-3 p-4 transition-shadow hover:shadow-lift">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-clay text-clay-foreground">
          <ListChecks className="size-5" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="text-display block text-base">View incoming orders</span>
          <span className="block text-sm text-muted-foreground">Accept, prepare and mark orders as delivered.</span>
        </span>
        <ArrowRight className="ml-auto size-4 shrink-0 text-clay" aria-hidden />
      </Link>
    </div>
  );
}
