import { DOCUMENT_PATH_LEGEND, type DocumentPath, JURISDICTIONS } from '@red-binder/poa-data';
import type { Locale } from '../i18n/strings';
import { cn } from '../lib/utils';

const COLS = Math.max(...JURISDICTIONS.map((j) => j.tile.col)) + 1;

// Literal class strings (Tailwind scans source — no dynamic construction). bg/border/text from the
// path.* tokens that mirror states.ts. `verify` states render PENDING — never the documentPath
// color — so the map makes no public claim about IN/PA until Taylor confirms (acceptance gate #1).
const PATH_CLASSES: Record<DocumentPath, string> = {
  UNIVERSAL: 'bg-path-universalBg border-path-universal text-path-universal',
  UNIVERSAL_PLUS_ADDENDUM: 'bg-path-addendumBg border-path-addendum text-path-addendum',
  STATE_FORM: 'bg-path-stateFormBg border-path-stateForm text-path-stateForm',
};
const PENDING_CLASS = 'bg-muted border-dashed border-muted-foreground/60 text-muted-foreground';

const legendFor = (path: DocumentPath) => DOCUMENT_PATH_LEGEND.find((e) => e.path === path)!;

interface LegendLike {
  labelEn: string;
  labelEs: string;
  descriptionEn: string;
  descriptionEs: string;
}
const labelOf = (e: LegendLike, locale: Locale) => (locale === 'es' ? e.labelEs : e.labelEn);
const descOf = (e: LegendLike, locale: Locale) =>
  locale === 'es' ? e.descriptionEs : e.descriptionEn;

const PENDING_LEGEND = {
  labelEn: 'Pending confirmation',
  labelEs: 'Pendiente de confirmar',
  descriptionEn: "We're confirming this state's classification.",
  descriptionEs: 'Estamos confirmando la clasificación de este estado.',
};

export function StateTileMap({
  locale,
  selected,
  onSelect,
}: {
  locale: Locale;
  selected: string | null;
  onSelect: (code: string) => void;
}) {
  const byName = [...JURISDICTIONS].sort((a, b) => a.name.localeCompare(b.name));
  const sel = JURISDICTIONS.find((j) => j.code === selected) ?? null;

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-bold">
          {locale === 'es' ? 'Tu estado' : 'Your state'}
        </span>
        <select
          value={selected ?? ''}
          onChange={(e) => onSelect(e.target.value)}
          className="h-11 w-full rounded-md border border-input bg-card px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="" disabled>
            {locale === 'es' ? 'Elige tu estado' : 'Choose your state'}
          </option>
          {byName.map((j) => (
            <option key={j.code} value={j.code}>
              {j.name}
            </option>
          ))}
        </select>
      </label>

      <div
        role="group"
        aria-label={locale === 'es' ? 'Mapa de estados' : 'State map'}
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {JURISDICTIONS.map((j) => {
          const isSel = j.code === selected;
          const desc = j.verify
            ? descOf(PENDING_LEGEND, locale)
            : descOf(legendFor(j.documentPath), locale);
          return (
            <button
              key={j.code}
              type="button"
              aria-pressed={isSel}
              aria-label={`${j.name} — ${desc}`}
              title={j.name}
              onClick={() => onSelect(j.code)}
              style={{ gridColumn: j.tile.col + 1, gridRow: j.tile.row + 1 }}
              className={cn(
                'flex aspect-square items-center justify-center rounded border text-[10px] font-bold',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                j.verify ? PENDING_CLASS : PATH_CLASSES[j.documentPath],
                isSel && 'ring-2 ring-primary ring-offset-1',
              )}
            >
              {j.code}
            </button>
          );
        })}
      </div>

      <ul className="space-y-1 text-sm">
        {DOCUMENT_PATH_LEGEND.map((e) => (
          <li key={e.path} className="flex items-start gap-2">
            <span
              className="mt-1 h-3 w-3 shrink-0 rounded-sm border"
              style={{ backgroundColor: e.bg, borderColor: e.color }}
            />
            <span>
              <span className="font-bold">{labelOf(e, locale)}:</span>{' '}
              <span className="text-muted-foreground">{descOf(e, locale)}</span>
            </span>
          </li>
        ))}
        <li className="flex items-start gap-2">
          <span className="mt-1 h-3 w-3 shrink-0 rounded-sm border border-dashed border-muted-foreground/60 bg-muted" />
          <span>
            <span className="font-bold">{labelOf(PENDING_LEGEND, locale)}:</span>{' '}
            <span className="text-muted-foreground">{descOf(PENDING_LEGEND, locale)}</span>
          </span>
        </li>
      </ul>

      {sel && (
        <div
          className={cn(
            'rounded-lg border p-3 text-sm',
            sel.verify
              ? 'border-muted-foreground/40 bg-muted text-foreground'
              : 'border-success bg-success-bg text-success-fg',
          )}
        >
          {sel.verify ? (
            <p>
              {locale === 'es'
                ? `Estamos confirmando la clasificación de ${sel.name}. Tu documento estará listo una vez confirmada.`
                : `We're confirming ${sel.name}'s classification. Your document will be ready once it's confirmed.`}
            </p>
          ) : (
            <p>
              <span className="font-bold">{labelOf(legendFor(sel.documentPath), locale)}.</span>{' '}
              {descOf(legendFor(sel.documentPath), locale)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
