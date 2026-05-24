# 🐋 Walrus Vault

> Programmable digital inheritance & time capsules on Sui. Submission for the
> **Tatum × Walrus Hackathon** (Build on Sui with Walrus, May 23 – Jun 6).

Walrus Vault lets anyone seal a file behind a future date. The encrypted
payload lives on **Walrus**; the access policy lives in a tiny **Move
package** on **Sui**, accessed through a **Tatum RPC gateway**.

**Use cases:**
- Letters to your future self (10-year capsule, kid's 18th birthday)
- Digital inheritance / dead-man's switch for sensitive documents
- Public time-released announcements (book reveals, art drops, journalism)

---

## How it integrates the stack

| Layer        | Used for                                                       |
| ------------ | -------------------------------------------------------------- |
| **Walrus**   | Cheap, durable storage of the encrypted payload (any size)     |
| **Sui Move** | Capsule object: blob_id pointer, unlock time, recipient gate   |
| **Tatum**    | All Sui RPC traffic from the Next.js app + wallet calls        |

```
┌──────────────────────────────────────────────────────────────┐
│                    Next.js App (Browser)                     │
│                                                              │
│   File ─► AES-GCM encrypt ─► Walrus PUT ─► Move tx via Sui   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                  │                          │
                  ▼                          ▼
        ┌─────────────────┐       ┌──────────────────────┐
        │ Walrus Network  │       │  Sui Mainnet via     │
        │ (encrypted blob)│       │  Tatum RPC Gateway   │
        └─────────────────┘       └──────────────────────┘
                                           │
                                           ▼
                                  ┌──────────────────┐
                                  │  Vault Move Pkg  │
                                  │  - Capsule obj   │
                                  │  - unlock_at_ms  │
                                  │  - blob_id ref   │
                                  │  - key_release() │
                                  └──────────────────┘
```

---

## Repo layout

```
.
├── walrus-vault/
│   ├── move/                        # Sui Move package (the smart contract)
│   │   ├── Move.toml
│   │   ├── sources/vault.move       # ~70 LOC, time-locked Capsule
│   │   └── tests/vault_tests.move   # 4 unit tests
│   ├── web/                         # Next.js 14 App Router
│   │   ├── app/
│   │   │   ├── page.tsx             # Landing page
│   │   │   ├── create/page.tsx      # Seal a new capsule
│   │   │   ├── capsules/page.tsx    # List your capsules
│   │   │   └── capsule/[id]/page.tsx# View & unlock one capsule
│   │   ├── components/              # WalletConnect, CapsuleForm/List, Countdown
│   │   ├── lib/                     # Tatum RPC, Walrus HTTP, AES, Move helpers
│   │   └── vercel.json              # Vercel framework hint
│   ├── scripts/publish.sh           # One-shot Move publish to mainnet
│   ├── vercel.json                  # Vercel root config (subdir → web/)
│   └── .env.example                 # Copy to web/.env.local
├── .github/workflows/ci.yml         # Typecheck + build on every push
├── DEMO_SCRIPT.md                   # 90-second demo video script
├── SUBMISSION.md                    # Devpost-ready submission template
└── README.md                        # You are here
```

---

## 🚀 Quickstart (for submission)

### 0. Prereqs (one-time)

- Node 20+: `node --version`
- Sui CLI: <https://docs.sui.io/guides/developer/getting-started/sui-install>
- A Sui wallet (Suiet / Slush / Sui Wallet) with some SUI for gas
- Tatum API key: <https://tatum.io>

### 1. Publish the Move package to Sui mainnet (≈30 seconds)

```bash
sui client switch --env mainnet     # make sure you're on mainnet
sui client active-address           # confirm you have SUI here

cd walrus-vault
./scripts/publish.sh
```

Look for `Published Objects` in the output. Copy the **PackageID** — it
looks like `0xabc123…`. You'll paste this into `web/.env.local` next.

> Optional: run the test suite first.
> ```bash
> cd walrus-vault/move && sui move test
> ```

### 2. Configure & run the web app

```bash
cd walrus-vault/web
cp ../.env.example .env.local
```

Edit `.env.local`:
- `TATUM_API_KEY` = your Tatum mainnet API key
- `NEXT_PUBLIC_VAULT_PACKAGE_ID` = the PackageID from step 1

Then:

```bash
npm install
npm run dev
```

Open <http://localhost:3000>, connect your wallet, seal a capsule.

### 3. Deploy to Vercel (≈5 minutes)

1. Push your repo to GitHub.
2. Go to <https://vercel.com/new> and import the repo.
3. Set **Root Directory** to `walrus-vault/web`.
4. Add the same env vars from `.env.local` in **Project Settings → Environment Variables**.
5. Hit Deploy.

The included `vercel.json` already configures the framework hint, so you
shouldn't need to change anything else.

### 4. Submit to the hackathon

Open `SUBMISSION.md` — it's pre-written in Devpost style. Fill in the
three placeholder fields (live URL, Move PackageID, video link) and paste
into the submission form.

For the demo video, follow `DEMO_SCRIPT.md` — beat-by-beat 90-second
script with shot directions.

---

## 🔐 Security notes (read before submitting!)

- **MVP encryption.** The AES key is stored in the Capsule object as raw
  bytes. The on-chain `unlock_capsule` function enforces *who* can unlock
  and *when*, but the `encrypted_key` field is technically readable by
  anyone running an RPC query. For "letter to my future self" this is
  fine; for adversarial scenarios, upgrade to Seal threshold-encryption.
- **Walrus content is public by default.** That's why we encrypt before
  uploading.
- **Never commit `.env.local`.** It contains your Tatum API key. The
  `.gitignore` is already set up to exclude it.

---

## 🧪 Verifying everything works

```bash
# 1. Move tests
cd walrus-vault/move && sui move test
# Expected: 4 passing tests

# 2. TypeScript strict
cd walrus-vault/web && npm run typecheck
# Expected: no output (clean)

# 3. Production build
npm run build
# Expected: 6 routes generated, all green
```

CI runs steps 2 + 3 on every push (`.github/workflows/ci.yml`).

---

## 🗺️ What's next (post-submission)

- Seal SDK integration for cryptographic time-lock encryption
- Multi-sig unlock (3-of-5 family members)
- Dead-man's switch mode (auto-unlock if creator goes silent)
- Capsule marketplace (transferable, sellable)
- WalletConnect for mobile

---

## 🙏 Credits

Built solo in 14 days for the [Tatum × Walrus Hackathon](https://tatum.io/sui-hackathon).
Powered by [Walrus](https://www.walrus.xyz/), [Sui](https://sui.io/), and
[Tatum](https://tatum.io/).
