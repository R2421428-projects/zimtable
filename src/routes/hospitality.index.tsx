import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp, Users, Wheat, ChefHat, ArrowRight } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DEMAND_INSIGHTS, DEMAND_TREND, POPULAR_DISHES, BUSINESS } from "@/lib/domain";
import { useStore } from "@/lib/store";
import { AnimatedNumber, SectionTitle, StatCard, StatusPill } from "@/components/bits";
import { PageHeader } from "@/components/role-shell";

export const Route = createFileRoute("/hospitality/")({
  head: () => ({
    meta: [
      { title: "Overview — Hospitality — The Zimbabwean Table" },
      { name: "description", content: "Demand AI dashboard for hospitality partners." },
      { property: "og:title", content: "Overview — Hospitality — The Zimbabwean Table" },
      { property: "og:description", content: "See what travellers are searching for and plan your menu." },
    ],
  }),
  component: HospitalityOverview,
});

function HospitalityOverview() {
  const { state } = useStore();
  const promptCount = state.tastePrompts.length;

  return (
    <div>
      <PageHeader
        eyebrow={BUSINESS.name}
        title="Demand dashboard"
        subtitle="What travellers are asking for right now"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Traveller queries"
          value={<AnimatedNumber value={promptCount} />}
          icon={<Users className="size-4" />}
          hint="This month"
        />
        <StatCard
          label="Traditional cuisine interest"
          value="+24%"
          tone="leaf"
          icon={<TrendingUp className="size-4" />}
          hint="vs last month"
        />
        <StatCard
          label="Farm-to-table demand"
          value="+18%"
          tone="gold"
          icon={<Wheat className="size-4" />}
          hint="vs last month"
        />
        <StatCard
          label="Active orders"
          value={state.orders.filter((o) => o.status !== "completed" && !o.declined).length}
          icon={<ChefHat className="size-4" />}
        />
      </div>

      <section className="mt-6 surface-card p-4">
        <SectionTitle title="Demand trend" subtitle="Traditional cuisine vs farm-to-table searches" />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DEMAND_TREND} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="colorTraditional" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--clay)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--clay)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorFarm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--leaf)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--leaf)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-xl)",
                }}
              />
              <Area
                type="monotone"
                dataKey="traditional"
                name="Traditional cuisine"
                stroke="var(--clay)"
                strokeWidth={2}
                fill="url(#colorTraditional)"
              />
              <Area
                type="monotone"
                dataKey="farm"
                name="Farm-to-table"
                stroke="var(--leaf)"
                strokeWidth={2}
                fill="url(#colorFarm)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="surface-card p-4">
          <SectionTitle title="AI demand insights" />
          <ul className="space-y-3">
            {DEMAND_INSIGHTS.map((insight) => (
              <li key={insight.label} className="flex items-start gap-3 rounded-xl border border-border p-3">
                <StatusPill tone={insight.change >= 0 ? "good" : "warn"}>
                  {insight.change >= 0 ? "+" : ""}
                  {insight.change}%
                </StatusPill>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{insight.label}</p>
                  <p className="text-xs text-muted-foreground">{insight.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface-card p-4">
          <SectionTitle title="Popular dishes this week" />
          <ul className="space-y-2">
            {POPULAR_DISHES.map((d, i) => (
              <li key={d.dish} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <span className="text-display w-6 text-sm text-muted-foreground">#{i + 1}</span>
                <span className="min-w-0 flex-1 text-sm font-medium">{d.dish}</span>
                <span className="text-xs text-muted-foreground">{d.searches.toLocaleString()} searches</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Link
        to="/hospitality/menu"
        className="surface-card mt-6 flex items-center gap-3 p-4 transition-shadow hover:shadow-lift"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-clay text-clay-foreground">
          <ChefHat className="size-5" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="text-display block text-base">Generate an AI seasonal menu</span>
          <span className="block text-sm text-muted-foreground">Turn live produce into a Zimbabwean tasting menu.</span>
        </span>
        <ArrowRight className="ml-auto size-4 shrink-0 text-clay" aria-hidden />
      </Link>
    </div>
  );
}
