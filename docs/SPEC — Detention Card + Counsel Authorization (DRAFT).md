---
title: Detention Card + Counsel Authorization — Build Spec
status: DRAFT — for Taylor's review and legal sign-off. Not legal advice. No content here is final.
drafted: 2026-06-17
current_as_of: 2026-06-17  # enforcement law moved materially in 2025 and is still moving — recheck before publish
languages: EN now; ES mirrors after EN wording is approved
scope: federal (no MS/TN split); free; open-source; separate from the family/financial POA
---

# Detention Card + Counsel Authorization — Build Spec (DRAFT)

Two problems, one piece of paper, per the research memo:
1. **Don't get tricked into signing a removal order** (the stipulated-removal trap).
2. **Let a trusted person and a lawyer actually reach and act for me** (the G-28 catch-22).

Design choice locked in: **layered**. Identity capture leads, because the ICE locator is unreliable for undocumented people with no A-number and mangled names. The durable fix is a relationship and authorization set up *in advance*.

---

## 1. Two artifacts, by exposure

| | **Wallet Card** (carried) | **Binder Page** (home + with trusted person + lawyer) |
|---|---|---|
| Purpose | Survive the first hour. Minimal, fast, low-data. | Hold the heavy paper and the full record. |
| Risk if seized/lost | Must be low. No fear-of-return statement, no immigration status. | Higher-detail, but it stays put. |
| Contents | Rights script; "DO NOT SIGN" rule; my chosen path (fight/depart) as a single mark; who to call. | Full identity block; fight-vs-depart instructions; authorization-to-retain-counsel; G-28 handling; emergency contacts. |

The carried card points *to* a person ("call this number / this lawyer"); it doesn't carry the sensitive proof. The binder page and the trusted person carry that.

---

## 2. Wallet card — DRAFT English microcopy

**Front — rights script (say out loud, sign nothing):**

> I am exercising my right to remain silent.
> I want to speak to a lawyer.
> I do not want to sign anything until I speak to a lawyer.
> I want to see an immigration judge.
> (Quiero guardar silencio. Quiero hablar con un abogado. No firmaré nada hasta hablar con un abogado. Quiero ver a un juez de inmigración.)

**Front — the one rule:**

> DO NOT SIGN any paper that says "stipulation," "removal order," "voluntary departure," or "waiver" until a lawyer explains it. Signing can erase your right to a judge and bar you from coming back. No one can force you to sign.

**Back — who to call:**
- My lawyer: `{{lawyer_name}}` — `{{lawyer_phone}}`
- Trusted person: `{{contact_1_name}}` — `{{contact_1_phone}}`
- Backup: `{{contact_2_name}}` — `{{contact_2_phone}}`
- "I have a signed authorization in my Red Binder." ☐ (mark if true)
- "A signed G-28 is on file with my lawyer." ☐ (mark if true)

**My choice, made calmly in advance** (single mark; see binder page for the full instructions):
- ☐ I want to FIGHT my case (ask for a bond hearing; sign nothing).
- ☐ I want to LEAVE, but protect my future (ask the judge for **voluntary departure** — never sign a stipulated removal order).

> Note for review: do we want the "choice" mark on the *carried* card at all, or only in the binder? Putting it on the card makes intent travel with the person; keeping it off avoids handing ICE a stated intent. Leaning: keep the *mark* in the binder, keep only the refusal script on the card.

---

## 3. Binder page — sections

### 3a. Identity block (the part that does the finding)
Because ODLS only matches the government's exact entry, capture every handle on this person:
- Full legal name as on home-country ID.
- **Apellido paterno** and **apellido materno** listed separately and labeled.
- Likely misspellings / how the name may have been mis-keyed; any hyphenated or combined versions.
- Other names/aliases ever used with any U.S. agency.
- Exact date of birth.
- Country of birth.
- A-number **if one exists** (prior NTA, work permit, any prior application) — note: many fully undocumented people won't have one yet; one is assigned at booking.
- A current photo; height; distinguishing features.
- Languages spoken / best interpretation language.

### 3b. Fight-vs-depart instructions (the full version of the card's single mark)
- Plain-language walk-through of both paths from the research memo.
- For FIGHT: ask for a bond hearing (note: generally one bite at bond absent changed circumstances); preserve any fear-of-return/asylum claim; sign nothing.
- For LEAVE: ask the judge for **voluntary departure** (or withdrawal of application for admission if charged as arriving); the conditions (own expense, passport, deadline) and the failure-to-depart trap; the honest limits (does **not** cure 3/10-yr unlawful-presence bars; may not be faster; you won't be released, you're flown from custody).
- The neutral framing: this is a record of a decision the person should make *with a lawyer*, not a nudge.

### 3c. Authorization to retain counsel + receive information (NEW instrument — needs your drafting)
A narrow, signed, dated authorization — **not** the family/financial POA, **not** a G-28 — whose only job is:
> "I authorize `{{trusted_person}}` to (1) receive information about my detention and immigration case, (2) hire an attorney to represent me, and (3) share my information with that attorney."
- This is the bridge for the no-lawyer-yet case so family can move fast.
- Needs: your decision on form (standalone signed statement vs. limited POA), whether notarization is advised, and the exact authority granted. **Flagged for you to draft/own.**

### 3d. G-28 handling (leans on established practice)
- If the person **has** a lawyer: a pre-signed, **undated G-28** naming that lawyer, original to the lawyer, copy in the binder. The card just flags it exists. (For TCB Law's own clients, executing these at intake fixes your own problem directly.)
- If **no** lawyer yet: include a **fillable blank G-28** + plain instructions to complete and sign it the moment they retain counsel, and keep copies. Note the EOIR-28 is separately needed for court; the G-28 is what unlocks ICE information.
- Plain explanation that a G-28 is the consent key — without it, ICE will not release information to the lawyer.

### 3e. Locating instructions for the trusted person
- How to use ODLS (locator.ice.gov): try A-number + country of birth first; if none, name + exact DOB + country of birth; **try multiple spellings of both surnames**; call the ERO field office if the search fails; note minors aren't listed and there's a lag after CBP transfer.

---

## 4. Token list (extends the existing template system)

```
{{lawyer_name}} {{lawyer_phone}} {{lawyer_firm}} {{lawyer_has_signed_g28}}
{{trusted_person}} {{trusted_person_phone}} {{trusted_person_relationship}}
{{contact_1_name}} {{contact_1_phone}} {{contact_2_name}} {{contact_2_phone}}
{{legal_name_full}} {{apellido_paterno}} {{apellido_materno}}
{{name_variants}} {{aliases}} {{dob_exact}} {{country_of_birth}} {{a_number}}
{{chosen_path}}  # fight | depart | undecided
{{photo}} {{height}} {{distinguishing_features}} {{best_language}}
{{generated_date}}
```

Reuses the existing EN/ES side-by-side layout, `<!-- pagebreak -->` convention, and pdf-lib fill pipeline. Same not-legal-advice disclaimer pattern as `rbp_basic`.

---

## 5. Disclaimers / accuracy

- Not legal advice; no attorney-client relationship; consult a licensed attorney.
- A dated **"current as of"** line (enforcement law is moving) + a named owner and recheck cadence.
- Privacy warning on the binder page: this paper concentrates sensitive identifiers; store it safely; decide who holds copies.
- No EOIR ID line needed on a public KYR tool (it's not an immigration filing); add TCB Law attribution only if you want it.

---

## 6. What needs you before this becomes final

1. **The choice-mark question** (§2): refusal script only on the carried card, decision-mark in the binder? (My lean: yes.)
2. **The authorization-to-retain-counsel instrument** (§3c): you draft/own the operative language and decide notarization.
3. **G-28 inclusion** (§3d): ship a fillable blank G-28 in the open-source kit, or just instructions + link? (Liability vs. usefulness.)
4. **Tone of the fight-vs-depart section**: neutral-and-route-to-counsel vs. more directive. You're the attorney; you own this call.
5. Then: I produce the EN print template, you redline, we mirror to ES.
