# 🎬 Demo Video Script — 90 seconds

> Goal: a single-take screen recording (with a face-cam intro) that hooks the
> judge in 10 seconds and ends with a clear call-to-action. Total target
> length: **75–90 seconds**. Anything longer and they'll skim.

---

## Tools

- **Screen recorder:** [Loom](https://loom.com/) or `OBS Studio` (free)
- **Tab order before recording:** wallet (Suiet/Slush), Walrus Vault tab,
  one Sui explorer tab open at `https://suiscan.xyz`
- **Test capsule:** before you hit record, seal a capsule that unlocks **2
  minutes from now**. You'll skip the wait by editing system clock OR using
  a separate pre-sealed capsule that's already past unlock time.

---

## Beat sheet

### 0:00 – 0:08 · Hook (face-cam, talking head)
> "What if the most important file you ever wrote could only be opened in
> ten years? Not by you, not by hackers, not by anyone — until the day you
> chose. That's Walrus Vault."

**On screen:** big title card "🐋 Walrus Vault" with tagline
*"Letters to the future, stored forever on Sui."*

### 0:08 – 0:18 · The pitch (voice-over, landing page)
> "Built solo for the Tatum × Walrus Hackathon, Walrus Vault turns every
> Sui wallet into a personal time-locked vault. Your file is encrypted in
> the browser, stored on Walrus, and gated by a Move smart contract on Sui."

**On screen:** scroll the landing page slowly. Highlight the three-step
"How it works" block.

### 0:18 – 0:38 · Live demo — sealing a capsule
> "Watch how fast it is."

1. Click **"Seal a capsule"** → `/create`
2. Type title: *"Letter to my 30-year-old self"*
3. Pick a date 1 minute in the future (so the demo is fast)
4. Drop in a `letter.txt` file
5. Click **"Seal capsule"**

Narrate while it runs:
> "It's encrypting locally with AES-256… uploading the ciphertext to
> Walrus… and now my wallet is signing a Move transaction that creates the
> Capsule object on Sui."

### 0:38 – 0:50 · The unlock magic
> "And here it is. The capsule lives in my wallet. I can't open it. Not
> yet. The smart contract enforces the time-lock."

**On screen:** click the share link → `/capsule/[id]` → show the countdown
ticking down. Try to click "Unlock & decrypt" while it's still locked → the
button is greyed out.

Wait for the countdown to hit zero (or cut to a pre-recorded segment that
already passed unlock time).

> "And now…"

Click **"Unlock & decrypt"** → wallet sign → file downloads.

> "The file is back. Pulled from Walrus. Decrypted in my browser. Provable
> on Sui."

### 0:50 – 1:05 · Why this matters (face-cam)
> "This is more than a 'letter to your future self' app. It's digital
> inheritance without a lawyer. It's a journalist's dead-man switch. It's
> a marriage proposal that opens on the wedding day, not before."

**On screen:** B-roll of the use-case grid on the landing page.

### 1:05 – 1:20 · Built on (technical credibility)
> "Walrus stores the encrypted blob — that's where the heavy data lives.
> Sui Move enforces the access policy in 70 lines. And every RPC call
> goes through Tatum's enterprise gateway. Three protocols, one product."

**On screen:** quick split-screen of (a) `vault.move`, (b) Walrus blob
explorer, (c) the Sui transaction on Suiscan.

### 1:20 – 1:30 · Call to action
> "Try it yourself at **walrus-vault.vercel.app**. The code is open source
> on GitHub. Built solo. Built in 14 days. Built to ship."

**On screen:** end card with the URL, the GitHub link, and a small
"Tatum × Walrus Hackathon" badge.

---

## Recording tips

- **One take is fine.** Don't over-edit — judges watch dozens of these,
  authenticity beats production value.
- **Speak slightly slower than feels natural.** Most demo videos sound
  rushed.
- **No music in the technical sections.** You want them to hear what
  you're saying, not an EDM track.
- **Subtitle the whole thing.** Most judges watch on mute first.
- **Upload to YouTube as Unlisted.** Devpost loves YouTube embeds; Drive
  links sometimes don't autoplay.

## Script export checklist

- [ ] Recording uploaded to YouTube (Unlisted)
- [ ] Thumbnail set to a frame showing the unlock animation
- [ ] Title: `Walrus Vault — Tatum × Walrus Hackathon Submission`
- [ ] Description includes GitHub link + live demo link
- [ ] Captions / subtitles uploaded
