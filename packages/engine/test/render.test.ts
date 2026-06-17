import { deflateSync } from 'node:zlib';
import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { renderDocument, renderDocuments } from '../src/index';

function isPdf(bytes: Uint8Array): boolean {
  // %PDF
  return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
}

async function pageCount(bytes: Uint8Array): Promise<number> {
  const doc = await PDFDocument.load(bytes);
  return doc.getPageCount();
}

async function onePagePdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.addPage([200, 200]);
  return doc.save();
}

// ---- build a minimal, valid 1×1 RGB PNG (no literal control bytes in source) ----
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = (CRC_TABLE[(c ^ buf[i]!) & 0xff]! ^ (c >>> 8)) >>> 0;
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const body = new Uint8Array(typeBytes.length + data.length);
  body.set(typeBytes, 0);
  body.set(data, typeBytes.length);
  const out = new Uint8Array(4 + body.length + 4);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  out.set(body, 4);
  view.setUint32(4 + body.length, crc32(body));
  return out;
}

function makePng1x1(): Uint8Array {
  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = new Uint8Array(13);
  const view = new DataView(ihdr.buffer);
  view.setUint32(0, 1); // width
  view.setUint32(4, 1); // height
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type 2 = RGB
  const idat = new Uint8Array(deflateSync(Buffer.from([0, 255, 0, 0]))); // filter byte + 1 red px
  const parts = [sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', new Uint8Array(0))];
  const total = parts.reduce((n, p) => n + p.length, 0);
  const png = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    png.set(p, offset);
    offset += p.length;
  }
  return png;
}

describe('renderDocument', () => {
  it('renders a bilingual letter doc to a valid PDF', async () => {
    const result = await renderDocument({
      template: {
        id: 'rbp-test',
        source:
          '# Title\n\nName: **{{principal_first}} {{principal_last}}**\n*Nombre: {{principal_first}} {{principal_last}}*\n\n- one\n- two',
      },
      data: { principal_first: 'Ana', principal_last: 'López Pérez' },
      locale: 'bilingual',
    });
    expect(isPdf(result.bytes)).toBe(true);
    expect(result.filename).toBe('rbp-test.pdf');
    expect(await pageCount(result.bytes)).toBeGreaterThanOrEqual(1);
  });

  it('honors a hard page break', async () => {
    const result = await renderDocument({
      template: { id: 'pb', source: '# One\n\n<!-- pagebreak -->\n\n# Two' },
      data: {},
      locale: 'bilingual',
    });
    expect(await pageCount(result.bytes)).toBe(2);
  });

  it('renders checkboxes from boolean values without error', async () => {
    const result = await renderDocument({
      template: { id: 'cb', source: '{{a}} immediately\n{{b}} on incapacity' },
      data: { a: true, b: false },
      locale: 'bilingual',
    });
    expect(isPdf(result.bytes)).toBe(true);
  });

  it('embeds a photo image', async () => {
    const result = await renderDocument({
      template: { id: 'photo', source: '# ID\n\n{{photo}}' },
      data: {},
      locale: 'bilingual',
      assets: { images: { photo: makePng1x1() } },
    });
    expect(isPdf(result.bytes)).toBe(true);
    expect(await pageCount(result.bytes)).toBe(1);
  });

  it('draws a placeholder box when the photo is absent', async () => {
    const result = await renderDocument({
      template: { id: 'photo2', source: '{{photo}}' },
      data: {},
      locale: 'bilingual',
    });
    expect(isPdf(result.bytes)).toBe(true);
  });

  it('appends attachments after the rendered pages', async () => {
    const result = await renderDocument({
      template: { id: 'att', source: '# Hello' },
      data: {},
      locale: 'bilingual',
      attachments: [await onePagePdf()],
    });
    expect(await pageCount(result.bytes)).toBe(2);
  });

  it('slugifies the output filename', async () => {
    const result = await renderDocument({
      template: { id: 'POA MS! v1', source: 'x' },
      data: {},
      locale: 'bilingual',
    });
    expect(result.filename).toBe('POA-MS-v1.pdf');
  });
});

describe('wallet-card format', () => {
  it('produces a single Letter page from two panels', async () => {
    const result = await renderDocument({
      template: {
        id: 'pocket-card',
        format: 'wallet-card',
        source: '# Rights\n\nDo not sign.\n\n<!-- pagebreak -->\n\n# Call\n\n{{lawyer_name}}',
      },
      data: { lawyer_name: 'TCB Law' },
      locale: 'bilingual',
    });
    expect(isPdf(result.bytes)).toBe(true);
    expect(await pageCount(result.bytes)).toBe(1);
  });
});

describe('renderDocuments (fan-out)', () => {
  it('renders each input independently with its own filename', async () => {
    const results = await renderDocuments([
      { template: { id: 'a', source: '# A' }, data: {}, locale: 'bilingual' },
      { template: { id: 'b', source: '# B' }, data: {}, locale: 'bilingual' },
    ]);
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.filename)).toEqual(['a.pdf', 'b.pdf']);
  });
});
