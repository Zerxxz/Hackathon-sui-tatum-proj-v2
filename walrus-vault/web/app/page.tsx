"use client";

import { motion } from "framer-motion";
import { CapsuleList } from "@/components/CapsuleList";
import { CapsuleVisual } from "@/components/CapsuleVisual";
import { GlowButton } from "@/components/GlowButton";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-6">
      <Header />

      {/* ─────────── Hero ─────────── */}
      <section className="grid gap-12 py-12 md:grid-cols-2 md:items-center md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/70 backdrop-blur">
            <span className="size-1.5 animate-pulse rounded-full bg-cyan-400" />
            Tatum × Walrus Hackathon
          </span>

          <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            Letters to the
            <br />
            <span className="gradient-text">future, sealed</span>
            <br />
            on Sui forever.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/60">
            Encrypt a file once. Lock it behind a date. Walrus stores it. Sui
            guards it. Open it the day you choose — not a second sooner.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <GlowButton href="/create" variant="solid">
              Seal a capsule
              <span className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </GlowButton>
            <GlowButton href="/capsules" variant="ghost">
              My capsules
            </GlowButton>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/40">
            <Stat value="< 5s" label="To seal a file" />
            <Stat value="$0.001" label="Avg gas on Sui" />
            <Stat value="Forever" label="Walrus storage" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
          className="hidden md:flex md:justify-center"
        >
          <CapsuleVisual />
        </motion.div>
      </section>

      {/* ─────────── How it works ─────────── */}
      <section className="py-16">
        <div className="mb-10 text-center">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.25em] text-cyan-300/80">
            How it works
          </p>
          <h2 className="text-3xl font-bold md:text-4xl">
            Three protocols, one moment.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Step
            n={1}
            title="Encrypt locally"
            body="AES-256-GCM in your browser. The plaintext never leaves your device."
            tag="Web Crypto"
          />
          <Step
            n={2}
            title="Store on Walrus"
            body="The ciphertext lives on Walrus, distributed across many storage nodes."
            tag="Walrus mainnet"
          />
          <Step
            n={3}
            title="Lock with Move"
            body="A 70-line Move package on Sui enforces who can unlock, and exactly when."
            tag="Tatum RPC"
          />
        </div>
      </section>

      {/* ─────────── Your capsules ─────────── */}
      <section className="py-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Your latest</h2>
            <p className="mt-1 text-sm text-white/50">
              Capsules you've sealed and the ones sent to you.
            </p>
          </div>
          <GlowButton href="/capsules" variant="ghost" className="!py-2 !px-5 !text-xs">
            See all →
          </GlowButton>
        </div>
        <CapsuleList />
      </section>

      {/* ─────────── Use cases ─────────── */}
      <section className="py-16">
        <div className="mb-10 text-center">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.25em] text-cyan-300/80">
            Use cases
          </p>
          <h2 className="text-3xl font-bold md:text-4xl">More than nostalgia.</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Feature emoji="📜" title="Letter to your future self" body="Open it on your 30th birthday. Or 50th. Or never." />
          <Feature emoji="👨‍👩‍👧" title="Digital inheritance" body="Photos, passwords, instructions — released on a death-switch." />
          <Feature emoji="📰" title="Journalist's safety net" body="Encrypted source documents that auto-publish if you go silent." />
          <Feature emoji="💍" title="Time-released gifts" body="Open on graduation. On the wedding. On the day they're born." />
        </div>
      </section>

      {/* ─────────── Footer ─────────── */}
      <footer className="mt-12 border-t border-white/5 py-12 text-center text-xs text-white/40">
        Built solo for the{" "}
        <a
          href="https://tatum.io/sui-hackathon"
          target="_blank"
          rel="noreferrer"
          className="text-white/60 hover:text-white"
        >
          Tatum × Walrus Hackathon
        </a>
        . Powered by{" "}
        <a href="https://www.walrus.xyz" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white">Walrus</a>,{" "}
        <a href="https://sui.io" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white">Sui</a>, and{" "}
        <a href="https://tatum.io" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white">Tatum</a>.
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <span className="font-mono text-sm font-semibold text-white">
        {value}
      </span>
      <span className="ml-1.5">{label}</span>
    </div>
  );
}

function Step({
  n,
  title,
  body,
  tag,
}: {
  n: number;
  title: string;
  body: string;
  tag: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="glass glass-hover relative gradient-border overflow-hidden rounded-2xl p-6"
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/15 font-mono text-sm text-cyan-300">
          {n}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-white/40">
          {tag}
        </span>
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-white/60">{body}</p>
    </motion.div>
  );
}

function Feature({
  emoji,
  title,
  body,
}: {
  emoji: string;
  title: string;
  body: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="glass glass-hover rounded-2xl p-5"
    >
      <div className="mb-3 text-2xl">{emoji}</div>
      <h3 className="mb-1.5 font-semibold">{title}</h3>
      <p className="text-sm text-white/55">{body}</p>
    </motion.div>
  );
}
