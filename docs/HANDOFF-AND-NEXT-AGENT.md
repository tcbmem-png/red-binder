# Red Binder Project — Handoff & Next-Agent Brief

**Written:** 2026-06-17 · **Repo:** `github.com/tcbmem-png/red-binder` · **Branch:** `main` · **HEAD at handoff:** `c3581d4`

This document is the whole job's memory. It is written so an agent with **none** of the prior context can
pick the project up cold, finish it, and deploy it. Read it top to bottom before touching code.

---

## 0. What this project is (one paragraph)

A free, bilingual (EN/ES), open-source, **100% client-side** web app for immigrant / mixed-status families.
A person enters their shared facts **once** and gets multiple **printable PDFs**: a Power of Attorney (POA),
a Red Binder Plan (RBP, a family-overview binder), and a Pocket Plan (a wallet card + a binder page for the
detention/ICE context). Nothing is ever stored or transmitted — generation happens in the browser and the
files download locally. Built by **Taylor C. Berger**, attorney (MS Bar #103232, MS/TN), a TCB Law initiative.
Taylor is the architect and the legal sign-off authority; the agent builds, Taylor approves.

---

## 1. Current state

**Stack:** pnpm 9.15.0 (via corepack; `packageManager` is pinned) · Turborepo · Node 22.20.0 · TypeScript 5 strict ·
React 19 · Vite 6 · Tailwind **3.4** (not v4) · Vitest. `.npmrc` sets `node-linker=hoisted`; root `package.json`
pins `pnpm.overrides.vite=^6.0.0` (single Vite across the workspace — do not remove, it fixes a nested-Vite build break).

**Monorepo layout:**
- `packages/engine` — pure `(payload, template) → PDF bytes`, browser-safe. pdf-lib + @pdf-lib/fontkit; Atkinson
  Hyperlegible base64-embedded (OFL, self-hosted); vector-drawn checkboxes; markdown directive processing.
  **`packages/engine/src/types.ts` is the FROZEN public contract — do not change it.**
- `packages/schema` — composed Zod: `core.ts` (dual-surname identity + gated field groups), `poa.ts`,
  `detention.ts`, `rbp.ts`; plus token bridges (`coreTokens`, `emergencyTokens`, `poaTokens`, `detentionTokens`,
  `rbpTokens`) and `composeCoreSchema` / `composeIntakeSchema` / `coreFieldGroupsFor` / `DocKind`.
- `packages/poa-data` — `states.ts`: 51 jurisdictions, each with a `documentPath`
  (`STATE_FORM` | `UNIVERSAL_PLUS_ADDENDUM` | `UNIVERSAL`) and a `verify` flag. `G28_FILLABLE_ENABLED` lives in
  `schema/detention.ts` (currently `false`).
- `packages/templates` — the bilingual `.md` documents, imported by the app as `?raw` strings.
- `apps/builder` — the React app (the only deployable).

**Phases / slices complete (commit hashes):**
| Phase | Commit | What |
|---|---|---|
| Initial | `b0ec90a` | repo init |
| 1 | `b087baf` | scaffold pnpm + Turborepo monorepo |
| 2 | `07a03e5` | render engine — **types frozen here** |
| 3 (data) | `eeff8a6` | `states.ts` (51 jurisdictions) + POA subschema |
| 3 (content) | `3e145cd`, `50660b4`, `547fac9`, `788f64b` | universal UPOAA POA (DRAFT), execution sheet, state addendum, Taylor's redline, Article II fix |
| 4 (core) | `9736971` | `schema/core.ts` — dual-surname identity + gated shared groups |
| 4 (UI) | `a711b84`, `024e420` | branding system, document picker, detention-template **floor test**, shared-core intake |
| 5 (schema) | `266124c` | `schema/detention.ts` — Pocket Plan fields + ICE-locator extras |
| 5 (templates) | `4a05444`, `1b6e363` | Pocket Card + Binder Page (DRAFT); card "bar you from coming back" restore |
| 5 (docs) | `6f7f8b5` | Phase-5 decision records |
| 6 (slice 1) | `cc5f3d5` | POA state tile map + POA section — **acceptance gate #1** |
| 6 (slice 2a) | `36a98fb` | generation core + fan-out + **the four acceptance gate tests** |
| 6 (slice 2b) | `1eebab9` | **live intake sections + review/generate wiring — tool runs end-to-end** |
| 6 (gotcha f) | `c3581d4` | guard that the POA notary + durability language renders (**HEAD**) |

**Tests — 101, all green** (`pnpm test`): engine 30 · poa-data 11 · schema 25 · templates 16 · builder 19.
`pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm build` all green.

**The gate / floor / guard tests (keep these green — they encode the program's promises):**
- `apps/builder/test/generate.test.ts` — the **four acceptance gates**:
  (#2) outputs stay separate — N inputs → N distinct valid PDFs, Pocket Plan never bundled;
  (#2 at the slice) detention slices carry no POA/contact/agent data;
  (card) from a full payload the card slice carries no A-number/name/DOB/country/fear;
  (#3) no-storage source scan — no app file uses `localStorage`/`sessionStorage`/`indexedDB`/`XMLHttpRequest`/`fetch(`/`sendBeacon`.
- `packages/templates/test/detention-floor.test.ts` — the rendering-side privacy floor: forbidden tokens
  (contact/agent on any detention template; sensitive identifiers on the wallet card) can't appear in the templates.
- `packages/templates/test/poa-render.test.ts` — the **gotcha (f) guard**: the notary + durability language
  renders in each POA's body; the VERIFIED provenance is in the stripped tail.
- Gate #1 (tile map respects `verify` flags) lives in `apps/builder/src/components/StateTileMap.tsx` —
  IN/PA (`verify:true`) render a neutral "Pending confirmation" style, never a `documentPath` color.

**What the live tool DOES (verified in a real browser via `vite preview`, port 4321):**
picker → core intake → per-document sections (`[poa] → [rbp] → [detention]`, only the selected ones) →
review → **"Make my documents"** → the browser downloads **one separate PDF per document**, then a done screen
("We kept nothing, and we sent nothing"). A single full run (all three docs) produced 6 valid PDFs:
`power-of-attorney-CA.pdf`, `how-to-sign.pdf`, `state-notice-CA.pdf`, `red-binder-plan.pdf`, `pocket-card.pdf`,
`binder-page.pdf` — each `%PDF`, distinct filename, zero console errors. Navigating Back never loses entered data
(each section restores via an `initial` prop; the detention photo is captured on file-pick so it survives remounts).

**What the live tool does NOT do yet:**
- **RBP renders empty repeater rows** (page bloat) — see gotcha (e) / §3 item 1. This is the one real functional defect.
- **ES (Spanish) is DRAFT throughout** — flagged for Phase 8 native review. Do not treat ES strings as final.
- **Everything carries a DRAFT marker by design** — sheddable only on Taylor's sign-off (§4).
- **The fillable blank G-28 is disabled** (`G28_FILLABLE_ENABLED=false`) — instructions-and-link is the default. By design.
- **Not deployed.** No Vercel project yet.

---

## 2. Exactly where I stopped

- **Last commit:** `c3581d4` (Phase 6 — gotcha (f) guard). Working tree clean, pushed to `origin/main`.
- **Incomplete work:** none in-flight / uncommitted. The end-to-end wiring is complete and verified. The known
  remaining work is enumerated in §3; it is all net-new, not half-done.
- **The single next concrete step:** add `<!-- if:token -->` / `<!-- endif -->` hide-annotations to the repeater
  rows in `packages/templates/rbp/rbp_basic.en-es.md` (gotcha (e) / §3 item 1). This is the highest-value next
  action — it's the only outstanding functional defect, and it's mechanical.

---

## 3. Remaining to functional completion + launch

### A. Leftover wiring (the build's job — do these before deploy)

1. **RBP repeater hide-annotations (the page-bloat fix) — DO THIS FIRST.**
   `packages/templates/rbp/rbp_basic.en-es.md` currently has **zero** `<!-- if -->` annotations, but renders
   **static** rows for `Child 1..20` (each a `### Child N / Niño N` block, ~13 lines) and `Document 1..30`,
   plus static `Successor Agent` / `Second Successor Agent` blocks. So a plan with 1 child + 1 document renders
   ~19 empty child blocks + ~29 empty document blocks + (if no successors) 2 empty agent blocks. Fix: wrap each
   repeater block in the engine's conditional, keyed on that row's required token, e.g.:
   ```
   <!-- if:child_1_name -->
   ### Child 1 / Niño 1
   Name: **{{child_1_name}}**
   ...
   <!-- endif -->
   ```
   Do this for `child_1..20` (key on `child_N_name`), `doc_1..30` (key on `doc_N_label`), and the successor-agent
   blocks (`agent2_first`, `agent3_first` — mirror how `poa_financial_universal.en-es.md` already gates them at
   its lines ~50 and ~67). The engine (`packages/engine/src/markdown.ts → evalConditionals`) keeps a block iff
   any listed token is present/non-empty. **Verify:** render the RBP with one child + one document and confirm
   no empty rows appear (use `vite preview` + the download-intercept approach in §7, or a small engine unit test).
   Consider adding a templates test asserting the RBP has an `<!-- if -->` for every `child_N`/`doc_N` so this
   can't regress.

2. **(Optional polish, not blocking)** A schema-validation pass on the merged payload at generate time. Today
   the section components do light client-side gating and the token bridges read defensively; `composeIntakeSchema`
   is not run on the final payload. Not required for correctness, but a belt for malformed input.

### B. Deploy (see the runbook in §6)

One Vercel project, **Root Directory `apps/builder`**, GitHub `main` auto-deploys. No secrets.

### C. Launch gates — these are TAYLOR'S, not the build's

The build does not flip these; they gate **launch**, not completion. Do not act on any without Taylor's explicit go:
1. **POA universal sign-off** — the universal UPOAA body is a source-anchored DRAFT awaiting his clause-level approval.
2. **Pocket Plan** — (§1) the authorization-to-retain-counsel wording + signature block; (§3) ship-or-veto the
   fillable blank G-28 (`G28_FILLABLE_ENABLED`); (§4) the rights-and-limits wording on the card + binder page.
3. **IN / PA ULC confirmation** — confirm Indiana and Pennsylvania are correctly treated as non-UPOAA, and check
   their execution-string specifics. Until then their `verify:true` flag stands and the tile map shows "Pending."
4. **Real-print wallet-fold check** — physically print the Pocket Card and confirm the single-sided fold geometry
   (two CR80 panels, no back-panel rotation) lines up. This is a physical check only Taylor can do.
5. **ES (Phase 8)** — native bilingual review (neutral LatAm, ~8th-grade) of all ES strings + templates.

When (and only when) a gate clears, Taylor authorizes shedding the relevant DRAFT marker for that document.

---

## 4. Binding context & invariants the successor MUST honor

**Read these docs, in this order, before building** (all under `docs/`):
1. `MASTER-KICKOFF.md` — the project brief and build order.
2. `ARCHITECTURE.md` — **the canonical architecture** (this is what "architecture-canonical" refers to; there is
   no `rebuild/` dir). §3 covers the enter-once / fan-out / data-minimization model.
3. `PRINCIPLES — Privacy & Data Handling.md` — the privacy contract (client-only, store nothing, transmit nothing).
4. `DECISION — Unified Builder App (Enter Once, Many Documents).md` — the one-payload-many-documents decision.
5. `DECISION — Deploy & Repo (Monorepo + Vercel).md` — the deploy model (§6 below summarizes it).
6. `SPEC — Detention Card + Counsel Authorization (DRAFT).md` — the Pocket Plan spec (card §1/§2, binder, G-28 §3, rights §4).
7. `DECISION — Phase 5 Detention Flags.md` — the detention feature flags and why they default off.
8. `DD — Phase 5 Legal Resolutions (DRAFT for Sign-off).md` — the legal resolutions behind the detention templates.
9. `BRANDING — Build Handoff.md` + `BRAND & IDENTITY — Red Binder Project (v1).md` — voice, color, type. EN microcopy
   is verbatim/handoff-voice; binder-red anchors the mark, never the background of legal text.
10. `HANDOFF — Token List for PDF Generation.md` — the token contract.

**Hard rules (do not violate):**
- **`packages/engine/src/types.ts` is frozen.** Everything leans on it. Do not change the public types.
- **Keep the four gate tests, the two floor tests, and the POA-render guard green** (§1 lists them). They encode
  the program's safety promises. If a change makes one fail, the change is wrong, not the test.
- **Tokens stay globally unique.** One token name = one meaning across all templates and bridges.
- **Do NOT, without Taylor's explicit go:** shed any DRAFT marker · flip `G28_FILLABLE_ENABLED` to `true` ·
  clear the IN/PA `verify` flags. These are his legal calls and they gate launch, not the build.
- **Privacy floor is non-negotiable:** the app stores nothing and transmits nothing. The wallet card carries only
  the rights script, the do-not-sign rule, and who-to-call — never name/DOB/A-number/status/country/fear/photo.
  `fear_of_return` is binder-page-only. A combined selection (e.g. POA + Pocket Plan) collects an address and the
  agent chain for the POA; the only thing keeping those off the card/binder is the **slicing** in
  `apps/builder/src/lib/generate.ts` + the floor tests. Preserve both.

---

## 5. Gotchas the successor must not relearn or undo

- **(a) Do NOT add a raw PDF byte-scan to "prove" no leak.** The engine subsets + embeds fonts, so rendered text
  is glyph-encoded — a byte-search for "García" never finds it even if it's printed on the card. It **false-passes**.
  The real guarantee is the **slice tests** (`generate.test.ts`) + the **template floor tests** — by construction at
  both ends. (Taylor ruled on this explicitly.) The only belt-and-suspenders worth building later is a *positive-control*
  text-extraction test: render card AND binder from the same payload, assert the name is FOUND in the binder
  (proving extraction works) and ABSENT from the card. Nice-to-have, not a gate.
- **(b) `sanitize` must stay control-char-safe.** `packages/engine/src/sanitize.ts` strips control characters with a
  **char-code loop** (`stripControlChars`), NOT a regex with literal control bytes in the source — the literal-byte
  version got mangled on write. Keep the char-code approach; never paste raw control bytes into source.
- **(c) Tailwind v3, not v4.** The shadcn HSL color tokens depend on v3 semantics. Do not upgrade to v4.
- **(d) The wallet-card fold needs NO back-panel rotation.** `packages/engine/src/walletCard.ts` lays out two CR80
  panels single-sided; do not add rotation "to fix" the fold. (Confirm against a real print — §3.C.4.)
- **(e) RBP repeater rows still need `<!-- if: -->` hide annotations.** **STATUS: NOT DONE — this is the #1
  leftover-wiring item (§3.A.1).** Without them the RBP renders 20 child blocks + 30 doc blocks regardless of how
  many are filled. Add them; do not "simplify" them away once added.
- **(f) The POA notary + durability render — RESOLVED & GUARDED (commit `c3581d4`).** The risk was that the engine
  truncates everything from the first `<!-- internal -->` comment or `## Open questions for Taylor` heading onward
  (`markdown.ts → truncateInternal`), and strips all HTML comments. **Finding:** in all three POA templates the
  `NOTARY ACKNOWLEDGMENT` block and the durability language sit in the **principal-facing body, before** that marker,
  and are **not** inside any `<!-- if -->` conditional — so they render. The `## VERIFIED — locked` block is *separate*
  provenance/sourcing notes that sit **after** the marker and correctly **strip** (it is NOT where the operative
  notary/durability text lives — that was the conceptual trap). `packages/templates/test/poa-render.test.ts` now
  asserts this for universal/MS/TN and will fail if anyone moves the notary/durability into the stripped tail.
  **Do not move operative language below the `<!-- Internal -->` line.**
- **(g) Fonts are self-hosted — no runtime CDN.** Atkinson Hyperlegible is base64-embedded in the engine. Do not
  introduce a runtime font fetch; it would break the offline/client-only guarantee and the no-network floor.

---

## 6. Deploy runbook (Vercel)

Per `docs/DECISION — Deploy & Repo (Monorepo + Vercel).md`:
- **One Vercel project**, connected to the GitHub repo, branch `main` (auto-deploy on push).
- **Root Directory: `apps/builder`.** Vercel's build resolves `packages/*` as workspace dependencies from the
  monorepo — nothing is published to npm. Framework preset: Vite (build `pnpm build` → output `dist`). pnpm is the
  package manager (pinned via `packageManager`); Vercel will honor corepack.
- **No environment variables / no secrets — by design.** The app makes no network calls and has no backend.
- **Nothing ships out of DRAFT.** Deploying the app does not shed any DRAFT marker — the live tool serves DRAFT
  documents until Taylor's §4 sign-offs land. Deploy is safe (it's a static, no-data tool); launch is the gated event.
- Suggested: deploy a preview first, click through picker → … → "Make my documents", confirm the PDFs download.

---

## 7. Successor's first actions

1. **Clone & install:** `git clone https://github.com/tcbmem-png/red-binder && cd red-binder` → ensure corepack
   (`corepack enable`) so pnpm 9.15.0 is used → `pnpm install`.
2. **Run the full suite — expect 101 passing** (`pnpm test`), and confirm `pnpm typecheck && pnpm lint && pnpm build`
   are green. If the count or greenness differs, stop and reconcile before changing anything.
3. **Read the binding docs in the order in §4**, then re-read §4 (invariants) and §5 (gotchas).
4. **Start from the named next step (§2 / §3.A.1):** add the RBP repeater `<!-- if -->` annotations. Before writing
   code, post a short plan (what blocks you'll wrap, what token each is keyed on, how you'll verify no empty rows).
5. **To verify UI/PDF changes** without a real download dialog: start the dev server (the `builder` launch config,
   port 4321), drive the flow, and intercept downloads in-page — hook `URL.createObjectURL` to capture the blobs and
   override `HTMLAnchorElement.prototype.click` to a no-op, then read each blob's first bytes (`%PDF`) and size. This
   is how the end-to-end run in §1 was verified. (Source-level template tests are preferred where possible — they
   never false-pass under font subsetting; see gotcha (a).)
6. **Then proceed through §3** (finish wiring → deploy) and hand the §4 launch gates to Taylor. Report outcomes
   faithfully: if a test fails, say so with the output; never shed a DRAFT marker or flip a flag on your own initiative.

— End of handoff —
