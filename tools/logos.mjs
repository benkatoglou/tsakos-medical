// Crops the kit's 3750x3750 logo SVGs to their artwork and removes background squares.
// Originals in /assets/logos are untouched; output goes to /site/assets/logos.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const CDP = 'file:///C:/Users/bkatoglou/AppData/Roaming/Claude/local-agent-mode-sessions/skills-plugin/d7a87ec6-04fd-4dd6-8aba-b8d8b3e1f8a7/bc86d20f-4c7f-43f7-92d8-d19b85b036d6/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const { Browser } = await import(CDP);

const SRC = 'C:/Users/bkatoglou/Documents/__CLIENTS/Tsakos Medical Group/assets/logos';
const DST = 'C:/Users/bkatoglou/Documents/__CLIENTS/Tsakos Medical Group/site/assets/logos';
const strip = (s) => s.replace(/<rect x="-375" width="4500"[^>]*\/>/g, '');

const b = await Browser.launch();
const p = await b.newPage({ width: 800, height: 600 });
await p.goto('about:blank', { settleMs: 50 });

async function bbox(svg) {
  return p.eval(async (svg) => {
    const img = new Image();
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    await img.decode();
    const S = 1875; // half resolution scan
    const c = document.createElement('canvas'); c.width = c.height = S;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, 0, 0, S, S);
    const d = x.getImageData(0, 0, S, S).data;
    let minX = S, minY = S, maxX = -1, maxY = -1;
    for (let y = 0; y < S; y++) for (let i = 0; i < S; i++) {
      if (d[(y * S + i) * 4 + 3] > 8) { if (i < minX) minX = i; if (i > maxX) maxX = i; if (y < minY) minY = y; if (y > maxY) maxY = y; }
    }
    const k = 3750 / S;
    return { x: minX * k, y: minY * k, w: (maxX - minX + 1) * k, h: (maxY - minY + 1) * k };
  }, svg);
}

function crop(svg, bb, pad = 6) {
  const vb = `${(bb.x - pad).toFixed(1)} ${(bb.y - pad).toFixed(1)} ${(bb.w + 2 * pad).toFixed(1)} ${(bb.h + 2 * pad).toFixed(1)}`;
  return svg.replace(/<svg([^>]*)>/, (m, attrs) => {
    attrs = attrs.replace(/\swidth="[^"]*"/, '').replace(/\sheight="[^"]*"/, '').replace(/\sviewBox="[^"]*"/, '');
    return `<svg${attrs} viewBox="${vb}" width="${Math.round(bb.w + 2 * pad)}" height="${Math.round(bb.h + 2 * pad)}">`;
  });
}

const out = {};
for (const f of readdirSync(SRC).filter((f) => f.endsWith('.svg'))) {
  const s = strip(readFileSync(join(SRC, f), 'utf8'));
  const bb = await bbox(s);
  const name = f.replace('_W_HRZ', '_white').replace('_HRZ', '').replace('.svg', '');
  writeFileSync(join(DST, name + '.svg'), crop(s, bb));
  out[name] = bb;
}
// white knock-out TMG logo for the navy footer
{
  const s = strip(readFileSync(join(SRC, 'TMG_HRZ.svg'), 'utf8')).replace(/fill="#(?!ffffff)[0-9a-fA-F]{6}"/g, 'fill="#ffffff"');
  const bb = await bbox(s);
  writeFileSync(join(DST, 'TMG_white.svg'), crop(s, bb));
  out.TMG_white = bb;
}
console.log(JSON.stringify(out, null, 1));
await b.close();
