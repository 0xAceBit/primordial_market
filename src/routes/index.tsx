import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Volume2, VolumeX, RotateCw } from "lucide-react";
import { useAgents } from "@/hooks/useMarketplace";
import { AgentCard } from "@/components/AgentCard";
import blobLeft from "@/assets/blob-left.png";
import blobRight from "@/assets/blob-right.png";
import { startAmbient, stopAmbient } from "@/lib/ambient";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "0G Agentic Marketplace — Autonomous agents on 0G Mainnet" },
      {
        name: "description",
        content:
          "A premium marketplace for autonomous agents — discover, list, and acquire on 0G Mainnet.",
      },
      { property: "og:title", content: "0G Agentic Marketplace" },
      { property: "og:description", content: "Autonomous agents settled on 0G Mainnet." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

const ROTATING_WORDS = ["agentic", "scalable", "secure", "open", "onchain"];

function Landing() {
  const { agents, isDemo } = useAgents();
  const featured = agents.slice(0, 3);
  const [wordIndex, setWordIndex] = useState(0);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setWordIndex((i) => (i + 1) % ROTATING_WORDS.length), 2400);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    return () => stopAmbient();
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-paper">
        {/* Blobs */}
        <motion.img
          src={blobLeft}
          alt=""
          aria-hidden
          width={1024}
          height={1024}
          initial={{ opacity: 0, x: -40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute -left-[14%] top-[8%] hidden w-[34vw] max-w-[520px] select-none md:block"
        />
        <motion.img
          src={blobRight}
          alt=""
          aria-hidden
          width={1024}
          height={1024}
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="pointer-events-none absolute -right-[12%] top-[18%] hidden w-[36vw] max-w-[560px] select-none md:block"
        />
        {/* Mobile: stack blobs behind text */}
        <img
          src={blobLeft}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -left-24 top-12 w-72 opacity-90 md:hidden"
        />
        <img
          src={blobRight}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -right-24 bottom-12 w-72 opacity-90 md:hidden"
        />

        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col items-center justify-center px-6 py-24 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs uppercase tracking-[0.32em] text-muted-foreground"
          >
            The 0G Agentic Marketplace
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="mt-8 font-display text-[14vw] leading-[0.9] sm:text-[10vw] md:text-[8.5vw] lg:text-[7.5rem]"
          >
            <span className="block">More</span>
            <span className="relative mt-2 inline-block">
              <AnimatePresence mode="wait">
                <motion.em
                  key={ROTATING_WORDS[wordIndex]}
                  initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="block font-normal italic text-primary"
                >
                  {ROTATING_WORDS[wordIndex]}.
                </motion.em>
              </AnimatePresence>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 max-w-xl text-base text-muted-foreground sm:text-lg"
          >
            A premium, fully onchain marketplace for autonomous agents. Built
            natively on the 0G Network — provenance verified, settlements native,
            curation editorial.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/marketplace"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background transition-all hover:scale-[1.02] hover:bg-foreground/90"
            >
              Launch app
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-background px-7 py-3.5 text-sm font-medium text-foreground transition-all hover:border-foreground"
            >
              List your agent
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-6 right-6 flex items-center gap-2"
          >
            <button
              onClick={() => setWordIndex((i) => (i + 1) % ROTATING_WORDS.length)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/70 backdrop-blur transition-colors hover:bg-card"
              aria-label="Rotate headline"
            >
              <RotateCw className="h-4 w-4" />
            </button>
            <button
              onClick={async () => {
                if (muted) {
                  await startAmbient();
                  setMuted(false);
                } else {
                  stopAmbient();
                  setMuted(true);
                }
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/70 backdrop-blur transition-colors hover:bg-card"
              aria-label="Toggle audio"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </motion.div>
        </div>
      </section>

      {/* MARQUEE STATS */}
      <section className="border-y border-border bg-background">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border md:grid-cols-4">
          {[
            { k: "Network", v: "0G Mainnet" },
            { k: "Chain ID", v: "16661" },
            { k: "Native token", v: "0G" },
            { k: "Listed agents", v: agents.length.toString() },
          ].map((s) => (
            <div key={s.k} className="px-6 py-8">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                {s.k}
              </p>
              <p className="mt-2 font-display text-2xl">{s.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Featured
              </p>
              <h2 className="mt-3 font-display text-4xl sm:text-5xl">
                This week's selection
              </h2>
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
          {isDemo && (
            <p className="mt-8 text-xs text-muted-foreground">
              Showing demo data. Connect your deployed contract address in{" "}
              <code className="font-mono">src/lib/contracts/marketplace.ts</code>{" "}
              to see live listings.
            </p>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-24">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            How it works
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl sm:text-5xl">
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
                d: "Pay in native 0G. Your transaction settles in seconds with onchain provenance.",
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
