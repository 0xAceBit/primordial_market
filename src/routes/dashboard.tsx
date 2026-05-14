import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAccount, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ExternalLink } from "lucide-react";
import { useAgents } from "@/hooks/useMarketplace";
import { formatOG, truncateAddress } from "@/lib/format";
import { explorerAddress } from "@/lib/chain";
import { ogMainnet } from "@/lib/chain";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard, Primordial Market" },
      { name: "description", content: "Your agents, purchases, and onchain activity." },
      { property: "og:title", content: "Dashboard, Primordial Market" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address, chainId: ogMainnet.id, query: { enabled: !!address } });
  const { agents } = useAgents();

  const mine = useMemo(
    () => (address ? agents.filter((a) => a.owner.toLowerCase() === address.toLowerCase()) : []),
    [agents, address],
  );

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
          Wallet required
        </p>
        <h1 className="mt-3 font-display text-5xl">Connect your wallet</h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          Your dashboard reads listings, purchases, and balances directly from
          the 0G Mainnet using the connected wallet address.
        </p>
        <div className="mt-8 inline-flex">
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <header className="border-b border-border pb-10">
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
          Account
        </p>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">Dashboard</h1>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <Stat label="Address">
            <a
              href={address ? explorerAddress(address) : "#"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-sm hover:underline"
            >
              {truncateAddress(address, 6)} <ExternalLink className="h-3 w-3" />
            </a>
          </Stat>
          <Stat label="Balance">
            <span className="font-display text-2xl">
              {balance ? `${Number(balance.formatted).toLocaleString(undefined, { maximumFractionDigits: 4 })} 0G` : "-"}
            </span>
          </Stat>
          <Stat label="Listings">
            <span className="font-display text-2xl">{mine.length}</span>
          </Stat>
        </div>
      </header>

      <section className="mt-12">
        <h2 className="font-display text-3xl">Your listings</h2>
        {mine.length === 0 ? (
          <div className="mt-6 border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">You haven't listed any agents yet.</p>
            <Link
              to="/create"
              className="mt-6 inline-block bg-foreground px-5 py-2.5 text-sm text-background"
            >
              List an agent
            </Link>
          </div>
        ) : (
          <div className="mt-6 divide-y divide-border border-y border-border">
            {mine.map((a) => (
              <Link
                key={a.id.toString()}
                to="/agents/$id"
                params={{ id: a.id.toString() }}
                className="grid grid-cols-12 items-center gap-4 px-2 py-5 text-sm hover:bg-muted/40"
              >
                <span className="col-span-1 font-mono text-xs text-muted-foreground">
                  #{a.id.toString()}
                </span>
                <span className="col-span-5 font-display text-lg">{a.name}</span>
                <span className="col-span-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {a.category}
                </span>
                <span className="col-span-2 font-mono text-xs">{a.sales.toString()} sales</span>
                <span className="col-span-2 text-right font-display">{formatOG(a.price)}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
