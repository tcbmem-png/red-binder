import { describe, expect, it } from 'vitest';
import { aNumberDigits, composeIntakeSchema, g28Schema, g28Tokens, phoneDigits } from '../src';

describe('G-28 schema + token normalization', () => {
  it('strips an A-number to 9 digits (no letter, no punctuation)', () => {
    expect(aNumberDigits('A123456789')).toBe('123456789');
    expect(aNumberDigits('A 123-456-789')).toBe('123456789');
    expect(aNumberDigits('12345678')).toBe('12345678'); // shorter A-numbers stay as-is
  });

  it('strips a phone to 10 digits', () => {
    expect(phoneDigits('(662) 555-0142')).toBe('6625550142');
    expect(phoneDigits('+1 662 555 0142')).toBe('1662555014'); // first 10 — caller passes a US 10-digit
  });

  it('g28Tokens maps + normalizes the payload', () => {
    const t = g28Tokens({
      a_number: 'A123456789',
      client_phone: '(662) 555-0142',
      client_email: 'mfg@example.com',
      mailing_street: '123 Calle Secreta',
      mailing_city: 'Oxford',
      mailing_state: 'MS',
      mailing_zip: '38655',
    });
    expect(t).toEqual({
      aNumber: '123456789',
      daytimePhone: '6625550142',
      email: 'mfg@example.com',
      mailingStreet: '123 Calle Secreta',
      mailingCity: 'Oxford',
      mailingState: 'MS',
      mailingZip: '38655',
    });
  });

  it('requires the mailing address; A-number + contact are optional', () => {
    expect(
      g28Schema.safeParse({
        mailing_street: '1 A St',
        mailing_city: 'X',
        mailing_state: 'MS',
        mailing_zip: '38655',
      }).success,
    ).toBe(true);
    expect(
      g28Schema.safeParse({
        mailing_street: '',
        mailing_city: 'X',
        mailing_state: 'MS',
        mailing_zip: '38655',
      }).success,
    ).toBe(false);
  });

  it('composeIntakeSchema(["g28"]) collects identity (name) + the G-28 address, nothing else', () => {
    const schema = composeIntakeSchema(['g28']);
    const ok = schema.safeParse({
      given_names: 'María',
      apellido_paterno: 'García',
      dob: '1988-04-12',
      mailing_street: '123 Calle',
      mailing_city: 'Oxford',
      mailing_state: 'MS',
      mailing_zip: '38655',
    });
    expect(ok.success).toBe(true);
  });
});
