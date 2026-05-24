"use client";

import { motion } from "framer-motion";
import { CapsuleForm } from "@/components/CapsuleForm";
import { Header } from "@/components/Header";

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-2xl px-6 pt-6">
      <Header />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
            New capsule
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
            Seal something <span className="gradient-text">timeless</span>.
          </h1>
          <p className="mt-3 text-sm text-white/55">
            Pick a file, set an unlock date, hit seal. Three steps, then forever.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl md:p-10">
          <CapsuleForm />
        </div>
      </motion.div>
    </div>
  );
}
