---
title: Pocket Card
generated_date: {{generated_date}}
---

**DRAFT — for attorney review.**

**Say this. Sign nothing.**

I am exercising my right to remain silent. I want to speak to a lawyer. I will not sign anything until I speak to a lawyer. I want to see an immigration judge.

**DO NOT SIGN** any paper that says "stipulation," "removal order," "voluntary departure," or "waiver" until a lawyer explains it. Signing can erase your right to see a judge and bar you from coming back. No one can force you to sign. Voluntary departure is something you **ask a judge** for, with a lawyer — not a form an officer hands you.

<!-- pagebreak -->

**Who to call**

Lawyer: {{lawyer_name}} — {{lawyer_phone}}

Trusted person: {{trusted_person}} — {{trusted_person_phone}}

Backup: {{backup_name}} — {{backup_phone}}

{{has_authorization}} I have a signed authorization in my Red Binder.

{{lawyer_has_signed_g28}} A signed G-28 is on file with my lawyer.

<!-- Internal — not principal-facing. -->

## VERIFIED — locked

**STATUS: DRAFT — NOT YET SIGNED OFF.** The §4 rights script and the DO-NOT-SIGN / voluntary-departure language are DRAFT pending Taylor's sign-off (he is the EOIR-registered attorney; bars / VD / expedited-removal accuracy is his to verify). The "DRAFT — for attorney review" line stays on the rendered card until he signs.

**Carried-card floor (SPEC §1).** No sensitive findability data on this card — no name, DOB, A-number, immigration status, country of birth, fear-of-return, or photo. Only the rights script, the one DO-NOT-SIGN rule, and who-to-call. Enforced by `detention-floor.test`.

**Voluntary-departure reconciliation (Phase-5 §4).** This card says do not sign a "voluntary departure" paper an officer hands you; the binder page says ask the judge for voluntary departure. Both surfaces state the distinction the same way: VD is requested from the judge, with counsel — never signed from an officer's form.

**Tokens.** `{{lawyer_name}}` / `{{lawyer_phone}}` / `{{trusted_person}}` / `{{trusted_person_phone}}` from `schema/detention`; `{{backup_name}}` / `{{backup_phone}}` from core emergency_contacts[0] (sliced in the app). `{{has_authorization}}` and `{{lawyer_has_signed_g28}}` are checkbox booleans. Rendered through the engine's single-sided fold `wallet-card` format.

## Open questions for Taylor

1. **§4 rights script + immigration-limits wording** — your sign-off (especially the DO-NOT-SIGN rule and the voluntary-departure line).
2. ES follows in Phase 8 after your EN sign-off.
