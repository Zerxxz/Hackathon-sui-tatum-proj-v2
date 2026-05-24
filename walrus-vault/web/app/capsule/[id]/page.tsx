"use client";

// Capsule viewer — the emotional centrepiece.
//
// We fetch the Capsule object once on mount, then render:
//   1. A full-bleed hero with the title + a HUGE countdown
//   2. A glass info panel with creator/recipient/blob ids
//   3. The unlock CTA (gated by the contract: time + recipient)
//
// On unlock we sign the on-chain `unlock_capsule` tx, pull the encrypted
// blob from Walrus, decrypt locally, and surface a download link.

import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { GlowButton } from "@/components/GlowButton";
import { Header } from "@/components/Header";
import { buildUnlockCapsuleTx } from "@/lib/contract";
import { decrypt, importKey } from "@/lib/crypto";
import { readBlob } from "@/lib/walrus";

type Capsule = {
  id: string;
  creator: string;
  recipient: string;
  blobId: string;
  encryptedKey: number[];
  unlockAtMs: number;
  title: string;
  unlocked: boolean;
};

export default function CapsulePage({ params }: { params: { id: string } }) {
  const suiClient = useSuiClient();
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [decryptedBlob, setDecryptedBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const obj = await suiClient.getObject({
          id: params.id,
          options: { showContent: true, showOwner: true },
        });
        const content = obj.data?.content;
        if (!content || content.dataType !== "moveObject") {
          throw new Error("Object is not a Capsule");
        }
        const fields = content.fields as Record<string, unknown>;
        setCapsule({
          id: params.id,
          creator: fields.creator as string,
          recipient: fields.recipient as string,
          blobId: fields.blob_id as string,
          encryptedKey: fields.encrypted_key as number[],
          unlockAtMs: Number(fields.unlock_at_ms),
          title: fields.title as string,
          unlocked: fields.unlocked as boolean,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    })();
  }, [params.id, suiClient]);

  async function onUnlock() {
    if (!capsule) return;
    setBusy(true);
    setError(null);
    try {
      const tx = buildUnlockCapsuleTx(capsule.id);
      await signAndExecute({ transaction: tx });

      const cipherBytes = await readBlob(capsule.blobId);
      const key = await importKey(new Uint8Array(capsule.encryptedKey));
      const plain = await decrypt(key, cipherBytes);
      setDecryptedBlob(new Blob([plain as BlobPart]));

      // Tiny celebratory burst on successful unlock
      void import("canvas-confetti").then((mod) => {
        mod.default({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.5 },
          colors: ["#fbbf24", "#fcd34d", "#22d3ee", "#67e8f9"],
        });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <Shell>
        <ErrorCard message={error} />
      </Shell>
    );
  }
  if (!capsule) {
    return (
      <Shell>
        <div className="mx-auto h-64 max-w-2xl animate-pulse rounded-2xl border border-white/5 shimmer" />
      </Shell>
    );
  }

  const ready = Date.now() >= capsule.unlockAtMs;
  const isRecipient = !!account && account.address === capsule.recipient;
  const canUnlock = ready && isRecipient && !capsule.unlocked;

  return (
    <Shell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Title block */}
        <div className="mb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
            {capsule.unlocked ? "Unlocked" : ready ? "Ready" : "Sealed"}
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
            {capsule.title}
          </h1>
        </div>

        {/* Hero countdown card */}
        <div className="relative mb-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-12 text-center backdrop-blur-xl">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-500/15 blur-3xl" />

          {capsule.unlocked ? (
            <UnlockedHero />
          ) : (
            <CountdownTimer targetMs={capsule.unlockAtMs} variant="hero" />
          )}
        </div>

        {/* Info panel */}
        <div className="mb-8 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm md:grid-cols-2">
          <Row label="Creator" value={capsule.creator} mono />
          <Row label="Recipient" value={capsule.recipient} mono />
          <Row label="Walrus blob" value={capsule.blobId} mono />
          <Row
            label="Unlocks"
            value={new Date(capsule.unlockAtMs).toLocaleString()}
          />
        </div>

        {/* Action zone */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
          {!account && (
            <p className="text-sm text-white/55">
              Connect your wallet to interact with this capsule.
            </p>
          )}

          {account && !isRecipient && (
            <p className="text-sm text-white/55">
              Only the recipient (
              <span className="font-mono text-xs">
                {short(capsule.recipient)}
              </span>
              ) can unlock this capsule.
            </p>
          )}

          {isRecipient && !ready && (
            <p className="text-sm text-white/55">
              Come back when the countdown hits zero. The contract enforces it
              — early-unlocking transactions abort.
            </p>
          )}

          {isRecipient && ready && (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-medium">
                  {capsule.unlocked
                    ? "Already unlocked on-chain"
                    : "It's time."}
                </p>
                <p className="mt-1 text-xs text-white/50">
                  {capsule.unlocked
                    ? "Re-fetch the file from Walrus and decrypt locally."
                    : "Sign the unlock transaction, then we'll fetch + decrypt the file in your browser."}
                </p>
              </div>
              <GlowButton onClick={onUnlock} disabled={busy}>
                {busy
                  ? "Unlocking…"
                  : capsule.unlocked
                    ? "Decrypt again"
                    : "Unlock & decrypt"}
              </GlowButton>
            </div>
          )}

          <AnimatePresence>
            {decryptedBlob && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4"
              >
                <span className="text-sm">🎉 File decrypted in your browser</span>
                <a
                  href={URL.createObjectURL(decryptedBlob)}
                  download={`${capsule.title || "capsule"}.bin`}
                  className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-white/90"
                >
                  Download file ↓
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </Shell>
  );
}

function UnlockedHero() {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-xs uppercase tracking-[0.3em] text-white/40">
        This capsule has been opened
      </span>
      <div className="text-7xl font-bold gradient-text-warm">Unlocked</div>
      <span className="text-xs text-white/40">
        On-chain forever. Sui never forgets.
      </span>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-6 pb-20">
      <Header />
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-white/40">
        {label}
      </p>
      <p className={mono ? "mt-1 break-all font-mono text-xs" : "mt-1"}>
        {value}
      </p>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
      <p className="font-semibold">Couldn't load that capsule</p>
      <p className="mt-2 text-sm text-red-200">{message}</p>
    </div>
  );
}

function short(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
