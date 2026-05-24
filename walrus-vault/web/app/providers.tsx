"use client";

// Wraps the app in @mysten/dapp-kit + react-query providers so any client
// component can use wallet hooks (useCurrentAccount, useSignAndExecuteTransaction).

import {
  SuiClientProvider,
  WalletProvider,
  createNetworkConfig,
} from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@mysten/dapp-kit/dist/index.css";
import { ReactNode, useState } from "react";

const { networkConfig } = createNetworkConfig({
  // We point all networks at the Tatum gateway. The gateway handles routing
  // by URL, so a single env var per network is enough.
  mainnet: {
    url:
      process.env.NEXT_PUBLIC_TATUM_RPC_URL ??
      "https://sui-mainnet.gateway.tatum.io/",
  },
  testnet: {
    url: "https://sui-testnet.gateway.tatum.io/",
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const network =
    (process.env.NEXT_PUBLIC_SUI_NETWORK as "mainnet" | "testnet") ??
    "mainnet";

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork={network}>
        <WalletProvider autoConnect>{children}</WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
