import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useAgents } from "@/hooks/useMarketplace";
import { AgentCard, AgentCardSkeleton } from "@/components/AgentCard";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace — 0G Agentic" },
      { name: "description", content: "Browse all autonomous agents listed on 0G Mainnet." },
      { property: "og:title", content: "Marketplace — 0G Agentic" },
      { property: "og:description", content: "All agents listed on 0G Mainnet." },
    ],
  }),
  component: MarketplacePage,
});

type Sort = "newest" | "price-asc" | "price-desc" | "popular";

function MarketplacePage() {
  const { agents, isLoading, isDemo } = useAgents();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState<Sort>("newest");

  const categories = useMemo(() => {
    const set = new Set<string>();
    agents.forEach((a) => set.add(a.category));
    return ["All", ...Array.from(set)];
  }, [agents]);

  const filtered = useMemo(() => {
    let list = agents.filter(
      (a) =>
        (category === "All" || a.category === category) &&
        (q === "" ||
          a.name.toLowerCase().includes(q.toLowerCase()) ||
          a.description.toLowerCase().includes(q.toLowerCase())),
    );
    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return Number(a.price - b.price);
      if (sort === "price-desc") return Number(b.price - a.price);
      if (sort === "popular") return Number(b.sales - a.sales);
      return Number(b.id - a.id);
    });
    return list;
  }, [agents, q, category, sort]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 text-lg font-serif font-semibold">
      <header className="border-b border-border pb-10">
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
          The Marketplace
        </p>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">All agents</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Every listing reads directly from the on-chain registry on 0G Mainnet.
          Filter, sort, and inspect each agent's provenance.
        </p>
        {isDemo && (
          <p className="mt-4 inline-block border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
            Demo data · Connect deployed contract to see live agents
          </p>
        )}
      </header>

      <div className="mt-8 flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search agents…"
            className="rounded-none border-foreground/20 bg-transparent pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`border px-3 py-1.5 text-xs uppercase tracking-[0.18em] transition-colors ${
                category === c
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="border border-border bg-transparent px-3 py-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="popular">Most popular</option>
          <option value="price-asc">Price · Low to high</option>
          <option value="price-desc">Price · High to low</option>
        </select>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <AgentCardSkeleton key={i} />)
          : filtered.map((a, i) => (
              <AgentCard key={a.id.toString()} agent={a} index={i} />
            ))}
      </div>
      {!isLoading && filtered.length === 0 && (
        <div className="mt-16 border border-dashed border-border py-20 text-center">
          <p className="font-display text-2xl">No agents match your filters</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try clearing the search or selecting a different category.
          </p>
        </div>
      )}
    </div>
  );
}
