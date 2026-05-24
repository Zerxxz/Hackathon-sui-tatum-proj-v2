import Link from "next/link";
import { CapsuleList } from "@/components/CapsuleList";
import { WalletConnect } from "@/components/WalletConnect";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-16 flex items-center justify-between">
        <h1 className="text-2xl font-bold">🐋 Walrus Vault</h1>
        <WalletConnect />
      </header>

      <section className="mb-24 grid gap-12 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-4 inline-block rounded-full bg-ocean-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-ocean-900">
            Tatum × Walrus Hackathon
          </p>
          <h2 className="text-5xl font-bold leading-tight">
            Letters to the future,
            <br />
            <span className="bg-gradient-to-r from-ocean-600 to-cyan-500 bg-clip-text text-transparent">
              stored forever on Sui.
            </span>
          </h2>
          <p className="mt-6 max-w-xl text-lg text-gray-600">
            Encrypt a file once, lock it behind a date, and let Walrus + Sui
            deliver it to your future self — or to someone else, exactly when
            you choose.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/create"
              className="rounded-lg bg-ocean-600 px-6 py-3 font-medium text-white transition hover:bg-ocean-900"
            >
              Seal a capsule
            </Link>
            <Link
              href="/capsules"
              className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
            >
              My capsules
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-ocean-50 to-cyan-50 p-8">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ocean-900">
            How it works
          </h3>
          <ol className="space-y-4 text-sm">
            <Step
              n={1}
              title="Encrypt locally"
              body="AES-256-GCM in your browser. The plaintext never leaves your device."
            />
            <Step
              n={2}
              title="Store on Walrus"
              body="The ciphertext lives on Walrus, distributed across many storage nodes."
            />
            <Step
              n={3}
              title="Lock with Move"
              body="A tiny smart contract on Sui enforces who can unlock, and when."
            />
          </ol>
        </div>
      </section>

      <section className="mb-16">
        <div className="mb-4 flex items-end justify-between">
          <h3 className="text-xl font-semibold">Your latest capsules</h3>
          <Link
            href="/capsules"
            className="text-sm text-ocean-600 hover:underline"
          >
            See all →
          </Link>
        </div>
        <CapsuleList />
      </section>

      <section className="grid gap-8 md:grid-cols-3">
        <Feature
          title="Decentralised"
          body="Files live on Walrus across many storage nodes. No single point of failure."
        />
        <Feature
          title="Time-locked"
          body="A Move smart contract enforces who can unlock, and when."
        />
        <Feature
          title="Yours forever"
          body="The capsule object lands in your wallet. Transfer it, gift it, will it."
        />
      </section>

      <footer className="mt-24 border-t pt-8 text-center text-xs text-gray-500">
        Built for the{" "}
        <a
          href="https://tatum.io/sui-hackathon"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Tatum × Walrus Hackathon
        </a>{" "}
        · Powered by{" "}
        <a
          href="https://www.walrus.xyz"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Walrus
        </a>
        ,{" "}
        <a
          href="https://sui.io"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Sui
        </a>
        , and{" "}
        <a
          href="https://tatum.io"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Tatum
        </a>
        .
      </footer>
    </main>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="flex gap-4">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ocean-600 text-xs font-bold text-white">
        {n}
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-gray-600">{body}</p>
      </div>
    </li>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-gray-200 p-6">
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-gray-600">{body}</p>
    </div>
  );
}
