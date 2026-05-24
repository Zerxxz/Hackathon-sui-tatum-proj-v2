"use client";

import { ConnectButton } from "@mysten/dapp-kit";

// Wraps the dapp-kit ConnectButton inside a `data-dapp-kit` div so our
// global CSS overrides can target it without using arbitrary class names.
export function WalletConnect() {
  return (
    <div data-dapp-kit>
      <ConnectButton />
    </div>
  );
}
