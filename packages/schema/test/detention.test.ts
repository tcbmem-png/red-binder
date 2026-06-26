import { describe, expect, it } from 'vitest';
import { detentionSchema, detentionTokens, G28_FILLABLE_ENABLED } from '../src/detention';
import { composeIntakeSchema } from '../src/index';

describe('detentionSchema', () => {
  it('requires country of birth and defaults the rest', () => {
    const parsed = detentionSchema.parse({ country_of_birth: 'Mexico' });
    expect(parsed.a_number).toBe('');
    expect(parsed.chosen_path).toBe('undecided');
    expect(parsed.fear_of_return).toBe(false);
    expect(parsed.lawyer.has_signed_g28).toBe(false);
    expect(parsed.include_g28_blank).toBe(false);
  });

  it('rejects a missing country of birth', () => {
    expect(detentionSchema.safeParse({}).success).toBe(false);
  });

  it('accepts the optional immigration status (the federal branch key) and a chosen path', () => {
    expect(
      detentionSchema.safeParse({
        country_of_birth: 'Guatemala',
        immigration_status: 'undocumented',
        chosen_path: 'fight',
      }).success,
    ).toBe(true);
  });

  it('has the G-28 ratified (G28_FILLABLE_ENABLED) — the standalone G-28 document ships', () => {
    expect(G28_FILLABLE_ENABLED).toBe(true);
  });
});

describe('detentionTokens', () => {
  it('maps findability fields and the checkbox booleans', () => {
    const t = detentionTokens({
      country_of_birth: 'Mexico',
      a_number: 'A123456789',
      name_variants: 'Garcia; García',
      chosen_path: 'depart',
      fear_of_return: true,
      lawyer: { name: 'TCB Law', phone: '(662) 555-0100', has_signed_g28: true },
      trusted_person: { name: 'Rosa', relationship: 'Hermana', phone: '(662) 555-0166' },
    });
    expect(t.country_of_birth).toBe('Mexico');
    expect(t.a_number).toBe('A123456789');
    expect(t.path_fight).toBe(false);
    expect(t.path_depart).toBe(true);
    expect(t.fear_of_return).toBe(true);
    expect(t.lawyer_name).toBe('TCB Law');
    expect(t.lawyer_has_signed_g28).toBe(true);
    expect(t.trusted_person).toBe('Rosa');
    expect(t.has_authorization).toBe(true);
  });

  it('reports no authorization and omits empty tokens when nothing is provided', () => {
    const t = detentionTokens({ country_of_birth: 'Mexico' });
    expect(t.has_authorization).toBe(false);
    expect(t.path_fight).toBe(false);
    expect(t).not.toHaveProperty('a_number');
    expect(t).not.toHaveProperty('lawyer_name');
  });
});

describe('composeIntakeSchema with detention', () => {
  it('detention-only: core identity + emergency + detention fields; NO agents, address, or POA', () => {
    const k = Object.keys(composeIntakeSchema(['detention']).shape);
    expect(k).toEqual(
      expect.arrayContaining([
        'given_names',
        'emergency_contacts',
        'country_of_birth',
        'chosen_path',
      ]),
    );
    expect(k).not.toContain('primary_agent');
    expect(k).not.toContain('address');
    expect(k).not.toContain('jurisdiction');
  });

  it('poa + detention unions both subschemas onto core', () => {
    const k = Object.keys(composeIntakeSchema(['poa', 'detention']).shape);
    expect(k).toEqual(
      expect.arrayContaining(['jurisdiction', 'country_of_birth', 'primary_agent', 'address']),
    );
  });
});
