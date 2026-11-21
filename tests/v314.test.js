// v3.14: perbaikan hasil pemeriksaan bug seluruh modul
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const near = (a, b, t, m) => assert(Math.abs(a - b) < t, (m || '') + ' ' + a + ' vs ' + b);
function load(store) { const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo/.test(e.message)) errs.push(e.message); });
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc, beforeParse(w) { w.scrollTo = () => {}; for (const k in store) w.localStorage.setItem(k, JSON.stringify(store[k])); } });
  return { w: dom.window, errs }; }
const sp = (n) => [...Array(n)].map((_, i) => ({ id: 's' + i, name: ['Hall', 'a', 'b', 'c', 'd'][i] }));
const { w, errs } = load({
  'sk-cba-v1': { name: '', unit: 'juta', rate: 0, start: 2026, rows: [{ c: '0', b: '0' }, { c: '1000', b: '0' }, { c: '0', b: '600' }, { c: '0', b: '600' }], sample: false },
  'sk-cpm-v1': { mode: 'cpm', unit: 'hari', target: '', acts: [{ id: '1', code: 'A', pred: '', a: '', m: '3', b: '' }, { id: '2', code: 'A', pred: '', a: '', m: '5', b: '' }, { id: '3', code: 'B', pred: 'A', a: '', m: '1', b: '' }], sample: false },
  'sk-syntax-v2': { mode: 'convex', spaces: sp(5), links: { 's0>s1': 1, 's0>s2': 1, 's0>s3': 1, 's0>s4': 1, 's1>s2': 1 }, root: null, sample: false },
  'sk-bsc-v1': { org: '', cap: 120, pw: { fin: 100, cus: 0, int: 0, lrn: 0 }, k: { fin: [{ id: 'k', name: 'IKU', w: '1', target: '10', real: '0', pol: 'up' }] }, sample: false },
  // proyek parsial/rusak tidak boleh membuat aplikasi macet
  'ism-studio-ahp-v1': { crit: [{ id: 'x', name: 'K1' }, { id: 'y' }], alts: [] },
  'sk-topsis-v1': { crit: [{ id: 'c', name: 'K', type: 'b', w: '1' }], alts: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], x: { 'a|c': '5', 'b|c': '5' }, sample: false },
});
setTimeout(() => {
  const d = w.document;
  // CBA payback dengan tahun 0 kosong
  const cb = w.__cbCalc(); near(cb.pb, 1 + 1000 / 600 + 0, 1e-9, 'payback'); // kumulatif: 0, −1000, −400, +200 → 2 + 400/600 dihitung dari t0
  near(cb.pb, 2 + 400 / 600, 1e-9);
  // CPM kode ganda
  assert(w.__cpCalc().errs.some(e => /lebih dari sekali/.test(e)));
  // Space syntax: hall terhubung ke semua ruang → integrasi ∞, peringkat pertama
  const sx = w.__sxCalc(); const hall = sx.rows.find(r => r.name === 'Hall'); assert.strictEqual(hall.int, Infinity);
  // BSC realisasi 0 → 0 %
  const bs = w.__bsCalc(); assert.strictEqual(bs.P[0].rows[0].a, 0);
  // TOPSIS tidak dapat dibedakan
  const tp = w.__tpCalc(); assert(!tp.ok && tp.nodiff);
  // semua langkah dapat dibuka tanpa galat walau data AHP parsial
  ['ahp-crit', 'ahp-cmp', 'ahp-res', 'tp-res', 'sx-res', 'cb-res', 'cp-res', 'bs-res'].forEach(s => { const b = d.querySelector(`[data-step="${s}"]`); if (b) b.click(); });
  assert(/∞/.test(d.querySelector('[data-sec="sx-res"]').textContent), 'integrasi ∞ tampil');
  // regresi dengan banyak prediktor tidak membeku (VIF tidak rekursif tanpa batas)
  const st = w.__st, n = 60, X = [...Array(n)].map((_, i) => [1, ...[...Array(10)].map((_, j) => Math.sin(i * (j + 1)) + (i % (j + 2)))]), y = X.map((r, i) => r.reduce((a, b) => a + b, 0) + Math.cos(i));
  const t0 = Date.now(); const O = st.stOLS(y, X, null, {}); assert(O.ok && O.vif.length === 11); assert(Date.now() - t0 < 3000, 'VIF lambat ' + (Date.now() - t0));
  // OBJ indeks relatif & mesh besar
  const M = w.__vzObj('v 0 0 0\nv 1 0 0\nv 0 1 0\nf -3 -2 -1'); assert.strictEqual(M.f[0].join(','), '0,1,2');
  const big = { v: [...Array(300000)].map((_, i) => [i % 97, i % 89, i % 83]), f: [] }; assert(/<svg/.test(w.__vzMeshSvg(big)));
  assert(!errs.length, errs.join('\n'));
  // muatan kedua: dataset, psikometri, TOPSIS angka ribuan
  const B = load({
    'sk-dataset-v1': { text: 'Nama;Alamat;Skor;Biaya\n"Budi; S";RT 01,02;3.5;1.234,5\nCici;RT 03,04;4.25;2.000,25\nDedi;RT 05;5.5;300,5', name: '', sample: false },
    'sk-domain-v2': { psych: { rows: [{ name: 'R1', i1: 4, i2: 4, i3: 5, i4: 4 }, { name: 'R2', i1: 3, i2: 4, i3: 4, i4: 3 }, { name: 'R3', i1: 5, i2: 5, i3: 4, i4: 5 }, { name: 'R7', i1: '', i2: '', i3: '', i4: '' }] } },
    'sk-topsis-v1': { crit: [{ id: 'c', name: 'Harga', type: 'c', w: '1' }], alts: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], x: { 'a|c': '1.500.000', 'b|c': '900.000' }, sample: false },
  });
  setTimeout(() => { const W = B.w, D = W.__dsData();
    const col = n => D.cols.find(c => c.name === n); assert.strictEqual(col('Nama').vals[0], 'Budi; S'); assert.strictEqual(col('Skor').vals.join('|'), '3.5|4.25|5.5'); assert.strictEqual(col('Biaya').vals.join('|'), '1234.5|2000.25|300.5'); assert(!col('Alamat').num);
    const P = W.__domainCalc('psych'); assert.strictEqual(P.rows.length, 3); near(P.alpha, 0.9, 0.2);
    const T = W.__tpCalc(); assert(T.ok && T.rk[1] === 1, 'B (900 ribu) lebih murah'); 
    assert(!B.errs.length, B.errs.join('\n')); console.log('v3.14 perbaikan OK'); }, 400);
}, 400);
