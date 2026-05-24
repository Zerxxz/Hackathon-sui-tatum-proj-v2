"use client";

// Multi-step form that:
//   1. Reads the user's file
//   2. Generates an AES key, encrypts the file
//   3. Uploads the ciphertext to Walrus
//   4. Sends a Move tx that creates the Capsule with blob_id + key + unlock time
//
// The wallet signs the Move tx via @mysten/dapp-kit. The encryption key is
// stored in the on-chain object as raw bytes for the MVP — see lib/crypto.ts
// and the Move contract for the security note.

import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { useState } from "react";
import { encrypt, exportKey, generateKey } from "@/lib/crypto";
import { storeBlob } from "@/lib/walrus";
import { buildCreateCapsuleTx } from "@/lib/contract";

type Status =
  | { kind: "idle" }
  | { kind: "encrypting" }
  | { kind: "uploading" }
  | { kind: "signing" }
  | { kind: "done"; digest: string }
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
      const unlockMs = new Date(unlockAt).getTime();
      const tx = buildCreateCapsuleTx({
        recipient: recipient || account.address,
        blobId,
        encryptedKey: keyBytes,
        unlockAtMs: unlockMs,
        title,
      });

      const result = await signAndExecute({ transaction: tx });
      setStatus({ kind: "done", digest: result.digest });
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
        disabled={status.kind !== "idle" && status.kind !== "error"}
        className="rounded-lg bg-ocean-600 px-6 py-3 font-medium text-white transition hover:bg-ocean-900 disabled:opacity-60"
      >
        {status.kind === "idle" || status.kind === "error"
          ? "Seal capsule"
          : "Sealing…"}
      </button>

      <StatusBanner status={status} />
    </form>
  );
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

  const map: Record<Status["kind"], string> = {
    idle: "",
    encrypting: "Encrypting your file…",
    uploading: "Uploading to Walrus…",
    signing: "Waiting for wallet signature…",
    done: "",
    error: "",
  };

  if (status.kind === "done") {
    return (
      <p className="rounded-md bg-emerald-50 p-4 text-sm text-emerald-800">
        Capsule sealed! Tx digest: <code>{status.digest}</code>
      </p>
    );
  }

  if (status.kind === "error") {
    return (
      <p className="rounded-md bg-red-50 p-4 text-sm text-red-800">
        {status.message}
      </p>
    );
  }

  return (
    <p className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
      {map[status.kind]}
    </p>
  );
}
