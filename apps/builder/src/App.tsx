import { useEffect, useState } from 'react';
import type { DocKind } from '@red-binder/schema';
import { CoreIntake } from './components/CoreIntake';
import { DocumentPicker } from './components/DocumentPicker';
import { POASection } from './components/POASection';
import { PICKER_ORDER, STRINGS, type Locale } from './i18n/strings';

const DOC_FROM_PARAM: Record<string, DocKind> = {
  poa: 'poa',
  rbp: 'rbp',
  detention: 'detention', // Door B (?doc=detention) pre-selects the Pocket Plan
};

type Step = 'picker' | 'core' | 'poa' | 'done';

export function App() {
  const [locale, setLocale] = useState<Locale>('en');
  const [selected, setSelected] = useState<Set<DocKind>>(new Set());
  const [step, setStep] = useState<Step>('picker');

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('doc');
    const doc = param ? DOC_FROM_PARAM[param] : undefined;
    if (doc) setSelected(new Set([doc]));
  }, []);

  const t = STRINGS[locale];
  const chosen = PICKER_ORDER.filter((d) => selected.has(d));

  const toggle = (doc: DocKind) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(doc)) next.delete(doc);
      else next.add(doc);
      return next;
    });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            {/* Binder red anchors the mark — never the background of legal text. */}
            <span aria-hidden className="h-8 w-8 shrink-0 rounded-md bg-binder" />
            <div>
              <p className="font-bold leading-tight">{t.appName}</p>
              <p className="text-sm text-muted-foreground">{t.tagline}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLocale((l) => (l === 'en' ? 'es' : 'en'))}
            className="rounded-md border border-border px-3 py-2 text-sm font-bold hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t.langToggle}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <p className="mb-8 text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{t.privacyShort}</span> {t.privacyWarm}
        </p>

        {step === 'picker' && (
          <DocumentPicker
            locale={locale}
            selected={selected}
            onToggle={toggle}
            onContinue={() => setStep('core')}
          />
        )}

        {step === 'core' && (
          <CoreIntake
            key={chosen.join(',')}
            locale={locale}
            selected={chosen}
            onBack={() => setStep('picker')}
            onSubmitted={() => setStep(chosen.includes('poa') ? 'poa' : 'done')}
          />
        )}

        {step === 'poa' && (
          <POASection
            locale={locale}
            onBack={() => setStep('core')}
            onContinue={() => setStep('done')}
          />
        )}

        {step === 'done' && (
          <section className="space-y-4">
            <div className="rounded-lg border border-success bg-success-bg p-4">
              <p className="font-bold text-success-fg">{t.privacyShort}</p>
              <p className="mt-1 text-sm text-success-fg">{t.intake.reviewStub}</p>
              <ul className="mt-3 list-inside list-disc text-sm text-success-fg">
                {chosen.map((d) => (
                  <li key={d}>{t.cards[d].name}</li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setStep('picker')}
              className="inline-flex h-11 items-center justify-center rounded-md border border-border px-5 font-bold hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t.intake.back}
            </button>
          </section>
        )}
      </main>

      <footer className="mx-auto max-w-2xl px-4 pb-10 pt-6 text-xs text-muted-foreground">
        <p>{t.notLegalAdvice}</p>
        <p className="mt-1">{t.tcb}</p>
      </footer>
    </div>
  );
}
