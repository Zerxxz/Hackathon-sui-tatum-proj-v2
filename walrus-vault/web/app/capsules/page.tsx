import Link from "next/link";
import { CapsuleList } from "@/components/CapsuleList";
import { WalletConnect } from "@/components/WalletConnect";

export default function CapsulesPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-10 flex items-center justify-between">
        <Link href="/" className="text-sm text-gray-600 hover:underline">
          ← Back
        </Link>
        <WalletConnect />
      </header>

      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your capsules</h1>
          <p className="mt-1 text-sm text-gray-600">
            Everything you&apos;ve sealed, plus capsules friends sent to you.
          </p>
        </div>
        <Link
          href="/create"
          className="rounded-lg bg-ocean-600 px-4 py-2 text-sm font-medium text-white hover:bg-ocean-900"
        >
          + New capsule
        </Link>
      </div>

      <CapsuleList />
    </main>
  );
}
