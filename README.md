# 🐋 Walrus Vault

> Programmable digital inheritance & time capsules on Sui. Submission for the
> **Tatum × Walrus Hackathon** (Build on Sui with Walrus, May 23 – Jun 6).

Walrus Vault lets anyone seal a file behind a future date. The encrypted
payload lives on **Walrus**; the access policy lives in a tiny **Move
package** on **Sui**, accessed through a **Tatum RPC gateway**.

Use cases:

- Letters to your future self (10-year capsule, kid's 18th birthday).
- Digital inheritance / dead-man's switch for sensitive documents.
- Public time-released announcements (book reveals, art drops, journalism).

---

## How it integrates the stack

| Layer        | Used for                                                       |
| ------------ | -------------------------------------------------------------- |
| **Walrus**   | Cheap, durable storage of the encrypted payload (any size).    |
| **Sui Move** | Capsule object: blob_id pointer, unlock time, recipient gate.  |
| **Tatum**    | All Sui RPC traffic from the Next.js app + wallet calls.       |

---

## Repo layout

```
walrus-vault/
├── move/                        # Sui Move package (the smart contract)
│   ├── Move.toml
│   └── sources/vault.move       # ~70 LOC, time-locked Capsule
├── web/                         # Next.js 14 App Router
│   ├── app/
│   │   ├── page.tsx             # Landing
│   │   ├── create/page.tsx      # Seal a new capsule
│   │   └── capsule/[id]/page.tsx# View & unlock
│   ├── components/              # Wallet connect, form, countdown
│   └── lib/                     # Tatum RPC, Walrus HTTP, AES, contract
├── scripts/publish.sh           # One-shot Move publish to mainnet
└── .env.example                 # Copy to web/.env.local
```

---

## Quickstart

### 0. Prereqs

- Node 20+
- Sui CLI: <https://docs.sui.io/guides/developer/getting-started/sui-install>
- A Sui wallet with some SUI for gas (Suiet / Sui Wallet / Slush).
- Tatum API key: <https://tatum.io>

### 1. Publish the Move package

```bash
sui client switch --env mainnet
./scripts/publish.sh
```

Copy the `PackageID` from the output — you'll paste it into the env file.

### 2. Configure the web app

```bash
cd walrus-vault/web
cp ../.env.example .env.local
# Fill in TATUM_API_KEY and NEXT_PUBLIC_VAULT_PACKAGE_ID
npm install
npm run dev
```

Open <http://localhost:3000>, connect your wallet, seal a capsule.

---

## Security notes (read before submitting!)

- **MVP encryption.** The AES key is stored in the Capsule object as raw
  bytes. The on-chain `unlock_capsule` function enforces _who_ can unlock
  and _when_, but the `encrypted_key` field is technically readable by
  anyone running an RPC query. For a "letter to my future self" this is
  fine; for adversarial scenarios (real inheritance), upgrade to Seal
  threshold-encryption — see `// v2` notes in `crypto.ts` and `vault.move`.
- **Walrus content is public by default.** That's why we encrypt before
  uploading.
- **Never commit `.env.local`.** It contains your Tatum API key.

---

## Roadmap (Hackathon edition)

- [x] Day 1–2: Scaffold (this PR).
- [ ] Day 3–4: Test Move package on testnet, publish to mainnet.
- [ ] Day 5–6: End-to-end Walrus upload/download.
- [ ] Day 7–8: Polish UI, add capsule list page.
- [ ] Day 9: Deploy to Vercel.
- [ ] Day 10: Record demo video.
- [ ] Day 11–14: Buffer + stretch goals (Seal integration, dead-man switch,
      multi-sig unlock).

---

## Credits

Built solo in 14 days for the Tatum × Walrus Hackathon. Powered by
[Walrus](https://www.walrus.xyz/), [Sui](https://sui.io/), and
[Tatum](https://tatum.io/).
