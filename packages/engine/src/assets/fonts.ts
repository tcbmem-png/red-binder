// Atkinson Hyperlegible font bytes for pdf-lib embedding.
//
// Decoded from the base64-embedded OFL TrueType files (./fonts.generated.ts) so the engine
// stays pure: no filesystem read, no network, no runtime CDN. `atob` is a standard global in
// both Node (>=16) and browsers — not a DOM/window coupling.
import { atkinsonBoldBase64, atkinsonRegularBase64 } from './fonts.generated';

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export const fontRegularBytes: Uint8Array = base64ToBytes(atkinsonRegularBase64);
export const fontBoldBytes: Uint8Array = base64ToBytes(atkinsonBoldBase64);
