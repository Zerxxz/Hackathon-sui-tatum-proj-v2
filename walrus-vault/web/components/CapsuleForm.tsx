"use client";

// Multi-step form that:
//   1. Reads the user's file
//   2. Generates an AES key, encrypts the file
//   3. Uploads the ciphertext to Walrus
//   4. Sends a Move tx that creates the Capsule with blob_id + key + unlock time
//
// On success we surface the new capsule's object id so the user can copy a
// shareable link to /capsule/[id].

import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import Link from "next/link";
import { useState } from "react";
import { encrypt, exportKey, generateKey } from "@/lib/crypto";
import { storeBlob } from "@/lib/walrus";
import { buildCreateCapsuleTx } from "@/lib/contract";

type Status =
  | { kind: "idle" }
  | { kind: "encrypting" }
  | { kind: "uploading" }
  | { kind: "signing" }
  | { kind: "done"; digest: string; capsuleId: string | null }
  | { kind: "error"; message: string };

export function CapsuleForm() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const [title, setTitle] = useState("");
  const [unlockAt, setUnlockAt] = useState(""); // datetime-local
  const [recipient, setRecipient] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!account) {
      setStatus({ kind: "error", message: "Connect your wallet first." });
      return;
    }
    if (!file) {
      setStatus({ kind: "error", message: "Pick a file to seal." });
      return;
    }
    const unlockMs = new Date(unlockAt).getTime();
    if (Number.isNaN(unlockMs) || unlockMs <= Date.now()) {
      setStatus({
        kind: "error",
        message: "Unlock time must be in the future.",
      });
      return;
    }

    try {
      // 1. Encrypt
      setStatus({ kind: "encrypting" });
      const fileBytes = new Uint8Array(await file.arrayBuffer());
      const key = await generateKey();
      const ciphertext = await encrypt(key, fileBytes);
      const keyBytes = await exportKey(key);

      // 2. Upload to Walrus
      setStatus({ kind: "uploading" });
      const { blobId } = await storeBlob(ciphertext);

      // 3. Build & sign tx
      setStatus({ kind: "signing" });
      const tx = buildCreateCapsuleTx({
        recipient: recipient || account.address,
        blobId,
        encryptedKey: keyBytes,
        unlockAtMs: unlockMs,
        title,
      });

      const result = await signAndExecute({
        transaction: tx,
      });

      // dapp-kit returns the digest synchronously, but to find the new
      // object id we need to look up the tx with objectChanges. We do
      // that lazily; if it fails we still show the digest.
      const capsuleId = await tryFindCapsuleId(result.digest);
      setStatus({ kind: "done", digest: result.digest, capsuleId });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Field label="Title">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Letter to my 30-year-old self"
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </Field>

      <Field label="Unlock at">
        <input
          required
          type="datetime-local"
          value={unlockAt}
          onChange={(e) => setUnlockAt(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </Field>

      <Field
        label="Recipient address"
        hint="Leave blank to send to yourself."
      >
        <input
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder={account?.address ?? "0x..."}
          className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
        />
      </Field>

      <Field label="File">
        <input
          required
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm"
        />
      </Field>

      <button
        type="submit"
        disabled={
          status.kind !== "idle" &&
          status.kind !== "error" &&
          status.kind !== "done"
        }
        className="rounded-lg bg-ocean-600 px-6 py-3 font-medium text-white transition hover:bg-ocean-900 disabled:opacity-60"
      >
        {status.kind === "idle" || status.kind === "error" || status.kind === "done"
          ? "Seal capsule"
          : "Sealing…"}
      </button>

      <StatusBanner status={status} />
    </form>
  );
}

async function tryFindCapsuleId(digest: string): Promise<string | null> {
  try {
    // We deliberately use a fresh fetch instead of pulling the SuiClient
    // here to keep this helper small. Any failure is non-fatal because
    // the user can still copy the digest and look up the tx manually.
    const url = process.env.NEXT_PUBLIC_TATUM_RPC_URL;
    if (!url) return null;
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "sui_getTransactionBlock",
        params: [digest, { showObjectChanges: true }],
      }),
    });
    const json = await res.json();
    const created = json?.result?.objectChanges?.find(
      (c: { type: string; objectType?: string }) =>
        c.type === "created" && c.objectType?.endsWith("::vault::Capsule"),
    );
    return created?.objectId ?? null;
  } catch {
    return null;
  }
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

function StatusBanner({ status }: { status: Status }) {
  if (status.kind === "idle") return null;

  if (status.kind === "done") {
    const shareUrl = status.capsuleId
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/capsule/${status.capsuleId}`
      : null;

    return (
      <div className="space-y-3 rounded-md bg-emerald-50 p-4 text-sm text-emerald-900">
        <p className="font-medium">Capsule sealed! 🔐</p>
        <p>
          Tx digest: <code className="break-all">{status.digest}</code>
        </p>
        {shareUrl && status.capsuleId && (
          <div className="space-y-2 border-t border-emerald-200 pt-3">
            <p className="font-medium">Share this capsule:</p>
            <div className="flex flex-wrap gap-2">
              <input
                readOnly
                value={shareUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="flex-1 rounded border border-emerald-200 bg-white px-2 py-1 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="rounded border border-emerald-300 bg-white px-3 py-1 text-xs hover:bg-emerald-100"
              >
                Copy
              </button>
              <Link
                href={`/capsule/${status.capsuleId}`}
                className="rounded bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-700"
              >
                Open →
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (status.kind === "error") {
    return (
      <p className="rounded-md bg-red-50 p-4 text-sm text-red-800">
        {status.message}
      </p>
    );
  }

  const messages: Record<Exclude<Status["kind"], "idle" | "done" | "error">, string> = {
    encrypting: "Encrypting your file…",
    uploading: "Uploading to Walrus…",
    signing: "Waiting for wallet signature…",
  };

  return (
    <p className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
      {messages[status.kind]}
    </p>
  );
}
