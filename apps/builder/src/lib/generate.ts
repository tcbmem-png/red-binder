// Fan-out orchestration (app-layer per ARCHITECTURE §3): one validated payload -> one RenderInput
// per selected document, each sliced to exactly the tokens that document needs. The engine then
// renders each independently and the browser downloads them as SEPARATE files. The Pocket Plan is
// never bundled with anything.
//
// LEAK SAFETY: the detention slices carry only what the carried card / binder need — the card gets
// who-to-call only (no identity at all); the binder gets identity name/DOB + detention findability,
// but NO contact (address) or agent tokens. So a combined POA + Pocket Plan run can never route a
// home address or an agent name onto the card or binder, by slicing — backed by the template floor
// test and the slice tests in generate.test.ts.
import { type RenderInput, renderDocuments } from '@red-binder/engine';
import { downloadResults } from '@red-binder/engine/browser';
import {
  coreTokens,
  detentionTokens,
  type DocKind,
  emergencyTokens,
  G28_FILLABLE_ENABLED,
  g28Tokens,
  poaTokens,
  rbpTokens,
} from '@red-binder/schema';
import { getJurisdiction } from '@red-binder/poa-data';

import poaUniversal from '@red-binder/templates/poa/poa_financial_universal.en-es.md?raw';
import poaMs from '@red-binder/templates/poa/poa_ms.en-es.md?raw';
import poaTn from '@red-binder/templates/poa/poa_tn.en-es.md?raw';
import executionInstructions from '@red-binder/templates/poa/execution_instructions.en-es.md?raw';
import stateAddendum from '@red-binder/templates/poa/state_addendum.en-es.md?raw';
import rbpBasic from '@red-binder/templates/rbp/rbp_basic.en-es.md?raw';
import walletCard from '@red-binder/templates/detention/wallet_card.en-es.md?raw';
import binderPage from '@red-binder/templates/detention/binder_page.en-es.md?raw';

/** The ONLY core tokens that may reach the detention binder: the name model + exact DOB. */
const BINDER_IDENTITY_TOKENS = [
  'legal_name_full',
  'apellido_paterno',
  'apellido_materno',
  'dob_exact',
];

function pick(src: Record<string, string>, keys: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of keys) {
    const value = src[key];
    if (value !== undefined) out[key] = value;
  }
  return out;
}

const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined;

export interface GenerateOptions {
  selected: DocKind[];
  payload: Record<string, unknown>;
  assets?: { images?: Record<string, Uint8Array> };
  generatedDate: string;
}

/** Build one RenderInput per selected document, each sliced to just its tokens. Pure. */
export function buildRenderInputs({
  selected,
  payload,
  assets,
  generatedDate,
}: GenerateOptions): RenderInput[] {
  const inputs: RenderInput[] = [];
  const core = coreTokens(payload);

  if (selected.includes('poa')) {
    const jur = getJurisdiction(str(payload.jurisdiction) ?? '');
    const injected = { generated_date: generatedDate, governing_law_state: jur?.name ?? '' };
    const data = { ...core, ...poaTokens(payload) };
    const source =
      jur?.documentPath === 'STATE_FORM' ? (jur.code === 'MS' ? poaMs : poaTn) : poaUniversal;
    inputs.push({
      template: { id: `power-of-attorney-${jur?.code ?? 'xx'}`, source },
      data,
      injected,
      locale: 'bilingual',
    });
    inputs.push({
      template: { id: 'how-to-sign', source: executionInstructions },
      data: {},
      injected,
      locale: 'bilingual',
    });
    if (jur?.documentPath === 'UNIVERSAL_PLUS_ADDENDUM') {
      inputs.push({
        template: { id: `state-notice-${jur.code}`, source: stateAddendum },
        data: { state_quirk_note: jur.notes },
        injected,
        locale: 'bilingual',
      });
    }
  }

  if (selected.includes('rbp')) {
    // The RBP's POA-reference passages are gated on `poa_included`: they render ONLY when the POA
    // is part of the SAME generation, so a Plan-only run never references a POA that isn't in the
    // download (no blank state, no "back of this binder"). When the POA is included we also supply
    // the state from the chosen jurisdiction so the cover reads "for the State of <state>".
    const rbpInjected: Record<string, string> = { generated_date: generatedDate };
    if (selected.includes('poa')) {
      rbpInjected.poa_included = 'yes';
      rbpInjected.state = getJurisdiction(str(payload.jurisdiction) ?? '')?.name ?? '';
    }
    inputs.push({
      template: { id: 'red-binder-plan', source: rbpBasic },
      data: { ...core, ...emergencyTokens(payload), ...rbpTokens(payload) },
      injected: rbpInjected,
      locale: 'bilingual',
    });
  }

  if (selected.includes('detention')) {
    const det = detentionTokens(payload);
    const contacts = Array.isArray(payload.emergency_contacts) ? payload.emergency_contacts : [];
    const backup = (contacts[0] ?? {}) as Record<string, unknown>;

    // Pocket Card: who-to-call ONLY. No identity, no findability — nothing seizable.
    inputs.push({
      template: { id: 'pocket-card', format: 'wallet-card', source: walletCard },
      data: {
        lawyer_name: det.lawyer_name,
        lawyer_phone: det.lawyer_phone,
        trusted_person: det.trusted_person,
        trusted_person_phone: det.trusted_person_phone,
        backup_name: str(backup.name),
        backup_phone: str(backup.phone),
        has_authorization: det.has_authorization,
        lawyer_has_signed_g28: det.lawyer_has_signed_g28,
      },
      injected: { generated_date: generatedDate },
      locale: 'bilingual',
    });

    // Binder Page: identity name/DOB + detention findability. NO contact (address) or agent tokens.
    inputs.push({
      template: { id: 'binder-page', source: binderPage },
      data: { ...pick(core, BINDER_IDENTITY_TOKENS), ...det },
      injected: { generated_date: generatedDate },
      assets,
      locale: 'bilingual',
    });
  }

  return inputs;
}

/**
 * The G-28 client values: the name comes from coreTokens (apellido_paterno + materno → family,
 * given_names → given); the rest is normalized in g28Tokens. The engine fills Part 3 only — the
 * attorney/representative section and every signature stay blank.
 */
export function buildG28Values(payload: Record<string, unknown>) {
  const core = coreTokens(payload);
  return {
    familyName: core.principal_last ?? '',
    givenName: core.principal_first ?? '',
    ...g28Tokens(payload),
  };
}

/** Render every selected document and hand each to the browser as its own file. Client-side only. */
export async function generateAndDownload(opts: GenerateOptions): Promise<number> {
  const results = await renderDocuments(buildRenderInputs(opts));

  // The G-28 is a filled AcroForm, not a markdown render, so it's produced outside renderDocuments,
  // and its ~490 KB form asset is lazy-loaded so it never weighs down the main bundle. Two paths,
  // both hard-gated by G28_FILLABLE_ENABLED:
  //   • the standalone G-28 document — filled with the client's Part 3 info;
  //   • the detention binder's opt-in "include a fillable blank G-28" — the untouched blank form.
  const wantsFilledG28 = opts.selected.includes('g28');
  const wantsBlankG28 =
    opts.selected.includes('detention') && opts.payload.include_g28_blank === true;
  if (G28_FILLABLE_ENABLED && (wantsFilledG28 || wantsBlankG28)) {
    const { fillG28, getBlankG28 } = await import('@red-binder/engine/g28');
    if (wantsFilledG28) results.push(await fillG28(buildG28Values(opts.payload)));
    if (wantsBlankG28) results.push(getBlankG28());
  }

  downloadResults(results);
  return results.length;
}
