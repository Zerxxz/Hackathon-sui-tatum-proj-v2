"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CapsuleList } from "@/components/CapsuleList";
import { GlowButton } from "@/components/GlowButton";
import { Header } from "@/components/Header";

export default function CapsulesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 pt-6">
      <Header />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Your <span className="gradient-text">capsules</span>
            </h1>
            <p className="mt-2 text-sm text-white/55">
              Everything you've sealed, plus capsules friends have sent to you.
            </p>
          </div>
          <GlowButton href="/create" variant="solid" className="!py-2.5 !px-5 !text-sm">
            + New capsule
          </GlowButton>
        </div>

        <CapsuleList />
      </motion.div>

      <p className="mt-12 text-center text-xs text-white/30">
        <Link href="/" className="hover:text-white/60">
          ← Home
        </Link>
      </p>
    </div>
  );
}
