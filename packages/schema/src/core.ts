// Shared, entered-once core (docs/ARCHITECTURE.md §3a). The single identity model lives here and
// feeds every document; the agent chain and other shared groups are pulled in ONLY when a document
// that needs them is selected — data-minimization by composition applies *within* core, not just at
// the subschema seam. In particular a detention-only user is never asked to name an agent.
// (Decision 2026-06-17 — see the project memory.)
import { z } from 'zod';

export type DocKind = 'rbp' | 'poa' | 'detention';

// ---------------------------------------------------------------- the identity (dual-surname)

export const personNameSchema = z.object({
  /** First (and middle) given name(s) → {{principal_first}}. */
  given_names: z.string().trim().min(1, 'Enter your first name.'),
  /** Father's surname (apellido paterno) → part of {{principal_last}}, and {{apellido_paterno}}. */
  apellido_paterno: z.string().trim().min(1, 'Enter your first surname (apellido paterno).'),
  /** Mother's surname (apellido materno), if you use one → {{apellido_materno}}. Optional. */
  apellido_materno: z.string().trim().default(''),
});
export type PersonName = z.infer<typeof personNameSchema>;

const joinName = (...parts: (string | undefined)[]) =>
  parts
    .map((p) => (p ?? '').trim())
    .filter(Boolean)
    .join(' ');

/** Given name(s) → the simple "first name" used by documents like the POA. */
export const principalFirst = (n: PersonName): string => n.given_names.trim();
/** Both surnames combined → the simple "last name" (paterno [+ materno]). */
export const principalLast = (n: PersonName): string =>
  joinName(n.apellido_paterno, n.apellido_materno);
/** Full legal name, given + both surnames → {{legal_name_full}} (used by the Pocket Plan). */
export const legalNameFull = (n: PersonName): string =>
  joinName(n.given_names, n.apellido_paterno, n.apellido_materno);

// ---------------------------------------------------------------- shared field groups

const DOB = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the date format YYYY-MM-DD.');

/** Identity — needed by EVERY document (POA principal, RBP, Pocket Plan findability). */
export const identitySchema = personNameSchema.extend({
  dob: DOB,
});

/** Contact — where the principal lives and how to reach them. POA + RBP only (the Pocket Plan
 *  carries no home address by design). */
export const contactSchema = z.object({
  address: z.string().trim().min(1, 'Enter your address.'),
  county: z.string().trim().min(1, 'Enter your county.'),
  phone: z.string().trim().min(1, 'Enter a phone number.'),
  email: z
    .string()
    .trim()
    .email('Enter a valid email, or leave it blank.')
    .or(z.literal(''))
    .default(''),
});

export const agentSchema = z.object({
  first_name: z.string().trim().min(1, 'Enter their first name.'),
  last_name: z.string().trim().min(1, 'Enter their last name.'),
  relationship: z.string().trim().min(1, 'How are they related to you?'),
  address: z.string().trim().default(''),
  phone: z.string().trim().default(''),
});
export type Agent = z.infer<typeof agentSchema>;

/** The agent chain — primary + optional successors. Shared by POA + RBP; NEVER collected for a
 *  detention-only user. */
export const agentChainSchema = z.object({
  primary_agent: agentSchema,
  successor_agent: agentSchema.optional(),
  second_successor: agentSchema.optional(),
});

export const emergencyContactSchema = z.object({
  name: z.string().trim().min(1),
  relationship: z.string().trim().min(1),
  phone: z.string().trim().min(1),
});
/** Emergency contacts — the RBP call-list and the Pocket Plan card's who-to-call. RBP + detention. */
export const emergencyContactsSchema = z.object({
  emergency_contacts: z.array(emergencyContactSchema).min(1).max(5),
});

// ---------------------------------------------------------------- composition (gated by selection)

interface FieldGroup {
  key: string;
  schema: z.AnyZodObject;
  neededBy: DocKind[];
}

/** Ordered so the composed schema is deterministic. */
export const CORE_FIELD_GROUPS: FieldGroup[] = [
  { key: 'identity', schema: identitySchema, neededBy: ['rbp', 'poa', 'detention'] },
  { key: 'contact', schema: contactSchema, neededBy: ['rbp', 'poa'] },
  { key: 'agentChain', schema: agentChainSchema, neededBy: ['rbp', 'poa'] },
  { key: 'emergencyContacts', schema: emergencyContactsSchema, neededBy: ['rbp', 'detention'] },
];

const isNeeded = (group: FieldGroup, selected: DocKind[]): boolean =>
  group.neededBy.some((doc) => selected.includes(doc));

/** Build the core schema for exactly the documents selected — including only the field groups a
 *  selected document needs. A detention-only selection yields identity + emergency contacts, and
 *  deliberately NO contact or agent fields. */
export function composeCoreSchema(selected: DocKind[]): z.AnyZodObject {
  let schema: z.AnyZodObject = z.object({});
  for (const group of CORE_FIELD_GROUPS) {
    if (isNeeded(group, selected)) schema = schema.merge(group.schema);
  }
  return schema;
}

/** Which core field groups a selection collects — drives the intake UI's sections. */
export function coreFieldGroupsFor(selected: DocKind[]): string[] {
  return CORE_FIELD_GROUPS.filter((g) => isNeeded(g, selected)).map((g) => g.key);
}

// ---------------------------------------------------------------- the token bridge

function mapAgent(out: Record<string, string>, prefix: string, agent: unknown): void {
  if (!agent || typeof agent !== 'object') return;
  const a = agent as Record<string, unknown>;
  const set = (key: string, v: unknown) => {
    if (typeof v === 'string' && v.trim() !== '') out[`${prefix}${key}`] = v.trim();
  };
  set('first', a.first_name);
  set('last', a.last_name);
  set('relationship', a.relationship);
  set('address', a.address);
  set('phone', a.phone);
}

/**
 * Derive the globally-unique tokens that come from core — the realization of "one identity feeds
 * both the POA and the Pocket Plan". Reads only what is present, so it works for any composition.
 * (Emergency-contact tokens differ per document — RBP `emergency_N_*` vs the card's `contact_1/2_*`
 * — so that mapping is done in per-document slicing, not here.)
 */
export function coreTokens(data: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  const str = (k: string): string | undefined =>
    typeof data[k] === 'string' && (data[k] as string).trim() !== ''
      ? (data[k] as string).trim()
      : undefined;

  const given = str('given_names');
  const paterno = str('apellido_paterno');
  const materno = str('apellido_materno');
  if (given || paterno) {
    const name: PersonName = {
      given_names: given ?? '',
      apellido_paterno: paterno ?? '',
      apellido_materno: materno ?? '',
    };
    out.principal_first = principalFirst(name);
    out.principal_last = principalLast(name);
    out.legal_name_full = legalNameFull(name);
    if (paterno) out.apellido_paterno = paterno;
    if (materno) out.apellido_materno = materno;
  }

  const dob = str('dob');
  if (dob) {
    out.principal_dob = dob;
    out.dob_exact = dob; // the Pocket Plan's findability DOB — same one identity model
  }
  const address = str('address');
  if (address) out.principal_address = address;
  const county = str('county');
  if (county) out.principal_county = county;
  const phone = str('phone');
  if (phone) out.principal_phone = phone;
  const email = str('email');
  if (email) out.principal_email = email;

  mapAgent(out, 'agent_', data.primary_agent);
  mapAgent(out, 'agent2_', data.successor_agent);
  mapAgent(out, 'agent3_', data.second_successor);

  return out;
}

/** Emergency-contact tokens: emergency_N_{name,relationship,phone} (1–5), for the RBP call-list.
 *  The Pocket Plan card's who-to-call backup is sliced from emergency_contacts[0] in the app. */
export function emergencyTokens(data: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  const list = Array.isArray(data.emergency_contacts) ? data.emergency_contacts : [];
  list.slice(0, 5).forEach((row, i) => {
    if (!row || typeof row !== 'object') return;
    const r = row as Record<string, unknown>;
    const n = i + 1;
    for (const field of ['name', 'relationship', 'phone']) {
      const v = r[field];
      if (typeof v === 'string' && v.trim() !== '') out[`emergency_${n}_${field}`] = v.trim();
    }
  });
  return out;
}
