// Markdown handling for the engine: directive processing + a small, token-aware parser for
// the subset our bilingual templates use. The template (trusted) is parsed into blocks with
// {{token}} placeholders kept as token runs; user values fill those runs as LITERAL text at
// layout time, so user input can never alter document structure or formatting.
import type { Resolver } from './resolve';

export interface TextRun {
  t: 'text';
  s: string;
  bold: boolean;
  es: boolean; // Spanish line / italic — rendered in the muted style
}
export interface TokenRun {
  t: 'token';
  name: string;
  bold: boolean;
  es: boolean;
}
export type Inline = TextRun | TokenRun;

export type Block =
  | { b: 'heading'; level: 1 | 2 | 3 | 4; runs: Inline[] }
  | { b: 'paragraph'; runs: Inline[] }
  | { b: 'list'; ordered: boolean; items: Inline[][] }
  | { b: 'table'; header: Inline[][]; rows: Inline[][][] }
  | { b: 'hr' }
  | { b: 'image'; token: string };

// ---------------------------------------------------------------- inline parsing

export function parseInline(text: string): Inline[] {
  const runs: Inline[] = [];
  let bold = false;
  let es = false;
  let buf = '';
  const flush = () => {
    if (buf) {
      runs.push({ t: 'text', s: buf, bold, es });
      buf = '';
    }
  };
  let i = 0;
  while (i < text.length) {
    if (text.startsWith('**', i)) {
      flush();
      bold = !bold;
      i += 2;
      continue;
    }
    if (text.charAt(i) === '*') {
      flush();
      es = !es;
      i += 1;
      continue;
    }
    if (text.startsWith('{{', i)) {
      const end = text.indexOf('}}', i + 2);
      if (end !== -1) {
        flush();
        runs.push({ t: 'token', name: text.slice(i + 2, end).trim(), bold, es });
        i = end + 2;
        continue;
      }
    }
    buf += text.charAt(i);
    i += 1;
  }
  flush();
  return runs;
}

// ---------------------------------------------------------------- directives

function stripFrontmatter(src: string): string {
  if (!src.startsWith('---')) return src;
  const m = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(src);
  return m ? src.slice(m[0].length) : src;
}

/** Everything from an "Internal" marker comment, or the "Open questions for Taylor" heading,
 *  onward is non-rendered. (Templates use these to mark the provenance/QA tail.) */
function truncateInternal(src: string): string {
  let out = src;
  const internal = out.search(/<!--\s*internal/i);
  if (internal !== -1) out = out.slice(0, internal);
  const openQ = out.search(/^#{1,6}[ \t]+Open questions for Taylor/im);
  if (openQ !== -1) out = out.slice(0, openQ);
  return out;
}

/** `<!-- if:tokenA,tokenB -->` … `<!-- endif -->` — keep the block if ANY listed token is
 *  present (non-empty). Nestable. Used for optional sections and repeater rows. */
function evalConditionals(src: string, resolver: Resolver): string {
  const out: string[] = [];
  const stack: boolean[] = [];
  const active = () => stack.every((s) => s);
  for (const line of src.split('\n')) {
    const trimmed = line.trim();
    const ifm = /^<!--\s*if:([^>]*?)-->$/i.exec(trimmed);
    if (ifm) {
      const tokens = (ifm[1] ?? '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      stack.push(tokens.some((t) => resolver.has(t)));
      continue;
    }
    if (/^<!--\s*endif\s*-->$/i.test(trimmed)) {
      stack.pop();
      continue;
    }
    if (active()) out.push(line);
  }
  return out.join('\n');
}

function stripComments(src: string): string {
  return src.replace(/<!--[\s\S]*?-->/g, '');
}

/** Process directives and split into page segments (one per `<!-- pagebreak -->`). */
export function prepareSource(source: string, resolver: Resolver): string[] {
  let src = stripFrontmatter(source);
  src = truncateInternal(src);
  src = evalConditionals(src, resolver);
  return src.split(/^[ \t]*<!--\s*pagebreak\s*-->[ \t]*$/im).map(stripComments);
}

// ---------------------------------------------------------------- block parsing

const HR_RE = /^(-{3,}|_{3,}|\*{3,})$/;
const HEADING_RE = /^(#{1,6})[ \t]+(.*)$/;
const UL_RE = /^-[ \t]+(.*)$/;
const OL_RE = /^\d+\.[ \t]+(.*)$/;
const IMG_ONLY_RE = /^\{\{[ \t]*([A-Za-z0-9_]+)[ \t]*\}\}$/;
const TABLE_SEP_CELL = /^:?-{2,}:?$/;

export function parseBlocks(segment: string): Block[] {
  const lines = segment.replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = (lines[i] ?? '').trim();
    if (trimmed === '') {
      i++;
      continue;
    }

    if (HR_RE.test(trimmed)) {
      blocks.push({ b: 'hr' });
      i++;
      continue;
    }

    const heading = HEADING_RE.exec(trimmed);
    if (heading) {
      const level = Math.min(heading[1]!.length, 4) as 1 | 2 | 3 | 4;
      blocks.push({ b: 'heading', level, runs: parseInline((heading[2] ?? '').trim()) });
      i++;
      continue;
    }

    if (trimmed.startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && (lines[i] ?? '').trim().startsWith('|')) {
        tableLines.push((lines[i] ?? '').trim());
        i++;
      }
      blocks.push(parseTable(tableLines));
      continue;
    }

    if (UL_RE.test(trimmed)) {
      const items: Inline[][] = [];
      while (i < lines.length) {
        const m = UL_RE.exec((lines[i] ?? '').trim());
        if (!m) break;
        items.push(parseInline(m[1] ?? ''));
        i++;
      }
      blocks.push({ b: 'list', ordered: false, items });
      continue;
    }

    if (OL_RE.test(trimmed)) {
      const items: Inline[][] = [];
      while (i < lines.length) {
        const m = OL_RE.exec((lines[i] ?? '').trim());
        if (!m) break;
        items.push(parseInline(m[1] ?? ''));
        i++;
      }
      blocks.push({ b: 'list', ordered: true, items });
      continue;
    }

    if (trimmed.startsWith('>')) {
      blocks.push({ b: 'paragraph', runs: parseInline(trimmed.replace(/^>[ \t]?/, '')) });
      i++;
      continue;
    }

    const imgOnly = IMG_ONLY_RE.exec(trimmed);
    if (imgOnly) {
      blocks.push({ b: 'image', token: imgOnly[1]! });
      i++;
      continue;
    }

    blocks.push({ b: 'paragraph', runs: parseInline(trimmed) });
    i++;
  }
  return blocks;
}

function parseTable(rawRows: string[]): Block {
  const grid = rawRows.map((r) =>
    r
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((c) => c.trim()),
  );
  const header = (grid[0] ?? []).map((c) => parseInline(c));
  let body = grid.slice(1);
  const sep = body[0];
  if (sep && sep.length > 0 && sep.every((c) => c === '' || TABLE_SEP_CELL.test(c))) {
    body = body.slice(1);
  }
  const rows = body.map((r) => r.map((c) => parseInline(c)));
  return { b: 'table', header, rows };
}
