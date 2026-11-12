import { pathToFileURL } from 'node:url'; import { resolve } from 'node:path';
const { Browser } = await import('file:///C:/Users/bkatoglou/AppData/Roaming/Claude/local-agent-mode-sessions/skills-plugin/d7a87ec6-04fd-4dd6-8aba-b8d8b3e1f8a7/bc86d20f-4c7f-43f7-92d8-d19b85b036d6/skills/design-taste-frontend/scripts/lib/cdp.mjs');
const [file, w = 390] = process.argv.slice(2);
const b = await Browser.launch(); const p = await b.newPage({ width: +w, height: 844, mobile: +w < 768 });
await p.goto(pathToFileURL(resolve(file)).href, { settleMs: 800 });
console.log(await p.eval(() => [...document.querySelectorAll('.mobile-bar, .mobile-bar > *')].map(e => { const cs = getComputedStyle(e); return [e.className, e.getBoundingClientRect().width, cs.gridTemplateColumns, cs.left, cs.right, cs.width]; }))); console.log(await p.eval(() => { const W = document.documentElement.clientWidth; const out = [];
  for (const el of document.querySelectorAll('body *')) { const r = el.getBoundingClientRect(); if (r.right > W + 1 && r.width > 0 && !el.closest('.mobile-bar, .drawer, .brands__row') && !(el.closest('svg') && el.tagName !== 'svg')) out.push(el.tagName + '.' + (el.className?.baseVal ?? el.className) + ' ' + Math.round(r.right)); }
  return { W, scrollW: document.documentElement.scrollWidth, out: out.slice(0, 15) }; }));
await b.close();
