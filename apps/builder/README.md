# builder — the Red Binder app

The one client-side app. A person picks what they need, enters shared facts **once**, and
gets multiple printable bilingual PDFs (Red Binder Plan, power of attorney, Pocket Plan)
from a single payload.

- **Client-side only.** No backend, no storage, no telemetry on input, no secrets. PDFs are
  generated in the browser via `@red-binder/engine` and never leave the device unless the
  person prints or saves them.
- **Outputs stay separate.** Each document is its own file; the Pocket Plan is never
  auto-bundled into a POA packet.
- Consumes `@red-binder/engine` only through its public contract; composes intake from
  `@red-binder/schema`; renders the state tile map from `@red-binder/poa-data`.

## Develop

```sh
pnpm --filter builder dev
pnpm --filter builder build
```

## Deploy

This folder is the **Root Directory** of the single Vercel project. Vercel resolves the
workspace `packages/*` as dependencies and auto-deploys `main`.

## Status

Phase 1 scaffold — a placeholder page. The picker, intake, branding, and bilingual
microcopy land in build phases 4–7.
