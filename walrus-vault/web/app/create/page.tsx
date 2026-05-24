import Link from "next/link";
import { CapsuleForm } from "@/components/CapsuleForm";
import { WalletConnect } from "@/components/WalletConnect";

export default function CreatePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <header className="mb-10 flex items-center justify-between">
        <Link href="/" className="text-sm text-gray-600 hover:underline">
          ← Back
        </Link>
        <WalletConnect />
      </header>

      <h1 className="mb-2 text-3xl font-bold">Create a capsule</h1>
      <p className="mb-8 text-gray-600">
        Pick a file, set an unlock date, and we&apos;ll handle the rest.
      </p>

      <CapsuleForm />
    </main>
  );
}
