import { useState } from 'react';
import { DocumentPicker } from './components/DocumentPicker';
import { STRINGS, type Locale } from './i18n/strings';

export function App() {
  const [locale, setLocale] = useState<Locale>('en');
  const t = STRINGS[locale];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            {/* Binder red anchors the mark — not the background of any legal text. */}
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
        <DocumentPicker locale={locale} />
      </main>

      <footer className="mx-auto max-w-2xl px-4 pb-10 pt-6 text-xs text-muted-foreground">
        <p>{t.notLegalAdvice}</p>
        <p className="mt-1">{t.tcb}</p>
      </footer>
    </div>
  );
}
