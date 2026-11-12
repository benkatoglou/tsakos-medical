// Screenshots each top-level section/footer of a page separately: node tools/sections.mjs page.html outPrefix 1920x1080
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const { Browser, sleep } = await import('file:///C:/Users/bkatoglou/AppData/Roaming/Claude/local-agent-mode-sessions/skills-plugin/d7a87ec6-04fd-4dd6-8aba-b8d8b3e1f8a7/bc86d20f-4c7f-43f7-92d8-d19b85b036d6/skills/design-taste-frontend/scripts/lib/cdp.mjs');
const [file, out, size = '1920x1080', sel = 'main > section, .site-footer'] = process.argv.slice(2);
const [w, h] = size.split('x').map(Number);
const b = await Browser.launch();
const p = await b.newPage({ width: w, height: h, mobile: w < 768 });
await p.goto(pathToFileURL(resolve(file)).href, { settleMs: 1000 });
await p.eval(async () => { document.documentElement.classList.add('is-static'); await document.fonts.ready; for (const i of document.images) { i.loading = 'eager'; try { await i.decode(); } catch {} } return 1; });
const rects = await p.eval((sel) => [...document.querySelectorAll(sel)].map((el) => { const r = el.getBoundingClientRect(); return { id: el.id || el.className.split(' ')[0], x: 0, y: r.top + scrollY, width: innerWidth, height: r.height }; }), sel);
let i = 0;
import { writeFileSync } from "node:fs";
for (const r of rects) { const { data } = await p.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: r.y, width: r.width, height: Math.min(r.height, 4000), scale: 1 } }, 45000); writeFileSync(`${out}-${String(++i).padStart(2, "0")}-${r.id}.png`, Buffer.from(data, "base64")); }
console.log(rects.map((r) => r.id + ':' + Math.round(r.height)).join('  '));
await b.close();
