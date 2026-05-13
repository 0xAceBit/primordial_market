import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAgents } from "@/hooks/useMarketplace";
import { AgentCard } from "@/components/AgentCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "0G Agentic Marketplace — On-chain agents on 0G Network" },
      {
        name: "description",
        content:
          "Discover, list, and acquire autonomous agents settled on 0G Mainnet. A premium marketplace for the agentic economy.",
      },
      { property: "og:title", content: "0G Agentic Marketplace" },
      { property: "og:description", content: "An editorial marketplace for autonomous agents on 0G." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { agents, isDemo } = useAgents();
  const featured = agents.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-24 lg:grid-cols-12 lg:py-32">
          <div className="lg:col-span-8">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs uppercase tracking-[0.24em] text-muted-foreground"
            >
              Issue 01 · The Agentic Economy
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 font-display text-6xl leading-[0.95] sm:text-7xl lg:text-[8rem]"
            >
              A marketplace
              <br />
              for autonomous
              <br />
              <em className="font-normal italic text-primary">agents.</em>
            </motion.h1>
            <p className="mt-8 max-w-xl text-lg text-muted-foreground">
              Discover, list, and acquire autonomous agents settled directly on the
              0G Network. Provenance is on-chain. Payments are native.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-2 bg-foreground px-6 py-3 text-sm text-background transition-colors hover:bg-foreground/90"
              >
                Browse marketplace <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 border border-foreground px-6 py-3 text-sm text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                List your agent
              </Link>
            </div>
          </div>
          <aside className="lg:col-span-4 lg:border-l lg:border-border lg:pl-8">
            <dl className="space-y-6 text-sm">
              <div>
                <dt className="uppercase tracking-[0.18em] text-muted-foreground">Network</dt>
                <dd className="mt-1 font-display text-xl">0G Mainnet</dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.18em] text-muted-foreground">Chain ID</dt>
                <dd className="mt-1 font-mono">16661</dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.18em] text-muted-foreground">Native token</dt>
                <dd className="mt-1 font-mono">0G</dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.18em] text-muted-foreground">Listed agents</dt>
                <dd className="mt-1 font-display text-xl">{agents.length}</dd>
              </div>
            </dl>
            {isDemo && (
              <p className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground">
                Showing demo data. Wire your deployed contract address in
                <code className="mx-1 font-mono">src/lib/contracts/marketplace.ts</code>
                to read live state.
              </p>
            )}
          </aside>
        </div>
      </section>

      {/* Featured */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Featured
              </p>
              <h2 className="mt-3 font-display text-4xl">This week's selection</h2>
            </div>
            <Link
              to="/marketplace"
              className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline-flex sm:items-center sm:gap-1"
            >
              All agents <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {featured.map((a, i) => (
              <AgentCard key={a.id.toString()} agent={a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-24">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            How it works
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl">
            Three steps. Zero intermediaries.
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Connect",
                d: "Connect any EVM wallet. We handle the 0G Mainnet network switch automatically.",
              },
              {
                n: "02",
                t: "Browse",
                d: "Each agent's price, owner, and sales history is read directly from the contract.",
              },
              {
                n: "03",
                t: "Transact",
                d: "Pay in native 0G. Your transaction settles in seconds with on-chain provenance.",
              },
            ].map((s) => (
              <div key={s.n} className="border-t border-foreground pt-6">
                <p className="font-mono text-xs text-muted-foreground">{s.n}</p>
                <h3 className="mt-3 font-display text-2xl">{s.t}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
