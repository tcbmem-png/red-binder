import type { DocKind } from '@red-binder/schema';
import { PICKER_ORDER, STRINGS, type Locale } from '../i18n/strings';
import { cn } from '../lib/utils';

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2',
        checked ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-card',
      )}
    >
      {checked && (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

export function DocumentPicker({
  locale,
  selected,
  onToggle,
  onContinue,
}: {
  locale: Locale;
  selected: Set<DocKind>;
  onToggle: (doc: DocKind) => void;
  onContinue: () => void;
}) {
  const t = STRINGS[locale];
  const hasSelection = PICKER_ORDER.some((d) => selected.has(d));

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">{t.pickerHeading}</h2>
        <p className="text-muted-foreground">{t.pickerHelper}</p>
      </div>

      <div role="group" aria-label={t.pickerHeading} className="space-y-3">
        {PICKER_ORDER.map((doc) => {
          const isSelected = selected.has(doc);
          const card = t.cards[doc];
          return (
            <button
              key={doc}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(doc)}
              className={cn(
                'flex w-full items-start gap-3 rounded-lg border bg-card p-4 text-left transition-colors',
                'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isSelected ? 'border-primary bg-accent' : 'border-border',
              )}
            >
              <CheckBox checked={isSelected} />
              <span className="space-y-1">
                <span className="block font-bold text-foreground">{card.name}</span>
                <span className="block text-sm text-muted-foreground">{card.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <button
          type="button"
          disabled={!hasSelection}
          onClick={onContinue}
          className={cn(
            'inline-flex h-11 items-center justify-center rounded-md px-6 font-bold transition-colors',
            'bg-primary text-primary-foreground hover:opacity-90',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-40',
          )}
        >
          {t.continueCta}
        </button>
        {!hasSelection && <p className="text-sm text-muted-foreground">{t.pickerEmpty}</p>}
      </div>
    </section>
  );
}
