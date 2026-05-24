// Thin wrapper around the Walrus HTTP publisher/aggregator.
//
// Docs: https://docs.wal.app/usage/web-api.html
// We use the HTTP API instead of the @mysten/walrus SDK to keep the MVP
// dependency surface small. Swap to the SDK if you need fine-grained
// control over storage nodes or upload relays.

import { config } from "./config";

export type StoreResult = {
  blobId: string;
  // The full Walrus response, kept opaque so the caller can debug if needed.
  raw: unknown;
};

/**
 * Upload a blob (Uint8Array) to Walrus and return its blob id.
 *
 * @param data        Encrypted bytes to store.
 * @param epochs      How many storage epochs to pay for. ~1 epoch ≈ 1 day.
 */
export async function storeBlob(
  data: Uint8Array,
  epochs: number = config.walrus.defaultEpochs,
): Promise<StoreResult> {
  const url = `${config.walrus.publisher}/v1/blobs?epochs=${epochs}`;
  // Cast: the body must be ArrayBuffer-backed; a Uint8Array view is fine
  // at runtime but `fetch`'s typings reject `Uint8Array<ArrayBufferLike>`.
  const res = await fetch(url, {
    method: "PUT",
    body: data as BodyInit,
  });

  if (!res.ok) {
    throw new Error(`Walrus store failed: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as Record<string, unknown>;

  // Walrus returns either { newlyCreated: { blobObject: { blobId } } }
  // or { alreadyCertified: { blobId } } depending on whether the blob was
  // already stored. Normalise to a single shape.
  const newly = (json.newlyCreated as { blobObject?: { blobId?: string } })
    ?.blobObject?.blobId;
  const already = (json.alreadyCertified as { blobId?: string })?.blobId;
  const blobId = newly ?? already;

  if (!blobId) {
    throw new Error(`Unexpected Walrus response: ${JSON.stringify(json)}`);
  }

  return { blobId, raw: json };
}

/**
 * Download a blob from Walrus by id. Returns the raw bytes.
 */
export async function readBlob(blobId: string): Promise<Uint8Array> {
  const url = `${config.walrus.aggregator}/v1/blobs/${blobId}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Walrus read failed: ${res.status}`);
  }
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}
