// @red-binder/schema — composed Zod schema (core + selected subschemas), per ARCHITECTURE §3a.
import { composeCoreSchema, type DocKind } from './core';
import { poaSchema } from './poa';

export * from './core';
export * from './poa';

/**
 * The full intake payload schema = the gated core ∪ the selected per-document subschemas. This is
 * what "enter once, many documents" composes to. detention.ts and rbp.ts subschemas merge in here
 * in build phases 5–6; today only the POA subschema exists.
 */
export function composeIntakeSchema(selected: DocKind[]) {
  let schema = composeCoreSchema(selected);
  if (selected.includes('poa')) schema = schema.merge(poaSchema);
  return schema;
}
