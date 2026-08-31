import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionTitle({
  title,
  action,
  subtitle,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-display text-lg text-foreground">{title}</h2>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const start = performance.now();
    const startValue = from.current;
    const delta = value - startValue;
    if (delta === 0) return;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 700);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(startValue + delta * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <span className={className} aria-live="polite">
      {shown.toLocaleString()}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "gold" | "leaf";
}) {
  return (
    <div className="surface-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        {icon ? (
          <span
            className={cn(
              "grid size-8 place-items-center rounded-full",
              tone === "gold" && "bg-gold/20 text-gold-foreground",
              tone === "leaf" && "bg-leaf/15 text-leaf",
              tone === "default" && "bg-secondary text-secondary-foreground",
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <div className="text-display mt-2 text-2xl">{value}</div>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function EmptyState({
  emoji,
  title,
  body,
  action,
}: {
  emoji: string;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface-card flex flex-col items-center gap-2 px-6 py-10 text-center">
      <span className="text-3xl" aria-hidden>
        {emoji}
      </span>
      <h3 className="text-display text-base">{title}</h3>
      <p className="max-w-xs text-sm text-muted-foreground">{body}</p>
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}

export function LoadingLines({ lines = 3, label }: { lines?: number; label?: string }) {
  return (
    <div className="surface-card space-y-3 p-4" role="status" aria-live="polite">
      {label ? (
        <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className="size-2 animate-pulse rounded-full bg-clay" aria-hidden />
          {label}
        </p>
      ) : null}
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 animate-pulse rounded-full bg-muted"
          style={{ width: `${90 - i * 15}%`, animationDelay: `${i * 90}ms` }}
        />
      ))}
    </div>
  );
}

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "neutral" && "bg-secondary text-secondary-foreground",
        tone === "good" && "bg-leaf/15 text-leaf",
        tone === "warn" && "bg-gold/25 text-gold-foreground",
        tone === "bad" && "bg-destructive/10 text-destructive",
      )}
    >
      {children}
    </span>
  );
}
