# DD — Phase 5 Legal Resolutions (DRAFT for Taylor's sign-off)

_Resolves the four SPEC flags so the Pocket Plan templates can leave DRAFT placeholder. **All legal language here is DRAFT for your review as the attorney — nothing is operative until you sign off.** The mechanical `schema/detention.ts` + wallet-card geometry can scaffold in parallel; they don't depend on any of this. Dated 2026-06-17._

---

## 1. Authorization-to-retain-counsel — proposed operative language (DRAFT)

**Purpose.** The bridge for the G-28 catch-22: lets a trusted person receive information and hire a lawyer on the detained person's behalf, set up *before* detention so help can move fast. Written in plain, person-facing language because the signer is often a layperson.

**Proposed text (EN — your redline):**

> **Authorization to Receive Information and Retain Counsel**
>
> I, **[full legal name]**, born **[DOB]**, authorize the person named below to act for me if I am detained by immigration authorities:
>
> Trusted person: **[name]** — relationship: **[relationship]** — phone: **[phone]**
>
> I authorize this person to: (1) receive information about my detention and my immigration case from any agency, facility, or attorney; (2) hire an attorney to represent me; and (3) share my information with that attorney so they can help me.
>
> This authorization does not create an attorney-client relationship with anyone until an attorney agrees to represent me. I can cancel it at any time in writing. It stays in effect until I cancel it.
>
> Signed: ______________________  Date: __________
>
> _(Notarization optional — see note.)_

**Flags for you:**
- **Notarization:** not legally required for this kind of authorization, but a notarized version carries more weight when a facility or agency questions it. Recommend offering it as "sign now; notarize if you can" rather than requiring it. Your call.
- **Scope:** drafted narrow on purpose (receive info + retain counsel only — not a financial/property POA; that's the separate document). Confirm you want it this narrow.
- This is **not** a G-28 and not a financial POA — it's the third, narrow instrument the SPEC identified.

## 2. Choice-mark — recommendation: confirm the SPEC lean

**Recommend: confirm.** Refusal script only on the carried **Pocket Card**; the fight-vs-depart **decision-mark lives on the Binder Page**, not the card. Reasoning: the card can be seized, so it should never carry a stated intent to fight or depart that ICE could use; and the actual decision belongs with counsel, recorded at home, not declared on a card in an officer's hand. Low-controversy — just needs your nod.

## 3. Blank G-28 — recommendation + your liability call

**Recommend: include an *optional* fillable blank G-28** as an engine `attachments` asset, gated behind one clear instruction — that it must be completed with a licensed attorney, and that the strongest version is a **pre-signed G-28 held by a lawyer who has already agreed to represent the person.** Keep an instructions-and-link fallback for those who'd rather not carry the form.

**Why:** the pre-signed-G-28 practice is the actual unblock for the catch-22; having the form physically present in the kit lowers friction for the trusted person and the lawyer. **The liability call is yours:** shipping a fillable federal form in a free open-source kit (risk: someone mis-fills it or names a lawyer who hasn't agreed) vs. instructions-only (safer, higher friction). My lean is optional-bundled-with-guardrail, but ratify or veto.

## 4. EN microcopy — finalized DRAFT for sign-off (ES stays Phase 8)

### 4a. Pocket Card (carried — minimal, no sensitive data)

**Front — rights script (say it; sign nothing):**
> I am exercising my right to remain silent.
> I want to speak to a lawyer.
> I will not sign anything until I speak to a lawyer.
> I want to see an immigration judge.

**Front — the one rule:**
> DO NOT SIGN any paper that says "stipulation," "removal order," "voluntary departure," or "waiver" until a lawyer explains it. Signing can erase your right to see a judge and bar you from coming back. No one can force you to sign.

**Back — who to call:**
> My lawyer: [name] — [phone]
> Trusted person: [name] — [phone]
> Backup: [name] — [phone]
> ☐ I have a signed authorization in my Red Binder.
> ☐ A signed G-28 is on file with my lawyer.

### 4b. Binder Page (kept at home / with the trusted person)

- **Identity block (so a lawyer can find you):** full legal name; apellido paterno; apellido materno; other spellings/names you've used; exact date of birth; country of birth; A-number (if you have one); a photo; height/identifying details; best language. Helper line: "Immigration databases only match the exact name an officer typed. List every spelling."
- **My decision (fight or leave):**
  > ☐ I want to FIGHT my case. Ask the judge for a bond hearing. Sign nothing.
  > ☐ I want to LEAVE, but protect my future. Ask the judge for **voluntary departure** — never sign a stipulated removal order.
  > Honest note: voluntary departure leaves without a removal order, but it does not erase the 3- and 10-year unlawful-presence bars, and missing the departure date turns it into a removal order. Decide this with a lawyer.
- **Authorization** — the §1 instrument.
- **G-28 handling** — per §3 (instructions + optional form).
- **How my people find me:** use ICE's online detainee locator (locator.ice.gov) with the A-number + country of birth, or exact name + date of birth + country of birth; try every spelling of both surnames; if nothing shows, call the local ICE ERO field office.

### 4c. Disclaimers (use branding handoff §2e wording)
Not legal advice; and the honest Pocket Plan limit — "This card can't stop a deportation and isn't a lawyer. What it does: it helps you avoid one mistake — signing away your right to see a judge — and helps your people reach a lawyer fast."

---

## What must clear your desk before the templates leave DRAFT

1. **§1 authorization language** — approve/redline + the notarization decision.
2. **§3 G-28** — ship the fillable form or instructions-only.
3. **§4 EN microcopy** — approve/redline (you're the attorney; the rights script and the honest limits especially).
4. **§2 choice-mark** — just a confirm.

Once those land, the Pocket Plan templates (`wallet_card.en-es.md`, `binder_page.en-es.md`) get written from approved EN, ES follows in Phase 8, and the placeholders come out.
