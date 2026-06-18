import { useState } from 'react';
import type { Locale } from '../i18n/strings';
import { cn } from '../lib/utils';
import { Field, Section, TextInput } from './ui/form';

export interface DetentionSelections {
  country_of_birth: string;
  a_number: string;
  name_variants: string;
  aliases: string;
  best_language: string;
  height: string;
  distinguishing_features: string;
  chosen_path: 'fight' | 'depart' | 'undecided';
  fear_of_return: boolean;
  lawyer: { name: string; firm: string; phone: string; has_signed_g28: boolean };
  trusted_person: { name: string; relationship: string; phone: string };
  include_g28_blank: boolean;
}

const COPY = {
  en: {
    title: 'Your Pocket Plan',
    draft: 'Draft for attorney review — the wording on the card and binder page is not final.',
    findTitle: 'So a lawyer can find you',
    findHelp:
      'Immigration databases only match the exact name an officer typed. List every spelling.',
    countryOfBirth: 'Country of birth',
    aNumber: 'A-number (if you have one)',
    nameVariants: 'Other spellings / how your name may be mis-keyed',
    aliases: 'Other names you have used',
    bestLanguage: 'Best language',
    height: 'Height',
    features: 'Identifying details',
    photo: 'Photo (PNG or JPEG)',
    photoAttached: '✓ Photo attached.',
    decisionTitle: 'Your decision — made calmly, with a lawyer',
    fight: 'I want to FIGHT my case. Ask the judge for a bond hearing. Sign nothing.',
    depart: 'I want to LEAVE, but protect my future. Ask the judge for voluntary departure.',
    undecided: "I haven't decided yet.",
    decisionNote:
      'Voluntary departure leaves without a removal order, but it does not erase the 3- and 10-year bars, and missing the date turns it into a removal order. Decide this with a lawyer.',
    fear: 'I am afraid to return to my country.',
    fearHelp: 'Stays on the binder page only — never on the card. Tell your lawyer.',
    counselTitle: 'Your lawyer and trusted person',
    lawyerName: 'Lawyer name',
    lawyerFirm: 'Law firm',
    lawyerPhone: 'Lawyer phone',
    hasG28: 'A signed G-28 is on file with this lawyer',
    trustedName: 'Trusted person',
    trustedRel: 'Relationship to you',
    trustedPhone: 'Trusted person phone',
    g28Title: 'G-28 form',
    g28Opt: 'Include a fillable blank G-28 with my binder',
    g28Help:
      'For your attorney to complete and sign once they agree to represent you. Do not file this yourself. (Off by default; instructions are always included.)',
    optional: 'Optional — only if it helps.',
    back: 'Back',
    continueCta: 'Continue',
    needCountry: 'Enter your country of birth to continue.',
  },
  es: {
    title: 'Tu Plan de Bolsillo',
    draft: 'Borrador para revisión de un abogado — el texto de la tarjeta y la página no es final.',
    findTitle: 'Para que un abogado pueda encontrarte',
    findHelp:
      'Las bases de datos de inmigración solo coinciden con el nombre exacto que escribió un oficial. Anota cada forma de escribirlo.',
    countryOfBirth: 'País de nacimiento',
    aNumber: 'Número A (si tienes uno)',
    nameVariants: 'Otras formas de escribir tu nombre / posibles errores',
    aliases: 'Otros nombres que has usado',
    bestLanguage: 'Idioma preferido',
    height: 'Estatura',
    features: 'Señas particulares',
    photo: 'Foto (PNG o JPEG)',
    photoAttached: '✓ Foto adjuntada.',
    decisionTitle: 'Tu decisión — con calma, con un abogado',
    fight: 'Quiero PELEAR mi caso. Pide al juez una audiencia de fianza. No firmes nada.',
    depart: 'Quiero IRME, pero proteger mi futuro. Pide al juez la salida voluntaria.',
    undecided: 'Todavía no he decidido.',
    decisionNote:
      'La salida voluntaria te deja salir sin una orden de expulsión, pero no borra las barras de 3 y 10 años, y si no sales a tiempo se convierte en una orden de expulsión. Decídelo con un abogado.',
    fear: 'Tengo miedo de regresar a mi país.',
    fearHelp: 'Queda solo en la página de la carpeta — nunca en la tarjeta. Díselo a tu abogado.',
    counselTitle: 'Tu abogado y persona de confianza',
    lawyerName: 'Nombre del abogado',
    lawyerFirm: 'Bufete',
    lawyerPhone: 'Teléfono del abogado',
    hasG28: 'Hay un G-28 firmado en manos de este abogado',
    trustedName: 'Persona de confianza',
    trustedRel: 'Relación contigo',
    trustedPhone: 'Teléfono de la persona de confianza',
    g28Title: 'Formulario G-28',
    g28Opt: 'Incluir un G-28 en blanco con mi carpeta',
    g28Help:
      'Para que tu abogado lo complete y firme cuando acepte representarte. No lo presentes tú. (Desactivado por defecto; las instrucciones siempre se incluyen.)',
    optional: 'Opcional — solo si ayuda.',
    back: 'Atrás',
    continueCta: 'Continuar',
    needCountry: 'Escribe tu país de nacimiento para continuar.',
  },
};

const linkRadio = 'flex items-start gap-2';

const emptyDetention = (): DetentionSelections => ({
  country_of_birth: '',
  a_number: '',
  name_variants: '',
  aliases: '',
  best_language: '',
  height: '',
  distinguishing_features: '',
  chosen_path: 'undecided',
  fear_of_return: false,
  lawyer: { name: '', firm: '', phone: '', has_signed_g28: false },
  trusted_person: { name: '', relationship: '', phone: '' },
  include_g28_blank: false,
});

export function DetentionSection({
  locale,
  initial,
  hasPhoto,
  onBack,
  onPhotoChange,
  onContinue,
}: {
  locale: Locale;
  initial?: DetentionSelections;
  hasPhoto?: boolean;
  onBack: () => void;
  // Fired the moment a file is picked, so the photo lives in the parent and survives remounts
  // (a file <input> cannot be re-populated programmatically) — never clobbered on Continue.
  onPhotoChange: (photo: Uint8Array | undefined) => void;
  onContinue: (data: DetentionSelections) => void;
}) {
  const t = COPY[locale];
  const [v, setV] = useState<DetentionSelections>(initial ?? emptyDetention());

  const set = <K extends keyof DetentionSelections>(k: K, val: DetentionSelections[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  const onFile = async (file: File | undefined) =>
    onPhotoChange(file ? new Uint8Array(await file.arrayBuffer()) : undefined);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
      <p className="rounded-md bg-caution-bg p-2 text-sm text-caution-fg">{t.draft}</p>

      <Section title={t.findTitle} help={t.findHelp}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t.countryOfBirth} htmlFor="cob">
            <TextInput
              id="cob"
              value={v.country_of_birth}
              onChange={(e) => set('country_of_birth', e.target.value)}
            />
          </Field>
          <Field label={t.aNumber} htmlFor="anum" optionalText={t.optional}>
            <TextInput
              id="anum"
              value={v.a_number}
              onChange={(e) => set('a_number', e.target.value)}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label={t.nameVariants} htmlFor="nv" optionalText={t.optional}>
              <TextInput
                id="nv"
                value={v.name_variants}
                onChange={(e) => set('name_variants', e.target.value)}
              />
            </Field>
          </div>
          <Field label={t.aliases} htmlFor="al" optionalText={t.optional}>
            <TextInput id="al" value={v.aliases} onChange={(e) => set('aliases', e.target.value)} />
          </Field>
          <Field label={t.bestLanguage} htmlFor="lang" optionalText={t.optional}>
            <TextInput
              id="lang"
              value={v.best_language}
              onChange={(e) => set('best_language', e.target.value)}
            />
          </Field>
          <Field label={t.height} htmlFor="ht" optionalText={t.optional}>
            <TextInput id="ht" value={v.height} onChange={(e) => set('height', e.target.value)} />
          </Field>
          <Field label={t.features} htmlFor="df" optionalText={t.optional}>
            <TextInput
              id="df"
              value={v.distinguishing_features}
              onChange={(e) => set('distinguishing_features', e.target.value)}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label={t.photo} htmlFor="photo" optionalText={t.optional}>
              <input
                id="photo"
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => void onFile(e.target.files?.[0])}
                className="block w-full text-sm file:mr-3 file:h-9 file:rounded-md file:border file:border-border file:bg-card file:px-3 file:font-bold"
              />
              {hasPhoto && <p className="mt-1 text-sm text-success-fg">{t.photoAttached}</p>}
            </Field>
          </div>
        </div>
      </Section>

      <Section title={t.decisionTitle}>
        <div className="space-y-2">
          {(['fight', 'depart', 'undecided'] as const).map((path) => (
            <label key={path} className={linkRadio}>
              <input
                type="radio"
                name="chosen_path"
                checked={v.chosen_path === path}
                onChange={() => set('chosen_path', path)}
                className="mt-1 h-4 w-4 accent-binder"
              />
              <span>{t[path]}</span>
            </label>
          ))}
          <p className="rounded-md bg-muted p-2 text-sm text-muted-foreground">{t.decisionNote}</p>
          <label className={cn(linkRadio, 'pt-2')}>
            <input
              type="checkbox"
              checked={v.fear_of_return}
              onChange={(e) => set('fear_of_return', e.target.checked)}
              className="mt-1 h-4 w-4 accent-binder"
            />
            <span>
              <span className="block">{t.fear}</span>
              <span className="block text-sm text-muted-foreground">{t.fearHelp}</span>
            </span>
          </label>
        </div>
      </Section>

      <Section title={t.counselTitle}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t.lawyerName} htmlFor="ln" optionalText={t.optional}>
            <TextInput
              id="ln"
              value={v.lawyer.name}
              onChange={(e) => set('lawyer', { ...v.lawyer, name: e.target.value })}
            />
          </Field>
          <Field label={t.lawyerPhone} htmlFor="lp" optionalText={t.optional}>
            <TextInput
              id="lp"
              value={v.lawyer.phone}
              onChange={(e) => set('lawyer', { ...v.lawyer, phone: e.target.value })}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label={t.lawyerFirm} htmlFor="lf" optionalText={t.optional}>
              <TextInput
                id="lf"
                value={v.lawyer.firm}
                onChange={(e) => set('lawyer', { ...v.lawyer, firm: e.target.value })}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <label className={linkRadio}>
              <input
                type="checkbox"
                checked={v.lawyer.has_signed_g28}
                onChange={(e) => set('lawyer', { ...v.lawyer, has_signed_g28: e.target.checked })}
                className="mt-1 h-4 w-4 accent-binder"
              />
              <span>{t.hasG28}</span>
            </label>
          </div>
          <Field label={t.trustedName} htmlFor="tn" optionalText={t.optional}>
            <TextInput
              id="tn"
              value={v.trusted_person.name}
              onChange={(e) => set('trusted_person', { ...v.trusted_person, name: e.target.value })}
            />
          </Field>
          <Field label={t.trustedRel} htmlFor="tr" optionalText={t.optional}>
            <TextInput
              id="tr"
              value={v.trusted_person.relationship}
              onChange={(e) =>
                set('trusted_person', { ...v.trusted_person, relationship: e.target.value })
              }
            />
          </Field>
          <Field label={t.trustedPhone} htmlFor="tp" optionalText={t.optional}>
            <TextInput
              id="tp"
              value={v.trusted_person.phone}
              onChange={(e) =>
                set('trusted_person', { ...v.trusted_person, phone: e.target.value })
              }
            />
          </Field>
        </div>
      </Section>

      <Section title={t.g28Title}>
        <label className={linkRadio}>
          <input
            type="checkbox"
            checked={v.include_g28_blank}
            onChange={(e) => set('include_g28_blank', e.target.checked)}
            className="mt-1 h-5 w-5 accent-binder"
          />
          <span>
            <span className="block font-bold text-foreground">{t.g28Opt}</span>
            <span className="block text-sm text-muted-foreground">{t.g28Help}</span>
          </span>
        </label>
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
          disabled={v.country_of_birth.trim() === ''}
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
        {v.country_of_birth.trim() === '' && (
          <p className="text-sm text-muted-foreground">{t.needCountry}</p>
        )}
      </div>
    </div>
  );
}
