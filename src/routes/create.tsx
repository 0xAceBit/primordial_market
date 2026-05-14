import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { parseEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEnsureOgChain, useListAgent } from "@/hooks/useMarketplace";
import { TransactionModal } from "@/components/TransactionModal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "List an agent, Primordial Marketplace" },
      { name: "description", content: "Publish your autonomous agent on the 0G Mainnet marketplace." },
      { property: "og:title", content: "List an agent, Primordial Marketplace" },
    ],
  }),
  component: CreatePage,
});

function CreatePage() {
  const { isConnected } = useAccount();
  const { onCorrectChain, ensure, isPending: switching } = useEnsureOgChain();
  const tx = useListAgent();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Research",
    price: "0.1",
  });

  useEffect(() => {
    if (tx.hash && !open) setOpen(true);
  }, [tx.hash, open]);
  useEffect(() => {
    if (tx.isSuccess) {
      toast.success("Agent listed on 0G Mainnet");
      const t = setTimeout(() => {
        setOpen(false);
        navigate({ to: "/marketplace" });
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [tx.isSuccess, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;
    if (!onCorrectChain) return ensure();
    if (tx.isDemo) {
      toast.info("Demo mode, connect your deployed contract to publish for real.");
      return;
    }
    let priceWei: bigint;
    try {
      priceWei = parseEther(form.price);
    } catch {
      toast.error("Invalid price");
      return;
    }
    tx.reset();
    setOpen(true);
    tx.list({
      name: form.name,
      description: form.description,
      category: form.category,
      priceWei,
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
        Publish
      </p>
      <h1 className="mt-3 font-display text-5xl sm:text-6xl">List an agent</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Submit your agent's metadata and pricing. The listing settles directly on
        the 0G Mainnet registry, your wallet remains the source of truth.
      </p>

      <form onSubmit={submit} className="mt-10 space-y-8 border-t border-border pt-10">
        <Field label="Name">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Atlas Research"
            required
          />
        </Field>
        <Field label="Description">
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What does this agent do?"
            rows={5}
            required
          />
        </Field>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="h-10 w-full border border-border bg-transparent px-3 text-sm"
            >
              {["Research", "DeFi", "Data", "Vision", "Writing", "Ops"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Price (0G)">
            <Input
              type="number"
              step="0.0001"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </Field>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Submitting writes a transaction to the 0G Mainnet marketplace contract.
          </p>
          {!isConnected ? (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  type="button"
                  onClick={openConnectModal}
                  className="bg-foreground px-6 py-3 text-sm text-background"
                >
                  Connect wallet
                </button>
              )}
            </ConnectButton.Custom>
          ) : !onCorrectChain ? (
            <button
              type="button"
              onClick={ensure}
              disabled={switching}
              className="bg-primary px-6 py-3 text-sm text-primary-foreground disabled:opacity-60"
            >
              {switching ? "Switching…" : "Switch to 0G Mainnet"}
            </button>
          ) : (
            <button
              type="submit"
              disabled={tx.isPending || tx.isConfirming}
              className="bg-foreground px-6 py-3 text-sm text-background disabled:opacity-60"
            >
              {tx.isPending
                ? "Confirm in wallet…"
                : tx.isConfirming
                  ? "Settling…"
                  : "Publish on 0G"}
            </button>
          )}
        </div>
      </form>

      <TransactionModal
        open={open}
        onOpenChange={setOpen}
        hash={tx.hash}
        isPending={tx.isPending}
        isConfirming={tx.isConfirming}
        isSuccess={tx.isSuccess}
        error={tx.error as Error | null}
        title="Publishing agent"
        successLabel="Your agent is now live on 0G Mainnet"
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
