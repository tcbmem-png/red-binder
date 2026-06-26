---
title: Binder Page — Pocket Plan
generated_date: {{generated_date}}
---

# **POCKET PLAN — BINDER PAGE**

**DRAFT — for attorney review.** The authorization section below awaits the attorney's signature.

Keep this page at home and with your trusted person. It holds the details a lawyer needs to find you and act for you. The card you carry holds none of this.

---

# **WHO I AM — so a lawyer can find me**

Immigration databases only match the exact name an officer typed. List every spelling.

Full legal name: **{{legal_name_full}}**

First surname (apellido paterno): **{{apellido_paterno}}**

<!-- if:apellido_materno -->
Second surname (apellido materno): **{{apellido_materno}}**
<!-- endif -->
<!-- if:name_variants -->
Other spellings / how my name may be mis-keyed: **{{name_variants}}**
<!-- endif -->
<!-- if:aliases -->
Other names I have used: **{{aliases}}**
<!-- endif -->

Date of birth: **{{dob_exact}}**

Country of birth: **{{country_of_birth}}**

<!-- if:a_number -->
A-number: **{{a_number}}**
<!-- endif -->
<!-- if:best_language -->
Best language: **{{best_language}}**
<!-- endif -->
<!-- if:height -->
Height: **{{height}}**
<!-- endif -->
<!-- if:distinguishing_features -->
Identifying details: **{{distinguishing_features}}**
<!-- endif -->

Photo:

{{photo}}

<!-- pagebreak -->

# **MY DECISION — made calmly, with a lawyer**

{{path_fight}} I want to FIGHT my case. Ask the judge for a bond hearing. Sign nothing.

{{path_depart}} I want to LEAVE, but protect my future. Ask the judge for **voluntary departure** — never sign a stipulated removal order, and never sign a "voluntary departure" form an officer hands you.

Honest note: voluntary departure lets you leave without a removal order, but it does **not** erase the 3- and 10-year unlawful-presence bars, and missing the departure date turns it into a removal order. Decide this with a lawyer.

{{fear_of_return}} I am afraid to return to my country. (Tell your lawyer. Do not sign anything that says you have no fear of returning.)

<!-- pagebreak -->

# **AUTHORIZATION TO RECEIVE INFORMATION AND RETAIN COUNSEL**

*DRAFT — this language is signed off by the attorney before it is used.*

I, **{{legal_name_full}}**, born **{{dob_exact}}**, authorize the person named below to act for me if I am detained by immigration authorities:

Trusted person: **{{trusted_person}}** — relationship: **{{trusted_person_relationship}}** — phone: **{{trusted_person_phone}}**

I authorize this person to: (1) receive information about my detention and my immigration case from any agency, facility, or attorney; (2) hire an attorney to represent me; and (3) share my information with that attorney so they can help me.

<!-- if:lawyer_name -->
If I have already chosen an attorney: **{{lawyer_name}}**.
<!-- endif -->

This authorization does not create an attorney-client relationship with anyone until an attorney agrees to represent me. I can cancel it at any time in writing. It stays in effect until I cancel it.

This is a bridge to counsel, not a substitute for a G-28. An agency may still require its own forms before it releases case information to my trusted person.

Signed: _______________________________  Date: _______________

*Notarization is optional. Sign now; notarize if you can — a notarized version carries more weight, but a notary is not required for this authorization.*

---

# **G-28 — the form that lets a lawyer get your information**

A G-28 is what makes ICE share your case information with your lawyer. The strongest version is a G-28 a lawyer has already signed and holds for you, arranged before any detention.

If you do not have a lawyer yet, do not file a G-28 yourself. Complete it with a licensed attorney once they agree to represent you; a trusted legal-aid organization can help you find counsel.

<!-- if:include_g28_blank -->
A fillable blank G-28 is included with this binder. **For your attorney to complete and sign once they agree to represent you. Do not file this yourself.**
<!-- endif -->

---

# **HOW MY PEOPLE FIND ME**

Use ICE's online detainee locator at locator.ice.gov. Search by A-number plus country of birth, or by exact name plus date of birth plus country of birth. Try every spelling of both surnames. If nothing shows, call the local ICE ERO field office. (Minors are not listed, and there is a delay right after a transfer from border custody.)

---

# **IMPORTANT**

This is a free tool, not legal advice, and using it does not make us your lawyers. For advice about your situation, talk to a licensed attorney.

This plan can't stop a deportation and isn't a lawyer. What it does: it helps you avoid one mistake — signing away your right to see a judge — and helps your people reach a lawyer fast.

<!-- Internal — not principal-facing. Locked reference for the implementer and attorney review. -->

## VERIFIED — locked

**STATUS: §4 SIGNED OFF; §1 AUTHORIZATION STILL DRAFT.** §4 (identity/decision rights + immigration-limits language) is signed off by Taylor (EOIR-registered attorney; bars / voluntary-departure / expedited-removal accuracy verified). One piece stays DRAFT until he signs, and the rendered "DRAFT — for attorney review" banner is now scoped to it:

- the **§1 authorization** operative language (he signs it).

**Source.** Authorization text and the §4 microcopy are transcribed from `DD — Phase 5 Legal Resolutions (DRAFT for Sign-off).md` §1 and §4; resolutions locked in `DECISION — Phase 5 Detention Flags.md`.

**§3 G-28.** Instructions-and-link is the always-on default (the §3 body above). The opt-in fillable blank G-28 ships only when `{{include_g28_blank}}` is set AND `G28_FILLABLE_ENABLED` (schema/detention) is true — RATIFIED true by Taylor 2026-06-25. Delivered as its own `g-28-blank.pdf` download (engine `getBlankG28`, the untouched USCIS form kept fully fillable — no pdf-lib re-save), generated alongside but never spliced into the binder PDF.

**Voluntary-departure reconciliation (§4).** The card says do not sign a "voluntary departure" paper an officer hands you; this page says ask the judge for voluntary departure. Both are stated the same way — VD is requested from the judge, with counsel.

**Floor.** Binder-only page. Carries the findability identifiers and `{{fear_of_return}}` that the carried card must never hold. Uses no core contact (`principal_address`/etc.) or agent-chain tokens — `detention-floor.test` enforces it. Name/DOB tokens (`legal_name_full`, `apellido_*`, `dob_exact`) source from core's one identity model.

## Open questions for Taylor

1. **§1 authorization wording + your signature** (and confirm the narrow scope + optional notarization).
2. **§3 G-28** — ship the fillable form (flip `G28_FILLABLE_ENABLED`) or keep instructions-only.
3. **§4 rights script + immigration-limits wording** — ✓ signed off by Taylor (VD distinction and the honest bars/deadline note included).
4. ES follows in Phase 8 after your EN sign-off.
