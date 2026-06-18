import { type ReactNode } from 'react';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

/** Shared shell for the static content pages (EN-only in v1): §2 header + 680px column + footer. */
export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[680px] flex-1 px-5 pb-16 pt-8 sm:px-6 sm:pt-10">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
