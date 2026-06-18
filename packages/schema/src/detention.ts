// Pocket Plan (detention) subschema — the most sensitive data in the program. Collected ONLY when
// the Pocket Plan is selected; NEVER in core. Per docs/ARCHITECTURE.md §3a and the Phase-5 SPEC.
//
// The canonical name + DOB come from `core` (the dual-surname identity). This subschema adds the
// ICE-locator extras (variants/aliases/misspellings) and the findability + counsel fields on top —
// it defines no name fields of its own. `fear_of_return` is BINDER PAGE ONLY — never on the carried
// card (enforced by the rendering-side floor test in @red-binder/templates).
import { z } from 'zod';

/** Federal branch key (state-independent). Reserved — v1 templates are status-uniform. */
export const immigrationStatusSchema = z.enum([
  'undocumented',
  'permanent_resident',
  'visa_holder',
  'other',
  'unsure',
]);

/** The Binder Page fight-vs-depart decision-mark. Lives on the binder page only (SPEC §2). */
export const chosenPathSchema = z.enum(['fight', 'depart', 'undecided']);

export const lawyerSchema = z.object({
  name: z.string().trim().default(''),
  firm: z.string().trim().default(''),
  phone: z.string().trim().default(''),
  /** A pre-signed, undated G-28 already on file with this lawyer (the strongest unblock). */
  has_signed_g28: z.boolean().default(false),
});

/** The §1 authorization-to-retain-counsel authorizee — a distinct role from a POA agent. */
export const trustedPersonSchema = z.object({
  name: z.string().trim().default(''),
  relationship: z.string().trim().default(''),
  phone: z.string().trim().default(''),
});

export const detentionSchema = z.object({
  immigration_status: immigrationStatusSchema.optional(),
  /** ODLS requires it; with the A-number it's the strongest locator key. */
  country_of_birth: z.string().trim().min(1, 'Enter your country of birth.'),
  /** Many fully-undocumented people have none yet (assigned at booking) — optional. */
  a_number: z.string().trim().default(''),
  /** Other spellings / how the name may have been mis-keyed — ODLS only matches the exact entry. */
  name_variants: z.string().trim().default(''),
  /** Other names/aliases ever used with any U.S. agency. */
  aliases: z.string().trim().default(''),
  best_language: z.string().trim().default(''),
  height: z.string().trim().default(''),
  distinguishing_features: z.string().trim().default(''),
  chosen_path: chosenPathSchema.default('undecided'),
  /** BINDER PAGE ONLY — never on the carried card. Preserves an asylum/fear claim. */
  fear_of_return: z.boolean().default(false),
  lawyer: lawyerSchema.default({}),
  trusted_person: trustedPersonSchema.default({}),
  /** §3 opt-in to bundle a fillable blank G-28. Also hard-gated by G28_FILLABLE_ENABLED below. */
  include_g28_blank: z.boolean().default(false),
});
export type DetentionInput = z.infer<typeof detentionSchema>;

/**
 * Phase-5 §3 liability gate. The fillable blank G-28 attachment stays DISABLED until Taylor
 * ratifies shipping it; instructions-and-link is the default path. The engine `attachments` path is
 * built, but the app must check this flag AND `include_g28_blank` before attaching the form.
 */
export const G28_FILLABLE_ENABLED = false;

/**
 * Derive the Pocket Plan tokens from the detention payload (the canonical name/DOB tokens come from
 * coreTokens()). Returns strings for text tokens and booleans for the engine's checkbox tokens.
 * NOTE: the carried-card who-to-call (lawyer / trusted person / backup) is sliced per template in
 * the app; this returns the full detention token set and the layout decides what each surface uses.
 */
export function detentionTokens(data: Record<string, unknown>): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  const str = (k: string): string | undefined =>
    typeof data[k] === 'string' && (data[k] as string).trim() !== ''
      ? (data[k] as string).trim()
      : undefined;
  const put = (token: string, value: string | undefined) => {
    if (value) out[token] = value;
  };

  put('country_of_birth', str('country_of_birth'));
  put('a_number', str('a_number'));
  put('name_variants', str('name_variants'));
  put('aliases', str('aliases'));
  put('best_language', str('best_language'));
  put('height', str('height'));
  put('distinguishing_features', str('distinguishing_features'));

  const path = data.chosen_path;
  out.path_fight = path === 'fight';
  out.path_depart = path === 'depart';
  out.fear_of_return = data.fear_of_return === true; // binder page only

  const lawyer = (data.lawyer ?? {}) as Record<string, unknown>;
  put('lawyer_name', typeof lawyer.name === 'string' ? lawyer.name.trim() : undefined);
  put('lawyer_firm', typeof lawyer.firm === 'string' ? lawyer.firm.trim() : undefined);
  put('lawyer_phone', typeof lawyer.phone === 'string' ? lawyer.phone.trim() : undefined);
  out.lawyer_has_signed_g28 = lawyer.has_signed_g28 === true;

  const tp = (data.trusted_person ?? {}) as Record<string, unknown>;
  const tpName = typeof tp.name === 'string' ? tp.name.trim() : '';
  put('trusted_person', tpName || undefined);
  put(
    'trusted_person_relationship',
    typeof tp.relationship === 'string' ? tp.relationship.trim() : undefined,
  );
  put('trusted_person_phone', typeof tp.phone === 'string' ? tp.phone.trim() : undefined);
  out.has_authorization = tpName !== ''; // the card's "I have a signed authorization" checkbox

  return out;
}
