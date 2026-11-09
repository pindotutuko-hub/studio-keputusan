// v3.9: PLS, SVM kernel, CN2, Scoring Sheet, Stacking, Nomogram, Paint Data, Datasets, SQL, Python (ekspor)
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo/.test(e.message)) errs.push(e.message); });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc });
const w = dom.window; w.scrollTo = () => {};
const near = (a, b, t = 1e-6) => assert(Math.abs(a - b) < t, `${a} != ${b}`);
setTimeout(() => {
  const V = w.__v27, L = V.learners, iris = w.__IRIS.split(';').map(r => r.split(',').map(Number)), X = iris.map(r => r.slice(0, 4)), y = iris.map(r => 'c' + r[4]);
  // PLS: dengan komponen = jumlah fitur, sama dengan OLS (numpy.linalg.lstsq pada data baku)
  const yr = iris.map(r => r[3]), Xr = iris.map(r => r.slice(0, 3)), Mp = L.pls.fit(Xr, yr, { nc: 3 }), Ml = L.linreg.fit(Xr, yr, {});
  Xr.slice(0, 10).forEach(x => near(L.pls.predict(Mp, x), L.linreg.predict(Ml, x), 1e-8)); assert(V.evaluate(Xr, yr, 'pls', { nc: 2 }, false, 'cv', 5, 1).r2 > 0.8);
  // SVM kernel: lingkaran (tidak terpisah linear) dipisahkan RBF
  const rng = V.rng(3), Xc = [], yc = []; for (let i = 0; i < 160; i++) { const a = rng() * 2 - 1, b = rng() * 2 - 1; Xc.push([a, b]); yc.push(a * a + b * b < 0.45 ? 'dalam' : 'luar'); }
  const lin = V.evaluate(Xc, yc, 'svm', {}, true, 'cv', 5, 1).ca, rbf = V.evaluate(Xc, yc, 'svm', { kernel: 'rbf', gamma: 2, C: 10 }, true, 'cv', 5, 1).ca; assert(rbf > 0.9 && rbf > lin + 0.15, `rbf ${rbf} lin ${lin}`);
  assert(V.evaluate(X, y, 'svm', { kernel: 'rbf' }, true, 'cv', 5, 1).ca > 0.9);
  // CN2: aturan pertama memisahkan setosa (petal length ≤ kuartil)
  const C = L.cn2.fit(X, y, {}); assert(C.rules[0].cls === 'c0' && C.rules[0].dc.c0 === C.rules[0].n); assert(C.rules[C.rules.length - 1].def); assert(V.evaluate(X, y, 'cn2', {}, true, 'cv', 5, 1).ca > 0.85);
  // Scoring sheet (biner): poin bilangan bulat, peluang 0–1, lebih baik dari tebakan
  const yb = y.map(v => v === 'c2' ? 'ya' : 'tidak'), S = L.scoring.fit(X, yb, { pos: 'ya', k: 3 }); assert(S.pts.every(Number.isInteger) && S.pts.length === 3); assert(V.evaluate(X, yb, 'scoring', { pos: 'ya', k: 3 }, true, 'cv', 5, 1).ca > 0.85);
  // Stacking kNN + Tree → logistik
  const st = V.evaluate(X, y, 'stack', { base: [{ t: 'knn', p: {} }, { t: 'tree', p: {} }] }, true, 'cv', 5, 1); assert(st.ca > 0.9 && st.auc > 0.9);
  // SQL lokal
  const O = w.__OV39, T = { cols: [{ name: 'kota', num: false, vals: ['A', 'A', 'B', 'B', 'B'] }, { name: 'luas ha', num: true, vals: [1, 3, 2, 4, 6] }], n: 5, role: {} };
  const q = O.sql('SELECT kota, COUNT(*) AS n, AVG([luas ha]) AS rerata FROM data WHERE [luas ha] > 1 GROUP BY kota ORDER BY rerata DESC', T);
  assert.deepStrictEqual(Array.from(q.cols[0].vals), ['B', 'A']); assert.deepStrictEqual(Array.from(q.cols[1].vals), [3, 1]); near(q.cols[2].vals[0], 4);
  assert.strictEqual(O.sql("SELECT * FROM data WHERE kota = 'A' LIMIT 1", T).n, 1); near(O.sql('SELECT [luas ha] * 2 AS dua FROM data ORDER BY dua DESC LIMIT 2', T).cols[0].vals[0], 12);
  assert(/read_csv/.test(O.py(T, 'data.csv')));
  // kanvas: Datasets → SQL; Paint → kNN → Test; logreg → Nomogram; CN2 → Rule Viewer; stacking dari dua model
  const OW = w.__OW(); OW.nodes = [{ id: 'ds', t: 'datasets', x: 0, y: 0, p: { ds: 'anscombe' } }, { id: 'sq', t: 'sql', x: 0, y: 0, p: { q: 'SELECT Set, AVG(y) AS ry FROM data GROUP BY Set' } }, { id: 'pa', t: 'paint', x: 0, y: 0, p: { pts: [[.1, .1, 'A'], [.2, .15, 'A'], [.15, .2, 'A'], [.8, .8, 'B'], [.9, .85, 'B'], [.85, .9, 'B'], [.12, .18, 'A'], [.88, .82, 'B'], [.2, .1, 'A'], [.9, .9, 'B']] } },
    { id: 'kn', t: 'knn', x: 0, y: 0, p: { k: 3 } }, { id: 'ts', t: 'test', x: 0, y: 0, p: { k: 5 } }, { id: 'ir', t: 'data', x: 0, y: 0, p: { src: 'iris' } }, { id: 'lr', t: 'logreg', x: 0, y: 0, p: {} }, { id: 'no', t: 'nomogram', x: 0, y: 0, p: {} }, { id: 'cn', t: 'cn2', x: 0, y: 0, p: {} }, { id: 'cv', t: 'cn2view', x: 0, y: 0, p: {} },
    { id: 'tr', t: 'tree', x: 0, y: 0, p: {} }, { id: 'sk', t: 'stack', x: 0, y: 0, p: {} }, { id: 'ts2', t: 'test', x: 0, y: 0, p: { k: 5 } }, { id: 'py', t: 'pyscript', x: 0, y: 0, p: {} }];
  OW.links = [['ds', 'sq'], ['pa', 'kn'], ['pa', 'ts'], ['kn', 'ts'], ['ir', 'lr'], ['lr', 'no'], ['ir', 'cn'], ['cn', 'cv'], ['ir', 'tr'], ['ir', 'sk'], ['tr', 'sk'], ['lr', 'sk'], ['ir', 'ts2'], ['sk', 'ts2'], ['ir', 'py']].map(([a, b], i) => ({ id: 'L' + i, a, b }));
  const sq = w.__owEval('sq'); assert.strictEqual(sq.data.n, 4); near(sq.data.cols[1].vals[0], 7.500909090909091, 1e-9);
  assert.strictEqual(w.__owEval('ts').results.out[0].ca, 1); assert(!w.__owEval('no').err); assert(w.__owEval('cv').fit.rules.length >= 2); { const t2 = w.__owEval('ts2'); assert(t2.results && t2.results.out[0].ca > 0.9, JSON.stringify(t2.err || (t2.results && t2.results.out[0].err))); } assert(/sklearn/.test(w.__owEval('py').code));
  // panel dirender tanpa galat
  { const d = w.document, go = m => { const b = d.createElement('button'); b.dataset.modgo = m; d.body.appendChild(b); b.click(); b.remove(); }; go('orange');
    for (const nd of OW.nodes) { OW.sel = nd.id; const b = d.createElement('button'); b.dataset.owpv = '_t'; b.dataset.v = '1'; (d.querySelector('#v27_ow_canvas') || d.body).appendChild(b); b.click(); b.remove(); } }
  assert(html.includes('Clark, P., &amp; Niblett, T. (1989)') && html.includes('Anscombe, F. J. (1973)'));
  assert.strictEqual(errs.length, 0, errs.join('\n')); console.log('v39 ok'); process.exit(0);
}, 2500);
