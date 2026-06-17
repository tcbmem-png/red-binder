import { describe, expect, it } from 'vitest';
import { poaSchema } from '../src/poa';

describe('poaSchema', () => {
  it('accepts a valid POA input', () => {
    expect(poaSchema.safeParse({ effectiveness: 'immediately', jurisdiction: 'MS' }).success).toBe(
      true,
    );
    expect(
      poaSchema.safeParse({ effectiveness: 'on_incapacity', jurisdiction: 'CA' }).success,
    ).toBe(true);
  });

  it('rejects an unknown jurisdiction', () => {
    expect(poaSchema.safeParse({ effectiveness: 'immediately', jurisdiction: 'ZZ' }).success).toBe(
      false,
    );
  });

  it('rejects an invalid effectiveness value', () => {
    expect(poaSchema.safeParse({ effectiveness: 'maybe', jurisdiction: 'MS' }).success).toBe(false);
  });

  it('defines no name or agent fields (those live in core)', () => {
    const shape = Object.keys(poaSchema.shape);
    expect(shape).toEqual(['effectiveness', 'jurisdiction', 'giftPower']);
  });

  it('defaults giftPower to false (no hot power granted unless elected)', () => {
    const parsed = poaSchema.parse({ effectiveness: 'immediately', jurisdiction: 'MS' });
    expect(parsed.giftPower).toBe(false);
  });
});
