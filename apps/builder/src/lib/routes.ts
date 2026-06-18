// Tiny path router for the builder's static content pages. Zero dependencies — the app is
// client-side only, and the gate #3 no-storage scan (apps/builder/test/generate.test.ts)
// forbids network/storage APIs in src; the History API used by router.tsx is allowed.
//
// Routes key on pathname ONLY. The picker's `?doc=` deep-link lives in the query string at
// '/', so navigation never disturbs it.

export type Route = 'builder' | 'how-it-works' | 'how-its-built' | 'start-one';

/** Map a pathname to a route; unknown paths fall back to the builder. Pure — unit-tested. */
export function matchRoute(pathname: string): Route {
  // Treat a trailing slash as equivalent ('/how-it-works/' === '/how-it-works').
  const path = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  switch (path) {
    case '/how-it-works':
      return 'how-it-works';
    case '/how-its-built':
      return 'how-its-built';
    case '/start-one':
      return 'start-one';
    default:
      return 'builder';
  }
}
