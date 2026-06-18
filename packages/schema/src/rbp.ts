// Red Binder Plan subschema — children + document locations. Identity, the agent chain, and
// emergency contacts come from core (the RBP renders all of them). Per docs/ARCHITECTURE.md §3a.
import { z } from 'zod';

export const childSchema = z.object({
  name: z.string().trim().min(1, "Enter the child's name."),
  dob: z.string().trim().default(''),
  school: z.string().trim().default(''),
});

export const documentLocationSchema = z.object({
  label: z.string().trim().min(1, 'What is the document?'),
  location: z.string().trim().default(''),
});

export const rbpSchema = z.object({
  children: z.array(childSchema).max(20).default([]),
  document_locations: z.array(documentLocationSchema).max(30).default([]),
});
export type RbpInput = z.infer<typeof rbpSchema>;

function rowTokens(
  out: Record<string, string>,
  rows: unknown,
  max: number,
  prefix: string,
  fields: string[],
): void {
  if (!Array.isArray(rows)) return;
  rows.slice(0, max).forEach((row, i) => {
    if (!row || typeof row !== 'object') return;
    const r = row as Record<string, unknown>;
    const n = i + 1;
    for (const f of fields) {
      const v = r[f];
      if (typeof v === 'string' && v.trim() !== '') out[`${prefix}_${n}_${f}`] = v.trim();
    }
  });
}

/** RBP repeater tokens: child_N_{name,dob,school} (1–20) and doc_N_{label,location} (1–30). */
export function rbpTokens(data: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  rowTokens(out, data.children, 20, 'child', ['name', 'dob', 'school']);
  rowTokens(out, data.document_locations, 30, 'doc', ['label', 'location']);
  return out;
}
