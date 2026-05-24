"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Hero illustration: a glass "capsule" with a live countdown ticking to
// a date 8 years out. Floats gently and is wrapped in particle dots.

export function CapsuleVisual() {
  const [target] = useState(() => Date.now() + 8 * 365 * 24 * 3600 * 1000);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, target - now);
  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining / 3_600_000) % 24);
  const minutes = Math.floor((remaining / 60_000) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  return (
    <div className="relative h-[420px] w-72">
      {/* Soft glow halo */}
      <div className="absolute inset-0 rounded-full bg-cyan-500/25 blur-[100px]" />

      {/* Floating capsule */}
      <motion.div
        animate={{ y: [-8, 8, -8] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative flex h-full w-full items-center justify-center"
      >
        <div className="relative h-[380px] w-52 overflow-hidden rounded-full border border-white/15 bg-gradient-to-b from-white/10 via-white/[0.02] to-cyan-500/10 shadow-glow-lg backdrop-blur-xl">
          {/* Vertical highlight line — gives the glass a "lit edge" */}
          <div className="absolute left-1/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/30 to-transparent" />

          {/* Inner content: countdown */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-white/40">
              Unlocks in
            </span>

            <div className="space-y-1 font-mono">
              <div className="text-4xl font-bold tabular-nums text-white">
                {days.toLocaleString()}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-white/50">
                days
              </div>
            </div>

            <div className="font-mono text-sm tabular-nums text-white/60">
              {String(hours).padStart(2, "0")}:
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </div>

            <div className="mt-3 h-px w-12 bg-white/15" />
            <span className="text-[10px] uppercase tracking-widest text-white/30">
              Sealed · 2026
            </span>
          </div>

          {/* Bottom inner glow */}
          <div className="absolute bottom-0 left-1/2 h-32 w-32 -translate-x-1/2 translate-y-1/2 rounded-full bg-cyan-400/30 blur-2xl" />
        </div>
      </motion.div>

      {/* Ambient particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute size-1 rounded-full bg-cyan-300"
          style={{
            top: `${15 + (i * 11) % 70}%`,
            left: `${(i % 2 === 0 ? -8 : 92) + Math.random() * 8}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            y: [0, -30],
          }}
          transition={{
            duration: 3 + (i % 3),
            delay: i * 0.4,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
