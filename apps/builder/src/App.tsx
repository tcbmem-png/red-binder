import { useEffect, useState } from 'react';
import type { FieldValues } from 'react-hook-form';
import type { DocKind } from '@red-binder/schema';
import { CoreIntake } from './components/CoreIntake';
import { DetentionSection, type DetentionSelections } from './components/DetentionSection';
import { DocumentPicker } from './components/DocumentPicker';
import { POASection, type PoaSelections } from './components/POASection';
import { RBPSection, type RbpSelections } from './components/RBPSection';
import { G28Section, type G28Selections } from './components/G28Section';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { generateAndDownload } from './lib/generate';
import { PICKER_ORDER, STRINGS, type Locale } from './i18n/strings';

const DOC_FROM_PARAM: Record<string, DocKind> = {
  poa: 'poa',
  rbp: 'rbp',
  detention: 'detention', // Door B (?doc=detention) pre-selects the Pocket Plan
  g28: 'g28',
};

type Step = 'picker' | 'core' | 'sections' | 'review' | 'done';

// Review / generate / done microcopy. EN is final-voice; ES is DRAFT (phase-8 review).
const REVIEW = {
  en: {
    reviewTitle: 'One last look',
    reviewHelp:
      "When you're ready, we build these on your device and your browser downloads them. Nothing is saved or sent.",
    makeCta: 'Make my documents',
    making: 'Making your documents…',
    draftNote:
      'Each document is marked DRAFT. Review it with a lawyer and sign it before you rely on it.',
    back: 'Back',
    doneTitle: 'Done — check your downloads.',
    doneHelp:
      'Your documents were made on your device and downloaded. We kept nothing, and we sent nothing. Closing this page erases everything you entered.',
    startOver: 'Start over',
    errorMsg:
      'Something went wrong while making your documents. Nothing was saved or sent — please try again.',
  },
  es: {
    reviewTitle: 'Una última revisión',
    reviewHelp:
      'Cuando estés listo, los creamos en tu dispositivo y tu navegador los descarga. No se guarda ni se envía nada.',
    makeCta: 'Crear mis documentos',
    making: 'Creando tus documentos…',
    draftNote:
      'Cada documento está marcado como BORRADOR. Revísalo con un abogado y fírmalo antes de confiar en él.',
    back: 'Atrás',
    doneTitle: 'Listo — revisa tus descargas.',
    doneHelp:
      'Tus documentos se crearon en tu dispositivo y se descargaron. No guardamos nada, y no enviamos nada. Cerrar esta página borra todo lo que pusiste.',
    startOver: 'Empezar de nuevo',
    errorMsg:
      'Algo salió mal al crear tus documentos. No se guardó ni se envió nada — inténtalo de nuevo.',
  },
};

const today = () => new Date().toISOString().slice(0, 10);

export function App() {
  const [locale, setLocale] = useState<Locale>('en');
  const [selected, setSelected] = useState<Set<DocKind>>(new Set());
  const [step, setStep] = useState<Step>('picker');
  const [sectionIdx, setSectionIdx] = useState(0);

  // Per-section data, accumulated into one payload only at generate time. Each is restored as the
  // section's `initial` so navigating Back never silently overwrites entered data with blanks.
  const [core, setCore] = useState<FieldValues>({});
  const [poa, setPoa] = useState<PoaSelections | null>(null);
  const [rbp, setRbp] = useState<RbpSelections | null>(null);
  const [detention, setDetention] = useState<DetentionSelections | null>(null);
  const [g28, setG28] = useState<G28Selections | null>(null);
  const [photo, setPhoto] = useState<Uint8Array | undefined>(undefined);

  const [gen, setGen] = useState<'idle' | 'working' | 'error'>('idle');

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('doc');
    const doc = param ? DOC_FROM_PARAM[param] : undefined;
    if (doc) setSelected(new Set([doc]));
  }, []);

  const t = STRINGS[locale];
  const R = REVIEW[locale];
  const chosen = PICKER_ORDER.filter((d) => selected.has(d));

  const toggle = (doc: DocKind) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(doc)) next.delete(doc);
      else next.add(doc);
      return next;
    });

  const nextSection = () => {
    if (sectionIdx < chosen.length - 1) setSectionIdx(sectionIdx + 1);
    else setStep('review');
  };
  const prevSection = () => {
    if (sectionIdx > 0) setSectionIdx(sectionIdx - 1);
    else setStep('core');
  };

  const make = async () => {
    setGen('working');
    try {
      // One flat payload; the token bridges in generate.ts slice it per document.
      const payload: Record<string, unknown> = {
        ...core,
        ...(poa ?? {}),
        ...(rbp ?? {}),
        ...(detention ?? {}),
        ...(g28 ?? {}),
      };
      const assets = photo ? { images: { photo } } : undefined;
      await generateAndDownload({ selected: chosen, payload, assets, generatedDate: today() });
      setGen('idle');
      setStep('done');
    } catch {
      setGen('error');
    }
  };

  const startOver = () => {
    setSelected(new Set());
    setSectionIdx(0);
    setCore({});
    setPoa(null);
    setRbp(null);
    setDetention(null);
    setG28(null);
    setPhoto(undefined);
    setGen('idle');
    setStep('picker');
  };

  const primaryBtn =
    'inline-flex h-11 items-center justify-center rounded-md px-6 font-bold bg-primary text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';
  const secondaryBtn =
    'inline-flex h-11 items-center justify-center rounded-md border border-border px-5 font-bold hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader
        locale={locale}
        onToggleLocale={() => setLocale((l) => (l === 'en' ? 'es' : 'en'))}
      />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <p className="mb-8 text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{t.privacyShort}</span> {t.privacyWarm}
        </p>

        {step === 'picker' && (
          <DocumentPicker
            locale={locale}
            selected={selected}
            onToggle={toggle}
            onContinue={() => {
              setSectionIdx(0);
              setStep('core');
            }}
          />
        )}

        {step === 'core' && (
          <CoreIntake
            key={chosen.join(',')}
            locale={locale}
            selected={chosen}
            onBack={() => setStep('picker')}
            onSubmitted={(data) => {
              setCore(data);
              setSectionIdx(0);
              setStep(chosen.length ? 'sections' : 'review');
            }}
          />
        )}

        {step === 'sections' &&
          (() => {
            const doc = chosen[sectionIdx];
            if (doc === 'poa')
              return (
                <POASection
                  locale={locale}
                  initial={poa ?? undefined}
                  onBack={prevSection}
                  onContinue={(d) => {
                    setPoa(d);
                    nextSection();
                  }}
                />
              );
            if (doc === 'rbp')
              return (
                <RBPSection
                  locale={locale}
                  initial={rbp ?? undefined}
                  onBack={prevSection}
                  onContinue={(d) => {
                    setRbp(d);
                    nextSection();
                  }}
                />
              );
            if (doc === 'detention')
              return (
                <DetentionSection
                  locale={locale}
                  initial={detention ?? undefined}
                  hasPhoto={!!photo}
                  onBack={prevSection}
                  onPhotoChange={setPhoto}
                  onContinue={(d) => {
                    setDetention(d);
                    nextSection();
                  }}
                />
              );
            if (doc === 'g28')
              return (
                <G28Section
                  locale={locale}
                  initial={g28 ?? undefined}
                  onBack={prevSection}
                  onContinue={(d) => {
                    setG28(d);
                    nextSection();
                  }}
                />
              );
            return null;
          })()}

        {step === 'review' && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">{R.reviewTitle}</h2>
            <p className="text-sm text-muted-foreground">{R.reviewHelp}</p>
            <ul className="space-y-2">
              {chosen.map((d) => (
                <li
                  key={d}
                  className="flex items-center gap-2 rounded-md border border-border bg-card p-3"
                >
                  <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-binder" />
                  <span className="font-bold">{t.cards[d].name}</span>
                </li>
              ))}
            </ul>
            <p className="rounded-md bg-caution-bg p-3 text-sm text-caution-fg">{R.draftNote}</p>
            {gen === 'error' && (
              <p className="rounded-md border border-caution-fg bg-caution-bg p-3 text-sm text-caution-fg">
                {R.errorMsg}
              </p>
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSectionIdx(Math.max(0, chosen.length - 1));
                  setStep('sections');
                }}
                className={secondaryBtn}
              >
                {R.back}
              </button>
              <button
                type="button"
                disabled={gen === 'working'}
                onClick={() => void make()}
                className={primaryBtn}
              >
                {gen === 'working' ? R.making : R.makeCta}
              </button>
            </div>
          </section>
        )}

        {step === 'done' && (
          <section className="space-y-4">
            <div className="rounded-lg border border-success bg-success-bg p-4">
              <p className="font-bold text-success-fg">{R.doneTitle}</p>
              <p className="mt-1 text-sm text-success-fg">{R.doneHelp}</p>
              <ul className="mt-3 list-inside list-disc text-sm text-success-fg">
                {chosen.map((d) => (
                  <li key={d}>{t.cards[d].name}</li>
                ))}
              </ul>
            </div>
            <button type="button" onClick={startOver} className={secondaryBtn}>
              {R.startOver}
            </button>
          </section>
        )}
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}
