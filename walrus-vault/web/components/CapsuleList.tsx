"use client";

// Lists every Capsule owned by the connected wallet.
//
// We rely on Sui's getOwnedObjects with a StructType filter so the RPC
// only returns objects of our Capsule type. The package id comes from
// NEXT_PUBLIC_VAULT_PACKAGE_ID, so make sure to publish the Move package
// and set that env var before this page becomes useful.

import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CountdownTimer } from "@/components/CountdownTimer";

type CapsuleSummary = {
  id: string;
  title: string;
  unlockAtMs: number;
  unlocked: boolean;
};

const PACKAGE_ID =
  process.env.NEXT_PUBLIC_VAULT_PACKAGE_ID ??
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const CAPSULE_TYPE = `${PACKAGE_ID}::vault::Capsule`;

export function CapsuleList() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  const [items, setItems] = useState<CapsuleSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!account) {
      setItems(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await suiClient.getOwnedObjects({
          owner: account.address,
          filter: { StructType: CAPSULE_TYPE },
          options: { showContent: true },
          limit: 50,
        });

        if (cancelled) return;

        const list: CapsuleSummary[] = [];
        for (const item of res.data) {
          const content = item.data?.content;
          if (!content || content.dataType !== "moveObject") continue;
          const fields = content.fields as Record<string, unknown>;
          list.push({
            id: item.data?.objectId ?? "",
            title: (fields.title as string) ?? "Untitled",
            unlockAtMs: Number(fields.unlock_at_ms ?? 0),
            unlocked: Boolean(fields.unlocked),
          });
        }

        // Sort: unlocked first, then by soonest unlock time.
        list.sort((a, b) => {
          if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
          return a.unlockAtMs - b.unlockAtMs;
        });

        setItems(list);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [account, suiClient]);

  if (!account) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
        Connect your wallet to see your capsules.
      </p>
    );
  }

  if (error) {
    return (
      <p className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
        Couldn&apos;t load capsules: {error}
      </p>
    );
  }

  if (items === null) {
    return (
      <ul className="space-y-3">
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="h-20 animate-pulse rounded-lg border border-gray-200 bg-gray-50"
          />
        ))}
      </ul>
    );
  }

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
        No capsules yet. <Link href="/create" className="text-ocean-600 underline">Create your first one →</Link>
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((c) => (
        <li
          key={c.id}
          className="rounded-lg border border-gray-200 p-4 transition hover:border-ocean-500 hover:shadow-sm"
        >
          <Link href={`/capsule/${c.id}`} className="block">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{c.title}</p>
                <p className="mt-1 break-all font-mono text-xs text-gray-500">
                  {c.id}
                </p>
              </div>
              <div className="text-right text-sm">
                {c.unlocked ? (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                    Unlocked
                  </span>
                ) : (
                  <CountdownTimer targetMs={c.unlockAtMs} />
                )}
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
