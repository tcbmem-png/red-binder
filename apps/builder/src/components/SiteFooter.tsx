import { STRINGS, type Locale } from '../i18n/strings';
import { Link } from '../lib/router';

/**
 * Shared footer — BRANDING SIGN-OFF §2 + the State-of-the-law handoff. Stacked blocks on bone,
 * separated by space (no rule), each quieter than the last: the "state of the law" pointer block,
 * the privacy line (the one red link), the not-legal-advice disclaimer, then the TCB Law line.
 * The tracker links are plain outbound anchors — nothing third-party loads at render.
 */
export function SiteFooter({ locale = 'en' }: { locale?: Locale }) {
  const sol = STRINGS[locale].stateOfLaw;
  return (
    <footer className="bg-background">
      <div className="mx-auto w-full max-w-[680px] px-5 pb-12 pt-8 sm:px-6">
        {/* "State of the law" — handoff: docs/HANDOFF — Footer "State of the Law" Block (EN+ES).
            Points to live trackers instead of asserting volatile law. Plain outbound <a> only
            (new tab, noopener noreferrer) — no scripts/embeds/trackers, gate #3 clean. */}
        <section aria-label={sol.heading} className="mb-6">
          <p className="text-[14px] font-bold leading-relaxed text-foreground">{sol.heading}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{sol.intro}</p>
          <ul className="mt-2 list-none space-y-1.5 pl-0 text-[13px] leading-relaxed text-muted-foreground">
            {sol.links.map((l) => (
              <li key={l.url}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-binder underline-offset-2 hover:underline focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {l.label}
                </a>{' '}
                — {l.desc}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[13px] italic leading-relaxed text-muted-foreground">
            {sol.reviewedNote}
          </p>
        </section>

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
