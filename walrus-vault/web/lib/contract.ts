// Helpers for building Move calls against the walrus_vault package.
//
// These functions return Transaction blocks ready to be signed by a
// connected wallet via @mysten/dapp-kit's useSignAndExecuteTransaction.

import { Transaction } from "@mysten/sui/transactions";
import { config } from "./config";

const MODULE = "vault";

/**
 * Build a transaction that creates a new capsule.
 *
 * @param args.recipient      Sui address that will own the capsule.
 * @param args.blobId         Walrus blob id (string).
 * @param args.encryptedKey   AES key bytes (already wrapped to recipient).
 * @param args.unlockAtMs     Unix ms timestamp when capsule becomes unlockable.
 * @param args.title          Human-readable label.
 */
export function buildCreateCapsuleTx(args: {
  recipient: string;
  blobId: string;
  encryptedKey: Uint8Array;
  unlockAtMs: number | bigint;
  title: string;
}): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${config.vaultPackageId}::${MODULE}::create_capsule`,
    arguments: [
      tx.pure.address(args.recipient),
      tx.pure.string(args.blobId),
      tx.pure.vector("u8", Array.from(args.encryptedKey)),
      tx.pure.u64(BigInt(args.unlockAtMs)),
      tx.pure.string(args.title),
    ],
  });

  return tx;
}

/**
 * Build a transaction that unlocks a capsule. The on-chain code checks
 * that `tx.sender` matches the recipient and that current time has
 * passed `unlock_at_ms`.
 *
 * @param capsuleObjectId   The on-chain object id of the Capsule.
 */
export function buildUnlockCapsuleTx(capsuleObjectId: string): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${config.vaultPackageId}::${MODULE}::unlock_capsule`,
    arguments: [tx.object(capsuleObjectId), tx.object.clock()],
  });

  return tx;
}
