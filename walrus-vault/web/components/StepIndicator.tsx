"use client";

import clsx from "clsx";
import { motion } from "framer-motion";

// Horizontal "1 ─ 2 ─ 3" indicator used by the seal flow to show which
// stage the user is on.

export type Step = {
  id: string;
  label: string;
};

export function StepIndicator({
  steps,
  activeIndex,
  status = "active",
}: {
  steps: Step[];
  activeIndex: number;
  status?: "active" | "done" | "error";
}) {
  return (
    <ol className="flex items-center justify-between gap-2">
      {steps.map((step, i) => {
        const isDone = i < activeIndex || (i === activeIndex && status === "done");
        const isCurrent = i === activeIndex && status === "active";
        const isError = i === activeIndex && status === "error";

        return (
          <li key={step.id} className="flex flex-1 items-center gap-2">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={
                  isCurrent
                    ? { scale: [1, 1.15, 1] }
                    : { scale: 1 }
                }
                transition={{ duration: 1.5, repeat: Infinity }}
                className={clsx(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  isError && "border-red-400 bg-red-500/20 text-red-200",
                  isCurrent &&
                    "border-cyan-400 bg-cyan-400/20 text-cyan-100 shadow-[0_0_20px_-4px_rgba(34,211,238,0.6)]",
                  isDone && "border-emerald-400 bg-emerald-500/20 text-emerald-100",
                  !isCurrent &&
                    !isDone &&
                    !isError &&
                    "border-white/15 bg-white/[0.02] text-white/40",
                )}
              >
                {isDone ? "✓" : i + 1}
              </motion.div>
              <span
                className={clsx(
                  "text-[10px] uppercase tracking-wider transition-colors",
                  isCurrent && "text-white",
                  isDone && "text-white/70",
                  !isCurrent && !isDone && "text-white/30",
                )}
              >
                {step.label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div className="mx-1 h-px flex-1 bg-gradient-to-r from-white/10 via-white/15 to-white/10" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
