# @red-binder/poa-data

The single source of truth for the 50-state POA strategy: **one universal body + a per-state
variation layer**, not 51 forms.

`states.ts` exports a typed array of all 51 jurisdictions (50 states + DC). Each entry
carries:

- `code`, `name`, and `tile` (row/col for the tile-grid cartogram),
- `documentPath` — `UNIVERSAL` / `UNIVERSAL_PLUS_ADDENDUM` / `STATE_FORM` (what the engine
  routes on and the tile map colors),
- statutory cite, notary-ack archetype id, execution minimum, `specialTriggers`,
- the `documentPath` legend metadata (label / color / EN-ES description) the tile map renders.

Changing how a state behaves is a **data edit here**, never a new code branch. The engine
stays state-agnostic; all 50-state logic lives in this module and in the `apps/builder`
tile map rendered against it.

> Mississippi is a `STATE_FORM`: it is governed by the older Uniform **Durable** POA Act
> (Miss. Code §§ 87-3-101…115), **not** the 2006 UPOAA the universal body is built on. The
> PA / IN uniform-act flags still need the project owner's confirmation before the tile map
> makes a public claim.

Built in build phase 3 from `docs/research/poa-portability-matrix-50-state.xlsx`.
