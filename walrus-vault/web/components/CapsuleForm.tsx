"use client";

// Multi-step form that:
//   1. Reads the user's file
//   2. Generates an AES key, encrypts the file
//   3. Uploads the ciphertext to Walrus
//   4. Sends a Move tx that creates the Capsule
//
// Visual flow:
//   - Live <StepIndicator/> reflects the current async stage
//   - Drag-and-drop file zone with hover feedback
//   - Confetti burst on success
//   - Inline share-link card with copy button

import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState, type DragEvent } from "react";
import { GlowButton } from "@/components/GlowButton";
import { StepIndicator, type Step } from "@/components/StepIndicator";
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

const STEPS: Step[] = [
  { id: "encrypt", label: "Encrypt" },
  { id: "upload", label: "Walrus" },
  { id: "sign", label: "Sui" },
];

const STEP_INDEX: Record<Status["kind"], number> = {
  idle: 0,
  encrypting: 0,
  uploading: 1,
  signing: 2,
  done: 2,
  error: 0,
};

export function CapsuleForm() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const [title, setTitle] = useState("");
  const [unlockAt, setUnlockAt] = useState("");
  const [recipient, setRecipient] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const busy =
    status.kind === "encrypting" ||
    status.kind === "uploading" ||
    status.kind === "signing";
  const showSteps = busy || status.kind === "done" || status.kind === "error";

  function onDragOver(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragOver(true);
  }
  function onDragLeave() {
    setDragOver(false);
  }
  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }

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
      setStatus({ kind: "encrypting" });
      const fileBytes = new Uint8Array(await file.arrayBuffer());
      const key = await generateKey();
      const ciphertext = await encrypt(key, fileBytes);
      const keyBytes = await exportKey(key);

      setStatus({ kind: "uploading" });
      const { blobId } = await storeBlob(ciphertext);

      setStatus({ kind: "signing" });
      const tx = buildCreateCapsuleTx({
        recipient: recipient || account.address,
        blobId,
        encryptedKey: keyBytes,
        unlockAtMs: unlockMs,
        title,
      });

      const result = await signAndExecute({ transaction: tx });
      const capsuleId = await tryFindCapsuleId(result.digest);

      // Celebrate the seal — lazy-load confetti so SSR + first paint stay light.
      void import("canvas-confetti").then((mod) => {
        const confetti = mod.default;
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ["#22d3ee", "#67e8f9", "#a5f3fc", "#fbbf24"],
        });
      });

      setStatus({ kind: "done", digest: result.digest, capsuleId });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const stepStatus =
    status.kind === "error"
      ? "error"
      : status.kind === "done"
        ? "done"
        : "active";

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {showSteps && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur-xl"
        >
          <StepIndicator
            steps={STEPS}
            activeIndex={STEP_INDEX[status.kind]}
            status={stepStatus}
          />
        </motion.div>
      )}

      <Field label="Title">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Letter to my 30-year-old self"
          disabled={busy}
        />
      </Field>

      <Field label="Unlock at" hint="Cannot be opened before this date.">
        <input
          required
          type="datetime-local"
          value={unlockAt}
          onChange={(e) => setUnlockAt(e.target.value)}
          disabled={busy}
        />
      </Field>

      <Field
        label="Recipient address"
        hint={`Leave blank to send to yourself${
          account ? ` (${shorten(account.address)})` : ""
        }.`}
      >
        <input
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
          className="font-mono text-sm"
          disabled={busy}
        />
      </Field>

      <Field label="File">
        <label
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={clsx(
            "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition cursor-pointer",
            dragOver
              ? "border-cyan-400 bg-cyan-500/10"
              : "border-white/10 bg-white/[0.02] hover:border-white/20",
            busy && "pointer-events-none opacity-60",
          )}
        >
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="sr-only"
            disabled={busy}
          />
          <div className="text-3xl opacity-60">{file ? "📄" : "⬆️"}</div>
          {file ? (
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="mt-1 text-xs text-white/50">
                {(file.size / 1024).toFixed(1)} KB · click to replace
              </p>
            </div>
          ) : (
            <div>
              <p className="font-medium">Drop a file here</p>
              <p className="mt-1 text-xs text-white/50">
                or click to browse — anything works
              </p>
            </div>
          )}
        </label>
      </Field>

      <div className="flex justify-end">
        <GlowButton
          type="submit"
          disabled={busy || status.kind === "done"}
          variant="solid"
        >
          {status.kind === "encrypting" && "Encrypting…"}
          {status.kind === "uploading" && "Uploading to Walrus…"}
          {status.kind === "signing" && "Awaiting signature…"}
          {(status.kind === "idle" || status.kind === "error") && (
            <>
              Seal capsule
              <span className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </>
          )}
          {status.kind === "done" && "Sealed ✓"}
        </GlowButton>
      </div>

      <AnimatePresence>
        {status.kind === "error" && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"
          >
            {status.message}
          </motion.p>
        )}

        {status.kind === "done" && (
          <SuccessCard
            digest={status.digest}
            capsuleId={status.capsuleId}
            key="success"
          />
        )}
      </AnimatePresence>
    </form>
  );
}

function SuccessCard({
  digest,
  capsuleId,
}: {
  digest: string;
  capsuleId: string | null;
}) {
  const shareUrl =
    capsuleId && typeof window !== "undefined"
      ? `${window.location.origin}/capsule/${capsuleId}`
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-4 rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-6 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-xl">
          🔐
        </div>
        <div>
          <p className="font-semibold">Capsule sealed</p>
          <p className="text-xs text-white/60">
            It's now living on Walrus + Sui. Forever.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-black/20 p-3">
        <p className="text-[10px] uppercase tracking-widest text-white/40">
          Tx digest
        </p>
        <p className="mt-1 break-all font-mono text-xs">{digest}</p>
      </div>

      {shareUrl && capsuleId && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-white/40">
            Share link
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              readOnly
              value={shareUrl}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="flex-1 font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs hover:bg-white/10"
            >
              Copy
            </button>
            <Link
              href={`/capsule/${capsuleId}`}
              className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-white/90"
            >
              Open →
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
}

async function tryFindCapsuleId(digest: string): Promise<string | null> {
  try {
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
      <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/60">
        {label}
      </span>
      {children}
      {hint && (
        <span className="mt-1.5 block text-xs text-white/40">{hint}</span>
      )}
    </label>
  );
}

function shorten(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
