// Tautan Javanese House / Ruang Syntax → Studio Keputusan (pt-link-sk). Run: npm test
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo|window\.open/.test(e.message)) errs.push(e.message); });
const payload = { from: 'javanese-house', created: 1, name: 'Rumah uji', rooms: ['Teras', 'Ruang tamu', 'Ruang keluarga', 'Dapur', 'Kamar tidur'].map(n => ({ name: n, fn: 'lain' })),
  links: [[-1, 0], [0, 1], [1, 2], [2, 3], [2, 4], [3, 4]],
  design: [{ label: 'Mean depth', value: 2.2, type: 'c' }, { label: 'Integrasi rata-rata', value: 1.5, type: 'b' }],
  roomMetrics: [{ label: 'Depth', type: 'c' }, { label: 'Integrasi', type: 'b' }], roomValues: [[1, 0.9], [2, 1.4], [3, 2.1], [4, 1.2], [4, 1.1]] };
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://pindotutuko.id/wp-content/themes/pindotutuko/assets/apps/studio-keputusan/index.html?from=jh', virtualConsole: vc,
  beforeParse(w) { w.localStorage.setItem('pt-link-sk', JSON.stringify(payload)); w.open = () => ({}); } });
const w = dom.window; w.scrollTo = () => {};
const d = w.document, click = s => { const el = d.querySelector(s); assert(el, 'missing ' + s); el.click(); };
setTimeout(() => {
  assert(/Rumah uji/.test(d.querySelector('#linkIn').textContent), 'kartu tautan tampil');
  assert.strictEqual(w.location.search, '', 'parameter ?from dibersihkan');
  click('#bLinkJh'); const H = w.__jhCalc().H; assert.strictEqual(H.length, 1); assert.strictEqual(H[0].TD, 9); assert.strictEqual(H[0].R[0].name, 'Teras');
  click('#bLinkSx'); const sx = w.__sxCalc(); assert.strictEqual(sx.k, 6); assert(sx.connected);
  click('#bLinkTpAlt'); let tp = w.__tpCalc(); assert.strictEqual(tp.A.length, 1); assert.strictEqual(tp.C.length, 2); assert.strictEqual(tp.C[0].type, 'c');
  click('#bLinkTpRooms'); click('#bLinkTpRooms'); tp = w.__tpCalc(); assert(tp.ok); assert.strictEqual(tp.A.length, 5); assert.strictEqual(tp.rk[2], 1);
  // arah balik: modul Javanese House Depth → aplikasi Javanese House
  click('.rail button[data-step="jh-in"]'); click('#bJhToApp'); const back = JSON.parse(w.localStorage.getItem('pt-link-jh'));
  assert.strictEqual(back.graph.rooms.length, 5); assert.deepStrictEqual(back.graph.links.find(l => l[0] === -1), [-1, 0]); assert.strictEqual(back.graph.links.length, 5);
  click('.rail button[data-step="sx-in"]'); click('#bSxToApp'); const sb = JSON.parse(w.localStorage.getItem('pt-link-jh'));
  assert.strictEqual(sb.graph.rooms.length, 5); assert.strictEqual(sb.graph.links.length, 6);
  assert.deepStrictEqual(errs, []); console.log('Link checks passed'); process.exit(0);
}, 300);
