import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// RBP GATING GUARD (acceptance pass — emergency contacts + plan-only POA reference).
//
// Two source-level regressions this locks (no PDF render, so it never false-passes under font
// subsetting — same approach as rbp-repeater.test.ts):
//   1. Section 4 Emergency Contacts 1–5 must each sit inside `<!-- if:emergency_N_name -->`, and the
//      Section 4 heading inside emergency_1_name — so a 1-contact plan shows no empty Contact 2–5
//      blocks, and a 0-contact plan shows nothing there (mirrors the children / doc-table gating).
//   2. Every reference to the Durable Financial Power of Attorney must sit inside
//      `<!-- if:poa_included -->` — so an RBP-only run (no POA selected) never references a POA that
//      isn't in the download (no blank {{state}}, no "back of this binder"). The app sets
//      poa_included only when the POA is in the same generation (apps/builder/src/lib/generate.ts).
//
// Replays the engine's directive rule (packages/engine/src/markdown.ts → evalConditionals): a line
// is "guarded" by a token iff it sits inside an `<!-- if:...token... -->` … `<!-- endif -->`.

const RBP = fileURLToPath(new URL('../rbp/rbp_basic.en-es.md', import.meta.url));
const lines = readFileSync(RBP, 'utf8').split('\n');

const IF_RE = /^<!--\s*if:([^>]*?)-->$/i;
const ENDIF_RE = /^<!--\s*endif\s*-->$/i;

/** For each source line, the set of tokens currently open via enclosing if-blocks. */
function openTokensPerLine(): Set<string>[] {
  const perLine: Set<string>[] = [];
  const stack: string[][] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    const m = IF_RE.exec(trimmed);
    if (m) {
      stack.push(
        (m[1] ?? '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      );
      perLine.push(new Set());
      continue;
    }
    if (ENDIF_RE.test(trimmed)) {
      stack.pop();
      perLine.push(new Set());
      continue;
    }
    perLine.push(new Set(stack.flat()));
  }
  return perLine;
}

describe('RBP gating — emergency contacts + plan-only POA reference', () => {
  const open = openTokensPerLine();
  const guardedBy = (re: RegExp, token: string, label: string) => {
    const i = lines.findIndex((l) => re.test(l));
    expect(i, `${label}: not found in template`).toBeGreaterThanOrEqual(0);
    expect(open[i]!.has(token), `${label}: must be gated on ${token}`).toBe(true);
  };

  it('if/endif markers balance', () => {
    const ifs = lines.filter((l) => IF_RE.test(l.trim())).length;
    const endifs = lines.filter((l) => ENDIF_RE.test(l.trim())).length;
    expect(ifs).toBe(endifs);
  });

  it('each Emergency Contact 1–5 block is gated on its own emergency_N_name', () => {
    for (let n = 1; n <= 5; n++) {
      guardedBy(
        new RegExp(`^### Contact ${n} / Contacto ${n}$`),
        `emergency_${n}_name`,
        `contact ${n} block`,
      );
    }
  });

  it('the Section 4 heading is gated on emergency_1_name (0-contact plan shows nothing there)', () => {
    guardedBy(
      /^# \*\*SECTION 4 — EMERGENCY CONTACTS\*\*$/,
      'emergency_1_name',
      'Section 4 heading',
    );
  });

  it('every Power-of-Attorney reference is gated on poa_included (plan-only shows none)', () => {
    guardedBy(/See the back of this binder\./, 'poa_included', 'cover POA block');
    guardedBy(
      /^- A Durable Financial Power of Attorney naming my Agent\.$/,
      'poa_included',
      'Section 1 "what you will find" POA bullet',
    );
    guardedBy(
      /^This is the person named in the Power of Attorney at the back of this binder\.$/,
      'poa_included',
      'Section 2 Primary-Agent POA line',
    );
    guardedBy(
      /The Durable Financial Power of Attorney included in this binder/,
      'poa_included',
      'Section 6 POA notarization disclaimer',
    );
  });
});
