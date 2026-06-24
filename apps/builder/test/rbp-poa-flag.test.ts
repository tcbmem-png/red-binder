import { describe, expect, it } from 'vitest';
import { buildRenderInputs } from '../src/lib/generate';

// Fix-2 app-side guard. The RBP references the POA only when the POA is in the same generation:
// buildRenderInputs must set `poa_included` (and the jurisdiction `state`) on the RBP's injected
// values ONLY when 'poa' is also selected — so the template's `<!-- if:poa_included -->` gate has a
// signal, and a Plan-only run renders no POA reference (no blank {{state}}). Pairs with the
// source-level guard in packages/templates/test/rbp-gating.test.ts.
const PAYLOAD: Record<string, unknown> = {
  given_names: 'María',
  apellido_paterno: 'García',
  dob: '1988-04-12',
  address: '123 Calle',
  county: 'Lafayette',
  phone: '555',
  primary_agent: { first_name: 'Juan', last_name: 'Agente', relationship: 'Hermano' },
  emergency_contacts: [{ name: 'Ana', relationship: 'Vecina', phone: '666' }],
  jurisdiction: 'MS',
};

const rbpInjected = (selected: ('rbp' | 'poa' | 'detention')[]) =>
  buildRenderInputs({ selected, payload: PAYLOAD, generatedDate: '2026-06-18' }).find(
    (i) => i.template.id === 'red-binder-plan',
  )?.injected ?? {};

describe('RBP poa_included / state injection (gate the plan-only POA reference)', () => {
  it('RBP-only: no poa_included and no state — the POA reference stays gated out', () => {
    const injected = rbpInjected(['rbp']);
    expect(injected.poa_included).toBeUndefined();
    expect(injected.state).toBeUndefined();
  });

  it('RBP + POA: poa_included is set and state fills from the chosen jurisdiction', () => {
    const injected = rbpInjected(['rbp', 'poa']);
    expect(injected.poa_included).toBeTruthy();
    expect(injected.state, 'state should fill from the chosen jurisdiction').toBeTruthy();
  });
});
