# Walrus Vault — Hackathon Submission

> Programmable digital inheritance & time-capsules on Sui.
> Submission for the **Tatum × Walrus Hackathon** (May 23 – Jun 6).

---

## 🎯 Elevator pitch

Walrus Vault lets anyone seal a file behind a future date. The encrypted
payload lives on **Walrus**; the access policy lives in a tiny **Move
package** on **Sui**, accessed through a **Tatum RPC gateway**. One UX,
three protocols, zero servers.

---

## 💡 Inspiration

A few weeks ago I read a thread about a journalist who left an encrypted
USB stick with a friend, "to be opened if anything happens to me." That's
a 2010 solution to a 2026 problem. Cloud drives can't be time-locked.
Lawyers are slow and expensive. Death-man switches require infrastructure.

What if the same primitive — *"only readable after time T, by person P"* —
could be a public utility, owned by you, transferable like an NFT,
verifiable on-chain?

That's Walrus Vault.

---

## 🛠️ What it does

- **Encrypts a file in your browser** (AES-256-GCM via Web Crypto)
- **Uploads the ciphertext to Walrus** as a single blob
- **Mints a Capsule object on Sui** that stores: `blob_id`, `unlock_at_ms`,
  `recipient`, and the (encrypted) AES key
- **Enforces the unlock rule on-chain**: the `unlock_capsule` Move entry
  function aborts if the caller isn't the recipient, or if the Sui Clock
  hasn't reached `unlock_at_ms`
- **Decrypts locally** once unlocked, so the plaintext never touches a
  server

Use cases:
- 📜 Letters to your future self
- 👨‍👩‍👧 Digital inheritance (photos, passwords, instructions)
- 📰 Journalist's dead-man switch
- 🎁 Time-released gifts (open on graduation day, on the wedding, etc.)
- 📢 Public time-released announcements (book reveals, art drops)

---

## 🏗️ How we built it

| Layer        | Tech                                                    |
| ------------ | ------------------------------------------------------- |
| Storage      | Walrus mainnet (HTTP publisher/aggregator)              |
| Smart contract | Sui Move (~70 LOC, edition 2024.beta)                 |
| RPC gateway  | Tatum (`https://sui-mainnet.gateway.tatum.io/`)         |
| Wallet       | `@mysten/dapp-kit` (Suiet, Slush, Sui Wallet)           |
| Frontend     | Next.js 14 App Router, TypeScript strict, Tailwind      |
| Deploy       | Vercel                                                  |
| CI           | GitHub Actions (typecheck + build on every push)        |

The architecture is intentionally boring:
1. The **frontend** does encryption, storage uploads, and signs Move calls
   directly. No backend.
2. The **Move package** is single-file and audit-ready in 5 minutes.
3. The **Tatum gateway** is the only piece of infra — it gives us a
   reliable Sui RPC without running our own full node.

---

## 🤔 Challenges

- **Two `@mysten/sui` versions.** `@mysten/dapp-kit@0.16.16` pins
  `1.36.1`, but I had `1.45.2` at the top level. Two `Transaction`
  classes, two `#private` fields, every `signAndExecute` call broke at
  type-check. Fixed by pinning `1.36.1` everywhere with an `overrides`
  block.
- **Web Crypto vs. TS DOM strict typing.** TS now distinguishes
  `Uint8Array<ArrayBuffer>` from `Uint8Array<ArrayBufferLike>`, and
  WebCrypto only accepts the former. Wrapping inputs through a tiny
  `toArrayBufferBacked` helper made every `subtle.encrypt` call
  predictable.
- **Time-lock honesty.** A 100% cryptographic time-lock needs threshold
  encryption (Walrus's Seal). For the MVP I documented the trade-off:
  the contract enforces *who* can unlock and *when*, but the AES key
  bytes themselves live on-chain. v2 will swap to Seal so the lock is
  cryptographic, not just contract+UI.

---

## 🎓 What I learned

- **Move 2024 syntax** is genuinely nicer to work with than the older
  edition (`public struct`, `ctx.sender()`, etc.).
- **Walrus's HTTP API** is dead-simple — one PUT, one GET. No SDK
  required for an MVP.
- **`@mysten/dapp-kit`** ships a working `ConnectButton`, network
  config, and React Query integration in ~30 lines. That alone saved me
  a day.
- **Building with constraints is a feature.** "Can't do encryption
  perfectly in 14 days solo" forced me to pick the smallest credible
  scope and ship it well, instead of half-finishing three layers.

---

## 🚀 What's next

- **Seal integration** for cryptographic time-lock encryption.
- **Multi-sig unlock** (3-of-5 family members agree before unlock).
- **Dead-man switch mode** (auto-unlock if creator hasn't pinged in N
  days).
- **Capsule marketplace** for transferable / sellable capsules (think:
  paid-access-to-the-future).
- **Mobile wallet support** via WalletConnect.

---

## 📦 Deliverables

| Item                         | Link                                                              |
| ---------------------------- | ----------------------------------------------------------------- |
| Live demo                    | `https://walrus-vault.vercel.app` *(after deploy)*                |
| Source code                  | `https://github.com/Zerxxz/Hackathon-sui-tatum-proj-v2`            |
| Move package on Sui Mainnet  | `0x...` *(after publish, paste the package id here)*               |
| Demo video                   | YouTube link *(see DEMO_SCRIPT.md)*                                |
| Architecture diagram         | See `README.md`                                                    |

---

## 🙏 Credits

Built solo for the [Tatum × Walrus Hackathon](https://tatum.io/sui-hackathon).
Powered by [Walrus](https://www.walrus.xyz/), [Sui](https://sui.io/), and
[Tatum](https://tatum.io/).

Inspired by every person who has ever wished they could send a message to
their future self.
