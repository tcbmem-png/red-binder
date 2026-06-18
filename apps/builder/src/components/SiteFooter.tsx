import { STRINGS, type Locale } from '../i18n/strings';
import { Link } from '../lib/router';

/**
 * Shared footer — BRANDING SIGN-OFF §2. Two stacked lines on bone, separated by space (no rule):
 * the privacy line (muted, with the one red link) then the quieter not-legal-advice disclaimer.
 * The red link is the only red in the footer.
 */
export function SiteFooter({ locale = 'en' }: { locale?: Locale }) {
  return (
    <footer className="bg-background">
      <div className="mx-auto w-full max-w-[680px] px-5 pb-12 pt-8 sm:px-6">
        {/* Phase 8 (ES): translate this privacy line. EN now per §2. */}
        <p className="text-[14px] leading-relaxed text-muted-foreground">
          Built client-side. We store nothing. Open source.{' '}
          <Link
            to="/how-its-built"
            className="font-normal text-binder underline-offset-2 hover:underline focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            → Privacy &amp; how it&apos;s built
          </Link>
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
          {STRINGS[locale].notLegalAdvice}
        </p>
        {/* Branding spec: TCB Law appears quietly in the footer (the quietest line). */}
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          {STRINGS[locale].tcb}
        </p>
      </div>
    </footer>
  );
}
