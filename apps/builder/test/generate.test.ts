import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderDocuments, type RenderInput } from '@red-binder/engine';
import { describe, expect, it } from 'vitest';
import { buildRenderInputs } from '../src/lib/generate';

// A fully-populated payload across all three documents — the worst case for a cross-document leak.
const FULL_PAYLOAD: Record<string, unknown> = {
  given_names: 'María Fernanda',
  apellido_paterno: 'García',
  apellido_materno: 'López',
  dob: '1988-04-12',
  address: '123 Calle Secreta',
  county: 'Lafayette',
  phone: '(662) 555-0142',
  email: 'mfg@example.com',
  primary_agent: {
    first_name: 'Juan',
    last_name: 'Agente',
    relationship: 'Hermano',
    address: '45 Oak',
    phone: '555',
  },
  emergency_contacts: [{ name: 'Ana Backup', relationship: 'Vecina', phone: '(662) 555-0123' }],
  jurisdiction: 'CA',
  effectiveness: 'immediately',
  giftPower: true,
  country_of_birth: 'Mexico',
  a_number: 'A123456789',
  name_variants: 'Garcia',
  aliases: 'Mari',
  chosen_path: 'depart',
  fear_of_return: true,
  lawyer: { name: 'TCB Law', phone: '555', has_signed_g28: true },
  trusted_person: { name: 'Rosa', relationship: 'Hermana', phone: '666' },
  children: [{ name: 'Sofía', dob: '2015-06-01', school: 'Oxford' }],
  document_locations: [{ label: 'Passport', location: 'Safe' }],
};

const build = (selected: ('rbp' | 'poa' | 'detention')[]) =>
  buildRenderInputs({ selected, payload: FULL_PAYLOAD, generatedDate: '2026-06-17' });
const byId = (inputs: RenderInput[], idStart: string) =>
  inputs.find((i) => i.template.id.startsWith(idStart));
const dataOf = (inputs: RenderInput[], idStart: string) =>
  JSON.stringify(byId(inputs, idStart)?.data ?? {});

describe('outputs stay separate (gate #2)', () => {
  it('each selected document is its own RenderInput; the Pocket Plan is never merged', () => {
    const ids = build(['poa', 'rbp', 'detention']).map((i) => i.template.id);
    expect(ids).toContain('red-binder-plan');
    expect(ids).toContain('pocket-card');
    expect(ids).toContain('binder-page');
    expect(ids.some((id) => id.startsWith('power-of-attorney'))).toBe(true);
    expect(new Set(ids).size).toBe(ids.length); // distinct files, nothing bundled
  });

  it('fan-out renders each input to its own valid PDF with a distinct filename', async () => {
    const inputs = build(['poa', 'detention']);
    const results = await renderDocuments(inputs);
    expect(results.length).toBe(inputs.length);
    for (const r of results) {
      expect(r.bytes[0]).toBe(0x25); // %PDF
      expect(r.filename.endsWith('.pdf')).toBe(true);
    }
    expect(new Set(results.map((r) => r.filename)).size).toBe(results.length);
  });
});

describe('detention slices carry no POA / contact / agent data (gate #2, at the slice)', () => {
  const binder = dataOf(build(['poa', 'detention']), 'binder-page');

  it('the binder carries no contact (address) or agent values or token keys', () => {
    for (const leak of [
      '123 Calle Secreta',
      'Lafayette',
      'mfg@example.com',
      'Juan',
      'Agente',
      '45 Oak',
    ]) {
      expect(binder).not.toContain(leak);
    }
    for (const key of [
      'principal_address',
      'principal_county',
      'principal_email',
      'agent_first',
      'agent_last',
    ]) {
      expect(binder).not.toContain(key);
    }
  });

  it('the binder carries no POA data', () => {
    for (const key of [
      'effective_immediately',
      'grant_gift_power',
      'governing_law_state',
      'jurisdiction',
    ]) {
      expect(binder).not.toContain(key);
    }
  });
});

describe('the carried Pocket Card carries no sensitive identifier (full payload)', () => {
  it('the card slice contains none of A-number / name / DOB / country / fear-of-return', () => {
    const card = dataOf(build(['detention']), 'pocket-card');
    for (const sensitive of [
      'A123456789',
      'María Fernanda',
      'García',
      'López',
      '1988-04-12',
      'Mexico',
    ]) {
      expect(card).not.toContain(sensitive);
    }
    expect(card).not.toContain('fear_of_return');
    expect(card).not.toContain('a_number');
  });

  it('the card still carries who-to-call', () => {
    const card = dataOf(build(['detention']), 'pocket-card');
    expect(card).toContain('TCB Law');
    expect(card).toContain('Rosa');
    expect(card).toContain('Ana Backup');
  });
});

describe('no-storage floor (gate #3): the app persists and transmits nothing', () => {
  const SRC = fileURLToPath(new URL('../src', import.meta.url));
  const FORBIDDEN: [RegExp, string][] = [
    [/\blocalStorage\b/, 'localStorage'],
    [/\bsessionStorage\b/, 'sessionStorage'],
    [/\bindexedDB\b/, 'indexedDB'],
    [/\bXMLHttpRequest\b/, 'XMLHttpRequest'],
    [/\bfetch\s*\(/, 'fetch('],
    [/navigator\.sendBeacon/, 'sendBeacon'],
  ];
  const stripComments = (s: string) =>
    s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  function tsFiles(dir: string): string[] {
    const out: string[] = [];
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) out.push(...tsFiles(p));
      else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
    }
    return out;
  }

  for (const file of tsFiles(SRC)) {
    const name = file.slice(SRC.length + 1);
    it(`${name} uses no storage or network APIs`, () => {
      const code = stripComments(readFileSync(file, 'utf8'));
      for (const [re, label] of FORBIDDEN) {
        expect(re.test(code), `${name} should not use ${label}`).toBe(false);
      }
    });
  }
});
