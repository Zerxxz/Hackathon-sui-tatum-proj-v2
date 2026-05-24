import Link from "next/link";
import { WalletConnect } from "@/components/WalletConnect";

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-12 flex items-center justify-between">
        <h1 className="text-2xl font-bold">🐋 Walrus Vault</h1>
        <WalletConnect />
      </header>

      <section className="space-y-6">
        <h2 className="text-5xl font-bold leading-tight">
          Letters to the future,
          <br />
          stored forever on Sui.
        </h2>
        <p className="max-w-2xl text-lg text-gray-600">
          Encrypt a file once, lock it behind a date, and let Walrus + Sui
          deliver it to your future self — or to someone else, exactly when
          you choose.
        </p>

        <div className="flex gap-4 pt-4">
          <Link
            href="/create"
            className="rounded-lg bg-ocean-600 px-6 py-3 font-medium text-white transition hover:bg-ocean-900"
          >
            Create a capsule
          </Link>
          <a
            href="https://docs.wal.app"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Learn about Walrus
          </a>
        </div>
      </section>

      <section className="mt-24 grid gap-8 md:grid-cols-3">
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
    </main>
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
