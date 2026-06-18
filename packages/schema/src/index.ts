// @red-binder/schema — composed Zod schema (core + selected subschemas), per ARCHITECTURE §3a.
import { composeCoreSchema, type DocKind } from './core';
import { detentionSchema } from './detention';
import { poaSchema } from './poa';

export * from './core';
export * from './poa';
export * from './detention';

/**
 * The full intake payload schema = the gated core ∪ the selected per-document subschemas. This is
 * what "enter once, many documents" composes to. The RBP subschema merges in here in phase 6.
 */
export function composeIntakeSchema(selected: DocKind[]) {
  let schema = composeCoreSchema(selected);
  if (selected.includes('poa')) schema = schema.merge(poaSchema);
  if (selected.includes('detention')) schema = schema.merge(detentionSchema);
  return schema;
}
