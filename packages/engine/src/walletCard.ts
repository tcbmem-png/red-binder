// The `wallet-card` page format — LOCKED single-sided, fold-once-to-wallet (ARCHITECTURE §6,
// MASTER-KICKOFF §6). One US Letter sheet holds two CR80 panels (3.375" × 2.125") side by
// side: FRONT (rights script + the one "DO NOT SIGN" rule) and BACK (who to call). A solid
// cut border surrounds the pair; a dashed fold line runs down the center. The user prints ONE
// side, cuts the border, folds once so the printed faces end up on the outside, and laminates.
//
// Geometry note: with a side-by-side layout and a vertical center fold, the back panel needs
// NO 180° rotation — after folding the back behind the front and flipping the card about the
// fold (its spine), the back reads upright. The brief's "mirrored across a center fold line"
// describes the layout symmetry, not a content flip. Flagged in the build plan for a physical
// print check; if a real print shows otherwise, rotating the back panel is the one change.
//
// Panels are taken from the template's `<!-- pagebreak -->`-separated segments: first = front,
// second = back. Content overflowing a panel is clipped (templates keep the card minimal).
import { type PDFDocument, type PDFFont, type PDFImage } from 'pdf-lib';
import type { Block } from './markdown';
import type { Resolver } from './resolve';
import { GRAY, INK, Layouter, WALLET_SIZES } from './layout';

const IN = 72;
const PAGE_W = 8.5 * IN;
const PAGE_H = 11 * IN;
const PANEL_W = 3.375 * IN;
const PANEL_H = 2.125 * IN;
const PAD = 9;

const FOLD_CAPTION_EN = 'Print. Cut on the solid line. Fold on the dashed line. Tape or laminate.';
const FOLD_CAPTION_ES =
  'Imprime. Corta en la línea sólida. Dobla en la línea punteada. Pega con cinta o plastifícalo.';

export function renderWalletCard(
  pdf: PDFDocument,
  panels: Block[][],
  resolver: Resolver,
  reg: PDFFont,
  bold: PDFFont,
  images: Map<string, PDFImage>,
  caption?: { en?: string; es?: string },
): void {
  const page = pdf.addPage([PAGE_W, PAGE_H]);

  const totalW = PANEL_W * 2;
  const x0 = (PAGE_W - totalW) / 2;
  const yBottom = (PAGE_H - PANEL_H) / 2;
  const yTop = yBottom + PANEL_H;
  const foldX = x0 + PANEL_W;

  page.drawRectangle({
    x: x0,
    y: yBottom,
    width: totalW,
    height: PANEL_H,
    borderWidth: 1,
    borderColor: INK,
  });
  page.drawLine({
    start: { x: foldX, y: yBottom },
    end: { x: foldX, y: yTop },
    thickness: 0.7,
    color: GRAY,
    dashArray: [3, 3],
  });

  const drawPanel = (blocks: Block[], left: number, right: number) => {
    const layouter = new Layouter(
      pdf,
      reg,
      bold,
      resolver,
      WALLET_SIZES,
      { x0: left + PAD, x1: right - PAD, yTop: yTop - PAD, yBottom: yBottom + PAD },
      PAGE_W,
      PAGE_H,
      'clip',
      images,
    );
    layouter.useExistingPage(page);
    layouter.drawBlocks(blocks);
  };

  drawPanel(panels[0] ?? [], x0, foldX);
  if (panels[1]) drawPanel(panels[1], foldX, x0 + totalW);

  const capSize = 8;
  const centerText = (text: string, y: number, color = GRAY) => {
    const w = reg.widthOfTextAtSize(text, capSize);
    page.drawText(text, { x: (PAGE_W - w) / 2, y, size: capSize, font: reg, color });
  };
  centerText(caption?.en ?? FOLD_CAPTION_EN, yBottom - 20, INK);
  centerText(caption?.es ?? FOLD_CAPTION_ES, yBottom - 32);
}
