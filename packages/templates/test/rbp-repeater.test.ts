import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// RBP REPEATER HIDE-ANNOTATION GUARD (gotcha (e) / handoff §3.A.1).
//
// Without `<!-- if: -->` annotations the RBP renders all 20 child blocks + 30 document rows +
// both successor-agent blocks regardless of how many are filled (page bloat); and an empty
// children/documents set would still print a lonely section heading or an empty table. This
// test asserts, at the source level, that every repeater block — and the Section 3 heading and
// the Section 5 doc-table header/separator that would otherwise orphan when empty — sits inside
// the engine's conditional, keyed on the block's REQUIRED token (child_N_name / doc_N_label /
// agent2_first / agent3_first). It is a structural guard: it does NOT run the PDF renderer, so it
// never false-passes under font subsetting (gotcha (a)). It replays the engine's directive rule
// (packages/engine/src/markdown.ts → evalConditionals): a line is "guarded" by a token iff it sits
// inside an `<!-- if:...token... -->` … `<!-- endif -->` whose token list includes that token.

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

describe('RBP repeater blocks hide when empty (gotcha e / §3.A.1)', () => {
  it('every repeater row + each orphan-prone section is gated on its required token', () => {
    const open = openTokensPerLine();
    const guardedBy = (re: RegExp, token: string, label: string) => {
      const i = lines.findIndex((l) => re.test(l));
      expect(i, `${label}: not found in template`).toBeGreaterThanOrEqual(0);
      expect(open[i]!.has(token), `${label}: must be gated on ${token}`).toBe(true);
    };

    // if/endif markers balance.
    const ifs = lines.filter((l) => IF_RE.test(l.trim())).length;
    const endifs = lines.filter((l) => ENDIF_RE.test(l.trim())).length;
    expect(ifs, 'if/endif markers must balance').toBe(endifs);

    // Every child block (1..20) gated on its own child_N_name.
    for (let n = 1; n <= 20; n++) {
      guardedBy(new RegExp(`^### Child ${n} / Niño ${n}$`), `child_${n}_name`, `child ${n} block`);
    }
    // Every document row (1..30) gated on its own doc_N_label.
    for (let n = 1; n <= 30; n++) {
      guardedBy(new RegExp(`\\{\\{doc_${n}_label\\}\\}`), `doc_${n}_label`, `document row ${n}`);
    }
    // Successor + second-successor agent blocks.
    guardedBy(/\{\{agent2_first\}\}/, 'agent2_first', 'successor agent block');
    guardedBy(/\{\{agent3_first\}\}/, 'agent3_first', 'second successor agent block');

    // Zero-empty edge case (§ Taylor): the children-section heading and the doc-table header +
    // separator must also vanish when empty — keyed on the first row's token — so an empty plan
    // renders nothing there, not a lonely header.
    guardedBy(/^# \*\*SECTION 3 — CHILDREN\*\*$/, 'child_1_name', 'Section 3 heading');
    guardedBy(
      /^\| # \| Document \/ Documento \| Location \/ Ubicación \|$/,
      'doc_1_label',
      'doc-table header',
    );
    guardedBy(/^\|---\|---\|---\|$/, 'doc_1_label', 'doc-table separator');

    // The always-present primary agent stays UNguarded (must never be hidden).
    const primary = lines.findIndex((l) => l.includes('{{agent_first}}'));
    expect(primary, 'primary agent not found').toBeGreaterThanOrEqual(0);
    expect(open[primary]!.size, 'primary agent must stay unguarded').toBe(0);
  });
});
