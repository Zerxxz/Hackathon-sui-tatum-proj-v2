#!/usr/bin/env bash
# =====================================================================
# Publish the Walrus Vault Move package to Sui mainnet.
#
# Prereqs:
#   1. `sui` CLI installed (https://docs.sui.io/guides/developer/getting-started/sui-install)
#   2. Active wallet with some SUI for gas: `sui client active-address`
#   3. Active env set to mainnet: `sui client switch --env mainnet`
#
# Usage:
#   ./scripts/publish.sh
#
# After publishing, copy the "PackageID" from the output into
# NEXT_PUBLIC_VAULT_PACKAGE_ID in web/.env.local.
# =====================================================================

set -euo pipefail

cd "$(dirname "$0")/../move"

echo "==> Building Move package..."
sui move build

echo "==> Publishing to $(sui client active-env)..."
sui client publish --gas-budget 200000000 .
