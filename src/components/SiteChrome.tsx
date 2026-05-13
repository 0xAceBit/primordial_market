import { Link, useRouterState } from "@tanstack/react-router";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const nav = [
  { to: "/marketplace", label: "Marketplace" },
  { to: "/create", label: "List agent" },
  { to: "/dashboard", label: "Dashboard" },
] as const;

export function SiteHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-primary" />
          <span className="font-display text-xl">0G&nbsp;Agentic</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => {
            const active = path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`text-sm transition-colors ${
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <ConnectButton
          accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
          chainStatus="icon"
          showBalance={{ smallScreen: false, largeScreen: true }}
        />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p className="font-display text-base text-foreground">0G Agentic Marketplace</p>
        <p>
          Built on{" "}
          <a
            href="https://chainscan.0g.ai"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-4 hover:underline"
          >
            0G Mainnet
          </a>{" "}
          · Chain ID 16661
        </p>
      </div>
    </footer>
  );
}
