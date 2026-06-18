import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// RENDERING-SIDE PRIVACY FLOOR (Taylor 2026-06-17).
//
// The schema's collection-side gate keeps a detention-ONLY payload free of contact + agent fields.
// A COMBINED selection (e.g. POA + Pocket Plan) DOES collect a home address and the agent chain for
// the POA — so the only thing that keeps those off the card / binder is the templates. These tests
// assert that by construction, and activate automatically as the phase-5 templates land.
const DETENTION_DIR = fileURLToPath(new URL('../detention', import.meta.url));

// Never on ANY detention template: core contact + the POA agent chain.
const FORBIDDEN_ALL =
  /\{\{\s*(principal_address|principal_county|principal_phone|principal_email|agent[23]?_[a-z0-9_]+)\s*\}\}/i;

// Never on the CARRIED card (seizure risk): any sensitive findability identifier. The card holds
// only the rights script, the DO-NOT-SIGN rule, and who-to-call — no name, DOB, A-number, status,
// country of birth, fear-of-return, or photo. (SPEC §1; the binder page may carry these.)
const FORBIDDEN_ON_CARD =
  /\{\{\s*(legal_name_full|apellido_paterno|apellido_materno|principal_dob|dob_exact|a_number|country_of_birth|immigration_status|name_variants|aliases|fear_of_return|photo|height|distinguishing_features)\s*\}\}/i;

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
    const name = file.split('/').pop() ?? file;
    it(`${name} references no contact or agent-chain tokens`, () => {
      const match = FORBIDDEN_ALL.exec(readFileSync(file, 'utf8'));
      expect(match ? `found forbidden token: ${match[0]}` : null).toBeNull();
    });
  }

  const card = files.find((f) => f.endsWith('wallet_card.en-es.md'));
  if (card) {
    it('the carried Pocket Card holds no sensitive findability identifiers', () => {
      const match = FORBIDDEN_ON_CARD.exec(readFileSync(card, 'utf8'));
      expect(match ? `card must not carry: ${match[0]}` : null).toBeNull();
    });
  }

  if (files.length === 0) {
    it('(no detention templates yet — the floor enforces automatically once phase 5 adds them)', () => {
      expect(files).toHaveLength(0);
    });
  }
});
