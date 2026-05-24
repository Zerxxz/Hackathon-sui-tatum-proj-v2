"use client";

import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import clsx from "clsx";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CountdownTimer } from "@/components/CountdownTimer";

// Lists every Capsule owned by the connected wallet, rendered as glass
// cards with hover glow. Falls back to skeletons while loading.

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

        list.sort((a, b) => a.unlockAtMs - b.unlockAtMs);
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
      <EmptyState
        title="Connect your wallet"
        body="Once connected, your sealed capsules will show up here."
      />
    );
  }

  if (error) {
    return (
      <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
        Couldn't load capsules: {error}
      </p>
    );
  }

  if (items === null) {
    return (
      <ul className="grid gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <li
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-white/5 shimmer"
          />
        ))}
      </ul>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No capsules yet"
        body={
          <>
            Sealed time is just one click away.{" "}
            <Link href="/create" className="text-cyan-300 hover:text-cyan-200">
              Create your first one →
            </Link>
          </>
        }
      />
    );
  }

  return (
    <motion.ul
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.06 } },
      }}
      className="grid gap-3 sm:grid-cols-2"
    >
      {items.map((c) => {
        const ready = Date.now() >= c.unlockAtMs;
        return (
          <motion.li
            key={c.id}
            variants={{
              hidden: { opacity: 0, y: 12 },
              show: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Link
              href={`/capsule/${c.id}`}
              className={clsx(
                "group block h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl transition gradient-border",
                "hover:border-white/20 hover:bg-white/[0.05]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c.title}</p>
                  <p className="mt-1 truncate font-mono text-[10px] text-white/40">
                    {c.id}
                  </p>
                </div>
                <StatusPill unlocked={c.unlocked} ready={ready} />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <CountdownTimer targetMs={c.unlockAtMs} variant="compact" />
                <span className="text-xs text-white/40 transition group-hover:translate-x-0.5 group-hover:text-cyan-300">
                  Open →
                </span>
              </div>
            </Link>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}

function StatusPill({
  unlocked,
  ready,
}: {
  unlocked: boolean;
  ready: boolean;
}) {
  if (unlocked) {
    return (
      <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-300">
        Unlocked
      </span>
    );
  }
  if (ready) {
    return (
      <span className="rounded-full border border-amber-400/40 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-300">
        Ready
      </span>
    );
  }
  return (
    <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/50">
      Sealed
    </span>
  );
}

function EmptyState({
  title,
  body,
}: {
  title: string;
  body: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-2 text-sm text-white/50">{body}</p>
    </div>
  );
}
