import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { fillG28 } from '../src/g28';

// G-28 FILL FLOOR. The G-28 we generate pre-fills the CLIENT (Part 3) only; the attorney section
// (Part 1), eligibility (Part 2), and EVERY signature line must render BLANK — it is a starting
// point "for your attorney to complete and sign," never something the client files. These tests
// fill a sample and read the values back out of the produced PDF (no render, so no false-pass).

const SAMPLE = {
  familyName: 'García López',
  givenName: 'María Fernanda',
  aNumber: '123456789', // 9 digits, no "A"
  daytimePhone: '6625550142', // 10 digits
  email: 'mfg@example.com',
  mailingStreet: '123 Calle Secreta',
  mailingCity: 'Oxford',
  mailingState: 'MS',
  mailingZip: '38655',
};

async function reader(bytes: Uint8Array) {
  const form = (await PDFDocument.load(bytes)).getForm();
  const text = (n: string): string => {
    try {
      return form.getTextField(`form1[0].${n}`).getText() ?? '';
    } catch {
      return '';
    }
  };
  const dropdown = (n: string): string => {
    try {
      return (form.getDropdown(`form1[0].${n}`).getSelected() ?? []).join('');
    } catch {
      return '';
    }
  };
  return { text, dropdown };
}

describe('G-28 fill — client (Part 3) filled', () => {
  it('writes every client field we map', async () => {
    const { bytes, filename } = await fillG28(SAMPLE);
    expect(filename.endsWith('.pdf')).toBe(true);
    expect(bytes[0]).toBe(0x25); // %PDF
    const { text, dropdown } = await reader(bytes);
    expect(text('#subform[1].Pt3Line5a_FamilyName[0]')).toBe('García López');
    expect(text('#subform[1].Pt3Line5b_GivenName[0]')).toBe('María Fernanda');
    expect(text('#subform[1].Pt3Line9_ANumber[0]')).toBe('123456789');
    expect(text('#subform[1].Line9_DaytimeTelephoneNumber[0]')).toBe('6625550142');
    expect(text('#subform[1].Line11_EMail[0]')).toBe('mfg@example.com');
    expect(text('#subform[1].Line12a_StreetNumberName[0]')).toBe('123 Calle Secreta');
    expect(text('#subform[1].Line12c_CityOrTown[0]')).toBe('Oxford');
    expect(text('#subform[1].Line12e_ZipCode[0]')).toBe('38655');
    expect(dropdown('#subform[1].Line12d_State[0]')).toBe('MS');
  });
});

describe('G-28 fill floor — attorney + signatures BLANK', () => {
  it('never writes Part 1 (attorney), Part 2 (eligibility), or any signature line', async () => {
    const { bytes } = await fillG28(SAMPLE);
    const { text } = await reader(bytes);
    for (const f of [
      '#subform[0].Pt1Line2a_FamilyName[0]', // attorney family name
      '#subform[0].Pt1Line2b_GivenName[0]', // attorney given name
      '#subform[0].Pt2Line1b_BarNumber[0]', // attorney bar number
      '#subform[0].Pt2Line1a_LicensingAuthority[0]',
      '#subform[0].Line3_NameofAttorneyOrRep[0]',
      '#subform[2].Line1_Signature[0]', // representative signature
      '#subform[2].Line3_Date[0]',
      '#subform[2].P5_Line6a_SignatureofApplicant[0]', // client signs by hand
    ]) {
      expect(text(f), `${f} must be blank`).toBe('');
    }
  });
});
