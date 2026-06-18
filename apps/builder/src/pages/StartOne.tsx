/**
 * Stub — /start-one. Linked from the explainer's "For organizers and neighbors". Minimal by
 * design (hand-off §1): a short paragraph, a contact, and a quiet link to the repo. Expandable
 * later. EN v1; ES is Phase 8.
 */
export function StartOne() {
  return (
    <article className="rb-prose">
      <h1>Start one in your town</h1>
      <p className="lead">
        Red Binder is free and open, and it's built to be copied. If you're an organizer, a
        legal-aid group, or a neighbor who wants to stand this up for your own community, get in
        touch — we're glad to help you start.
      </p>
      <p>
        <a href="mailto:taylor@tcblaw.org" className="rb-cta">
          taylor@tcblaw.org
        </a>
      </p>
      <p className="rb-fineprint">
        Prefer the technical path? The code and templates are public at{' '}
        <a href="https://github.com/tcbmem-png/red-binder" target="_blank" rel="noreferrer">
          github.com/tcbmem-png/red-binder
        </a>
        .
      </p>
    </article>
  );
}
