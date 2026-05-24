"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";

// Two display modes:
//   - "compact": one-liner used in the capsule list (e.g. "12d 03h 45m")
//   - "hero":    huge tabular-nums grid used on the capsule viewer page

export function CountdownTimer({
  targetMs,
  variant = "compact",
}: {
  targetMs: number;
  variant?: "compact" | "hero";
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, targetMs - now);

  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining / 3_600_000) % 24);
  const minutes = Math.floor((remaining / 60_000) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  const ready = remaining === 0;

  if (variant === "compact") {
    if (ready) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
          Ready
        </span>
      );
    }
    return (
      <span className="font-mono text-xs tabular-nums text-white/60">
        {days > 0 ? `${days}d ` : ""}
        {pad(hours)}h {pad(minutes)}m {pad(seconds)}s
      </span>
    );
  }

  // Hero variant
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-xs uppercase tracking-[0.3em] text-white/40">
        {ready ? "The capsule is ready" : "Unlocks in"}
      </span>

      <div
        className={clsx(
          "flex items-end gap-3 font-mono",
          ready && "gradient-text-warm",
        )}
      >
        <Cell value={days} label="days" big />
        <Sep />
        <Cell value={hours} label="hrs" />
        <Sep />
        <Cell value={minutes} label="min" />
        <Sep />
        <Cell value={seconds} label="sec" />
      </div>
    </div>
  );
}

function Cell({
  value,
  label,
  big,
}: {
  value: number;
  label: string;
  big?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={clsx(
          "tabular-nums font-bold leading-none",
          big ? "text-6xl md:text-7xl" : "text-4xl md:text-5xl",
        )}
      >
        {pad(value)}
      </span>
      <span className="mt-2 text-[10px] uppercase tracking-widest text-white/40">
        {label}
      </span>
    </div>
  );
}

function Sep() {
  return (
    <span className="pb-8 text-3xl font-light text-white/20 md:text-4xl">
      :
    </span>
  );
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}
