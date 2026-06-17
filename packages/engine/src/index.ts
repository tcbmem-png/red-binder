// @red-binder/engine — public entry. Implements the FROZEN contract in ./types.ts.
//
// Pure (payload, template) -> PDF bytes. No window/fs/network here (the only browser-coupled
// helper, downloadResults, lives in ./browser). Per docs/ARCHITECTURE.md §3.
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, type PDFImage } from 'pdf-lib';
import { fontBoldBytes, fontRegularBytes } from './assets/fonts';
import { LETTER_SIZES, Layouter } from './layout';
import { parseBlocks, prepareSource } from './markdown';
import { makeResolver } from './resolve';
import type { RenderInput, RenderResult } from './types';
import { renderWalletCard } from './walletCard';

export type { Locale, PageFormat, RenderInput, RenderResult, TemplateInput } from './types';

const LETTER_W = 612;
const LETTER_H = 792;
const MARGIN = 54;

function slugify(id: string): string {
  const slug = id.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  return `${slug || 'document'}.pdf`;
}

function detectImage(bytes: Uint8Array): 'png' | 'jpg' | null {
  if (bytes.length >= 2 && bytes[0] === 0x89 && bytes[1] === 0x50) return 'png';
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) return 'jpg';
  return null;
}

export async function renderDocument(input: RenderInput): Promise<RenderResult> {
  const { template, data, injected, assets, attachments } = input;
  const resolver = makeResolver(data, injected, assets?.images);

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit as Parameters<PDFDocument['registerFontkit']>[0]);
  const reg = await pdf.embedFont(fontRegularBytes, { subset: true });
  const bold = await pdf.embedFont(fontBoldBytes, { subset: true });

  // Pre-embed images so the layout stays synchronous.
  const images = new Map<string, PDFImage>();
  if (assets?.images) {
    for (const [name, bytes] of Object.entries(assets.images)) {
      if (!(bytes instanceof Uint8Array) || bytes.length === 0) continue;
      try {
        const img =
          detectImage(bytes) === 'jpg' ? await pdf.embedJpg(bytes) : await pdf.embedPng(bytes);
        images.set(name, img);
      } catch {
        // Unembeddable asset — ignored; layout falls back to a placeholder box for {{photo}}.
      }
    }
  }

  const segments = prepareSource(template.source, resolver);

  if ((template.format ?? 'letter') === 'wallet-card') {
    const panels = segments.map((seg) => parseBlocks(seg)).filter((blocks) => blocks.length > 0);
    renderWalletCard(pdf, panels, resolver, reg, bold, images, {
      en: injected?.fold_caption_en,
      es: injected?.fold_caption_es,
    });
  } else {
    const frame = { x0: MARGIN, x1: LETTER_W - MARGIN, yTop: LETTER_H - MARGIN, yBottom: MARGIN };
    const layouter = new Layouter(
      pdf,
      reg,
      bold,
      resolver,
      LETTER_SIZES,
      frame,
      LETTER_W,
      LETTER_H,
      'paginate',
      images,
    );
    for (const seg of segments) {
      const blocks = parseBlocks(seg);
      if (blocks.length === 0) continue; // skip empty page segments (e.g. trailing pagebreak)
      layouter.startNewPage();
      layouter.drawBlocks(blocks);
    }
  }

  // Append static attachments (e.g. a blank G-28), after the rendered pages.
  if (attachments && attachments.length > 0) {
    for (const att of attachments) {
      try {
        const source = await PDFDocument.load(att);
        const copied = await pdf.copyPages(source, source.getPageIndices());
        for (const p of copied) pdf.addPage(p);
      } catch {
        // Skip an unreadable attachment rather than failing the whole render.
      }
    }
  }

  if (pdf.getPageCount() === 0) pdf.addPage([LETTER_W, LETTER_H]);

  const bytes = await pdf.save();
  return { filename: slugify(template.id), bytes };
}

/** Fan-out convenience: render each input independently and collect the results. */
export async function renderDocuments(inputs: RenderInput[]): Promise<RenderResult[]> {
  const results: RenderResult[] = [];
  for (const input of inputs) {
    results.push(await renderDocument(input));
  }
  return results;
}
