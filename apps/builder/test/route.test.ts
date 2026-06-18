import { describe, expect, it } from 'vitest';
import { matchRoute } from '../src/lib/routes';

// Cheap route coverage (hand-off §0). matchRoute is pure, so this runs in the node env without a
// DOM — it locks the content routes in and documents that the picker's `?doc=` deep-link (a query
// string at '/') is never disturbed, because routing keys on pathname only.
describe('content-page routing (matchRoute)', () => {
  it('maps each content path to its route', () => {
    expect(matchRoute('/how-it-works')).toBe('how-it-works');
    expect(matchRoute('/how-its-built')).toBe('how-its-built');
    expect(matchRoute('/start-one')).toBe('start-one');
  });

  it('treats a trailing slash as the same route', () => {
    expect(matchRoute('/how-it-works/')).toBe('how-it-works');
    expect(matchRoute('/how-its-built/')).toBe('how-its-built');
  });

  it('routes the home path and unknown paths to the builder', () => {
    expect(matchRoute('/')).toBe('builder');
    expect(matchRoute('/nope')).toBe('builder');
  });
});
