// POA subschema — POA-only fields. Per docs/ARCHITECTURE.md §3a, this deliberately defines NO
// name or agent fields: identity comes from `core`, and the shared agent chain (primary +
// successor + second-successor) lives in `core` too, pulled in when POA or RBP is selected
// (decided 2026-06-17 — see the project memory). The POA branches on STATE only.
import { z } from 'zod';
import { isJurisdictionCode } from '@red-binder/poa-data';

export const effectivenessSchema = z.enum(['immediately', 'on_incapacity']);

export const poaSchema = z.object({
  /** When the POA takes effect. Drives the {{effective_*}} checkbox tokens. */
  effectiveness: effectivenessSchema,
  /** The two-letter jurisdiction code (state of residence) — the POA's only branch key. */
  jurisdiction: z.string().refine(isJurisdictionCode, { message: 'Choose your state.' }),
});

export type Effectiveness = z.infer<typeof effectivenessSchema>;
export type PoaInput = z.infer<typeof poaSchema>;
