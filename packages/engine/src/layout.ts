// pdf-lib drawing: turns parsed blocks into laid-out pages. Word-wraps styled runs,
// paginates (or clips, for wallet panels), draws checkboxes as vectors (no font-glyph
// dependency for ☒/☐), renders the muted Spanish style, lists, tables, and images.
import { type PDFDocument, type PDFFont, type PDFImage, type PDFPage, rgb } from 'pdf-lib';
import type { Block, Inline } from './markdown';
import type { Resolver } from './resolve';

type Color = ReturnType<typeof rgb>;

export const INK: Color = rgb(0.122, 0.106, 0.102); // #1F1B1A
export const GRAY: Color = rgb(0.42, 0.388, 0.376); // #6B6360 — the calm secondary voice (ES)
export const HAIRLINE: Color = rgb(0.894, 0.863, 0.816); // #E4DCD0

export interface SizeScheme {
  body: number;
  h1: number;
  h2: number;
  h3: number;
  h4: number;
  lineFactor: number;
  paraGap: number;
  listIndent: number;
  listGap: number;
}

export const LETTER_SIZES: SizeScheme = {
  body: 10.5,
  h1: 17,
  h2: 14,
  h3: 12,
  h4: 11,
  lineFactor: 1.35,
  paraGap: 4,
  listIndent: 15,
  listGap: 1.5,
};

export const WALLET_SIZES: SizeScheme = {
  body: 7.5,
  h1: 9.5,
  h2: 8.5,
  h3: 8,
  h4: 7.5,
  lineFactor: 1.18,
  paraGap: 2,
  listIndent: 9,
  listGap: 0.5,
};

export interface Frame {
  x0: number;
  x1: number;
  yTop: number;
  yBottom: number;
}

interface Atom {
  kind: 'word' | 'space' | 'box';
  text: string;
  font: PDFFont;
  color: Color;
  checked: boolean;
  size: number;
  w: number;
}

// ---------------------------------------------------------------- pure helpers

function buildAtoms(
  runs: Inline[],
  size: number,
  resolver: Resolver,
  reg: PDFFont,
  bold: PDFFont,
): Atom[] {
  const atoms: Atom[] = [];
  const spaceW = reg.widthOfTextAtSize(' ', size);

  const pushWords = (text: string, font: PDFFont, color: Color) => {
    for (const part of text.split(/(\s+)/)) {
      if (part === '') continue;
      if (/^\s+$/.test(part)) {
        atoms.push({ kind: 'space', text: '', font, color, checked: false, size, w: spaceW });
      } else {
        atoms.push({
          kind: 'word',
          text: part,
          font,
          color,
          checked: false,
          size,
          w: font.widthOfTextAtSize(part, size),
        });
      }
    }
  };

  for (const run of runs) {
    const font = run.bold ? bold : reg;
    const color = run.es ? GRAY : INK;
    if (run.t === 'text') {
      pushWords(run.s, font, color);
      continue;
    }
    const resolved = resolver.resolve(run.name);
    if (resolved.kind === 'checkbox') {
      atoms.push({
        kind: 'box',
        text: '',
        font: reg,
        color: INK,
        checked: resolved.checked,
        size,
        w: size * 0.78 + size * 0.28,
      });
    } else if (resolved.kind === 'text') {
      pushWords(resolved.value, font, color);
    }
    // 'image' (inline) and 'empty' contribute nothing
  }
  return atoms;
}

function wrap(atoms: Atom[], maxWidth: number): Atom[][] {
  const lines: Atom[][] = [];
  let cur: Atom[] = [];
  let curW = 0;
  for (const atom of atoms) {
    if (cur.length === 0 && atom.kind === 'space') continue; // trim leading space
    if (curW + atom.w > maxWidth && cur.length > 0) {
      lines.push(cur);
      cur = [];
      curW = 0;
      if (atom.kind === 'space') continue; // drop the wrapping space
    }
    cur.push(atom);
    curW += atom.w;
  }
  if (cur.length > 0) lines.push(cur);
  return lines;
}

function drawCheckbox(page: PDFPage, x: number, baseline: number, size: number, checked: boolean) {
  const side = size * 0.78;
  page.drawRectangle({
    x,
    y: baseline,
    width: side,
    height: side,
    borderWidth: 0.8,
    borderColor: INK,
  });
  if (checked) {
    const inset = side * 0.18;
    page.drawLine({
      start: { x: x + inset, y: baseline + inset },
      end: { x: x + side - inset, y: baseline + side - inset },
      thickness: 0.8,
      color: INK,
    });
    page.drawLine({
      start: { x: x + inset, y: baseline + side - inset },
      end: { x: x + side - inset, y: baseline + inset },
      thickness: 0.8,
      color: INK,
    });
  }
}

function drawLineAtoms(page: PDFPage, atoms: Atom[], x: number, baseline: number) {
  let cx = x;
  for (const atom of atoms) {
    if (atom.kind === 'word') {
      page.drawText(atom.text, {
        x: cx,
        y: baseline,
        size: atom.size,
        font: atom.font,
        color: atom.color,
      });
    } else if (atom.kind === 'box') {
      drawCheckbox(page, cx, baseline, atom.size, atom.checked);
    }
    cx += atom.w;
  }
}

function plainLength(runs: Inline[], resolver: Resolver): number {
  let n = 0;
  for (const run of runs) {
    if (run.t === 'text') n += run.s.length;
    else {
      const r = resolver.resolve(run.name);
      if (r.kind === 'text') n += r.value.length;
      else if (r.kind === 'checkbox') n += 1;
    }
  }
  return n;
}

// ---------------------------------------------------------------- the layouter

export class Layouter {
  private page: PDFPage | null = null;
  private y = 0;
  clipped = false;

  constructor(
    private readonly pdf: PDFDocument,
    private readonly reg: PDFFont,
    private readonly bold: PDFFont,
    private readonly resolver: Resolver,
    private readonly sizes: SizeScheme,
    private readonly frame: Frame,
    private readonly pageW: number,
    private readonly pageH: number,
    private readonly mode: 'paginate' | 'clip',
    private readonly images: Map<string, PDFImage>,
  ) {}

  startNewPage(): void {
    this.page = this.pdf.addPage([this.pageW, this.pageH]);
    this.y = this.frame.yTop;
  }

  useExistingPage(page: PDFPage): void {
    this.page = page;
    this.y = this.frame.yTop;
  }

  private cur(): PDFPage {
    if (!this.page) throw new Error('Layouter: draw called before a page was started');
    return this.page;
  }

  /** Ensure `h` vertical space. Paginate mode starts a new page; clip mode flags overflow. */
  private ensure(h: number): boolean {
    if (this.y - h >= this.frame.yBottom) return true;
    if (this.mode === 'paginate') {
      this.startNewPage();
      return true;
    }
    this.clipped = true;
    return false;
  }

  drawBlocks(blocks: Block[]): void {
    for (const blk of blocks) {
      if (this.clipped) return;
      switch (blk.b) {
        case 'heading':
          this.drawHeading(blk.level, blk.runs);
          break;
        case 'paragraph':
          this.drawRunsBlock(blk.runs, this.sizes.body, 0);
          this.y -= this.sizes.paraGap;
          break;
        case 'list':
          this.drawList(blk.ordered, blk.items);
          break;
        case 'table':
          this.drawTable(blk.header, blk.rows);
          break;
        case 'hr':
          this.drawHr();
          break;
        case 'image':
          this.drawImage(blk.token);
          break;
      }
    }
  }

  private headingSize(level: 1 | 2 | 3 | 4): number {
    return level === 1
      ? this.sizes.h1
      : level === 2
        ? this.sizes.h2
        : level === 3
          ? this.sizes.h3
          : this.sizes.h4;
  }

  private drawHeading(level: 1 | 2 | 3 | 4, runs: Inline[]): void {
    const size = this.headingSize(level);
    const lh = size * this.sizes.lineFactor;
    this.y -= this.sizes.paraGap;
    // keep-with-next: don't orphan a heading at the bottom of a page
    if (
      this.mode === 'paginate' &&
      this.y - (lh + this.sizes.body * this.sizes.lineFactor) < this.frame.yBottom
    ) {
      this.startNewPage();
    }
    this.drawRunsBlock(runs, size, 0);
    this.y -= this.sizes.paraGap * 0.5;
  }

  private drawRunsBlock(runs: Inline[], size: number, indent: number): void {
    const atoms = buildAtoms(runs, size, this.resolver, this.reg, this.bold);
    const lines = wrap(atoms, this.frame.x1 - this.frame.x0 - indent);
    const lh = size * this.sizes.lineFactor;
    for (const line of lines) {
      if (!this.ensure(lh)) return;
      drawLineAtoms(this.cur(), line, this.frame.x0 + indent, this.y - size);
      this.y -= lh;
    }
  }

  private drawList(ordered: boolean, items: Inline[][]): void {
    const size = this.sizes.body;
    const lh = size * this.sizes.lineFactor;
    const indent = this.sizes.listIndent;
    items.forEach((item, idx) => {
      if (this.clipped) return;
      if (!this.ensure(lh)) return;
      const baseline = this.y - size;
      if (ordered) {
        this.cur().drawText(`${idx + 1}.`, {
          x: this.frame.x0 + 1,
          y: baseline,
          size,
          font: this.reg,
          color: INK,
        });
      } else {
        const dot = size * 0.22;
        this.cur().drawRectangle({
          x: this.frame.x0 + 3,
          y: baseline + size * 0.28,
          width: dot,
          height: dot,
          color: INK,
        });
      }
      this.drawRunsBlock(item, size, indent);
      this.y -= this.sizes.listGap;
    });
    this.y -= this.sizes.paraGap;
  }

  private drawHr(): void {
    this.y -= this.sizes.paraGap;
    if (!this.ensure(2)) return;
    this.cur().drawLine({
      start: { x: this.frame.x0, y: this.y },
      end: { x: this.frame.x1, y: this.y },
      thickness: 0.5,
      color: HAIRLINE,
    });
    this.y -= this.sizes.paraGap;
  }

  private drawTable(header: Inline[][], rows: Inline[][][]): void {
    const size = this.sizes.body;
    const lh = size * this.sizes.lineFactor;
    const pad = 3;
    const colCount = Math.max(header.length, rows[0]?.length ?? 1);
    const totalW = this.frame.x1 - this.frame.x0;

    const weights: number[] = [];
    for (let c = 0; c < colCount; c++) {
      weights.push(Math.max(plainLength(header[c] ?? [], this.resolver), 1));
    }
    const weightSum = weights.reduce((a, b) => a + b, 0);
    const widths = weights.map((w) => Math.max(24, (totalW * w) / weightSum));
    const scale = totalW / widths.reduce((a, b) => a + b, 0);
    const colW = widths.map((w) => w * scale);
    const colX: number[] = [];
    let cx = this.frame.x0;
    for (const w of colW) {
      colX.push(cx);
      cx += w;
    }

    const headerBold: Inline[][] = header.map((cell) => cell.map((r) => ({ ...r, bold: true })));
    const allRows: Inline[][][] = [headerBold, ...rows];

    for (const cells of allRows) {
      if (this.clipped) return;
      let maxLines = 1;
      const wrapped = cells.map((cell, c) => {
        const w = (colW[c] ?? totalW) - pad * 2;
        const lines = wrap(buildAtoms(cell, size, this.resolver, this.reg, this.bold), w);
        maxLines = Math.max(maxLines, lines.length || 1);
        return lines;
      });
      const rowH = maxLines * lh + pad;
      if (!this.ensure(rowH)) return;
      const top = this.y;
      wrapped.forEach((lines, c) => {
        let yy = top - pad * 0.5;
        for (const line of lines) {
          const baseline = yy - size;
          if (baseline < this.frame.yBottom) break;
          drawLineAtoms(this.cur(), line, (colX[c] ?? this.frame.x0) + pad, baseline);
          yy -= lh;
        }
      });
      this.y = top - rowH;
      this.cur().drawLine({
        start: { x: this.frame.x0, y: this.y },
        end: { x: this.frame.x1, y: this.y },
        thickness: 0.4,
        color: HAIRLINE,
      });
    }
    this.y -= this.sizes.paraGap;
  }

  private drawImage(token: string): void {
    const resolved = this.resolver.resolve(token);
    if (resolved.kind === 'image') {
      const img = this.images.get(token);
      if (img) {
        const maxW = Math.min(150, this.frame.x1 - this.frame.x0);
        const fit = Math.min(maxW / img.width, 190 / img.height, 1);
        const w = img.width * fit;
        const h = img.height * fit;
        if (!this.ensure(h + this.sizes.paraGap)) return;
        this.cur().drawImage(img, { x: this.frame.x0, y: this.y - h, width: w, height: h });
        this.y -= h + this.sizes.paraGap;
        return;
      }
    }
    if (resolved.kind === 'text') {
      this.drawRunsBlock(
        [{ t: 'text', s: resolved.value, bold: false, es: false }],
        this.sizes.body,
        0,
      );
      this.y -= this.sizes.paraGap;
      return;
    }
    // empty: leave a labeled placeholder box for a photo to be taped/printed in
    if (token.toLowerCase().includes('photo')) {
      const w = 108;
      const h = 144;
      if (!this.ensure(h + this.sizes.paraGap)) return;
      const top = this.y;
      this.cur().drawRectangle({
        x: this.frame.x0,
        y: top - h,
        width: w,
        height: h,
        borderWidth: 0.8,
        borderColor: HAIRLINE,
      });
      const label = 'Photo / Foto';
      const ls = this.sizes.body * 0.85;
      const lw = this.reg.widthOfTextAtSize(label, ls);
      this.cur().drawText(label, {
        x: this.frame.x0 + (w - lw) / 2,
        y: top - h / 2,
        size: ls,
        font: this.reg,
        color: GRAY,
      });
      this.y -= h + this.sizes.paraGap;
    }
  }
}
