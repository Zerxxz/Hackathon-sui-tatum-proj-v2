// AES-GCM helpers running on the Web Crypto API.
//
// MVP behaviour:
//   * generateKey() returns a fresh 256-bit AES key
//   * encrypt() returns iv ‖ ciphertext as a single Uint8Array
//   * decrypt() expects the same layout
//
// The exported AES key is what we store in the Capsule object. v2 will
// wrap this exported key with the recipient's wallet pubkey via Seal so
// only they can decrypt it.

const ALG = "AES-GCM";
const IV_LEN = 12;

/**
 * WebCrypto's TS types insist on `Uint8Array<ArrayBuffer>` (not
 * `<ArrayBufferLike>`), so any view we pass in must be backed by a plain
 * ArrayBuffer. The cheapest way to guarantee that is a one-shot copy.
 */
function toArrayBufferBacked(view: Uint8Array): Uint8Array<ArrayBuffer> {
  const copy = new Uint8Array(view.byteLength);
  copy.set(view);
  return copy;
}

export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ALG, length: 256 },
    true, // extractable so we can export and store
    ["encrypt", "decrypt"],
  );
}

export async function exportKey(key: CryptoKey): Promise<Uint8Array> {
  const raw = await crypto.subtle.exportKey("raw", key);
  return new Uint8Array(raw);
}

export async function importKey(raw: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    toArrayBufferBacked(raw),
    ALG,
    true,
    ["encrypt", "decrypt"],
  );
}

export async function encrypt(
  key: CryptoKey,
  plaintext: Uint8Array,
): Promise<Uint8Array> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
  const cipher = await crypto.subtle.encrypt(
    { name: ALG, iv },
    key,
    toArrayBufferBacked(plaintext),
  );
  // Concatenate iv ‖ ciphertext so we only have to ship a single blob.
  const out = new Uint8Array(IV_LEN + cipher.byteLength);
  out.set(iv, 0);
  out.set(new Uint8Array(cipher), IV_LEN);
  return out;
}

export async function decrypt(
  key: CryptoKey,
  payload: Uint8Array,
): Promise<Uint8Array> {
  const iv = toArrayBufferBacked(payload.subarray(0, IV_LEN));
  const cipher = toArrayBufferBacked(payload.subarray(IV_LEN));
  const plain = await crypto.subtle.decrypt({ name: ALG, iv }, key, cipher);
  return new Uint8Array(plain);
}
