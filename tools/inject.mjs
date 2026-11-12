// Injects shared partials into pages between <!-- name:start --> and <!-- name:end --> markers. Idempotent.
import { readFileSync, writeFileSync } from 'node:fs';
const parts = { icons: 'assets/icons.svg', eumap: 'tools/_map.svg.html' };
for (const page of process.argv.slice(2)) {
  let html = readFileSync(page, 'utf8');
  for (const [name, file] of Object.entries(parts)) {
    const re = new RegExp(`(<!-- ${name}:start -->)[^]*?(<!-- ${name}:end -->)`, 'g');
    html = html.replace(re, (_, a, b) => `${a}\n${readFileSync(file, 'utf8').trim()}\n${b}`);
  }
  writeFileSync(page, html); console.log('injected', page);
}
