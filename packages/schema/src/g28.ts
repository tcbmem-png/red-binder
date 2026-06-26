// G-28 (Notice of Entry of Appearance) subschema — the CLIENT-side fields a noncitizen pre-fills.
// Collected ONLY when the G-28 is selected. The name comes from `core` identity; this subschema adds
// the structured mailing address, the client's own contact info, and the optional A-number. The
// form's representative section is never collected — it stays blank for the attorney.
//
// Like the detention card, the G-28 carries its OWN contact + address fields rather than reusing the
// core `contact` group, so a G-28-only run stays clean (no free-text home-address / county prompt it
// can't use). A G-28 + POA run re-enters contact info — acceptable for v1; unify into a structured
// core address later. `client_phone`/`client_email` are named distinctly from core's `phone`/`email`
// so they never clash or double-render with the core contact section.
import { z } from 'zod';

/** USPS 2-letter codes for the G-28 Part 3 state dropdown (50 states + DC). */
export const US_STATE_CODES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'DC',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
] as const;

export const g28Schema = z.object({
  mailing_street: z.string().trim().min(1, 'Enter your street number and name.'),
  mailing_city: z.string().trim().min(1, 'Enter your city or town.'),
  mailing_state: z.string().trim().min(1, 'Choose your state.'),
  mailing_zip: z.string().trim().min(1, 'Enter your ZIP code.'),
  client_phone: z.string().trim().default(''),
  client_email: z
    .string()
    .trim()
    .email('Enter a valid email, or leave it blank.')
    .or(z.literal(''))
    .default(''),
  /** Many people have no A-number yet (assigned at booking) — optional, like the detention card. */
  a_number: z.string().trim().default(''),
});
export type G28Input = z.infer<typeof g28Schema>;

/** Digits of an A-number — the form prints "A‑" and the field holds 9 digits, no letter. */
export const aNumberDigits = (raw: string): string => raw.replace(/\D/g, '').slice(0, 9);
/** Digits of a phone — the G-28 daytime-phone field holds 10. */
export const phoneDigits = (raw: string): string => raw.replace(/\D/g, '').slice(0, 10);

/**
 * Derive the G-28 client values from the payload, normalized to the form's field widths. The name is
 * NOT here — the app composes family/given from coreTokens (apellido_paterno + materno → family,
 * given_names → given). Shape matches the engine's G28Values (minus the name).
 */
export function g28Tokens(data: Record<string, unknown>): {
  aNumber: string;
  daytimePhone: string;
  email: string;
  mailingStreet: string;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
} {
  const str = (k: string): string =>
    typeof data[k] === 'string' ? (data[k] as string).trim() : '';
  return {
    aNumber: aNumberDigits(str('a_number')),
    daytimePhone: phoneDigits(str('client_phone')),
    email: str('client_email'),
    mailingStreet: str('mailing_street'),
    mailingCity: str('mailing_city'),
    mailingState: str('mailing_state'),
    mailingZip: str('mailing_zip'),
  };
}
