import { useState } from 'react';
import { POA_STRINGS, type Locale } from '../i18n/strings';
import { cn } from '../lib/utils';
import { StateTileMap } from './StateTileMap';
import { Section } from './ui/form';

export interface PoaSelections {
  jurisdiction: string;
  effectiveness: 'immediately' | 'on_incapacity';
  giftPower: boolean;
}

export function POASection({
  locale,
  initial,
  onBack,
  onContinue,
}: {
  locale: Locale;
  initial?: PoaSelections;
  onBack: () => void;
  onContinue: (poa: PoaSelections) => void;
}) {
  const t = POA_STRINGS[locale];
  const [jurisdiction, setJurisdiction] = useState<string | null>(initial?.jurisdiction ?? null);
  const [effectiveness, setEffectiveness] = useState<'immediately' | 'on_incapacity'>(
    initial?.effectiveness ?? 'immediately',
  );
  const [giftPower, setGiftPower] = useState(initial?.giftPower ?? false);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>

      <Section title={locale === 'es' ? 'Tu estado' : 'Your state'}>
        <StateTileMap locale={locale} selected={jurisdiction} onSelect={setJurisdiction} />
      </Section>

      <Section title={t.effectivenessTitle}>
        <div className="space-y-2">
          <label className="flex items-start gap-2">
            <input
              type="radio"
              name="effectiveness"
              checked={effectiveness === 'immediately'}
              onChange={() => setEffectiveness('immediately')}
              className="mt-1 h-4 w-4 accent-binder"
            />
            <span>{t.immediate}</span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="radio"
              name="effectiveness"
              checked={effectiveness === 'on_incapacity'}
              onChange={() => setEffectiveness('on_incapacity')}
              className="mt-1 h-4 w-4 accent-binder"
            />
            <span>{t.springing}</span>
          </label>
          {effectiveness === 'on_incapacity' && (
            <p className="rounded-md bg-caution-bg p-2 text-sm text-caution-fg">
              {t.springingWarn}
            </p>
          )}
        </div>
      </Section>

      <Section title={locale === 'es' ? 'Regalos (opcional)' : 'Gifts (optional)'}>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={giftPower}
            onChange={(e) => setGiftPower(e.target.checked)}
            className="mt-1 h-5 w-5 accent-binder"
          />
          <span>
            <span className="block font-bold text-foreground">{t.giftLabel}</span>
            <span className="block text-sm text-muted-foreground">{t.giftHelp}</span>
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
          disabled={!jurisdiction}
          onClick={() => jurisdiction && onContinue({ jurisdiction, effectiveness, giftPower })}
          className={cn(
            'inline-flex h-11 items-center justify-center rounded-md px-6 font-bold',
            'bg-primary text-primary-foreground hover:opacity-90',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-40',
          )}
        >
          {t.continueCta}
        </button>
        {!jurisdiction && <p className="text-sm text-muted-foreground">{t.needState}</p>}
      </div>
    </div>
  );
}
