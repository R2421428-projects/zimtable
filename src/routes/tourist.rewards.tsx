import { createFileRoute } from "@tanstack/react-router";
import { Check, Lock } from "lucide-react";
import { nextTier, REWARDS, TIERS, tierFor } from "@/lib/domain";
import { useStore } from "@/lib/store";
import { AnimatedNumber, SectionTitle, StatusPill } from "@/components/bits";
import { PageHeader } from "@/components/role-shell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tourist/rewards")({
  head: () => ({
    meta: [
      { title: "Culinary Passport & Rewards — The Zimbabwean Table" },
      {
        name: "description",
        content: "Track culinary points, tier benefits and passport stamps as you eat your way across Zimbabwe.",
      },
      { property: "og:title", content: "Culinary Passport & Rewards — The Zimbabwean Table" },
      { property: "og:description", content: "Bronze to Platinum tiers, regional stamps and unlocked experiences." },
    ],
  }),
  component: Rewards,
});

function Rewards() {
  const { state } = useStore();
  const tier = tierFor(state.points);
  const next = nextTier(state.points);
  const earned = state.passport.filter((p) => p.earned).length;

  return (
    <div>
      <PageHeader eyebrow="Culinary passport" title="Your journey rewards" subtitle="Points earned by eating locally" />

      <div className="bg-night animate-rise rounded-3xl p-5 text-primary-foreground shadow-lift">
        <p className="text-xs font-semibold tracking-widest uppercase opacity-70">Total points</p>
        <p className="text-display text-4xl">
          <AnimatedNumber value={state.points} />
        </p>
        <p className="mt-1 text-sm opacity-85">{tier} tier</p>
        {next ? (
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-background/20">
              <div
                className="h-full rounded-full bg-gold transition-[width] duration-700"
                style={{ width: `${Math.min(100, Math.round((state.points / next.min) * 100))}%` }}
              />
            </div>
            <p className="mt-2 text-xs opacity-85">
              {next.min - state.points} points until {next.tier}
            </p>
          </div>
        ) : null}
      </div>

      <section className="mt-8">
        <SectionTitle title="Passport stamps" subtitle={`${earned} of ${state.passport.length} collected`} />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {state.passport.map((p) => (
            <div
              key={p.id}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl border p-3 text-center",
                p.earned ? "border-clay bg-clay/10" : "border-dashed border-border opacity-60",
              )}
            >
              <span className="text-xl" aria-hidden>
                {p.earned ? "🛂" : "○"}
              </span>
              <span className="text-[11px] font-medium leading-tight">{p.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle title="Tier benefits" subtitle="Benefits unlock automatically as you climb" />
        <div className="space-y-3">
          {TIERS.map((t) => {
            const unlocked = state.points >= t.min;
            return (
              <article key={t.tier} className={cn("surface-card p-4", !unlocked && "opacity-70")}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-display text-base">{t.tier}</h3>
                  <StatusPill tone={unlocked ? "good" : "neutral"}>
                    {unlocked ? "Unlocked" : `${t.min.toLocaleString()} points`}
                  </StatusPill>
                </div>
                <ul className="mt-2 space-y-1">
                  {t.benefits.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-muted-foreground">
                      {unlocked ? (
                        <Check className="size-3.5 shrink-0 text-leaf" aria-hidden />
                      ) : (
                        <Lock className="size-3.5 shrink-0" aria-hidden />
                      )}
                      {b}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle title="Experiences you can unlock" subtitle="Milestones on the way to Platinum" />
        <div className="grid gap-3 sm:grid-cols-2">
          {REWARDS.map((r) => {
            const unlocked = state.points >= r.cost;
            return (
              <article key={r.id} className={cn("surface-card flex items-start gap-3 p-4", !unlocked && "opacity-70")}>
                <span className="text-2xl" aria-hidden>
                  {r.emoji}
                </span>
                <div className="min-w-0">
                  <h3 className="text-display text-base leading-snug">{r.name}</h3>
                  <p className="text-sm text-muted-foreground">{r.detail}</p>
                  <p className="mt-1 text-xs font-semibold text-clay">
                    {unlocked ? "Unlocked at your level" : `${(r.cost - state.points).toLocaleString()} points to go`}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle title="Points history" />
        <ul className="surface-card divide-y divide-border">
          {state.transactions.slice(0, 10).map((tx) => (
            <li key={tx.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{tx.label}</p>
                <p className="text-xs text-muted-foreground">{tx.at}</p>
              </div>
              <span className={cn("text-display text-sm", tx.points >= 0 ? "text-leaf" : "text-destructive")}>
                {tx.points >= 0 ? `+${tx.points}` : tx.points}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
