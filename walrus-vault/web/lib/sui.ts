// Sui RPC client wired through the Tatum gateway.
//
// Tatum's Sui endpoint speaks the standard Sui JSON-RPC, so we just point
// `SuiClient` at it and let `@mysten/sui` do the rest. The API key is
// attached as a custom header.

import { SuiClient } from "@mysten/sui/client";
import { config } from "./config";

let client: SuiClient | null = null;

export function getSuiClient(): SuiClient {
  if (client) return client;

  client = new SuiClient({
    url: config.tatumRpcUrl,
    // The Sui client uses fetch under the hood; merge in the auth header.
    // NOTE: we only attach the api key when running on the server. In the
    // browser the public RPC URL is enough; if you need an authed key in
    // the browser, proxy requests through a Next.js route handler instead.
    rpcHeaders:
      typeof window === "undefined" && config.tatumApiKey
        ? { "x-api-key": config.tatumApiKey }
        : undefined,
  });

  return client;
}
