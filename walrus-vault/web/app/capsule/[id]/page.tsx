"use client";

// Capsule viewer page.
//
// Flow:
//   1. Fetch the Capsule object from Sui (via Tatum RPC) by `id`.
//   2. Show metadata + countdown.
//   3. If `unlock_at_ms` has passed and the viewer is the recipient,
//      offer a button that signs `unlock_capsule` and then downloads +
//      decrypts the blob from Walrus.

import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { WalletConnect } from "@/components/WalletConnect";
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

  // Load on mount
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
      // 1. Sign + execute on-chain unlock so the Capsule is marked unlocked.
      const tx = buildUnlockCapsuleTx(capsule.id);
      await signAndExecute({ transaction: tx });

      // 2. Pull the encrypted blob from Walrus.
      const cipherBytes = await readBlob(capsule.blobId);

      // 3. Decrypt locally and surface as a downloadable Blob.
      const key = await importKey(new Uint8Array(capsule.encryptedKey));
      const plain = await decrypt(key, cipherBytes);
      setDecryptedBlob(new Blob([plain]));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  if (error) return <Shell>Error: {error}</Shell>;
  if (!capsule) return <Shell>Loading capsule…</Shell>;

  const canUnlock =
    !!account &&
    account.address === capsule.recipient &&
    Date.now() >= capsule.unlockAtMs;

  return (
    <Shell>
      <h1 className="mb-2 text-3xl font-bold">{capsule.title}</h1>
      <p className="mb-8 text-sm text-gray-500">Capsule {capsule.id}</p>

      <dl className="mb-8 space-y-3 text-sm">
        <Row label="Creator" value={capsule.creator} mono />
        <Row label="Recipient" value={capsule.recipient} mono />
        <Row label="Walrus blob" value={capsule.blobId} mono />
        <Row
          label="Unlocks in"
          value={<CountdownTimer targetMs={capsule.unlockAtMs} />}
        />
      </dl>

      {capsule.unlocked && !decryptedBlob && (
        <p className="mb-4 text-sm text-amber-700">
          This capsule has already been unlocked on-chain. Reconnect with the
          recipient wallet and click below to redownload + decrypt locally.
        </p>
      )}

      <button
        onClick={onUnlock}
        disabled={!canUnlock || busy}
        className="rounded-lg bg-ocean-600 px-6 py-3 font-medium text-white transition hover:bg-ocean-900 disabled:opacity-60"
      >
        {busy ? "Unlocking…" : "Unlock & decrypt"}
      </button>

      {decryptedBlob && (
        <a
          href={URL.createObjectURL(decryptedBlob)}
          download={`${capsule.title}.bin`}
          className="ml-4 text-ocean-600 underline"
        >
          Download decrypted file
        </a>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <header className="mb-10 flex items-center justify-between">
        <a href="/" className="text-sm text-gray-600 hover:underline">
          ← Back
        </a>
        <WalletConnect />
      </header>
      {children}
    </main>
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
    <div className="flex gap-4">
      <dt className="w-32 shrink-0 text-gray-500">{label}</dt>
      <dd className={mono ? "break-all font-mono text-xs" : ""}>{value}</dd>
    </div>
  );
}
