import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs';
const { Browser } = await import('file:///C:/Users/bkatoglou/AppData/Roaming/Claude/local-agent-mode-sessions/skills-plugin/d7a87ec6-04fd-4dd6-8aba-b8d8b3e1f8a7/bc86d20f-4c7f-43f7-92d8-d19b85b036d6/skills/design-taste-frontend/scripts/lib/cdp.mjs');
const dir = process.argv[2];
const b = await Browser.launch(); const p = await b.newPage(); await p.goto('about:blank',{settleMs:50});
for (const f of readdirSync(dir).filter(f=>f.endsWith('.png'))) {
  const b64 = readFileSync(dir+'/'+f).toString('base64');
  const out = await p.eval(async (src)=>{const i=new Image();i.src='data:image/png;base64,'+src;await i.decode();const c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;c.getContext('2d').drawImage(i,0,0);return c.toDataURL('image/jpeg',0.86).split(',')[1];}, b64);
  writeFileSync(dir+'/'+f.replace('.png','.jpg'), Buffer.from(out,'base64')); unlinkSync(dir+'/'+f); console.log(f);
}
await b.close();
