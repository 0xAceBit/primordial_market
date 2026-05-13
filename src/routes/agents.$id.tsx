import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import { useAgent, usePurchaseAgent, useEnsureOgChain } from "@/hooks/useMarketplace";
import { formatOG, truncateAddress } from "@/lib/format";
import { explorerAddress } from "@/lib/chain";
import { TransactionModal } from "@/components/TransactionModal";
import { toast } from "sonner";

export const Route = createFileRoute("/agents/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Agent #${params.id}, 0G Agentic` },
      { name: "description", content: "Agent details and onchain provenance." },
      { property: "og:title", content: `Agent #${params.id}, 0G Agentic` },
    ],
  }),
  component: AgentDetail,
});

function AgentDetail() {
  const { id } = Route.useParams();
  const agentId = (() => {
    try { return BigInt(id); } catch { return undefined; }
  })();
  const { agent, isLoading } = useAgent(agentId);
  const { isConnected } = useAccount();
  const { onCorrectChain, ensure, isPending: switching } = useEnsureOgChain();
  const tx = usePurchaseAgent();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (tx.hash && !open) setOpen(true);
  }, [tx.hash, open]);

  useEffect(() => {
    if (tx.isSuccess) toast.success("Purchase confirmed on 0G Mainnet");
  }, [tx.isSuccess]);

  if (!agentId) throw notFound();
  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-6 py-24 text-muted-foreground">Loading…</div>;
  }
  if (!agent) throw notFound();

  const handlePurchase = () => {
    if (!isConnected) return;
    if (!onCorrectChain) return ensure();
    if (tx.isDemo) {
      toast.info("Demo mode, connect your deployed contract to enable real purchases.");
      return;
    }
    tx.reset();
    setOpen(true);
    tx.purchase(agent);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All agents
      </Link>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-12">
        <article className="lg:col-span-8">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            {agent.category}
          </p>
          <h1 className="mt-4 font-display text-6xl leading-[0.95] sm:text-7xl">
            {agent.name}
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
            {agent.description}
          </p>

          <div className="mt-12 grid grid-cols-2 gap-6 border-y border-border py-6 sm:grid-cols-4">
            <Stat label="ID" value={`#${agent.id.toString()}`} mono />
            <Stat label="Sales" value={agent.sales.toString()} />
            <Stat label="Status" value={agent.active ? "Active" : "Paused"} />
            <Stat label="Network" value="0G Mainnet" />
          </div>

          <section className="mt-12">
            <h2 className="font-display text-2xl">Capabilities</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {[
                "Settles every action on the 0G Mainnet registry.",
                "Pricing and ownership verified directly from the contract.",
                "Composable with any wallet that supports EVM chain ID 16661.",
              ].map((c) => (
                <li key={c} className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </section>
        </article>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 border border-foreground bg-card p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Acquire
            </p>
            <p className="mt-3 font-display text-5xl">{formatOG(agent.price)}</p>
            <div className="mt-6 space-y-3 border-t border-border pt-4 text-sm">
              <Row label="Owner">
                <a
                  href={explorerAddress(agent.owner)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs hover:underline"
                >
                  {truncateAddress(agent.owner)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Row>
              <Row label="Gas (est.)">
                <span className="font-mono text-xs">~0.0002 0G</span>
              </Row>
              <Row label="Settlement">
                <span className="text-xs">Instant on 0G</span>
              </Row>
            </div>

            <div className="mt-6">
              {!isConnected ? (
                <div className="[&>div]:!w-full [&_button]:!w-full">
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <button
                        onClick={openConnectModal}
                        className="w-full bg-foreground py-3 text-sm text-background hover:bg-foreground/90"
                      >
                        Connect wallet
                      </button>
                    )}
                  </ConnectButton.Custom>
                </div>
              ) : !onCorrectChain ? (
                <button
                  onClick={ensure}
                  disabled={switching}
                  className="w-full bg-primary py-3 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {switching ? "Switching…" : "Switch to 0G Mainnet"}
                </button>
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={tx.isPending || tx.isConfirming}
                  className="w-full bg-foreground py-3 text-sm text-background transition-colors hover:bg-foreground/90 disabled:opacity-60"
                >
                  {tx.isPending
                    ? "Confirm in wallet…"
                    : tx.isConfirming
                      ? "Settling…"
                      : `Purchase for ${formatOG(agent.price)}`}
                </button>
              )}
            </div>
            <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Settled onchain · Non-custodial
            </p>
          </div>
        </aside>
      </div>

      <TransactionModal
        open={open}
        onOpenChange={setOpen}
        hash={tx.hash}
        isPending={tx.isPending}
        isConfirming={tx.isConfirming}
        isSuccess={tx.isSuccess}
        error={tx.error as Error | null}
        title={`Purchase · ${agent.name}`}
      />
    </div>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className={`mt-1 ${mono ? "font-mono" : "font-display text-xl"}`}>{value}</p>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
