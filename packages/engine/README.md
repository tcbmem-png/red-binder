# @red-binder/engine

The shared render core. **Pure `(payload, template) → PDF bytes`.** This is the platform;
everything else is content or UI built on top of it.

## Two load-bearing properties

1. **Browser-safe.** No `window`, no `fs`, no network, no server-only dependency. The
   identical code runs in the browser — this is what makes the privacy floor real.
   (The single browser-coupled helper, `downloadResults`, lives in its own `./browser`
   entry so the core stays pure.)
2. **Fan-out over one payload.** The app enters core facts once and calls the engine once
   per selected document, each call reading the slice of the payload its template needs.

## Public contract (frozen — see `src/types.ts`)

```ts
renderDocument(input: RenderInput): Promise<RenderResult>;
renderDocuments(inputs: RenderInput[]): Promise<RenderResult[]>;   // fan-out convenience
// from @red-binder/engine/browser:
downloadResults(results: RenderResult[], opts?: { zipName?: string }): void;
```

Once this contract is frozen (build phase 2), changing it is the expensive move. The
conceptual contract `(payload, template) → PDF bytes` does not change.

## In the engine

Markdown parse · `{{token}}` substitution · checkbox rendering (boolean → ☒ / ☐) ·
repeater rows (1-indexed, blank/hidden) · hide-if-absent blocks · strip internal blocks
(`Open questions for Taylor`, `<!-- Internal -->`) · `<!-- pagebreak -->` (never splits a
signature block from its notary acknowledgment) · bilingual EN/ES layout · `pdf-lib`
drawing · font embedding (Atkinson Hyperlegible) · image embedding (`{{photo}}`,
PNG/JPEG) · page formats (`letter`, `wallet-card` single-sided fold) · PDF attachment /
merge (e.g. a static blank G-28) · PII sanitization.

## Never in the engine

Zod schemas · the intake UI · the document picker · state selection / tile map · fan-out
orchestration (which templates, slicing the payload) · browser delivery. No state-specific
or document-specific logic — that lives in `@red-binder/poa-data`, `@red-binder/schema`,
and `apps/builder`.
