// Screenshot helper (headless Chrome over CDP, zero deps). Reuses the taste-skill CDP client.
// node site/tools/shot.mjs <html file> <outPrefix> [fold|full|both] [w x h ...]
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const CDP = 'file:///C:/Users/bkatoglou/AppData/Roaming/Claude/local-agent-mode-sessions/skills-plugin/d7a87ec6-04fd-4dd6-8aba-b8d8b3e1f8a7/bc86d20f-4c7f-43f7-92d8-d19b85b036d6/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const { Browser, sleep } = await import(CDP);

const [file, out, mode = 'both', ...sizes] = process.argv.slice(2);
const list = sizes.length ? sizes : ['1920x1080', '1366x768', '390x844'];
const url = pathToFileURL(resolve(file)).href;
const b = await Browser.launch();
try {
  for (const s of list) {
    const [w, h] = s.split('x').map(Number);
    const mobile = w < 768;
    const p = await b.newPage({ width: w, height: h, dsf: 1, mobile });
    await p.goto(url, { settleMs: 1200 });
    await p.eval(() => document.fonts.ready.then(() => true));
    if (mode !== 'full') await p.screenshot({ path: `${out}-${w}x${h}-fold.png`, format: 'png' });
    if (mode !== 'fold') {
      // reveal everything (scroll through so observers fire), then full-page shot
      await p.eval(async () => { document.documentElement.classList.add('is-static'); for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } scrollTo(0, 0); await new Promise(r => setTimeout(r, 400)); return true; });
      await sleep(600);
      await p.screenshot({ path: `${out}-${w}-full.png`, format: 'png', fullPage: true });
    }
    if (p.consoleErrors.length) console.log('console errors', s, p.consoleErrors);
    await p.close();
  }
} finally { await b.close(); }
console.log('done');
