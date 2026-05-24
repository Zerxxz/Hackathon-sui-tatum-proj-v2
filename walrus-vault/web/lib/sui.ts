// Sui RPC client wired through the Tatum gateway.
//
// Tatum's Sui endpoint speaks the standard Sui JSON-RPC, so we just
// configure SuiHTTPTransport to point at it. Auth header is only attached
// server-side; in the browser the public RPC URL is enough.

import { SuiClient, SuiHTTPTransport } from "@mysten/sui/client";
import { config } from "./config";

let client: SuiClient | null = null;

export function getSuiClient(): SuiClient {
  if (client) return client;

  const headers =
    typeof window === "undefined" && config.tatumApiKey
      ? { "x-api-key": config.tatumApiKey }
      : undefined;

  client = new SuiClient({
    transport: new SuiHTTPTransport({
      url: config.tatumRpcUrl,
      rpc: headers ? { headers } : undefined,
    }),
  });

  return client;
}
