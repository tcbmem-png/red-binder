# Red Binder Project

**A plan, before the emergency.**

Free, bilingual (English / Spanish), open-source tools for immigrant and mixed-status
families. A person picks what they need, enters their facts **once**, and gets printable
documents — a family emergency plan, a financial power of attorney, and a "Pocket Plan"
for what to do if someone is detained.

A TCB Law initiative. Built by Taylor C. Berger, attorney (MS/TN).

> **Not legal advice.** This software and the documents it generates are a free tool, not
> legal advice, and using it does not create an attorney–client relationship. For advice
> about your situation, talk to a licensed attorney.

## Privacy floor — client-side only, nothing stored

Everything happens **on the person's device, in the browser.** There is no backend, no
database, no account system, no telemetry on what a person types, and no third-party call
that carries personal information. Documents (PDFs) are generated locally and never leave
the device unless the person chooses to print or save them.

The whole app sits at this floor because one form may hold an A-number, immigration
status, and a fear-of-return statement beside power-of-attorney data. **The code is public
so the privacy claim is auditable — you don't have to take our word for it.**

See [`docs/PRINCIPLES — Privacy & Data Handling.md`](docs/PRINCIPLES%20—%20Privacy%20&%20Data%20Handling.md).

## Repository layout

```
red-binder/
  packages/
    engine/      Pure (payload, template) -> PDF bytes. Browser-safe, no window/fs/network.
                 Token fill, repeaters, page breaks, bilingual layout, pdf-lib drawing,
                 image embed, letter + wallet-card formats, PDF attachment.
    templates/   Bilingual EN/ES markdown templates, grouped: poa/ detention/ rbp/.
    schema/      Zod schemas: core.ts (entered once) + poa.ts / detention.ts / rbp.ts.
    poa-data/    states.ts (51 jurisdictions) + the 50-state portability matrix.
  apps/
    builder/     The app: unified conditional intake -> selected PDFs. Deploys to Vercel.
  docs/          Architecture (binding), decisions, principles, research, specs, branding.
```

The binding architecture is [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). If anything in
the code or another doc conflicts with it, that file wins.

## Requirements

- **Node 22 LTS** (`.nvmrc`)
- **pnpm 9** (pinned via the `packageManager` field; `corepack` provides it)

## Develop

```sh
corepack enable        # or: corepack prepare pnpm@9.15.0 --activate
pnpm install
pnpm dev               # run the builder app
pnpm typecheck         # type-check every package
pnpm lint              # lint every package
pnpm test              # run engine tests
pnpm build             # build everything
```

This is a pnpm + Turborepo monorepo. There are **no secrets and no `.env`** — by design.

## Deploy

One Vercel project, this repo, **Root Directory `apps/builder`**. Vercel builds the shared
`packages/*` as workspace dependencies (no publish step) and auto-deploys `main`.

## License

- **Code:** MIT — see [`LICENSE`](LICENSE).
- **Legal templates / content** (`packages/templates`): **CC BY 4.0** — see
  [`packages/templates/LICENSE-CONTENT`](packages/templates/LICENSE-CONTENT). Free to copy,
  adapt, and redeploy with attribution. The templates remain DRAFT, for attorney review — the
  license governs reuse; it is not a statement that the content is final or legally approved.

## Status

DRAFT — under active development, for attorney review. Nothing here is final or legally
approved.
