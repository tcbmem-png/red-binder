// @red-binder/schema — composed Zod schema (core + selected subschemas), per ARCHITECTURE §3a.
import { composeCoreSchema, type DocKind } from './core';
import { detentionSchema } from './detention';
import { g28Schema } from './g28';
import { poaSchema } from './poa';
import { rbpSchema } from './rbp';

export * from './core';
export * from './poa';
export * from './detention';
export * from './rbp';
export * from './g28';

/**
 * The full intake payload schema = the gated core ∪ the selected per-document subschemas. This is
 * what "enter once, many documents" composes to. The RBP subschema merges in here in phase 6.
 */
export function composeIntakeSchema(selected: DocKind[]) {
  let schema = composeCoreSchema(selected);
  if (selected.includes('poa')) schema = schema.merge(poaSchema);
  if (selected.includes('detention')) schema = schema.merge(detentionSchema);
  if (selected.includes('rbp')) schema = schema.merge(rbpSchema);
  if (selected.includes('g28')) schema = schema.merge(g28Schema);
  return schema;
}
