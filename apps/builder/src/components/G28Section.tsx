import { useState } from 'react';
import { US_STATE_CODES } from '@red-binder/schema';
import type { Locale } from '../i18n/strings';
import { cn } from '../lib/utils';
import { Field, Section, TextInput } from './ui/form';

export interface G28Selections {
  mailing_street: string;
  mailing_city: string;
  mailing_state: string;
  mailing_zip: string;
  client_phone: string;
  client_email: string;
  a_number: string;
}

const COPY = {
  en: {
    title: 'Your G-28',
    intro:
      'This fills Form G-28 (Notice of Entry of Appearance) with your information so a lawyer who takes your case can act quickly. The lawyer/representative section and every signature are left blank for the attorney to complete and sign. Do not file this yourself.',
    addressTitle: 'Your mailing address',
    street: 'Street number and name',
    city: 'City or town',
    state: 'State',
    statePlaceholder: 'Select',
    zip: 'ZIP code',
    contactTitle: 'Your contact information',
    phone: 'Daytime phone',
    email: 'Email',
    aTitle: 'A-number',
    aNumber: 'A-number (if you have one)',
    aHelp: 'Nine digits — leave blank if one has not been assigned to you yet.',
    optional: 'Optional — only if it helps.',
    back: 'Back',
    continueCta: 'Continue',
    needAddress: 'Enter your mailing address to continue.',
  },
  es: {
    title: 'Tu G-28',
    intro:
      'Esto llena el Formulario G-28 (Aviso de Comparecencia) con tu información para que un abogado que tome tu caso actúe rápido. La sección del abogado/representante y todas las firmas quedan en blanco para que el abogado las complete y firme. No lo presentes tú.',
    addressTitle: 'Tu dirección postal',
    street: 'Número y nombre de la calle',
    city: 'Ciudad',
    state: 'Estado',
    statePlaceholder: 'Elige',
    zip: 'Código postal',
    contactTitle: 'Tu información de contacto',
    phone: 'Teléfono de día',
    email: 'Correo electrónico',
    aTitle: 'Número A',
    aNumber: 'Número A (si tienes uno)',
    aHelp: 'Nueve dígitos — déjalo en blanco si aún no te han asignado uno.',
    optional: 'Opcional — solo si ayuda.',
    back: 'Atrás',
    continueCta: 'Continuar',
    needAddress: 'Escribe tu dirección postal para continuar.',
  },
};

const empty = (): G28Selections => ({
  mailing_street: '',
  mailing_city: '',
  mailing_state: '',
  mailing_zip: '',
  client_phone: '',
  client_email: '',
  a_number: '',
});

export function G28Section({
  locale,
  initial,
  onBack,
  onContinue,
}: {
  locale: Locale;
  initial?: G28Selections;
  onBack: () => void;
  onContinue: (data: G28Selections) => void;
}) {
  const t = COPY[locale];
  const [v, setV] = useState<G28Selections>(initial ?? empty());
  const set = <K extends keyof G28Selections>(k: K, val: G28Selections[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  const ready =
    v.mailing_street.trim() !== '' &&
    v.mailing_city.trim() !== '' &&
    v.mailing_state.trim() !== '' &&
    v.mailing_zip.trim() !== '';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
      <p className="rounded-md bg-caution-bg p-3 text-sm text-caution-fg">{t.intro}</p>

      <Section title={t.addressTitle}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label={t.street} htmlFor="g28-street">
              <TextInput
                id="g28-street"
                value={v.mailing_street}
                onChange={(e) => set('mailing_street', e.target.value)}
              />
            </Field>
          </div>
          <Field label={t.city} htmlFor="g28-city">
            <TextInput
              id="g28-city"
              value={v.mailing_city}
              onChange={(e) => set('mailing_city', e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t.state} htmlFor="g28-state">
              <select
                id="g28-state"
                value={v.mailing_state}
                onChange={(e) => set('mailing_state', e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-card px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">{t.statePlaceholder}</option>
                {US_STATE_CODES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t.zip} htmlFor="g28-zip">
              <TextInput
                id="g28-zip"
                value={v.mailing_zip}
                onChange={(e) => set('mailing_zip', e.target.value)}
              />
            </Field>
          </div>
        </div>
      </Section>

      <Section title={t.contactTitle}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t.phone} htmlFor="g28-phone" optionalText={t.optional}>
            <TextInput
              id="g28-phone"
              value={v.client_phone}
              onChange={(e) => set('client_phone', e.target.value)}
            />
          </Field>
          <Field label={t.email} htmlFor="g28-email" optionalText={t.optional}>
            <TextInput
              id="g28-email"
              value={v.client_email}
              onChange={(e) => set('client_email', e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section title={t.aTitle}>
        <Field label={t.aNumber} htmlFor="g28-anum" optionalText={t.optional}>
          <TextInput
            id="g28-anum"
            value={v.a_number}
            onChange={(e) => set('a_number', e.target.value)}
          />
          <p className="mt-1 text-sm text-muted-foreground">{t.aHelp}</p>
        </Field>
      </Section>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-11 items-center justify-center rounded-md border border-border px-5 font-bold hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t.back}
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => onContinue(v)}
          className={cn(
            'inline-flex h-11 items-center justify-center rounded-md px-6 font-bold',
            'bg-primary text-primary-foreground hover:opacity-90',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-40',
          )}
        >
          {t.continueCta}
        </button>
        {!ready && <p className="text-sm text-muted-foreground">{t.needAddress}</p>}
      </div>
    </div>
  );
}
