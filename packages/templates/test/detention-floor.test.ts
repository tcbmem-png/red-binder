import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// RENDERING-SIDE PRIVACY FLOOR (Taylor 2026-06-17).
//
// The schema's collection-side gate keeps a detention-ONLY payload free of contact + agent fields.
// But a COMBINED selection (e.g. POA + Pocket Plan) DOES collect a home address and the agent chain
// for the POA — so the only thing that keeps those off the carried card / binder page is the
// templates themselves. This asserts the detention templates reference NONE of those tokens, so the
// carried card can't leak a home address or an agent name by construction, even in a combined run.
//
// It activates automatically when wallet_card / binder_page land in build phase 5.
const DETENTION_DIR = fileURLToPath(new URL('../detention', import.meta.url));

const FORBIDDEN =
  /\{\{\s*(principal_address|principal_county|principal_phone|principal_email|agent[23]?_[a-z0-9_]+)\s*\}\}/i;

function detentionTemplates(): string[] {
  if (!existsSync(DETENTION_DIR)) return [];
  return readdirSync(DETENTION_DIR)
    .filter((f) => f.endsWith('.en-es.md'))
    .map((f) => join(DETENTION_DIR, f));
}

describe('detention templates — rendering-side privacy floor', () => {
  const files = detentionTemplates();

  it('the detention/ template directory exists', () => {
    expect(existsSync(DETENTION_DIR)).toBe(true);
  });

  for (const file of files) {
    it(`${file.split('/').pop()} references no contact or agent-chain tokens`, () => {
      const match = FORBIDDEN.exec(readFileSync(file, 'utf8'));
      expect(match ? `found forbidden token: ${match[0]}` : null).toBeNull();
    });
  }

  if (files.length === 0) {
    it('(no detention templates yet — the floor enforces automatically once phase 5 adds them)', () => {
      expect(files).toHaveLength(0);
    });
  }
});
