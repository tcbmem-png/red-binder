# Can the Red Binder ship a durable POA that survives in any state?

Internal research memo. June 17, 2026.

## Bottom line

You can build one financial POA that is *legally valid* in every state. You cannot build one that is *guaranteed to be accepted* in every state. Those are different problems, and the gap between them is the whole ballgame.

For medical, the same is true but worse — there's no financial-side uniform act doing the heavy lifting, so portability rests on a patchwork of recognition statutes plus the goodwill of whoever is standing at the hospital desk.

The honest framing for the product: a single "national" durable POA built on the Uniform Power of Attorney Act, executed to the strictest formalities, with a governing-law designation baked in. It will hold up in court anywhere. It will reduce friction at banks and hospitals. It will not eliminate that friction. We should not tell a user it "works in all 50 states" — we should tell them it is *built to be honored anywhere*, and that the failure mode is a clerk, not a judge.

---

## Financial POA — the law is mostly on our side

Two things make a single financial document genuinely portable.

**1. The Full Faith and Credit baseline.** A durable financial POA validly executed in one state is generally recognized in another. Most states will honor the powers granted so long as they don't directly conflict with local law. So even a plain Mississippi POA is not void the moment it crosses into Tennessee.

**2. The Uniform Power of Attorney Act (UPOAA).** This is the real lever. As of early 2026 roughly 31 states plus D.C. have adopted the UPOAA, whose stated purpose is "promotion of the portability and use of powers of attorney." Two provisions matter to us:

- **Section 106 (Validity).** A POA executed in another state is valid in the enacting state if its execution complied with the law of the jurisdiction whose law governs the instrument under Section 107 — or with the federal military POA standard. In plain words: if it was good where it was made, it's good here.
- **Section 107 (Meaning and effect / governing law).** The POA is governed by the law of the jurisdiction *indicated in the document*, and absent that, by the law of the principal's domicile. This is the drafting hook. We can name a governing-law state on the face of the document and have the UPOAA states honor that choice.

So in any UPOAA state, a document drafted to UPOAA standards with an explicit governing-law clause is recognized by statute, not by hope. For the non-UPOAA minority, the Full Faith and Credit baseline plus their own foreign-POA recognition statutes generally carry it — with more friction.

**The catch is practical, not legal.** Banks and brokerages reject valid POAs constantly. They are unfamiliar with out-of-state forms, they fear liability, they want their own form, or they object to the document's age. None of that is about validity. It's about a risk-averse institution's comfort. A UPOAA-based form helps because more institutions recognize the format — but it's not a cure.

---

## Medical POA — portability is real but conditional

All 50 states and D.C. recognize advance directives and healthcare powers of attorney. But there is **no unified recognition system**, and the financial side's UPOAA equivalent — the Uniform Health-Care Decisions Act — has been adopted by far fewer states.

States fall into roughly three buckets on out-of-state directives:

1. **Honor if valid where executed** — the friendliest, mirrors UPOAA logic.
2. **Honor if it meets the treating state's own requirements** — your document has to clear the local bar, not the bar where it was signed.
3. **Silent** — a handful of states say nothing, which means a hospital is improvising.

Because witness rules, who may serve as a witness, and what medical instructions are enforceable all vary widely, a directive that's airtight in one state can meet "real resistance in a hospital across the border" — and a hospital, unlike a court, acts in minutes. The practical-acceptance problem is sharper here than on the financial side because the stakes are immediate and the gatekeeper has no time to consult counsel.

---

## Execution formalities — the one technical knob that actually moves portability

The substance of a POA travels well. What trips it up at the border is *how it was signed*. Requirements vary:

- **Florida** — durable POA needs two witnesses *and* a notary.
- **North Carolina** — statutory form needs two qualified witnesses *and* notarial acknowledgment.
- **California** — notary *or* two witnesses (witnesses must be adults, not the agent).
- **New York** — two witnesses, one of whom may be the notary.
- Many states require less — notary alone, or even neither for a financial POA.

The drafting answer is the belt-and-suspenders approach: **execute every document to the most stringent standard — signed by the principal before a notary AND two disinterested adult witnesses (neither being the agent).** A document that over-satisfies formalities satisfies every state's minimum. This is the single highest-leverage thing we can do to make one form portable, and it costs us nothing but an execution instruction sheet.

---

## Recommended product approach

**1. Replace the per-state financial POA with one UPOAA-based "national" durable financial POA.** Build it on the UPOAA statutory framework, include an express governing-law designation (Section 107), include the durability language, and include the agent-protection / third-party-reliance and indemnity language that makes banks comfortable relying on it. Keep the bilingual EN/ES side-by-side layout. This retires `poa_ms` and `poa_tn` as the default path and stops the template count from growing one state at a time.

**2. Pair every document with a one-page execution instruction sheet** that tells the user: sign before a notary, with two disinterested adult witnesses, and keep originals with the binder. This is what converts "valid" into "accepted." It's also squarely on-brand — the product is memory and making the next right action easy to find, and this is exactly that.

**3. For medical, ship a portable advance directive built on Uniform Health-Care Decisions Act language, executed to the same max formalities — but do not retire state-specific medical forms.** The hospital-desk failure mode is too immediate to bet a user's care on portability alone. Offer the national directive as the default and keep the option to generate the user's home-state form alongside it.

**4. Say what's true.** Drop any "valid in all 50 states" claim. Use language like "built on the Uniform Power of Attorney Act and executed to the strictest standard so it's honored as widely as possible." Add a short, plain note that some institutions may still demand their own form, and that the fix is to present the document early and ask the institution's legal department to review it, not to panic. Publish this the way we publish prices — straight.

**5. Keep a state-form fallback for the known-stubborn cases.** Some institutions (and some non-UPOAA states) will refuse anything but their own paper. A user who can generate the home-state form on demand is never stuck. The national form is the default; the state form is the escape hatch.

---

## What this means for the codebase

- New template: `poa_financial_universal.en-es.md` (UPOAA-based, governing-law clause, third-party-reliance + indemnity, durability).
- New template: `ad_medical_universal.en-es.md` (UHCDA-based advance directive + healthcare agent designation).
- New artifact: `execution_instructions.en-es.md` — the notary + two-witness sheet, generated with every plan.
- Keep `poa_ms` / `poa_tn` as fallbacks, not defaults; structure the generator so adding a fallback state is a data entry, not a new code path.
- Form/UX: a single choice — "national document" (default) vs. "my home-state form" — rather than a state picker gating the whole flow.

## Honest limits of this memo

This is product-level research, not a 50-state statutory audit. Before we ship, the universal templates need a clause-level review against the current UPOAA text and against the non-UPOAA states' recognition statutes, and the medical directive needs a check against the treating-state-requirements bucket. I'm confident in the strategy; the per-clause language is where a careful pass still has to happen. If you want, the next step is that 50-state execution-and-recognition table — one row per state, financial and medical — which becomes both the QA checklist and a credible thing to publish.
