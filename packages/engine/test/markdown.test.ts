import { describe, expect, it } from 'vitest';
import { parseInline, prepareSource } from '../src/markdown';
import { makeResolver } from '../src/resolve';
import { sanitizeValue } from '../src/sanitize';

describe('parseInline', () => {
  it('splits leading text, bold, and tokens', () => {
    expect(parseInline('Name: **{{a}} {{b}}**')).toEqual([
      { t: 'text', s: 'Name: ', bold: false, es: false },
      { t: 'token', name: 'a', bold: true, es: false },
      { t: 'text', s: ' ', bold: true, es: false },
      { t: 'token', name: 'b', bold: true, es: false },
    ]);
  });

  it('marks a fully italic Spanish line as es', () => {
    const runs = parseInline('*Nombre: {{a}}*');
    expect(runs.every((r) => r.es)).toBe(true);
    expect(runs.some((r) => r.t === 'token' && r.name === 'a')).toBe(true);
  });
});

describe('prepareSource', () => {
  const resolver = (data: Record<string, unknown>) => makeResolver(data, undefined, undefined);

  it('keeps a conditional block only when a listed token is present', () => {
    const tpl = 'A\n<!-- if:x -->\nB {{x}}\n<!-- endif -->\nC';
    expect(prepareSource(tpl, resolver({ x: 'yes' })).join('\n')).toContain('B');
    expect(prepareSource(tpl, resolver({})).join('\n')).not.toContain('B');
  });

  it('strips the Internal tail and the Open questions section', () => {
    const tpl =
      'Body\n\n<!-- Internal -->\n## VERIFIED — locked\ncite\n\n## Open questions for Taylor\nq';
    const out = prepareSource(tpl, resolver({})).join('\n');
    expect(out).toContain('Body');
    expect(out).not.toContain('VERIFIED');
    expect(out).not.toContain('Open questions');
  });

  it('splits page segments on a pagebreak', () => {
    expect(prepareSource('one\n<!-- pagebreak -->\ntwo', resolver({}))).toHaveLength(2);
  });

  it('strips YAML frontmatter', () => {
    const out = prepareSource('---\ntitle: x\n---\nBody', resolver({})).join('\n');
    expect(out).not.toContain('title:');
    expect(out).toContain('Body');
  });
});

describe('sanitizeValue', () => {
  it('strips HTML but keeps spaces and hyphens', () => {
    expect(sanitizeValue('Ana <b>María</b> López-Pérez')).toBe('Ana María López-Pérez');
  });

  it('treats a token-shaped value as literal (no re-interpretation)', () => {
    expect(sanitizeValue('{{evil}}')).toBe('{{evil}}');
  });

  it('drops control characters but keeps the surrounding text', () => {
    // Build the input from char codes so no literal control bytes live in source.
    const input = 'a' + String.fromCharCode(0) + 'b' + String.fromCharCode(7) + 'c';
    expect(sanitizeValue(input)).toBe('abc');
  });

  it('collapses newlines and tabs to a single space', () => {
    expect(sanitizeValue('line1\nline2\tx')).toBe('line1 line2 x');
  });
});

describe('makeResolver', () => {
  const r = makeResolver(
    { name: 'Ana', flag: true, off: false, blank: '' },
    { gen: '2026-06-17' },
    { photo: new Uint8Array([1, 2, 3]) },
  );

  it('resolves text, checkboxes, images, injected, and empties', () => {
    expect(r.resolve('name')).toEqual({ kind: 'text', value: 'Ana' });
    expect(r.resolve('flag')).toEqual({ kind: 'checkbox', checked: true });
    expect(r.resolve('off')).toEqual({ kind: 'checkbox', checked: false });
    expect(r.resolve('blank')).toEqual({ kind: 'empty' });
    expect(r.resolve('gen')).toEqual({ kind: 'text', value: '2026-06-17' });
    expect(r.resolve('photo').kind).toBe('image');
    expect(r.resolve('missing')).toEqual({ kind: 'empty' });
  });

  it('reports presence for conditionals/rows', () => {
    expect(r.has('name')).toBe(true);
    expect(r.has('blank')).toBe(false);
    expect(r.has('missing')).toBe(false);
    expect(r.has('off')).toBe(true); // a boolean is present even when false
    expect(r.has('photo')).toBe(true);
  });
});
