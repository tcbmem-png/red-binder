# CC Kickoff — Phase 5: Pocket Plan Detention Templates

_For the same single build session (engine frozen, core + intake + the mechanical detention scaffold done). This is the operative-template phase for the Pocket Plan. The four SPEC flags are resolved — see `DECISION — Phase 5 Detention Flags.md` (locked state) and `DD — Phase 5 Legal Resolutions (DRAFT for Sign-off).md` (rationale). Dated 2026-06-17._

---

## What Phase 5 produces

Two bilingual templates under `packages/templates/detention/`, written **EN-only now (ES deferred to Phase 8)**, rendered through the existing engine:

1. `wallet_card.en-es.md` — the **Pocket Card** (carried). Renders into the engine's locked single-sided fold `wallet-card` geometry.
2. `binder_page.en-es.md` — the **Binder Page** (kept at home / with a trusted person).

The mechanical scaffold (`schema/detention.ts`, wallet geometry, locator name-variant/alias fields, photo, chosen-path enum, lawyer + trusted-person shapes) proceeds/continues in parallel — it depends on none of the legal calls below.

## The DRAFT discipline (non-negotiable)

Two pieces stay **DRAFT-until-Taylor-signs** and must be rendered behind a visible DRAFT marker so nothing ships as final before his sign-off:
- the **§1 authorization operative language** (he signs it), and
- the **§4 rights script + immigration-limits language** (he's the EOIR-registered attorney; the bars / voluntary-departure / expedited-removal accuracy is his to verify).

Write the approved-in-substance EN now; mark it DRAFT; the templates do not "leave DRAFT" until Taylor signs §1 and §4 and decides §3.

## The four resolutions to build to

### §1 — Authorization to retain counsel (Binder Page only — never carried)
- Narrow scope: receive information + hire counsel only. Not a financial POA, not a G-28.
- Notarization: offer, don't require ("sign now, notarize if you can").
- Include the **optional named-attorney slot** — default general ("hire an attorney"), plus optional "if I have already chosen an attorney: [name / firm]."
- Surrounding copy sets the realistic expectation: this is the **bridge to counsel, not a substitute for the G-28**; do not imply the trusted person can compel an agency to release case information on the strength of this page alone.
- On the Pocket Card, this appears only as the checkbox "☐ I have a signed authorization in my Red Binder."

### §2 — Choice-mark (LOCKED)
- **Pocket Card:** refusal script only. No fight-vs-depart intent on the carried card.
- **Binder Page:** the fight-vs-depart decision-mark lives here, with the instructions.

### §3 — Blank G-28 (optional, opt-in, gated on Taylor's ratification)
- Build the path to include a fillable blank G-28 via the engine's `attachments`, but **as an explicit opt-in, not auto-bundled** into the binder packet.
- Label it exactly: **"For your attorney to complete and sign once they agree to represent you. Do not file this yourself."**
- **Instructions-and-link is the default path.** Keep the fillable attachment **disabled by config until Taylor ratifies** shipping it (his liability call).

### §4 — EN microcopy (approved in substance; DRAFT wording)
Use the finalized EN in `DD — Phase 5 Legal Resolutions...` §4 for the Pocket Card (rights script, the one DO-NOT-SIGN rule, the who-to-call back with the two checkboxes) and the Binder Page (identity block + exact-match helper line, the fight-vs-depart decision with the honest VD limits, the §1 authorization, the §3 G-28 handling, the ODLS locating instructions).

**The one clarification that must be explicit** (prevents the most dangerous misread): the card says don't sign a "voluntary departure" paper an officer hands you; the binder says ask the judge for voluntary departure. Make the distinction unmistakable on both surfaces — *don't sign a voluntary-departure form an officer gives you; voluntary departure is something you **request from the judge, with counsel.*** Don't let the two read as contradictory.

## Guardrails already standing in the repo (honor them)

- **`detention-floor.test`** bars contact/agent tokens from the detention templates — keep the detention templates clear of core-only agent tokens.
- **Privacy floor:** immigration status and the sensitive identifiers (A-number, fear-of-return, etc.) live in `schema/detention.ts`, **never** in core. `fear_of_return` is **Binder Page only — never on the carried card.**
- **Outputs stay separate** — the Pocket Plan is never auto-bundled into a POA packet.
- Tokens globally unique; extend, don't break the HANDOFF contract.

## Checkpoint (report to Taylor before anything leaves DRAFT)

When the two templates are drafted, render samples — the **Pocket Card on its fold sheet** (verify it reads upright after one fold against a real print) and the **Binder Page** — and put them in front of Taylor with the three open items called out:
1. §1 authorization wording + his signature,
2. §3 G-28 ship-or-veto,
3. §4 rights script + immigration-limits wording.

Nothing leaves DRAFT until those land. ES follows in Phase 8 after his EN sign-off.

## Start with

1. `DECISION — Phase 5 Detention Flags.md` — the locked resolutions.
2. `DD — Phase 5 Legal Resolutions (DRAFT for Sign-off).md` — the EN microcopy and the authorization draft.
3. `SPEC — Detention Card + Counsel Authorization (DRAFT).md` — the build contract.
4. `RESEARCH — Detention Decision Form (What ICE Wants Signed).md` — the why behind the rights script and the VD distinction.
5. `BRANDING — Build Handoff.md` §2e — disclaimer wording and voice.
