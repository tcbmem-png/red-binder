// POA subschema — POA-only fields. Per docs/ARCHITECTURE.md §3a, this deliberately defines NO
// name or agent fields: identity comes from `core`, and the shared agent chain (primary +
// successor + second-successor) lives in `core` too, pulled in when POA or RBP is selected
// (decided 2026-06-17 — see the project memory). The POA branches on STATE only.
import { z } from 'zod';
import { isJurisdictionCode } from '@red-binder/poa-data';

export const effectivenessSchema = z.enum(['immediately', 'on_incapacity']);

export const poaSchema = z.object({
  /** When the POA takes effect; immediate is the DEFAULT, springing is an explicit opt-out
   *  (UPOAA §109(a)). Drives the {{effective_*}} checkbox tokens. */
  effectiveness: effectivenessSchema.default('immediately'),
  /** The two-letter jurisdiction code (state of residence) — the POA's only branch key. */
  jurisdiction: z.string().refine(isJurisdictionCode, { message: 'Choose your state.' }),
  /**
   * The only UPOAA §201 "hot power" offered (decided 2026-06-17). When true, the app sets the
   * {{grant_gift_power}} token and the bounded gift article (§201(a)(2) + §217, narrowed to
   * dependent support) renders. Default false — no gift authority is granted. Every other hot
   * power (trust, survivorship, beneficiary, delegate, annuity waiver, fiduciary, disclaim) is
   * deliberately ungranted.
   */
  giftPower: z.boolean().default(false),
});

export type Effectiveness = z.infer<typeof effectivenessSchema>;
export type PoaInput = z.infer<typeof poaSchema>;

/**
 * POA token bridge. Effectiveness becomes the two checkbox booleans; the elected gift power sets
 * {{grant_gift_power}} (present-only-when-granted, driving the engine's <!-- if:grant_gift_power -->
 * gift article). The governing-law state name is injected by the app from poa-data, not here.
 */
export function poaTokens(data: Record<string, unknown>): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {
    effective_immediately: data.effectiveness === 'immediately',
    effective_on_incapacity: data.effectiveness === 'on_incapacity',
  };
  if (data.giftPower === true) out.grant_gift_power = true;
  return out;
}
