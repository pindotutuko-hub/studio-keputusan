// v2.7: MCDM Lab, ketidakpastian, kuadran, visualisasi statistik, kanvas gaya Orange, ekspor–impor, glosarium, panduan.
// Angka acuan dicocokkan dengan NumPy/SciPy (linprog, linkage) dan scikit-learn (KMeans, PCA, GaussianNB, DecisionTree, KNN, f_classif).
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo|scrollIntoView|getScreenCTM/.test(e.message)) errs.push(e.message); });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc });
const w = dom.window; w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
const d = w.document, $ = s => d.querySelector(s), click = s => { const el = $(s); assert(el, 'missing ' + s); el.click(); };
const go = m => { const b = d.createElement('button'); b.dataset.modgo = m; d.body.appendChild(b); b.click(); b.remove(); };
const step = s => click(`.rail button[data-step="${s}"]`);
const near = (a, b, tol = 1e-5) => assert(Math.abs(a - b) < tol, `${a} != ${b}`);
const arr = (a, b, tol = 1e-5) => { assert.strictEqual(a.length, b.length); a.forEach((x, i) => near(x, b[i], tol)); };
setTimeout(() => {
  click('[data-setup="full"]');
  const V = w.__v27;
  // --- mesin MCDM (contoh lokasi permukiman) ---
  const X = [[1.2,12,6,2,6],[2.1,5,8,4,8],[1.5,9,7,2,7],[2.8,4,9,1,9]], W = [.25,.2,.2,.2,.15], T = ['c','c','b','c','b'];
  const m = V.mcdm(X, W, T, {});
  arr(m.saw.score, [0.65,0.663968,0.661111,0.857143]); arr(m.wp.score, [0.227848,0.227223,0.240901,0.304028]); arr(m.topsis.score, [0.523,0.4316,0.5948,0.6189], 1e-4);
  arr(m.vikor.Q, [0.785714,0.602476,0.302557,0.5]); arr(m.promethee.score, [-0.3,-0.1,-0.1,0.5]); arr(m.moora.score, [-0.163825,-0.168184,-0.122743,-0.056675]);
  arr(V.entropyW(X).w, [0.184385,0.328163,0.040181,0.40709,0.040181]); arr(V.criticW(X, T).w, [0.357296,0.16282,0.142319,0.195247,0.142319]);
  const bw = V.bwm(0, 3, [1,2,4,8,3], [8,4,2,1,3]); arr(bw.w, [0.448087,0.229508,0.114754,0.054645,0.153005]); near(bw.xi, 0.010929, 1e-6);
  const u = V.uncert([[200,100,-120],[90,50,-20],[0,0,0]], [.3,.5,.2], .6, false); near(u.evpi, 24, 1e-9); assert.deepStrictEqual(u.crit.find(c => c.k === 'regret').win, [1]);
  // --- mesin data mining (Iris) ---
  const I = w.__IRIS.split(';').map(r => r.split(',').map(Number));
  const XI = I.map(r => r.slice(0, 4)), yI = I.map(r => ['setosa','versicolor','virginica'][r[4]]);
  const km = V.kmeans(XI, 3, 1); near(km.inertia, 78.851441, 1e-4); near(V.silhouette(XI, km.lab).mean, 0.552819, 1e-5);
  arr(V.hclust(XI, 'ward').slice(-3).map(z => z[2]), [6.399407,12.300396,32.447607]); arr(V.pca(XI).ratio, [0.924619,0.053066,0.017103,0.005212]);
  const rk = V.rankFeatures(XI, yI, ['sl','sw','pl','pw'], true); assert.strictEqual(rk[0].name, 'pl'); near(rk[0].score, 1180.161, 1e-3);
  near(V.evaluate(XI, yI, 'tree', { depth: 3, leaf: 1 }, true, 'train', 10, 1).ca, 0.973333, 1e-5);
  // --- modul baru: alur UI ---
  go('mcdm'); click('#bMcSample'); step('mc-w'); click('[data-wm="critic"]'); step('mc-res'); const mc = w.__mcCalc(); assert(mc.ok); assert.strictEqual(mc.wUsed, 'critic'); assert.strictEqual(mc.act.length, 6); assert($('#v27_mc_res table')); step('mc-sens'); assert($('#v27_mc_sens svg'));
  go('uncert'); click('#bDuSample'); step('du-res'); const du = w.__duCalc(); assert(du.ok && du.hasP); assert($('#v27_du_res svg'));
  go('quadrant'); click('#bQdSample'); step('qd-res'); const qd = w.__qdCalc(); assert(qd.ok); assert.strictEqual(qd.n, 20); assert.strictEqual(Object.values(qd.groups).reduce((s, g) => s + g.length, 0), 20); assert($('#v27_qd_res .qdgrid'));
  go('stat'); step('ss-data'); click('.dsSample'); step('ss-viz'); ['hist','box','scatter','bar','heat','qq'].forEach(t => { click(`[data-svt="${t}"]`); assert($('#svFig svg'), 'viz ' + t); });
  // kanvas: template data mining dan template metode
  go('orange'); click('[data-owtpl="klaster"]'); const ow = w.__OW(); const kmn = ow.nodes.find(n => n.t === 'kmeans'); const r = w.__owEval(kmn.id); assert(r.k >= 2 && r.sil.mean > 0.3, 'kmeans node');
  const pca = ow.nodes.find(n => n.t === 'pca'); assert(w.__owEval(pca.id).P);
  click('[data-owtpl="klasifikasi"]'); click('[data-owtpl="klasifikasi"]'); const ts = w.__OW().nodes.find(n => n.t === 'test'); const tr = w.__owEval(ts.id); assert(tr.results && tr.results.out.length === 3 && tr.results.out.every(o => o.ca > 0.9), 'test&score');
  click('[data-owtpl="keputusan"]'); click('[data-owtpl="keputusan"]'); assert(w.__OW().nodes.some(n => n.t === 'm:ahp')); click('[data-owemb="__quick"]') ;
  // ekspor–impor: proyek memuat modul baru, paket metode dapat diimpor
  const exp = w.__exportObj(); assert(exp.mcdm && exp.uncert && exp.quadrant && exp.orange); assert(w.__MSTORE().length >= 30);
  go('io'); assert($('#v27_io table')); go('gloss'); assert(d.querySelectorAll('.gitem').length === w.__glossN);
  go('manual'); assert(d.querySelectorAll('.mansec').length > 30); assert($('#man-m-mcdm') && $('#man-statistik'));
  go('home'); assert($('#learnCats')); assert(d.querySelectorAll('#learnCats .mcard').length > 30);
  assert(d.body.textContent.includes('You Ari Faeni'));
  setTimeout(() => { if (errs.length) { console.error(errs.slice(0, 5)); process.exit(1); } console.log('v2.7 checks passed'); process.exit(0); }, 600);
}, 700);
