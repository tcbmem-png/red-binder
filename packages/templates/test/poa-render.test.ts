import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// GOTCHA (f) GUARD — the POA notary acknowledgment + durability language MUST render.
//
// The engine (packages/engine/src/markdown.ts -> truncateInternal) drops everything from the FIRST
// `<!-- internal -->` comment OR `## Open questions for Taylor` heading onward — that tail is
// provenance/QA, never principal-facing. If the notary block or the durability "magic words" ever
// drift into that stripped tail (or behind a hide-if-absent `<!-- if: -->`), the POA renders WITHOUT
// its notary acknowledgment and is legally non-functional. A POA missing its notary block does not
// work. These tests assert, for every POA template, that the operative notary + durability text sits
// in the SURVIVING body and the VERIFIED provenance heading sits in the STRIPPED tail.
//
// This is a source-level structural guard (like detention-floor.test.ts) — it does not run the PDF
// renderer, so it never false-passes under font subsetting. It mirrors the engine's truncation rule
// by name: if you change `truncateInternal`, update splitAtTruncation() here to match.

const POA_DIR = fileURLToPath(new URL('../poa', import.meta.url));
const TEMPLATES = ['poa_financial_universal', 'poa_ms', 'poa_tn'].map((n) => `${n}.en-es.md`);

/** Split a template at the engine's first truncation marker (mirrors markdown.ts truncateInternal). */
function splitAtTruncation(src: string): { body: string; tail: string } {
  const internal = src.search(/<!--\s*internal/i);
  const openQ = src.search(/^#{1,6}[ \t]+Open questions for Taylor/im);
  const marks = [internal, openQ].filter((i) => i !== -1);
  const cut = marks.length ? Math.min(...marks) : src.length;
  return { body: src.slice(0, cut), tail: src.slice(cut) };
}

describe('POA notary + durability render (gotcha f guard)', () => {
  for (const file of TEMPLATES) {
    const src = readFileSync(`${POA_DIR}/${file}`, 'utf8');
    const { body, tail } = splitAtTruncation(src);
    const plainBody = body.replace(/\*/g, ''); // drop markdown bold so phrase matches are clean

    it(`${file}: has a truncation marker (so the body/tail split is meaningful)`, () => {
      expect(
        tail.length,
        `${file} has no <!-- internal --> or "Open questions for Taylor" marker`,
      ).toBeGreaterThan(0);
    });

    it(`${file}: the notary acknowledgment renders (lives in the body, not the stripped tail)`, () => {
      expect(body).toMatch(/NOTARY ACKNOWLEDGMENT/);
      expect(plainBody).toMatch(/acknowledged that/i); // the operative jurat sentence
    });

    it(`${file}: the durability language renders`, () => {
      expect(plainBody).toMatch(/\bdurable\b/i);
      expect(plainBody).toMatch(/\bnot\b\s+(terminat|affect)/i); // "not terminated" / "NOT terminate" / "not affected"
    });

    it(`${file}: the VERIFIED provenance heading is in the stripped tail (not principal-facing)`, () => {
      expect(tail).toMatch(/^#{1,6}[ \t]+.*VERIFIED/im);
    });
  }
});
