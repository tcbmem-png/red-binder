// @red-binder/schema — composed Zod schema (core + selected subschemas).
//
// core.ts (shared identity + the gated agent chain), detention.ts, and rbp.ts land in build
// phase 4; poa.ts (POA-only fields) is here now. Per docs/ARCHITECTURE.md §3a.
export * from './poa';
