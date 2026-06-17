import { describe, expect, it } from 'vitest';
import {
  composeCoreSchema,
  coreFieldGroupsFor,
  coreTokens,
  legalNameFull,
  principalFirst,
  principalLast,
} from '../src/core';
import { composeIntakeSchema } from '../src/index';

describe('dual-surname identity', () => {
  const name = {
    given_names: 'María Fernanda',
    apellido_paterno: 'García',
    apellido_materno: 'López',
  };

  it('derives first / last / full from one model', () => {
    expect(principalFirst(name)).toBe('María Fernanda');
    expect(principalLast(name)).toBe('García López');
    expect(legalNameFull(name)).toBe('María Fernanda García López');
  });

  it('handles a missing apellido materno', () => {
    const n = { given_names: 'Juan', apellido_paterno: 'García', apellido_materno: '' };
    expect(principalLast(n)).toBe('García');
    expect(legalNameFull(n)).toBe('Juan García');
  });
});

describe('composeCoreSchema — gated by selection (data minimization within core)', () => {
  const keys = (sel: Parameters<typeof composeCoreSchema>[0]) =>
    Object.keys(composeCoreSchema(sel).shape);

  it('detention-only collects identity + emergency contacts, but NO agent or contact fields', () => {
    const k = keys(['detention']);
    expect(k).toContain('given_names');
    expect(k).toContain('emergency_contacts');
    expect(k).not.toContain('primary_agent'); // the privacy floor: never ask a detention-only user
    expect(k).not.toContain('address');
  });

  it('poa-only collects identity + contact + the agent chain, but NO emergency contacts', () => {
    const k = keys(['poa']);
    expect(k).toContain('primary_agent');
    expect(k).toContain('address');
    expect(k).not.toContain('emergency_contacts');
  });

  it('rbp collects identity + contact + agents + emergency contacts', () => {
    expect(keys(['rbp'])).toEqual(
      expect.arrayContaining(['given_names', 'address', 'primary_agent', 'emergency_contacts']),
    );
  });

  it('poa + detention unions their needs (agents from POA, emergency contacts from detention)', () => {
    expect(keys(['poa', 'detention'])).toEqual(
      expect.arrayContaining(['given_names', 'address', 'primary_agent', 'emergency_contacts']),
    );
  });

  it('coreFieldGroupsFor reflects the gating (drives the intake sections)', () => {
    expect(coreFieldGroupsFor(['detention'])).toEqual(['identity', 'emergencyContacts']);
    expect(coreFieldGroupsFor(['poa'])).toEqual(['identity', 'contact', 'agentChain']);
  });
});

describe('coreTokens — the identity → token bridge', () => {
  it('derives POA and Pocket Plan name tokens from one identity model', () => {
    const t = coreTokens({
      given_names: 'María Fernanda',
      apellido_paterno: 'García',
      apellido_materno: 'López',
      dob: '1988-04-12',
      address: '123 Main St',
      county: 'Lafayette',
      phone: '(662) 555-0142',
      email: '',
      primary_agent: { first_name: 'Juan', last_name: 'García', relationship: 'Hermano' },
    });
    expect(t.principal_first).toBe('María Fernanda');
    expect(t.principal_last).toBe('García López');
    expect(t.legal_name_full).toBe('María Fernanda García López');
    expect(t.apellido_paterno).toBe('García');
    expect(t.apellido_materno).toBe('López');
    expect(t.principal_dob).toBe('1988-04-12');
    expect(t.dob_exact).toBe('1988-04-12'); // same model feeds the Pocket Plan findability DOB
    expect(t.principal_county).toBe('Lafayette');
    expect(t.agent_first).toBe('Juan');
    expect(t.agent_relationship).toBe('Hermano');
    expect(t).not.toHaveProperty('principal_email'); // empty optional omitted
  });

  it('omits empty optionals', () => {
    const t = coreTokens({ given_names: 'Ana', apellido_paterno: 'Ruiz' });
    expect(t.principal_last).toBe('Ruiz');
    expect(t).not.toHaveProperty('apellido_materno');
  });
});

describe('composeIntakeSchema', () => {
  it('merges core + the POA subschema when POA is selected', () => {
    expect(Object.keys(composeIntakeSchema(['poa']).shape)).toEqual(
      expect.arrayContaining(['given_names', 'jurisdiction', 'effectiveness', 'giftPower']),
    );
  });

  it('a detention-only intake has no POA fields and no agent fields', () => {
    const k = Object.keys(composeIntakeSchema(['detention']).shape);
    expect(k).not.toContain('jurisdiction');
    expect(k).not.toContain('primary_agent');
  });
});
