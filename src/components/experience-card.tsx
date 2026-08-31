import { Link } from "@tanstack/react-router";
import { Bookmark, Clock, MapPin, Star } from "lucide-react";
import { duration, money, type Experience } from "@/lib/domain";
import { useStore } from "@/lib/store";
import { StatusPill } from "@/components/bits";
import { cn } from "@/lib/utils";

export function ExperienceCard({ exp, compact = false }: { exp: Experience; compact?: boolean }) {
  const { state, dispatch } = useStore();
  const saved = state.saved.includes(exp.id);

  return (
    <article
      className={cn(
        "surface-card group overflow-hidden transition-shadow hover:shadow-lift",
        compact && "w-64 shrink-0 snap-start",
      )}
    >
      <div className="relative">
        <Link to="/tourist/experience/$id" params={{ id: exp.id }} aria-label={`Open ${exp.name}`}>
          <img
            src={exp.image}
            alt={exp.name}
            loading="lazy"
            width={1024}
            height={768}
            className={cn("w-full object-cover", compact ? "h-32" : "h-44")}
          />
        </Link>
        <button
          type="button"
          onClick={() => dispatch({ type: "toggleSave", id: exp.id })}
          aria-label={saved ? `Remove ${exp.name} from saved` : `Save ${exp.name}`}
          aria-pressed={saved}
          className="absolute top-2 right-2 grid size-9 place-items-center rounded-full bg-background/85 text-foreground backdrop-blur transition-transform active:scale-90"
        >
          <Bookmark className={cn("size-4", saved && "fill-clay text-clay")} />
        </button>
        <div className="absolute bottom-2 left-2">
          <StatusPill tone={exp.status === "Available today" ? "good" : "warn"}>
            {exp.status}
          </StatusPill>
        </div>
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-display text-base leading-snug">{exp.name}</h3>
          <span className="text-display shrink-0 text-base text-clay">{money(exp.price)}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden /> {exp.city}
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5 fill-gold text-gold" aria-hidden /> {exp.rating} (
            {exp.reviews})
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden /> {duration(exp.durationMins)}
          </span>
        </div>
        {!compact ? <p className="text-sm text-muted-foreground">{exp.tagline}</p> : null}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-medium text-leaf">{exp.authenticity}</span>
          <Link
            to="/tourist/experience/$id"
            params={{ id: exp.id }}
            className="text-sm font-semibold text-clay underline-offset-4 hover:underline"
          >
            Explore experience
          </Link>
        </div>
      </div>
    </article>
  );
}
