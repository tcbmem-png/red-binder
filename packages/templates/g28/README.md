# Form G-28 — source asset

**Form G-28 — Notice of Entry of Appearance as Attorney or Accredited Representative**
(DHS / USCIS, OMB No. 1615-0105, edition **09/17/18**). A public-domain U.S. government form.

- **`g-28.pdf`** — the official fillable form from USCIS
  (`https://www.uscis.gov/sites/default/files/document/forms/g-28.pdf`). It ships with
  owner-password encryption (restricts editing; opens freely), which `pdf-lib` cannot read.
- **`g-28-fillable.pdf`** — the same form, decrypted so `pdf-lib` can read and fill its AcroForm:

  ```sh
  qpdf --decrypt g-28.pdf g-28-fillable.pdf
  ```

## How the app uses it

The app does **not** read these PDFs at runtime. The decrypted form is base64-embedded at
`packages/engine/src/assets/g28.generated.ts` and filled **in the browser, with no network**
(same pattern as the embedded fonts) by `packages/engine/src/g28.ts` → `fillG28()`. It fills the
**Part 3 client fields only**; Part 1 (attorney), Part 2 (eligibility), the appearance-scope boxes,
and every signature are left **blank** — the form is a starting point for the client's attorney to
complete and sign, never filed by the client.

## Refreshing the edition

Replace `g-28.pdf` with the current USCIS file, then:

1. `qpdf --decrypt g-28.pdf g-28-fillable.pdf`
2. Regenerate `packages/engine/src/assets/g28.generated.ts` (base64 of `g-28-fillable.pdf`).
3. Re-check the AcroForm field names in `packages/engine/src/g28.ts` (they shift between editions);
   `packages/engine/test/g28-fill.test.ts` guards that the client fields fill and the attorney /
   signature fields stay blank.
