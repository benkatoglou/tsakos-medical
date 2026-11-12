// Builds the minimal Europe line map (Natural Earth 50m land, public domain) as an inline SVG partial.
import { readFileSync, writeFileSync } from 'node:fs';
const gj = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const W = 800, H = 600, lon0 = -11, lon1 = 31, lat1 = 61.5, lat0 = 34;
const k = Math.cos(48 * Math.PI / 180);
const sx = W / ((lon1 - lon0) * k), sy = sx;
const Hc = (lat1 - lat0) * sy; // natural height
const P = ([lo, la]) => [ (lo - lon0) * k * sx, (lat1 - la) * sy ];
const inBox = (r) => r.some(([lo, la]) => lo > lon0 - 6 && lo < lon1 + 6 && la > lat0 - 6 && la < lat1 + 6);
let d = '';
for (const f of gj.features) {
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const poly of polys) for (const ring of poly) {
    if (!inBox(ring)) continue;
    let last = null, lx = -99, ly = -99, seg = "";
    for (const c of ring) { const [x, y] = P(c).map((v) => Math.round(v * 10) / 10); if (Math.hypot(x - lx, y - ly) < 2.2) continue; seg += (seg ? "L" : "M") + x + "," + y; lx = x; ly = y; }
    d += seg + 'Z';
  }
}
const cities = { thess: [22.94, 40.64], uk: [-0.13, 51.5], de: [8.68, 50.11], rs: [20.46, 44.79], it: [12.5, 41.9] };
const pt = Object.fromEntries(Object.entries(cities).map(([n, c]) => [n, P(c).map((v) => Math.round(v))]));
const arc = (a, b) => { const [x1, y1] = pt[a], [x2, y2] = pt[b]; const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - Math.hypot(x2 - x1, y2 - y1) * 0.22; return `M${x1},${y1}Q${Math.round(mx)},${Math.round(my)} ${x2},${y2}`; };
const labels = { uk: ['Ηνωμένο Βασίλειο', -1, -14], de: ['Γερμανία', 0, -14], rs: ['Σερβία', 12, 5, 'start'], it: ['Ιταλία', -10, 22, 'end'], thess: ['Θεσσαλονίκη', 14, 22, 'start'] };
let out = `<svg class="eu-map" viewBox="0 0 ${W} ${Math.round(Hc)}" role="img" aria-labelledby="map-title">\n<title id="map-title">Χάρτης Ευρώπης με συνδέσεις από τη Θεσσαλονίκη προς Ηνωμένο Βασίλειο, Γερμανία, Σερβία και Ιταλία</title>\n`;
out += `<path class="eu-map__land" d="${d}"/>\n<g class="eu-map__arcs">` + ['uk', 'de', 'rs', 'it'].map((c) => `<path d="${arc('thess', c)}"/>`).join('') + '</g>\n';
for (const [n, [x, y]] of Object.entries(pt)) {
  const [t, dx, dy, anchor = 'middle'] = labels[n];
  out += n === 'thess'
    ? `<g class="eu-map__home"><circle cx="${x}" cy="${y}" r="16" class="eu-map__halo"/><circle cx="${x}" cy="${y}" r="7"/></g><text x="${x + dx}" y="${y + dy}" text-anchor="${anchor}" class="eu-map__label eu-map__label--home">${t}</text>\n`
    : `<circle cx="${x}" cy="${y}" r="5" class="eu-map__pin"/><text x="${x + dx}" y="${y + dy}" text-anchor="${anchor}" class="eu-map__label">${t}</text>\n`;
}
out += '</svg>\n';
writeFileSync(process.argv[3], out);
console.log('bytes', out.length, pt);
