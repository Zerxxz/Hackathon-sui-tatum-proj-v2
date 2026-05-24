"use client";

import { useEffect, useState } from "react";

export function CountdownTimer({ targetMs }: { targetMs: number }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, targetMs - now);

  if (remaining === 0) {
    return <span className="font-mono text-emerald-600">Ready to unlock</span>;
  }

  const seconds = Math.floor(remaining / 1000) % 60;
  const minutes = Math.floor(remaining / 60_000) % 60;
  const hours = Math.floor(remaining / 3_600_000) % 24;
  const days = Math.floor(remaining / 86_400_000);

  return (
    <span className="font-mono text-gray-700">
      {days}d {pad(hours)}h {pad(minutes)}m {pad(seconds)}s
    </span>
  );
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}
