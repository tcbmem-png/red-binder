import { STRINGS, type Locale } from '../i18n/strings';
import { Link, useScrolled } from '../lib/router';
import { cn } from '../lib/utils';

/**
 * Shared header — BRANDING SIGN-OFF §2. Bone, no border at rest, a 1px hairline on scroll
 * (not sticky in v1). Wordmark routes home to the picker; one ink→red link to the explainer.
 *
 * The builder passes `locale` + `onToggleLocale` to keep its EN/ES toggle and to localize the
 * wordmark; the content pages (EN-only in v1) omit them, leaving §2's "wordmark + one link +
 * air" exactly. Red appears only on the square mark and on hyperlink hover — never a fill.
 */
export function SiteHeader({
  locale,
  onToggleLocale,
}: {
  locale?: Locale;
  onToggleLocale?: () => void;
}) {
  const scrolled = useScrolled();
  const wordmark = locale ? STRINGS[locale].appName : 'Red Binder Project';

  return (
    <header
      className={cn(
        'bg-background transition-colors',
        scrolled ? 'border-b border-border' : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-14 max-w-[680px] items-center justify-between px-5 sm:h-16 sm:px-6">
        <Link
          to="/"
          aria-label={`${wordmark} — home`}
          className="-ml-2 inline-flex min-h-[44px] items-center gap-2 rounded-md px-2 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span aria-hidden className="h-6 w-6 shrink-0 rounded-[6px] bg-binder" />
          <span className="text-[18px] font-bold leading-none text-foreground">{wordmark}</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {locale && onToggleLocale && (
            <button
              type="button"
              onClick={onToggleLocale}
              className="inline-flex min-h-[44px] items-center rounded-md border border-border px-3 text-sm font-bold text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {STRINGS[locale].langToggle}
            </button>
          )}
          {/* Phase 8 (ES): label becomes "Cómo funciona" and points to the ES explainer. */}
          <Link
            to="/how-it-works"
            className="inline-flex min-h-[44px] items-center rounded-md px-2 text-[16px] font-normal text-foreground no-underline hover:text-binder hover:underline focus-visible:text-binder focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            How it works
          </Link>
        </nav>
      </div>
    </header>
  );
}
