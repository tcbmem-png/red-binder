// G-28 form-fill (Notice of Entry of Appearance as Attorney or Accredited Representative).
//
// Fills ONLY the Part 3 client fields of the blank USCIS G-28 (edition 09/17/18). Part 1 (attorney),
// Part 2 (eligibility), the appearance-scope boxes, and EVERY signature/date line are left BLANK —
// the form is a starting point "for your attorney to complete and sign," never filed by the client.
//
// Client-side only: the blank form is base64-embedded (./assets/g28.generated.ts), so there is no
// fetch/network — pdf-lib fills the AcroForm in the browser, same privacy floor as every other
// document. pdf-lib drops the form's dynamic XFA layer; the static AcroForm (what prints and is
// reviewed/signed) is what we fill. This module is lazy-imported so the ~490 KB asset never lands
// in the main bundle.
import { PDFDocument } from 'pdf-lib';
import { g28Base64 } from './assets/g28.generated';
import type { RenderResult } from './types';

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Client (the noncitizen) values for Part 3. Pre-normalized by the caller: `aNumber` is digits only
 * (no "A", ≤ 9), `daytimePhone` is digits only (≤ 10), `mailingState` is a 2-letter USPS code. Any
 * field left undefined is simply not written (stays blank for the attorney/client to complete).
 */
export interface G28Values {
  familyName: string;
  givenName: string;
  middleName?: string;
  aNumber?: string;
  daytimePhone?: string;
  email?: string;
  mailingStreet?: string;
  mailingCity?: string;
  mailingState?: string;
  mailingZip?: string;
}

// Part 3 — "Information About Client" (the only subform we touch).
const P3 = 'form1[0].#subform[1]';

/** Fill the G-28 client section and return the PDF bytes as a RenderResult (its own download). */
export async function fillG28(values: G28Values): Promise<RenderResult> {
  const pdf = await PDFDocument.load(base64ToBytes(g28Base64));
  const form = pdf.getForm();

  const text = (name: string, value?: string) => {
    const v = value?.trim();
    if (!v) return;
    try {
      form.getTextField(name).setText(v);
    } catch {
      // Field renamed/absent in a future edition — skip rather than fail the whole document.
    }
  };

  text(`${P3}.Pt3Line5a_FamilyName[0]`, values.familyName);
  text(`${P3}.Pt3Line5b_GivenName[0]`, values.givenName);
  text(`${P3}.Pt3Line5c_MiddleName[0]`, values.middleName);
  text(`${P3}.Pt3Line9_ANumber[0]`, values.aNumber);
  text(`${P3}.Line9_DaytimeTelephoneNumber[0]`, values.daytimePhone);
  text(`${P3}.Line11_EMail[0]`, values.email);
  text(`${P3}.Line12a_StreetNumberName[0]`, values.mailingStreet);
  text(`${P3}.Line12c_CityOrTown[0]`, values.mailingCity);
  text(`${P3}.Line12e_ZipCode[0]`, values.mailingZip);

  const state = values.mailingState?.trim();
  if (state) {
    try {
      form.getDropdown(`${P3}.Line12d_State[0]`).select(state);
    } catch {
      // Not a valid 2-letter option — leave the state box unset.
    }
  }

  const bytes = await pdf.save();
  return { filename: 'g-28-notice-of-appearance.pdf', bytes };
}

/**
 * The BLANK fillable G-28 — the untouched USCIS form with no data — delivered as its own download
 * for the detention binder's "include a fillable blank G-28" option. We hand back the embedded form
 * bytes as-is (no pdf-lib re-save), so it stays fully interactive for the attorney who takes the
 * case to fill. Same no-fetch embedded asset, so the privacy floor is unchanged.
 */
export function getBlankG28(): RenderResult {
  return { filename: 'g-28-blank.pdf', bytes: base64ToBytes(g28Base64) };
}
