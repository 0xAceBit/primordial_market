import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { ogMainnet } from "./chain";

export const wagmiConfig = getDefaultConfig({
  appName: "Primordial Market",
  // Public WalletConnect Cloud project ID; replace with your own for production.
  projectId: "5cce1cb2bb1d8a7ed9f4f4bb0a9d12d5",
  chains: [ogMainnet],
  transports: {
    [ogMainnet.id]: http("https://evmrpc.0g.ai"),
  },
  ssr: true,
});
