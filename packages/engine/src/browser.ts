// @red-binder/engine/browser — the ONLY browser-coupled export, kept in its own entry so the
// core stays pure (no window/fs/network). Per docs/ARCHITECTURE.md §3.
import type { RenderResult } from './types';

/**
 * Trigger a browser download for each result. Nothing is uploaded — the bytes were generated
 * on-device and only the user receives them.
 *
 * `zipName` is reserved for a future single-archive download. For now each file downloads
 * individually, which also keeps outputs separate (the Pocket Plan is never auto-bundled).
 */
export function downloadResults(results: RenderResult[], _opts?: { zipName?: string }): void {
  for (const result of results) {
    // Cast: TS 5.7 types Uint8Array as Uint8Array<ArrayBufferLike>, which the DOM lib's
    // BlobPart (ArrayBufferView<ArrayBuffer>) rejects. The bytes are plain ArrayBuffer-backed.
    const blob = new Blob([result.bytes as unknown as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = result.filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }
}
