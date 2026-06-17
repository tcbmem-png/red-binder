import { describe, expect, it } from 'vitest';
import {
  DOCUMENT_PATH_LEGEND,
  getJurisdiction,
  isJurisdictionCode,
  JURISDICTIONS,
} from '../src/index';

describe('states.ts', () => {
  it('has all 51 jurisdictions (50 states + DC)', () => {
    expect(JURISDICTIONS).toHaveLength(51);
  });

  it('has unique state codes', () => {
    expect(new Set(JURISDICTIONS.map((j) => j.code)).size).toBe(51);
  });

  it('has unique tile coordinates (no overlapping tiles)', () => {
    const keys = JURISDICTIONS.map((j) => `${j.tile.row},${j.tile.col}`);
    expect(new Set(keys).size).toBe(51);
  });

  it('every documentPath is a valid enum value', () => {
    const valid = new Set(['UNIVERSAL', 'UNIVERSAL_PLUS_ADDENDUM', 'STATE_FORM']);
    for (const j of JURISDICTIONS) {
      expect(valid.has(j.documentPath), `${j.code}`).toBe(true);
    }
  });

  it('matches the confirmed 28 / 21 / 2 split', () => {
    const count = (p: string) => JURISDICTIONS.filter((j) => j.documentPath === p).length;
    expect(count('UNIVERSAL')).toBe(28);
    expect(count('UNIVERSAL_PLUS_ADDENDUM')).toBe(21);
    expect(count('STATE_FORM')).toBe(2);
  });

  it('MS and TN are the only STATE_FORM jurisdictions', () => {
    const stateForm = JURISDICTIONS.filter((j) => j.documentPath === 'STATE_FORM')
      .map((j) => j.code)
      .sort();
    expect(stateForm).toEqual(['MS', 'TN']);
  });

  it('keeps verify flags on the contested rows (IN, PA)', () => {
    expect(getJurisdiction('IN')?.verify).toBe(true);
    expect(getJurisdiction('PA')?.verify).toBe(true);
  });

  it('classifies MS / PA / IN as not full UPOAA', () => {
    for (const code of ['MS', 'PA', 'IN']) {
      expect(getJurisdiction(code)?.upoaa, code).toBe(false);
    }
  });

  it('every UNIVERSAL jurisdiction has upoaa === true', () => {
    for (const j of JURISDICTIONS.filter((x) => x.documentPath === 'UNIVERSAL')) {
      expect(j.upoaa, j.code).toBe(true);
    }
  });

  it('isJurisdictionCode recognizes valid and rejects invalid codes', () => {
    expect(isJurisdictionCode('CA')).toBe(true);
    expect(isJurisdictionCode('DC')).toBe(true);
    expect(isJurisdictionCode('ZZ')).toBe(false);
  });

  it('legend covers all three paths', () => {
    expect(DOCUMENT_PATH_LEGEND.map((e) => e.path).sort()).toEqual([
      'STATE_FORM',
      'UNIVERSAL',
      'UNIVERSAL_PLUS_ADDENDUM',
    ]);
  });
});
