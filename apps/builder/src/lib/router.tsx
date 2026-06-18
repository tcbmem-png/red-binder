import { useEffect, useState, type AnchorHTMLAttributes, type MouseEvent } from 'react';

// History-API router primitives. No storage/network APIs (gate #3 safe); the picker's `?doc=`
// query string is never touched because everything here keys on pathname.

/** Current pathname; re-renders on back/forward (popstate) and on in-app navigate(). */
export function usePath(): string {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => {
    const sync = () => setPath(window.location.pathname);
    window.addEventListener('popstate', sync);
    window.addEventListener('rb:navigate', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('rb:navigate', sync);
    };
  }, []);
  return path;
}

/** Push a new path, notify subscribers, scroll to top — the client-side nav primitive. */
export function navigate(to: string): void {
  const here = window.location.pathname + window.location.search + window.location.hash;
  if (to === here) return;
  window.history.pushState({}, '', to);
  window.dispatchEvent(new Event('rb:navigate'));
  window.scrollTo(0, 0);
}

/** True once the page is scrolled past `threshold` — drives the header's on-scroll hairline. */
export function useScrolled(threshold = 4): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

/**
 * Internal link. Renders a real `<a href>` (shareable, bookmarkable, right-clickable) but routes
 * client-side on a plain left-click. Modifier- and middle-clicks fall through to the browser, so
 * "open in new tab" still works.
 */
export function Link({
  to,
  onClick,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    navigate(to);
  };
  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
