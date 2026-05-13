import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutGrid,
  List,
  Search,
  Shuffle,
  Sparkles,
  TrendingUp,
  Heart,
  X,
  Flame,
} from "lucide-react";
import { useAgents } from "@/hooks/useMarketplace";
import { AgentCard, AgentCardSkeleton, AgentRow } from "@/components/AgentCard";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatEther } from "viem";
import { formatOG } from "@/lib/format";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace, 0G Agentic" },
      { name: "description", content: "Browse all autonomous agents listed on 0G Mainnet." },
      { property: "og:title", content: "Marketplace, 0G Agentic" },
      { property: "og:description", content: "All agents listed on 0G Mainnet." },
    ],
  }),
  component: MarketplacePage,
});

type Sort = "newest" | "price-asc" | "price-desc" | "popular";
type Preset = "all" | "trending" | "cheap" | "favorites";
type View = "grid" | "list";

const FAV_KEY = "0g-favorites";
const VIEW_KEY = "0g-view";

function categoryGlyph(c: string) {
  const map: Record<string, string> = {
    Research: "🔬",
    DeFi: "📈",
    Data: "🗂️",
    Vision: "👁️",
    Writing: "✍️",
    Ops: "⚙️",
  };
  return map[c] ?? "✦";
}

function MarketplacePage() {
  const { agents, isLoading, isDemo } = useAgents();

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState<Sort>("newest");
  const [preset, setPreset] = useState<Preset>("all");
  const [view, setView] = useState<View>("grid");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(2);
  const searchRef = useRef<HTMLInputElement>(null);

  // hydrate persistence
  useEffect(() => {
    try {
      const v = localStorage.getItem(VIEW_KEY);
      if (v === "grid" || v === "list") setView(v);
      const f = localStorage.getItem(FAV_KEY);
      if (f) setFavorites(new Set(JSON.parse(f)));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {}
  }, [view]);

  useEffect(() => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(favorites)));
    } catch {}
  }, [favorites]);

  // ⌘K focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleFav = (id: bigint) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      const k = id.toString();
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const maxPrice = useMemo(() => {
    if (!agents.length) return 2;
    const max = agents.reduce((m, a) => (a.price > m ? a.price : m), 0n);
    return Math.max(1, Math.ceil(Number(formatEther(max))));
  }, [agents]);

  // initialise price range to full span when agents load
  useEffect(() => {
    setMaxPriceFilter(maxPrice);
  }, [maxPrice]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    agents.forEach((a) => set.add(a.category));
    return ["All", ...Array.from(set)];
  }, [agents]);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    agents.forEach((a) => (m[a.category] = (m[a.category] ?? 0) + 1));
    return m;
  }, [agents]);

  const filtered = useMemo(() => {
    let list = agents.filter((a) => {
      const inCat = category === "All" || a.category === category;
      const inSearch =
        q === "" ||
        a.name.toLowerCase().includes(q.toLowerCase()) ||
        a.description.toLowerCase().includes(q.toLowerCase());
      const priceEth = Number(formatEther(a.price));
      const inPrice = priceEth >= 0 && priceEth <= maxPriceFilter;

      let inPreset = true;
      if (preset === "trending") inPreset = Number(a.sales) >= 50;
      if (preset === "cheap") inPreset = priceEth < 1;
      if (preset === "favorites") inPreset = favorites.has(a.id.toString());

      return inCat && inSearch && inPrice && inPreset;
    });

    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return Number(a.price - b.price);
      if (sort === "price-desc") return Number(b.price - a.price);
      if (sort === "popular") return Number(b.sales - a.sales);
      return Number(b.id - a.id);
    });
    return list;
  }, [agents, q, category, sort, preset, favorites, maxPriceFilter]);

  // stats
  const stats = useMemo(() => {
    const total = agents.length;
    const sales = agents.reduce((s, a) => s + Number(a.sales), 0);
    const creators = new Set(agents.map((a) => a.owner.toLowerCase())).size;
    const avgPrice =
      total === 0
        ? 0n
        : agents.reduce((s, a) => s + a.price, 0n) / BigInt(total);
    return { total, sales, creators, avgPrice };
  }, [agents]);

  // newest = top 2 by id
  const newIds = useMemo(() => {
    const ids = [...agents].sort((a, b) => Number(b.id - a.id)).slice(0, 2).map((a) => a.id.toString());
    return new Set(ids);
  }, [agents]);

  const surpriseMe = () => {
    if (!filtered.length) return;
    const a = filtered[Math.floor(Math.random() * filtered.length)];
    const el = document.getElementById(`agent-${a.id.toString()}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.03)" }, { transform: "scale(1)" }],
      { duration: 700, easing: "cubic-bezier(0.22,1,0.36,1)" },
    );
  };

  const clearAll = () => {
    setQ("");
    setCategory("All");
    setPreset("all");
    setMaxPriceFilter(maxPrice);
  };

  const activeChips: { label: string; onClear: () => void }[] = [];
  if (q) activeChips.push({ label: `“${q}”`, onClear: () => setQ("") });
  if (category !== "All") activeChips.push({ label: category, onClear: () => setCategory("All") });
  if (preset !== "all")
    activeChips.push({
      label: preset === "trending" ? "Trending" : preset === "cheap" ? "Under 1 0G" : "Favorites",
      onClear: () => setPreset("all"),
    });
  if (maxPriceFilter < maxPrice)
    activeChips.push({
      label: `≤ ${maxPriceFilter} 0G`,
      onClear: () => setMaxPriceFilter(maxPrice),
    });

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 text-lg font-serif font-semibold">
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-border pb-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-24 h-80 w-80 rounded-full bg-gradient-to-br from-foreground/10 to-transparent blur-3xl"
        />
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
          The Marketplace
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
          <h1 className="font-display text-5xl sm:text-6xl">All agents</h1>
          <button
            onClick={surpriseMe}
            className="group inline-flex items-center gap-2 border border-foreground bg-foreground px-4 py-2 text-xs uppercase tracking-[0.2em] text-background transition-transform hover:-translate-y-0.5 active:scale-95"
          >
            <Shuffle className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" />
            Surprise me
          </button>
        </div>
        <p className="mt-4 max-w-2xl font-sans text-base font-normal text-muted-foreground">
          Every listing reads directly from the onchain registry on 0G Mainnet.
          Filter, sort, and inspect each agent's provenance.
        </p>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
          <Stat label="Agents" value={stats.total.toString()} />
          <Stat label="Total sales" value={stats.sales.toLocaleString()} />
          <Stat label="Avg price" value={formatOG(stats.avgPrice, 2)} />
          <Stat label="Creators" value={stats.creators.toString()} />
        </div>

        {isDemo && (
          <p className="mt-6 inline-block border border-border bg-muted/40 px-3 py-1 text-xs font-normal text-muted-foreground">
            Demo data · Connect deployed contract to see live agents
          </p>
        )}
      </header>

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-20 -mx-6 mt-8 border-b border-border bg-background/80 px-6 py-4 backdrop-blur-md">
        <div className="flex flex-col gap-3">
          {/* presets row */}
          <div className="flex flex-wrap items-center gap-2">
            <PresetBtn active={preset === "all"} onClick={() => setPreset("all")} icon={<Sparkles className="h-3 w-3" />}>
              All
            </PresetBtn>
            <PresetBtn active={preset === "trending"} onClick={() => setPreset("trending")} icon={<Flame className="h-3 w-3" />}>
              Trending
            </PresetBtn>
            <PresetBtn active={preset === "cheap"} onClick={() => setPreset("cheap")} icon={<TrendingUp className="h-3 w-3" />}>
              Under 1 0G
            </PresetBtn>
            <PresetBtn active={preset === "favorites"} onClick={() => setPreset("favorites")} icon={<Heart className="h-3 w-3" />}>
              Favorites {favorites.size > 0 && <span className="ml-1 opacity-60">({favorites.size})</span>}
            </PresetBtn>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search agents…"
                className="rounded-none border-foreground/20 bg-transparent pl-9 pr-16 font-normal"
              />
              <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground">
                ⌘K
              </kbd>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {categories.map((c) => (
                <motion.button
                  key={c}
                  onClick={() => setCategory(c)}
                  whileTap={{ scale: 0.95 }}
                  className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs uppercase tracking-[0.18em] transition-colors ${
                    category === c
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c !== "All" && <span aria-hidden>{categoryGlyph(c)}</span>}
                  {c}
                  {c !== "All" && counts[c] != null && (
                    <span className="opacity-60">· {counts[c]}</span>
                  )}
                </motion.button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
                <SelectTrigger className="w-[180px] rounded-none border-border font-normal">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Most popular</SelectItem>
                  <SelectItem value="price-asc">Price · Low to high</SelectItem>
                  <SelectItem value="price-desc">Price · High to low</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border border-border">
                <ViewBtn active={view === "grid"} onClick={() => setView("grid")} aria-label="Grid view">
                  <LayoutGrid className="h-4 w-4" />
                </ViewBtn>
                <ViewBtn active={view === "list"} onClick={() => setView("list")} aria-label="List view">
                  <List className="h-4 w-4" />
                </ViewBtn>
              </div>
            </div>
          </div>

          {/* price slider + chips */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full max-w-sm items-center gap-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Max price</span>
              <Slider
                value={[maxPriceFilter]}
                onValueChange={(v) => setMaxPriceFilter(v[0])}
                min={0}
                max={maxPrice}
                step={0.05}
                className="flex-1"
              />
              <span className="font-mono text-[11px] font-normal text-muted-foreground tabular-nums">
                ≤ {maxPriceFilter.toFixed(2)} 0G
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-normal">
              <span className="text-muted-foreground">
                {filtered.length} of {agents.length} agents
              </span>
              <AnimatePresence>
                {activeChips.map((chip) => (
                  <motion.button
                    key={chip.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={chip.onClear}
                    className="inline-flex items-center gap-1 border border-border bg-muted/40 px-2 py-1 text-[11px] uppercase tracking-[0.15em] hover:border-foreground"
                  >
                    {chip.label}
                    <X className="h-3 w-3" />
                  </motion.button>
                ))}
              </AnimatePresence>
              {activeChips.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <AgentCardSkeleton key={i} />
            ))}
          </div>
        ) : view === "grid" ? (
          <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((a, i) => (
                <div key={a.id.toString()} id={`agent-${a.id.toString()}`}>
                  <AgentCard
                    agent={a}
                    index={i}
                    isFavorite={favorites.has(a.id.toString())}
                    onToggleFavorite={toggleFav}
                    isNew={newIds.has(a.id.toString())}
                  />
                </div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="border-t border-border">
            <div className="grid grid-cols-12 gap-4 border-b border-border px-2 py-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <div className="col-span-4">Agent</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-2">Sales</div>
              <div className="col-span-1">Owner</div>
              <div className="col-span-1" />
            </div>
            <AnimatePresence mode="popLayout">
              {filtered.map((a, i) => (
                <div key={a.id.toString()} id={`agent-${a.id.toString()}`}>
                  <AgentRow
                    agent={a}
                    index={i}
                    isFavorite={favorites.has(a.id.toString())}
                    onToggleFavorite={toggleFav}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 border border-dashed border-border py-20 text-center"
          >
            <p className="text-5xl">🪐</p>
            <p className="mt-4 font-display text-2xl">Nothing in this orbit</p>
            <p className="mt-2 text-sm font-normal text-muted-foreground">
              Try clearing your filters and exploring again.
            </p>
            <button
              onClick={clearAll}
              className="mt-6 border border-foreground bg-foreground px-4 py-2 text-xs uppercase tracking-[0.2em] text-background transition-transform hover:-translate-y-0.5 active:scale-95"
            >
              Reset filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background px-4 py-5">
      <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl">{value}</p>
    </div>
  );
}

function PresetBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-colors ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </motion.button>
  );
}

function ViewBtn({
  active,
  onClick,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      onClick={onClick}
      {...rest}
      className={`grid h-9 w-9 place-items-center transition-colors ${
        active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
