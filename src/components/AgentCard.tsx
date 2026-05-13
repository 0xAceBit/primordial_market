import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Heart, TrendingUp, Sparkles } from "lucide-react";
import type { Agent } from "@/lib/contracts/marketplace";
import { formatOG, truncateAddress } from "@/lib/format";

type Props = {
  agent: Agent;
  index?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (id: bigint) => void;
  isNew?: boolean;
};

export function AgentCard({ agent, index = 0, isFavorite, onToggleFavorite, isNew }: Props) {
  const hot = Number(agent.sales) >= 70;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="relative"
    >
      {/* gradient sweep top border */}
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-foreground/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <Link
        to="/agents/$id"
        params={{ id: agent.id.toString() }}
        className="group relative flex h-full flex-col justify-between border border-border bg-card p-6 transition-all duration-300 hover:border-foreground hover:shadow-[0_20px_40px_-24px_rgba(0,0,0,0.25)]"
      >
        {/* ribbons */}
        <div className="absolute left-0 top-0 flex gap-1 p-3">
          {isNew && (
            <span className="inline-flex items-center gap-1 bg-foreground px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-background">
              <Sparkles className="h-3 w-3" /> New
            </span>
          )}
          {hot && (
            <span className="inline-flex items-center gap-1 border border-border bg-background/80 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] backdrop-blur">
              <TrendingUp className="h-3 w-3" /> Trending
            </span>
          )}
        </div>

        {/* favorite */}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(agent.id);
            }}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full border border-border bg-background/70 backdrop-blur transition-all hover:scale-110 hover:border-foreground active:scale-95"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isFavorite ? "fill-foreground text-foreground" : "text-muted-foreground"
              }`}
            />
          </button>
        )}

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {agent.category}
            </span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
          </div>
          <h3 className="mt-6 font-display text-3xl leading-tight">{agent.name}</h3>
          <p className="mt-3 line-clamp-3 text-sm font-normal text-muted-foreground">
            {agent.description}
          </p>
        </div>

        <div className="mt-8 flex items-end justify-between border-t border-border pt-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Price</p>
            <p className="mt-1 font-display text-xl">{formatOG(agent.price)}</p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 border border-border px-2 py-1 text-[11px] font-normal text-muted-foreground">
              ▲ {agent.sales.toString()} sales
            </span>
            <p className="mt-1.5 font-mono text-[11px] font-normal text-foreground">
              {truncateAddress(agent.owner)}
            </p>
          </div>
        </div>

        {/* hover affordance */}
        <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full bg-foreground px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-background opacity-0 transition-all duration-300 group-hover:-translate-y-3 group-hover:opacity-100">
          View details →
        </div>
      </Link>
    </motion.div>
  );
}

export function AgentCardSkeleton() {
  return (
    <div className="relative h-72 overflow-hidden border border-border bg-muted/30">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
    </div>
  );
}

export function AgentRow({
  agent,
  index = 0,
  isFavorite,
  onToggleFavorite,
}: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
    >
      <Link
        to="/agents/$id"
        params={{ id: agent.id.toString() }}
        className="group grid grid-cols-12 items-center gap-4 border-b border-border px-2 py-4 text-sm transition-colors hover:bg-muted/40"
      >
        <div className="col-span-4">
          <p className="font-display text-lg leading-tight">{agent.name}</p>
          <p className="mt-0.5 line-clamp-1 text-xs font-normal text-muted-foreground">
            {agent.description}
          </p>
        </div>
        <div className="col-span-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {agent.category}
        </div>
        <div className="col-span-2 font-display">{formatOG(agent.price)}</div>
        <div className="col-span-2 text-xs font-normal text-muted-foreground">
          ▲ {agent.sales.toString()} sales
        </div>
        <div className="col-span-1 font-mono text-[11px] font-normal">
          {truncateAddress(agent.owner)}
        </div>
        <div className="col-span-1 flex items-center justify-end gap-2">
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite(agent.id);
              }}
              aria-label="Toggle favorite"
              className="grid h-8 w-8 place-items-center rounded-full border border-transparent transition-all hover:border-border active:scale-95"
            >
              <Heart
                className={`h-4 w-4 ${
                  isFavorite ? "fill-foreground text-foreground" : "text-muted-foreground"
                }`}
              />
            </button>
          )}
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
        </div>
      </Link>
    </motion.div>
  );
}
