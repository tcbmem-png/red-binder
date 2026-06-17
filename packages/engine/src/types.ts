// ============================================================================
// @red-binder/engine — PUBLIC CONTRACT.  FROZEN (build phase 2).
//
// Per docs/ARCHITECTURE.md §3. Changing anything in this file is the expensive
// move — it ripples into schema, templates, and the app. Do not edit without a
// recorded decision. The conceptual contract is `(payload, template) -> PDF bytes`.
// ============================================================================

/** EN/ES side-by-side is the only mode. */
export type Locale = 'bilingual';

/** Page geometry. `wallet-card` is the single-sided fold-once-to-wallet sheet. */
export type PageFormat = 'letter' | 'wallet-card';

export interface TemplateInput {
  /** Logical id — used for the output filename and logging. */
  id: string;
  /** Raw template markdown. The app imports this from @red-binder/templates;
   *  the engine never reads the filesystem (keeps it browser-safe). */
  source: string;
  /** Defaults to 'letter'. */
  format?: PageFormat;
}

export interface RenderInput {
  template: TemplateInput;
  /** The payload slice this document needs. Zod validation runs in the app, not here. */
  data: Record<string, unknown>;
  locale: Locale;
  /** Render-time, non-PII values: e.g. generated_date, current_as_of. */
  injected?: Record<string, string>;
  /** Binary assets keyed by token name, e.g. { images: { photo } } for {{photo}}. */
  assets?: { images?: Record<string, Uint8Array> };
  /** Static PDFs appended after the rendered pages, e.g. a blank G-28. */
  attachments?: Uint8Array[];
}

/** Print-ready output. Never uploaded — the app hands it to the browser to save. */
export interface RenderResult {
  filename: string;
  bytes: Uint8Array;
}
