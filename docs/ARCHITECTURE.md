# Red Binder — Canonical Architecture (binding)

Source of truth for every build session. Locked June 17, 2026.

This doc folds in these locked records and is binding once committed:
- `DECISION — Unified Builder App (Enter Once, Many Documents).md` — **one app, `apps/builder`**; enter shared facts once, fan out to many PDFs.
- `DECISION — Deploy & Repo (Monorepo + Vercel).md` — one monorepo, Vercel deploy, Lovable dropped.
- `COORDINATION — Single Session + Build Phasing.md` — **one Claude Code session** builds the whole thing; phasing replaces the inter-session gate.
- `PRINCIPLES — Privacy & Data Handling.md` — client-side only, nothing stored; the program-wide floor.

If a build playbook conflicts with this file, this file wins. **One** Claude Code build session reads this before writing code and follows it as external memory throughout.

---

## 0. The decisions that bound everything

**Privacy floor (binding, per PRINCIPLES).** A user can always create their document with nothing leaving their device. Generation is client-side, in the browser. No backend store of PII, no telemetry on input, no third-party call carrying PII. Because one form may now hold an A-number, immigration status, and a fear-of-return statement beside POA data, the **whole app sits at the strict floor** — nothing stored or transmitted, no exceptions.

**One unified app (binding, per the Unified Builder decision).** There is **one** client-side intake app — `apps/builder` — where the user picks what they want, enters shared facts once, and gets multiple documents (Red Binder Plan, POA, detention card) from a single payload. This replaces the earlier `apps/poa` + `apps/detention-card` split. Outputs stay separate files; the detention card is never auto-bundled into a POA packet.

**Deploy/repo (binding).** One open-source monorepo on GitHub, shared `packages/*`, deployed as **one** Vercel project (Root Directory `apps/builder`). Lovable is gone.

We protect the engine and the content (expensive, hard to reverse) and treat the host as cheap and replaceable.

---

## 1. Stack — what survives the national port

Keep: **React + Vite (SPA)**, **Tailwind + shadcn/ui**, **pdf-lib**, **Zod**, **react-hook-form**.

Drop: **TanStack Start** (server framework; no server), **Supabase** entirely, **email-gated download**, **server rate limit**, **30-day purge**, the **`free_plan_contacts`** table. The POA gives up server-side email delivery *inside this app* — acceptable per PRINCIPLES. The old PLAN's templates, token contract, Zod shape, and form sections survive; its server pipeline does not.

## 2. Monorepo layout, workspace tool, versions — LOCKED

```
red-binder/                         # one public GitHub repo
  packages/
    engine/                         # shared render core. pure (payload, template) -> PDF bytes. browser-safe. fan-out over one payload.
    templates/                      # bilingual EN/ES markdown, grouped by module:
      poa/  detention/  rbp/        #   {{tokens}}, <!-- pagebreak -->, VERIFIED/Open-questions conventions
    schema/                         # Zod: core.ts (shared, entered-once) + poa.ts / rbp.ts / detention.ts subschemas
    poa-data/                       # states.ts (51 jurisdictions) + the 50-state portability matrix
  apps/
    builder/                        # THE app: unified conditional intake -> selected PDFs. One Vercel project (Root Directory: apps/builder).
  docs/                             # this file, the DECISIONs, PRINCIPLES, RESEARCH, SPEC, HANDOFF, token lists
  .github/workflows/ci.yml          # typecheck + lint + engine tests on PR
  package.json  pnpm-workspace.yaml  turbo.json  .nvmrc  tsconfig.base.json
```

(`packages/schema` and `packages/poa-data` are elaborations of the Unified Builder decision's structure, added so schema ownership and POA data have unambiguous homes — see §3a and §5.)

- **Workspace tool: pnpm workspaces + Turborepo** (Vercel-native; builds shared packages as part of the app build, no publish step). Turbo is light and worth it; pnpm workspaces alone ship if it's friction on day one.
- **Versions (pin in lockfile + `.nvmrc` + `engines`):** Node 22 LTS, pnpm 9.x, TypeScript 5.x, React 19, Vite 6.x. Confirm Node against Vercel's supported runtimes the day you scaffold.
- **No secrets.** Client-side only means no API keys, no sensitive `.env`. `.gitignore` build/`node_modules`/`.vercel`. That's a feature.

## 3. The engine — module boundary and signature — LOCKED

`packages/engine` is the platform. The unification makes two properties **load-bearing**:

1. **Browser-safe.** Pure, environment-agnostic — no `window`, no `fs`, no network, no server-only dependency — so the identical code runs in the browser. This is what makes the privacy floor real. Non-negotiable.
2. **Fan-out over one shared payload.** The user enters core facts once; the app calls the engine **once per selected document**, each call reading the slice of the shared payload that its template needs. The engine stays single-document-pure (`renderDocument`); `renderDocuments` is the batch convenience. The fan-out orchestration (which templates, slicing the payload) lives in `apps/builder`, not the engine.

**In the engine:** markdown parse, `{{token}}` substitution, checkbox/effectiveness logic, repeater expansion (1-indexed, blank/hidden rows), hide-if-absent blocks, `VERIFIED — locked` rendering, `Open questions for Taylor` stripping, `<!-- pagebreak -->` hard breaks (never split a signature block from its notary acknowledgment), EN/ES side-by-side layout, pdf-lib drawing, font embedding, **image embedding** (`{{photo}}`), **page formats** (`letter`, `wallet-card`), **PDF attachment/merge** (append a static blank G-28). PII sanitization (strip control chars/HTML; treat input as literal; never interpret tokens inside input).

**In the app, never the engine:** Zod schemas, the conditional intake UI, the document picker, state selection + tile map, fan-out orchestration, browser delivery.

**Signature (the locked contract):**

```ts
// packages/engine/src/types.ts
export type Locale = 'bilingual';                 // EN/ES side-by-side — the only mode
export type PageFormat = 'letter' | 'wallet-card';

export interface TemplateInput {
  id: string;                                     // logical id, for filename + logging
  source: string;                                 // raw markdown (app imports it from @red-binder/templates)
  format?: PageFormat;                            // default 'letter'
}
export interface RenderInput {
  template: TemplateInput;
  data: Record<string, unknown>;                  // the payload slice this document needs (Zod runs in the app)
  locale: Locale;
  injected?: Record<string, string>;              // render-time, non-PII: generated_date, current_as_of
  assets?: { images?: Record<string, Uint8Array> };   // e.g. { photo } for {{photo}}
  attachments?: Uint8Array[];                     // static PDFs appended after render (e.g. blank G-28)
}
export interface RenderResult { filename: string; bytes: Uint8Array; }   // print-ready; never uploaded

export function renderDocument(input: RenderInput): Promise<RenderResult>;
export function renderDocuments(inputs: RenderInput[]): Promise<RenderResult[]>;   // fan-out convenience
```

```ts
// packages/engine/src/browser.ts  — the ONLY browser-coupled export, in its own entry so the core stays pure
export function downloadResults(results: RenderResult[], opts?: { zipName?: string }): void;
```

The conceptual contract is still `(payload, template) → PDF bytes`. Templates are passed in as raw strings — the engine never reads the filesystem, which keeps it browser-safe. `packages/templates` exports those strings (Vite `?raw` or a generated typed index).

## 3a. Schema ownership — shared core vs. per-document subschema — LOCKED

The intake is **one composed Zod schema**: a shared **core** plus the **subschemas** of the documents the user selected. This is what lets "enter once, many documents" work without collisions. (These are **module boundaries**, not session boundaries — one session builds them all; the boundaries are good engineering regardless.)

- **`schema/core.ts` — shared, entered once.** The **single identity model** (full legal name capturing **both surnames separately** — apellido paterno + apellido materno — which also yields first/last for documents that use a simple name), DOB, address, county, phone, emergency contacts, agents. Identity is captured here once; no other module defines name fields.
- **`schema/poa.ts` — POA subschema.** effectiveness, successor + second-successor agents, the selected jurisdiction, and POA-only fields. **Reads name (and all core fields) from `core` — defines none of its own.** Plus `poa-data/states.ts` (the 51-jurisdiction data + `documentPath` legend metadata). Has **no dependency on immigration status or any detention field**.
- **`schema/detention.ts` — detention subschema.** **Immigration status** (the detention branch key), A-number, aliases, country of birth, fear-of-return, chosen path, lawyer + trusted-person fields, photo. Reads name/surnames from `core`; defines no name fields. Has **no dependency on the selected state.**
- **`schema/rbp.ts` — Red Binder Plan subschema.** children, document locations.

Composition rule: the full intake payload = `core` ∪ (selected subschemas). Each document's `RenderInput.data` is the slice it needs. **Token names stay globally unique across subschemas** so the shared token contract (`HANDOFF — Token List for PDF Generation.md`) never collides — extend it, don't break it. Name tokens (`{{principal_first}}`/`{{principal_last}}` for the POA, `{{legal_name_full}}`/`{{apellido_paterno}}`/`{{apellido_materno}}` for detention) all source from the one core identity model. **Data minimization is enforced by composition:** a POA-only user's payload never contains detention fields (incl. immigration status), because that subschema was never added.

## 3b. Intake model & branch axes — LOCKED

The two documents branch on **orthogonal keys**, and that independence is binding:

- **POA branches on state of residence** (the tile map → `documentPath`). It is the **primary, first-class, standalone** path: a user can complete the POA and its PDF without ever touching the detention path. `states.ts` and `schema/poa.ts` assume nothing about whether detention ran.
- **Detention branches on immigration status** — federal, state-independent. State is irrelevant to it. `schema/detention.ts` assumes no state was chosen.

State is where you live; status is who you are to the federal government. Neither axis reaches into the other. **No document gates another.** Flow: `picker → shared core (entered once) → (POA state branch | detention status branch, each shown only if selected) → review → separate PDFs`, POA presented first. The picker may be **defaulted from a URL param** so branded landing pages can deep-link with a document pre-selected — that routing is app-layer UI (in `apps/builder`); the POA content module imposes no constraint on it and renders the same regardless of entry point.

## 4. Templates, tokens, and the 50-state strategy — LOCKED

**Shared token contract (do not break):** mustache `{{tokens}}`; identical tokens in EN and ES lines; 1-indexed repeaters with blank/hidden empty rows; hide-if-absent blocks; `<!-- pagebreak -->` honored; `VERIFIED — locked` rendered; `Open questions for Taylor` stripped; `injected` tokens set at render. New document modules add their own tokens under these same conventions; tokens are globally unique, so modules never collide.

**50-state POA strategy — one base, a per-state layer, not 51 forms:**
- One universal body, `templates/poa/poa_financial_universal.en-es.md` (UPOAA-based, governing-law designation, durability, third-party-reliance + indemnity), with state-variation tokens: `{{state_statutory_block}}`, `{{state_notary_ack}}`, `{{state_execution_note}}`.
- `packages/poa-data/states.ts` — the single source of truth from the research matrix — carries `documentPath` (`UNIVERSAL` / `UNIVERSAL_PLUS_ADDENDUM` / `STATE_FORM`), statutory cite, notary-ack archetype id, execution minimum, `specialTriggers`, and the `documentPath` legend (label/color/EN-ES description the tile map renders). Changing a state is a data edit.
- A small set of notary-ack archetypes (not 51) + per-state cite strings.
- Keep `templates/poa/poa_ms` and `poa_tn` as verified `STATE_FORM` templates; `templates/poa/state_addendum.en-es.md` serves the `UNIVERSAL_PLUS_ADDENDUM` path; `templates/poa/execution_instructions.en-es.md` is the signing sheet.
- The engine stays state-agnostic. All 50-state logic lives in `states.ts` (the data module) and the `apps/builder` intake (the tile map UI rendered against it).

## 5. Single session + build phasing — LOCKED

**One Claude Code session builds the whole thing.** Per `COORDINATION — Single Session + Build Phasing.md`. There is no POA-first/Builder-second split, no inter-session handoff gate, no separate branch namespaces, and no cross-session engine-change PR protocol — one owner, one branch flow to `main`. What was a *handoff gate* between two agents becomes **internal sequencing discipline**: build and freeze the engine before the UI leans on it.

**Phases (each a commit/checkpoint):**
1. Scaffold the monorepo + tooling (pnpm + Turbo, versions, CI, `.gitignore`). Create the public GitHub repo `red-binder` — **pause for Taylor to create the empty repo / confirm the org**. Set up the single Vercel project (Root Directory `apps/builder`).
2. Build `packages/engine` to the §3 signature; test it. **Freeze its public types before building UI on top.**
3. POA content: `templates/poa/*`, `packages/poa-data/states.ts` + the 50-state matrix, `schema/poa.ts`.
4. Core: `schema/core.ts` (incl. the entered-once dual-surname identity) + the document picker + shared-core intake.
5. **Detention path first to shippable:** `schema/detention.ts`, `templates/detention/{wallet_card,binder_page}.en-es.md`, rendered through the engine behind the picker. Reaches a shippable state before the full 50-state POA UI is finished — it's the most time-sensitive.
6. Wire the POA path (tile map against `states.ts` + POA fields) and the RBP path into the same flow.
7. Privacy notice + "clear everything" control; repo hygiene (LICENSE split, READMEs).
8. ES translation pass after Taylor signs off on the EN.

**Module boundaries hold even with one session** (good engineering, not session bookkeeping): keep `packages/engine` pure and its public `types.ts` frozen once set; `schema/{core,poa,detention,rbp}.ts`, `packages/poa-data`, and `templates/{poa,detention,rbp}` keep their §3a/§3b shapes and rules; tokens stay globally unique. Move planning `.md` files into `docs/` (commit this file as `docs/ARCHITECTURE.md`).

**Kickoff prompts:** `PROMPT — Claude Code Kickoff (POA).md` and `PROMPT — Claude Code Kickoff (Builder).md` will be **merged into one master kickoff prompt**, assembled **after** the branding pass so it carries 100% of the goal (visual identity + copy/voice through decision trees, schema, engine, output). Until that master prompt exists, the two briefs' substance stands as the build contract; only the session structure is changing.

## 6. Deploy — Vercel

**One** Vercel project, same repo, **Root Directory `apps/builder`**. The build resolves `packages/*` as workspace deps (no publish). GitHub is the source of truth; Vercel auto-deploys `main` and previews PRs.

## 7. Privacy floor in practice (per PRINCIPLES)

Document picker → conditional intake (only selected documents' fields are collected) → engine fan-out → browser download. Nothing uploaded, stored, or logged. The whole app is at the strict floor because one payload may hold the program's most sensitive data. Outputs stay separate files — the detention card is never auto-bundled. Say the privacy posture in the UI; the code is public so the claim is auditable. Any additive convenience (on-device `localStorage` autosave) is opt-in, disclosed, one-click clearable, and never the only path to the document.

## 8. Open-source hygiene

- **License (recommended, your call as the attorney):** code under **MIT**; the legal templates/content under **CC BY 4.0** (or CC0). Licensing the forms has implications you own — flag before publish.
- **README** at root (the monorepo, the privacy floor, "not legal advice") + an `apps/builder` README.
- **CI:** GitHub Action on PR runs typecheck, ESLint + Prettier, and `packages/engine` tests. TS strict. Vercel handles previews.
- **Secrets:** none by design. `.gitignore` build artifacts, `node_modules`, `.vercel`.

## 9. Discipline the single session keeps (module hygiene)

Even with one builder, hold these so the codebase stays clean:
- `apps/builder` consumes `packages/engine` only via its public contract — never reimplement token-fill or pdf-lib drawing in the app.
- Compose intake from `schema/core.ts` + the per-document subschemas; honor the §4 token contract exactly; keep tokens globally unique.
- The tile map reads `packages/poa-data/states.ts` — the data module is the single source of truth; don't duplicate state data into the app.
- Freeze `packages/engine` public types once set (phase 2); keep the engine free of `window`/`fs`/network and free of state/document-specific logic.
- Detention path reaches shippable first, behind the picker. Whole app at the strict privacy floor; outputs stay separate files.

---

## Still needs Taylor (not blockers for scaffolding)

- License choice for code vs. legal content (§8).
- Detention-card legal items in the SPEC (authorization-to-retain-counsel instrument, choice-mark question, blank G-28) — the engine supports all three mechanically.
- Confirm the UPOAA/UHCDA flags (PA, IN, MS) in `states.ts` against the Uniform Law Commission lists before the tile map makes a public claim.
