// Token resolution: maps a {{token}} name to a value from the payload, the injected
// render-time values, or the image assets. Boolean values become checkboxes (☒ / ☐ are
// drawn as vectors at layout time, not as font glyphs).
import { sanitizeValue } from './sanitize';

export type Resolved =
  | { kind: 'text'; value: string }
  | { kind: 'checkbox'; checked: boolean }
  | { kind: 'image'; bytes: Uint8Array }
  | { kind: 'empty' };

export interface Resolver {
  /** Present and non-empty — used by conditional blocks and repeater rows. */
  has(name: string): boolean;
  resolve(name: string): Resolved;
}

export function makeResolver(
  data: Record<string, unknown>,
  injected: Record<string, string> | undefined,
  images: Record<string, Uint8Array> | undefined,
): Resolver {
  const lookup = (name: string): unknown => {
    if (Object.prototype.hasOwnProperty.call(data, name)) return data[name];
    if (injected && Object.prototype.hasOwnProperty.call(injected, name)) return injected[name];
    return undefined;
  };

  const imageBytes = (name: string): Uint8Array | undefined => {
    if (!images) return undefined;
    const v = images[name];
    return v instanceof Uint8Array ? v : undefined;
  };

  return {
    has(name) {
      if (imageBytes(name)) return true;
      const v = lookup(name);
      if (typeof v === 'boolean') return true;
      if (v === undefined || v === null) return false;
      return String(v).trim() !== '';
    },
    resolve(name) {
      const img = imageBytes(name);
      if (img) return { kind: 'image', bytes: img };
      const v = lookup(name);
      if (typeof v === 'boolean') return { kind: 'checkbox', checked: v };
      if (v === undefined || v === null) return { kind: 'empty' };
      const value = sanitizeValue(v);
      return value === '' ? { kind: 'empty' } : { kind: 'text', value };
    },
  };
}
