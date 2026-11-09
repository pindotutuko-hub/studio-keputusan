// v3.10: Cremona utuh, psikrometrik, hidrograf, kurva S, interaksi kolom, denah; widget Orange tambahan; Lampiran II Kepdirjen 163/E/KPT/2022
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo/.test(e.message)) errs.push(e.message); });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc });
const w = dom.window; w.scrollTo = () => {};
const near = (a, b, t = 1e-6) => assert(Math.abs(a - b) < t, `${a} != ${b}`);
setTimeout(() => {
  const VG = w.__VG, V = w.__v27, L = V.learners;
  // Cremona: segitiga, beban 10 di puncak → diagram tertutup, panjang garis = |gaya batang|
  { const nodes = [[0, 0], [4, 0], [2, 3]], mem = [[0, 1], [1, 2], [0, 2]], T = VG.truss(nodes, mem, [[0, 'sendi'], [1, 'rol']], [[2, 0, -10]]);
    const ex = nodes.map((_, j) => ({ j, fx: 0, fy: 0 })); ex[2].fy -= 10; T.R.forEach(r => { const j = Math.floor(r.d / 2); if (r.d % 2) ex[j].fy += r.v; else ex[j].fx += r.v; });
    const C = VG.cremona(nodes, mem, T, ex.filter(f => Math.hypot(f.fx, f.fy) > 1e-9)); near(C.err, 0, 1e-9);
    C.segs.filter(s => s.e.kind === 'm').forEach(s => { const a = C.pos[s.f1], b = C.pos[s.f2]; near(Math.hypot(a[0] - b[0], a[1] - b[1]), Math.abs(T.N[s.e.k]), 1e-9); });
    C.segs.filter(s => s.e.kind === 'x').forEach(s => { const a = C.pos[s.f1], b = C.pos[s.f2]; near(Math.hypot(a[0] - b[0], a[1] - b[1]), Math.hypot(s.e.f.fx, s.e.f.fy), 1e-9); });
    assert(VG.bowLabels(nodes, C).length >= 4); }
  // alat rangka batang bawaan: diagram Cremona ikut tergambar dan tertutup
  { const S = w.__SCI_TOOLS.sains, tr = S.find(t => t.id === 'truss'), v = {}; tr.f.forEach(f => v[f[0]] = f[3]); const R = tr.run(v); assert(/Diagram Cremona/.test(R.html), R.html.slice(-300)); const m = R.html.match(/Ketidaktertutupan diagram ([\d.,e-]+)/); assert(m && Math.abs(parseFloat(m[1].replace(',', '.'))) < 1e-3, m && m[1]); }
  // psikrometrik: 30 °C, RH 75 %, 101,325 kPa → w ≈ 0,0201 kg/kg (Magnus–Alduchov & Eskridge)
  { const p = VG.psy(30, 75); near(VG.psat(30), 0.61094 * Math.exp(17.625 * 30 / 273.04), 1e-12); near(p.w, 0.622 * p.pv / (101.325 - p.pv), 1e-12); near(p.w, 0.02014, 5e-5); near(p.td, 25.08, 0.05); }
  // SCS-CN: P = 100 mm, CN 80 → Q = (P − 0,2S)²/(P + 0,8S), S = 25400/CN − 254
  { const S = 25400 / 80 - 254; near(VG.scsQ(100, 80), (100 - 0.2 * S) ** 2 / (100 + 0.8 * S), 1e-9); assert.strictEqual(VG.scsQ(5, 80), 0);
    const H = VG.hydro(10, 80, [10, 30, 20], 1, 2); near(V.sum(H.ex), VG.scsQ(60, 80), 1e-9); near(H.tp, 0.5 + 0.6 * 2, 1e-12); near(H.qp, 0.208 * 10 / H.tp, 1e-12); assert(H.peak > 0 && H.tpeak > 0); }
  // kurva S: bobot terbagi rata, kumulatif berakhir di 100 %
  { const S = VG.scurve([{ s: 1, d: 2, w: 40 }, { s: 2, d: 3, w: 60 }], 5); assert.deepStrictEqual(Array.from(S.plan), [20, 40, 20, 20, 0]); near(S.cum[4], 100); }
  // diagram interaksi kolom: P0 = 0,85 f′c (Ag − Ast) + fy Ast; φPn,max = 0,8·0,65·P0 (sengkang)
  { const As = 3 * Math.PI * 19 * 19 / 4, P = VG.colPM(400, 400, 30, 420, [{ d: 60, As }, { d: 340, As }], true), Ast = 2 * As;
    near(P.P0, (0.85 * 30 * (160000 - Ast) + 420 * Ast) / 1000, 1e-9); near(P.Pmax, 0.52 * P.P0, 1e-9); near(P.b1, 0.85 - 0.05 * 2 / 7, 1e-12);
    assert(P.pts.every(q => q.Pn <= P.Pmax + 1e-9)); near(P.pts[P.pts.length - 1].Pn, -0.9 * 420 * Ast / 1000, 1e-9); assert(Math.max(...P.pts.map(q => q.Mn)) > 100); }
  // denah: luas sel ruang = luas program × (W·(H−koridor)/neto); bruto = neto × (1 + sirkulasi)
  { const R = VG.plan([{ t: 'Ruang tamu', a: 20, z: 1 }, { t: 'Kamar', a: 12, z: 3 }, { t: 'Dapur', a: 9, z: 4 }], 1.5, 0.2); near(R.net, 41); near(R.gross, 49.2); near(R.W * R.H, 49.2, 1e-9);
    near(R.cells.reduce((s, c) => s + c.w * c.h, 0), 49.2, 1e-6); assert(/<svg/.test(VG.planSVG(R))); }
  // alat SCI baru dijalankan dengan nilai bawaan tanpa galat
  for (const id of ['plan', 'psy', 'hydro', 'scurve', 'colpm']) { const t = w.__SCI_TOOLS.sains.find(x => x.id === id); assert(t, id); const v = {}; t.f.forEach(f => v[f[0]] = f[3]); const R = t.run(v); assert(R.html && /<svg/.test(R.html) && !/NaN/.test(R.html), id + ': ' + String(R.html).slice(0, 200)); }
  // Curve Fit (Levenberg–Marquardt): y = 2·e^(0,3x) dipulihkan; rumus sendiri
  { const X = [...Array(12)].map((_, i) => [i * 0.5]), y = X.map(x => 2 * Math.exp(0.3 * x[0])), M = L.curvefit.fit(X, y, { model: 'exp' }); near(M.th[0], 2, 1e-4); near(M.th[1], 0.3, 1e-5);
    const M2 = L.curvefit.fit(X, X.map(x => 1 + 3 * x[0] * x[0]), { model: 'custom', expr: 'a + b*x1^2' }); near(M2.th[1], 3, 1e-5); near(L.curvefit.predict(M2, [2]), 13, 1e-4); }
  // Calibrated Learner: peluang terkalibrasi berjumlah 1, akurasi tetap baik
  const iris = w.__IRIS.split(';').map(r => r.split(',').map(Number)), Xi = iris.map(r => r.slice(0, 4)), yi = iris.map(r => 'c' + r[4]);
  { for (const method of ['sigmoid', 'isotonic']) { const M = L.calibl.fit(Xi, yi, { method, base: [{ t: 'nb', p: {} }] }); const P = L.calibl.proba(M, Xi[0]); near(Object.values(P).reduce((a, b) => a + b, 0), 1, 1e-9); }
    assert(V.evaluate(Xi, yi, 'calibl', { base: [{ t: 'logreg', p: {} }] }, true, 'cv', 5, 1).ca > 0.9); }
  // FreeViz: jangkar pada lingkaran satuan, proyeksi memisahkan kelas
  { const O = w.__OV310, S = Xi.map(x => x.map((v, j) => (v - V.mean(Xi.map(r => r[j]))))), F = O.freeviz(S, yi, 40); assert(F.A.every(a => Math.hypot(a[0], a[1]) <= 1 + 1e-9)); assert.strictEqual(F.P.length, 150); }
  // Save/Load Model: JSON → model dimuat memberi prediksi sama
  { const O = w.__OV310; for (const [t, p] of [['logreg', {}], ['rf', { trees: 5 }], ['svm', { kernel: 'rbf' }], ['tree', {}], ['knn', {}], ['nb', {}], ['nn', { iter: 30 }], ['gb', { n: 10 }]]) { if (!L[t]) continue; const M = L[t].fit(Xi, yi, p, true), J = JSON.parse(JSON.stringify(M, (k, v) => typeof v === 'function' ? undefined : v)), R = O.revive(J, t, p);
      Xi.slice(0, 30).forEach(x => assert.strictEqual(String(L[t].predict(R, x)), String(L[t].predict(M, x)), t)); } }
  // kanvas: Data → Apply Domain / Select by Data Index / Create Instance / FreeViz / RF → Pythagorean Forest / Save Model; Load Model → Predictions
  const OW = w.__OW(); OW.nodes = [{ id: 'ir', t: 'data', x: 0, y: 0, p: { src: 'iris' } }, { id: 'sa', t: 'sampler', x: 0, y: 0, p: { pct: 30 } }, { id: 'ad', t: 'applydom', x: 0, y: 0, p: {} }, { id: 'si', t: 'selidx', x: 0, y: 0, p: {} }, { id: 'ci', t: 'createinst', x: 0, y: 0, p: {} },
    { id: 'fv', t: 'freeviz', x: 0, y: 0, p: { it: 20 } }, { id: 'rf', t: 'rf', x: 0, y: 0, p: { trees: 4 } }, { id: 'pf', t: 'pyforest', x: 0, y: 0, p: {} }, { id: 'sm', t: 'savemodel', x: 0, y: 0, p: {} }, { id: 'co', t: 'color', x: 0, y: 0, p: { pal: 'okabe' } },
    { id: 'cf', t: 'curvefit', x: 0, y: 0, p: {} }, { id: 'cl', t: 'calibl', x: 0, y: 0, p: {} }, { id: 'lg', t: 'logreg', x: 0, y: 0, p: {} }, { id: 'ts', t: 'test', x: 0, y: 0, p: { k: 5 } }, { id: 'lm', t: 'loadmodel', x: 0, y: 0, p: {} }, { id: 'pr', t: 'predictions', x: 0, y: 0, p: {} }];
  OW.links = [['ir', 'sa'], ['ir', 'ad'], ['sa', 'ad'], ['ir', 'si'], ['sa', 'si'], ['ir', 'ci'], ['ir', 'fv'], ['ir', 'rf'], ['rf', 'pf'], ['rf', 'sm'], ['ir', 'co'], ['ir', 'lg'], ['ir', 'cl'], ['lg', 'cl'], ['ir', 'ts'], ['cl', 'ts'], ['ci', 'pr'], ['lm', 'pr']].map(([a, b], i) => ({ id: 'L' + i, a, b }));
  { const sa = w.__owEval('sa'); assert(sa.data, JSON.stringify(sa.err)); const si = w.__owEval('si'); assert.strictEqual(si.data.n, sa.data.n, JSON.stringify(si.err)); const ad = w.__owEval('ad'); assert.strictEqual(ad.data.n, 150);
    assert.strictEqual(w.__owEval('ci').data.n, 1); assert(w.__owEval('fv').F, JSON.stringify(w.__owEval('fv').err)); assert(w.__owEval('pf').fit.T.length === 4); assert(w.__owEval('sm').fit);
    const ts = w.__owEval('ts'); assert(ts.results && ts.results.out[0].ca > 0.9, JSON.stringify(ts.err || ts.results && ts.results.out[0].err));
    const M = w.__owEval('rf'); OW.nodes.find(n => n.id === 'lm').p.model = JSON.stringify({ t: 'rf', p: { trees: 4 }, names: M.names, cls: M.cls, tname: M.tname, fit: M.fit }, (k, v) => typeof v === 'function' ? undefined : v);
    for (const k in w.__OWM || {}) delete w.__OWM[k];
    const pr = w.__owEval('pr'); assert(pr.data && !pr.err, JSON.stringify(pr.err)); }
  // panel semua widget baru dirender tanpa galat
  { const d = w.document, go = m => { const b = d.createElement('button'); b.dataset.modgo = m; d.body.appendChild(b); b.click(); b.remove(); }; go('orange');
    for (const nd of OW.nodes) { OW.sel = nd.id; const b = d.createElement('button'); b.dataset.owpv = '_t'; b.dataset.v = '1'; (d.querySelector('#v27_ow_canvas') || d.body).appendChild(b); b.click(); b.remove(); } }
  // peta riset: jejaring kecil (3 penulis) digambar rapat di tengah, tidak melebar ke tepi
  { const N = [{ c: 1 }, { c: 1 }, { c: 1 }]; w.__OV310.litLayout(N, [{ i: 0, j: 1, w: 1 }, { i: 1, j: 2, w: 1 }, { i: 0, j: 2, w: 1 }]); const xs = N.map(n => n.x), ys = N.map(n => n.y);
    assert(Math.max(...xs) - Math.min(...xs) <= (1000 - 220) * 0.48 + 1e-6 && Math.min(...xs) > 250 && Math.max(...ys) < 640 - 150, JSON.stringify(N));
    const N2 = [...Array(40)].map(() => ({ c: 1 })); w.__OV310.litLayout(N2, []); near(Math.max(...N2.map(n => n.x)) - Math.min(...N2.map(n => n.x)), 780, 1e-6); }
  // Lampiran II: 20 program profesi + 61 spesialis; tetap 574 prodi Lampiran I
  { const K = w.__kp; assert.strictEqual(K.KP_P.filter(p => p[5] === 'II.I').length, 20); assert.strictEqual(K.KP_P.filter(p => p[5] === 'II.II').length, 61); assert.strictEqual(K.KP_P.filter(p => !p[5]).length, 574); assert.strictEqual(K.KP_S.length, 56);
    assert(K.kpSearch('profesi arsitek', '').some(p => p[1] === 'Pendidikan Profesi Arsitek')); assert(new Set(K.KP_P.map(p => p[0])).size === K.KP_P.length); }
  assert(html.includes('Demšar, J., Leban, G., &amp; Zupan, B. (2007)') && html.includes('Marquardt, D. W. (1963)') && html.includes('Alduchov, O. A., &amp; Eskridge, R. E. (1996)'));
  assert.strictEqual(errs.length, 0, errs.join('\n')); console.log('v310 ok'); process.exit(0);
}, 2500);
