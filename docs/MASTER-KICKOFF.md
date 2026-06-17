# Master Kickoff — Red Binder Builder (single Claude Code session)

_Paste this into one fresh Claude Code session with access to `/Users/taylorberger/Documents/Claude/Projects/Red Binder/`. **One session builds the whole thing.** This is the consolidation of the POA and Builder briefs, now carrying 100% of the goal — visual identity and copy through decision trees, schema, engine, and output. It supersedes both kickoff briefs for session structure; their substance lives in the binding docs below._

---

## 0. How to use this prompt

- **Binding source of truth:** `rebuild/architecture-canonical.md` (commit it into the repo as `docs/ARCHITECTURE.md`). If anything here and that file ever conflict, that file wins on architecture; this prompt wins on intent and sequencing. Read it in full before writing code.
- **Do not start coding until you've read the docs in §9 and reported a plan back to Taylor** (what the plan must cover is in §10).
- **The GitHub repo already exists** — no pause needed for repo creation. Clone it and push your scaffold to `main`:
  - Repo: **`tcbmem-png/red-binder`** · Public · default branch `main`
  - Remote: `https://github.com/tcbmem-png/red-binder.git`
  - **MIT LICENSE is already committed** (initial commit) — that covers the code. The legal-content license (CC BY 4.0 or CC0 for templates) is still Taylor's call; add it as a separate `LICENSE` under `packages/templates/` or `docs/` when he confirms (§11).

## 1. Who you're working for

Taylor C. Berger, attorney, Mississippi Bar #103232, licensed in MS and TN, TCB Law, Oxford, MS. This is the **Red Binder Project** — free, bilingual, open-source tools for immigrant and mixed-status families. A plan, before the emergency.

Voice: plain words, periods where others use commas, calm and direct, honest about limits. Dignity, not fear. No funnel-bro language — no scarcity, no "trusted by," no manufactured urgency. The product is memory: make the next right action easy to find.

You build from attorney-reviewed specs. **You are not the attorney.** Anywhere legal operative language is required — authorization wording, G-28 advice, statutory phrasing — use a clearly-marked placeholder and flag it. Never invent it.

## 2. What you're building

**One client-side web app — `apps/builder`** — where a person picks what they need, enters shared facts **once**, and gets multiple printable bilingual (EN/ES) PDFs from a single payload. Three documents:

- **Red Binder Plan (RBP)** — family emergency overview.
- **Power of attorney (POA)** — national; lets a trusted person handle money and home if the principal can't. Branches on **state of residence**.
- **Pocket Plan** (the detention card; the "DD" working label is retired) — branches on **immigration status**, federal, state-independent. Two physical pieces: a **Pocket Card** carried (minimal, no sensitive data on it) and a **Binder Page** kept at home / with a trusted person (identity details, the fight-vs-depart decision, the counsel/trusted-person authorization).

Stack: **React + Vite (SPA), Tailwind + shadcn/ui, pdf-lib, Zod, react-hook-form.** Client-side only. Bilingual EN/ES side-by-side.

## 3. Non-negotiables

1. **Privacy floor — client-side only, nothing stored.** No backend, no database, no account system, no email, no analytics/telemetry touching user input, no third-party call carrying PII. PDFs are generated in the browser and never leave the device unless the user prints/saves. The **whole app** sits at this floor because one payload may hold an A-number, immigration status, and a fear-of-return statement beside POA data. Per `PRINCIPLES — Privacy & Data Handling.md` and architecture §7. Say it plainly in the UI; the code is public so it's auditable.
2. **Outputs stay separate.** Each document is its own file the user chooses to print. **Never auto-bundle the Pocket Plan** into a POA packet.
3. **Use the shared engine via its public contract.** `packages/engine` (architecture §3) does token-fill, repeaters, pagebreaks, EN/ES layout, pdf-lib drawing, image embed, `wallet-card`/`letter` formats, PDF attachment. Never reimplement that in the app. Freeze the engine's public `types.ts` (phase 2) before building UI on it. Keep it pure — no `window`/`fs`/network.
4. **No inventing legal language.** Authorization-to-retain-counsel, G-28 advice, statutory phrasing → flagged placeholders. Taylor owns them.
5. **Bilingual, ES after EN.** Use the EN microcopy from the branding handoff; produce ES from the handoff's draft strings, but treat all ES as TODO pending the named native review (architecture phase 8). Render EN/ES side-by-side per the token contract.
6. **Token contract intact — extend, don't break.** `HANDOFF — Token List for PDF Generation.md`. Tokens globally unique across modules so the one shared payload never collides.
7. **Monorepo + Vercel, no Lovable.** One Vercel project, Root Directory `apps/builder`.

## 4. Architecture in brief (binding detail in `architecture-canonical.md`)

- **Monorepo (§2):** `packages/engine`, `packages/templates/{poa,detention,rbp}`, `packages/schema/{core,poa,detention,rbp}.ts`, `packages/poa-data` (`states.ts` + matrix), `apps/builder`, `docs/`. pnpm workspaces + Turbo. Node 22 LTS, pnpm 9, TS 5, React 19, Vite 6 (confirm against Vercel runtimes the day you scaffold).
- **Engine signature (§3):** `renderDocument(input) → RenderResult`, `renderDocuments(inputs[])` for fan-out, `downloadResults()` the only browser-coupled export. Conceptually `(payload, template) → PDF bytes`. Templates passed as raw strings; engine never reads the filesystem.
- **Schema (§3a):** one composed Zod schema = shared `core` ∪ selected subschemas. `core.ts` owns the entered-once identity **including the dual-surname name model** (apellido paterno + materno, also yielding first/last). `poa.ts` defines no name fields and reads from core. Detention identity sources its surnames from core. Data minimization by composition — a subschema's fields are only collected when its document is selected.
- **Intake model + orthogonal branch axes (§3b):** picker → shared core → conditional sections → review → fan-out. **POA branches on state; Pocket Plan branches on immigration status.** Independent axes; neither reaches into the other. POA is the primary, standalone path — it completes and produces its PDF with no dependency on any detention field.
- **50-state strategy (§4):** one universal POA body + state-variation tokens, driven by `states.ts` (`documentPath` = `UNIVERSAL` / `UNIVERSAL_PLUS_ADDENDUM` / `STATE_FORM`). Engine stays state-agnostic; the tile map UI renders against `states.ts`.
- **Deploy (§6), OSS hygiene (§8), module discipline (§9)** as written.

## 5. Branding integration (full artifacts in `BRANDING — Build Handoff.md`)

Carry the whole look and copy, not just the structure.

- **Tokens (§1):** paste the handoff's shadcn `:root` HSL block into `globals.css` and the `theme.extend` into `tailwind.config.ts`. Two things easy to miss: (a) **remap shadcn's `--destructive` to the caution amber** `#BE8A3E` — binder red `#C8362B` is the *find-me* color, not an alarm; there is no second alarm-red; (b) the most "destructive" action (Clear everything) is a calm outline button with a confirm step, styled as privacy *relief*, never as danger.
- **Type (§1d):** **Atkinson Hyperlegible**, self-hosted woff2 in the repo (no runtime CDN — privacy-floor + offline-friendly print). Weights 400/700 only. Type scale and 1.6 body line-height as specified. Mobile-first: touch targets ≥44px, inputs ≥44px, labels above fields, high contrast, no dense legal walls. Red anchors the mark + one primary action per screen; never the background of legal text.
- **Microcopy (§2):** use the handoff's EN/ES string set verbatim for the picker, shared-core/POA/detention sections, CTAs, states (empty/confirm/clear/success/error), and especially the **privacy notice** (three registers) and the **three disclaimers** (not legal advice / POA-not-valid-until-notarized / honest Pocket Plan limits) in caution amber. CTAs name the next action — never "Get started free / Unlock / Claim."
- **Naming (§3, LOCKED):** "Pocket Plan / Plan de Bolsillo" everywhere in the UI; app stays "Red Binder Project." No schema/token impact.
- **Tile legend (§2g):** render the `documentPath` legend (label/color/EN-ES description) from `states.ts` using the `path.*` colors — functional 3-way legend, distinct from brand red so a tile never reads as an action.
- **Entry points (§4):** two landing pages (Door A `?doc=poa`, Door B `?doc=detention`) deep-linking into the picker with a document pre-selected (app-layer routing; POA renders identically regardless of entry). Persistent privacy line on every screen. TCB Law appears quietly in footer/about/disclaimers — "A TCB Law initiative" — never the hero, and its letterhead system stays in its own lane.

## 6. The decision logic to get right

- **Picker:** multi-select; POA presented first; none gates another; a POA-only user completes and never sees an immigration field. Accepts `?doc=` to pre-select.
- **Conditional intake:** only the selected documents' fields are collected (data minimization by composition).
- **POA path:** state tile map against `states.ts` → `documentPath` routing + POA fields (effectiveness, successors). State-driven only.
- **Pocket Plan path (per `SPEC — Detention Card...`):** identity block that makes the person findable (full legal name; apellido paterno + materno separately; likely misspellings/aliases; exact DOB; country of birth; A-number if any; photo — constrain upload to **PNG/JPEG** so pdf-lib embeds it; distinguishing details; best language). Chosen path fight-vs-depart per SPEC §2 (refusal script on the carried card; decision-mark on the binder page — keep the toggle configurable). Trusted contacts + lawyer fields. Authorization-to-retain-counsel = **flagged placeholder**, Taylor's language. G-28 handling = instructions + reference; if Taylor ships a fillable blank G-28, pass it to the engine via `attachments`.
  - **Wallet card format — LOCKED: single-sided, fold-once-to-wallet.** The `wallet-card` output is **one** US Letter page (offer A4 too) holding the two CR80 panels (3.375"×2.125") — front (rights script + the one "DO NOT SIGN" rule) and back (who-to-call) — printed side-by-side and mirrored across a center fold line, with a solid cut border and a dashed fold line. The user prints **one side only** (no duplex — the reliability win for people printing at a library or a friend's), cuts the border, folds once so front and back meet, tapes or laminates. Put a one-line bilingual instruction on the sheet: "Print. Cut on the solid line. Fold on the dashed line. Tape or laminate. / Imprime. Corta en la línea sólida. Dobla en la línea punteada. Pega con cinta o plastifícalo." This avoids duplex misregistration and two-pass alignment. If the engine's `wallet-card` format can't yet emit this fold layout, that's the one engine capability to add in phase 2 — before finalizing `wallet_card.en-es.md`.
- **Fan-out:** run the engine once per selected template; offer each PDF separately; in-memory only; `localStorage` autosave only if Taylor approves (opt-in, one-tap clear).

## 7. Build order (architecture §5 — each phase a commit/checkpoint)

1. Clone **`tcbmem-png/red-binder`** (exists, public, MIT, `main`); scaffold monorepo + tooling + CI into it; push to `main`. Set up the single Vercel project (Root Directory `apps/builder`).
2. Build `packages/engine` to the §3 signature; test it; **freeze public types.**
3. POA content: `templates/poa/*`, `poa-data/states.ts` + matrix, `schema/poa.ts`.
4. Core: `schema/core.ts` (dual-surname identity) + document picker + shared-core intake. Apply tokens/type/microcopy here.
5. **Pocket Plan path first to shippable:** `schema/detention.ts`, `templates/detention/{wallet_card,binder_page}.en-es.md`, rendered through the engine behind the picker. Ships before the full 50-state POA UI — most time-sensitive.
6. Wire the POA path (tile map + fields) and the RBP path into the same flow.
7. Privacy notice + "clear everything" control; entry-point landing pages; repo hygiene (LICENSE split, READMEs).
8. ES translation pass after Taylor signs off on EN.

## 8. What you must not do

- No server, database, storage, email, or input-capturing telemetry. Client-side only.
- Don't auto-bundle the Pocket Plan with other documents.
- Don't invent legal language — flagged placeholders only.
- Don't reimplement engine work in the app, or mutate engine public types / state data after they're set without recording it.
- Don't machine-translate ES ahead of Taylor's EN sign-off; mark ES TODO.
- Don't wire Lovable. No real person's data, secrets, or keys in the repo.
- Don't present anything as final or legally approved — DRAFT for attorney review.

## 9. Start with (reading order)

1. `rebuild/architecture-canonical.md` — binding architecture (§3 engine, §3a schema, §3b intake/branch axes, §4 50-state, §5 phasing, §7 privacy, §9 discipline).
2. `BRANDING — Build Handoff.md` — tokens, microcopy, naming, entry points.
3. `DECISION — Unified Builder App...md`, `DECISION — Deploy & Repo (Monorepo + Vercel).md`, `PRINCIPLES — Privacy & Data Handling.md`.
4. `SPEC — Detention Card + Counsel Authorization (DRAFT).md` and `RESEARCH — Detention Decision Form (What ICE Wants Signed).md` — the Pocket Plan build contract and the why.
5. `HANDOFF — Token List for PDF Generation.md` — token/render conventions to match and extend.

## 10. Report a plan before writing app code

After reading, report back to Taylor: the repo scaffold (layout, pnpm/Turbo, pinned versions), the `packages/engine` public signature you'll commit, the `schema/core.ts` + `schema/detention.ts` shapes (and how core's dual-surname identity feeds both POA and detention), the new detention tokens, the picker/conditional-intake flow, how you'll apply the branding tokens + microcopy, how the `wallet-card` format renders the locked single-sided fold layout (§6), and any blocking open questions. Then build.

## 11. Open sign-offs (non-blocking — proceed with the recommended default, flag for Taylor)

- **Naming:** LOCKED — Pocket Plan / Red Binder Project. Carry as final.
- **Binder red exact value:** `#C8362B` recommended — proceed, flag for approval.
- **EN disclaimer wording:** the three disclaimers — confirm with Taylor (the attorney) before they ship.
- **Spanish reviewer:** ES is phase 8; needs a named native reviewer (neutral LatAm, ~8th grade; `carpeta` vs. `fólder`).
- **Light mode only:** recommended for v1 — proceed light-first, dark deferred.
- **LICENSE split:** MIT for code is **done** (committed in the repo). The legal-content license — CC BY 4.0 (or CC0) for templates — is still Taylor's call; add it under `packages/templates/` or `docs/` before publish.
- **Wallet card format:** LOCKED — single-sided fold-once-to-wallet (§6). Carry as final.
- **SPEC legal placeholders** (authorization-to-retain-counsel, choice-mark, blank G-28) and the **PA/IN/MS uniform-act flags** in `states.ts` — Taylor confirms before the relevant surface makes a public claim. Engine supports all three Pocket Plan affordances mechanically.
