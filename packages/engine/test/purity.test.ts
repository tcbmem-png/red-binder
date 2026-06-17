import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// The core must be browser-safe: no window/fs/network/server-only globals. The single
// browser-coupled file (browser.ts) is excluded, as are generated data files.
const SRC = fileURLToPath(new URL('../src', import.meta.url));

function coreFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...coreFiles(full));
    } else if (
      entry.name.endsWith('.ts') &&
      entry.name !== 'browser.ts' &&
      !entry.name.endsWith('.generated.ts')
    ) {
      out.push(full);
    }
  }
  return out;
}

function stripComments(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

const FORBIDDEN: [RegExp, string][] = [
  // Match the DOM globals only when accessed (so a 'document' string literal — e.g. a
  // filename fallback — is not a false positive).
  [/\bwindow\s*\./, 'window.'],
  [/\bdocument\s*\./, 'document.'],
  [/\blocalStorage\b/, 'localStorage'],
  [/\bsessionStorage\b/, 'sessionStorage'],
  [/\bXMLHttpRequest\b/, 'XMLHttpRequest'],
  [/\bfetch\s*\(/, 'fetch('],
  [/['"](?:node:)?fs['"]/, "an 'fs' import"],
  [/\bprocess\./, 'process.'],
];

describe('engine core is browser-safe (pure)', () => {
  const files = coreFiles(SRC);

  it('finds core files to scan', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    const name = file.slice(SRC.length + 1);
    it(`${name} references no window/fs/network globals`, () => {
      const code = stripComments(readFileSync(file, 'utf8'));
      for (const [pattern, label] of FORBIDDEN) {
        expect(pattern.test(code), `${name} should not reference ${label}`).toBe(false);
      }
    });
  }
});
