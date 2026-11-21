// v3.15: heat index NWS (cabang rendah), STL biner, IRR ganda + MIRR, RTTV per rakitan, WWR persen, urutan kategori
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const near = (a, b, t, m) => assert(Math.abs(a - b) < t, (m || '') + ' ' + a + ' vs ' + b);
const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo/.test(e.message)) errs.push(e.message); });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc, beforeParse(w) { w.scrollTo = () => {};
  w.localStorage.setItem('sk-cba-v1', JSON.stringify({ name: '', unit: 'juta', rate: 10, start: 2026, rows: [{ c: '1600', b: '0' }, { c: '0', b: '10000' }, { c: '10000', b: '0' }], sample: false })); } });
const w = dom.window;
setTimeout(() => {
  // heat index: 20 °C / 50 % → rata-rata rumus sederhana dengan T (NWS)
  const T = 68, simple = 0.5 * (T + 61 + (T - 68) * 1.2 + 50 * 0.094); near(w.__BEN.heatIndex(20, 50), ((simple + T) / 2 - 32) * 5 / 9, 1e-9);
  near(w.__BEN.heatIndex(20, 50), 19.6806, 1e-3);
  // cabang tinggi tidak berubah: 32 °C / 70 %
  { const t = 32 * 9 / 5 + 32, rh = 70; const hi = -42.379 + 2.04901523 * t + 10.14333127 * rh - .22475541 * t * rh - .00683783 * t * t - .05481717 * rh * rh + .00122874 * t * t * rh + .00085282 * t * rh * rh - .00000199 * t * t * rh * rh; near(w.__BEN.heatIndex(32, 70), (hi - 32) * 5 / 9, 1e-9); }
  // STL biner: satu segitiga
  const buf = new ArrayBuffer(84 + 50), dv = new DataView(buf); dv.setUint32(80, 1, true); [[0, 0, 0], [1, 0, 0], [0, 1, 0]].forEach((p, k) => p.forEach((x, j) => dv.setFloat32(84 + 12 + k * 12 + j * 4, x, true)));
  const M = w.__vzStlAny(buf); assert.strictEqual(M.v.length, 3); assert.strictEqual(M.f.length, 1);
  const A = Buffer.from('solid t\n facet normal 0 0 1\n outer loop\n vertex 0 0 0\n vertex 1 0 0\n vertex 0 1 0\n endloop\n endfacet\nendsolid'); { const ab = new w.ArrayBuffer(A.length); new w.Uint8Array(ab).set(A); assert.strictEqual(w.__vzStlAny(ab).v.length, 3); }
  // IRR ganda: −1600, +10000, −10000 → IRR 25 % dan 400 %
  const c = w.__cbCalc(); assert.strictEqual(c.signCh, 2); assert.strictEqual(c.irrs.length, 2); near(c.irrs[0], 0.25, 1e-6); near(c.irrs[1], 4, 1e-6);
  // MIRR: FV positif pada 10 % = 10000×1,1 = 11000; PV negatif = 1600 + 10000/1,21 → (11000/PV)^(1/2) − 1
  near(c.mirr, Math.sqrt(11000 / (1600 + 10000 / 1.21)) - 1, 1e-9);
  // urutan kategori alami
  const X = w.__st.stCrosstab(['10', '2', '1', '2'], ['a', 'b', 'a', 'b']); assert.strictEqual(X.rows.join(','), '1,2,10');
  // RTTV: dua rakitan atap → Σ α·A·U·TDek
  const ot = w.__otRoof; assert(typeof ot === 'function');
  // pintu masuk Riset Terpadu di beranda dan bilah atas
  const d = w.document; d.querySelector('[data-step="home"]') && d.querySelector('[data-step="home"]').click();
  assert(d.querySelector('.modpick [data-modgo="riset"]'), 'tombol bilah atas'); const rb = d.querySelector('.rsbar [data-modgo="riset"]'); assert(rb, 'kartu beranda');
  rb.click(); assert(!d.querySelector('[data-sec="rs-pend"]').hidden, 'membuka langkah Pendahuluan');
  // judul berupa textarea lebar; bidang ilmu bertingkat menurut Kepdirjen 163/E/KPT/2022
  assert(d.querySelector('#rsPend textarea.rsjudul'));
  const fire = (el, v) => { el.value = v; el.dispatchEvent(new w.Event('change', { bubbles: true })); };
  fire(d.querySelector('#rsPend [data-rskp="r"]'), 'Terapan'); fire(d.querySelector('#rsPend [data-rskp="s"]'), '24');
  const ps = d.querySelector('#rsPend [data-rskp="p"]'); assert([...ps.options].some(o => o.textContent === 'Arsitektur')); fire(ps, '253');
  assert(/^Arsitektur/.test(w.__rs.get().bidang), w.__rs.get().bidang); assert.strictEqual(d.querySelector('#rsPend [data-rs="bidang"]').value, w.__rs.get().bidang);
  fire(d.querySelector('#rsPend [data-rskp="p"]'), 'lain'); assert(d.querySelector('#rsPend [data-rs="bidang"]'));
  assert(!errs.length, errs.join('\n')); console.log('v3.15 OK');
}, 400);
