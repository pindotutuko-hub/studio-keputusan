// v2.9: Studio Kualitatif (gaya NVivo), Analisis Skala, Analisis Citra (gaya Orange Image Analytics).
// Angka acuan: scikit-learn cohen_kappa_score, SciPy linkage(average) & linear_sum_assignment & kurtosis,
// scikit-image graycomatrix/graycoprops, NumPy (α, colourfulness), optimisasi ULS/minres SciPy (ω).
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo|scrollIntoView|getScreenCTM|getContext|toDataURL/.test(e.message)) errs.push(e.message); });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc });
const w = dom.window; w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
const d = w.document, $ = s => d.querySelector(s), click = s => { const el = $(s); assert(el, 'missing ' + s); el.click(); };
const go = m => { const b = d.createElement('button'); b.dataset.modgo = m; d.body.appendChild(b); b.click(); b.remove(); };
const step = s => click(`.rail button[data-step="${s}"]`);
const near = (a, b, tol = 1e-6) => assert(Math.abs(a - b) < tol, `${a} != ${b}`);
setTimeout(() => {
  click('[data-setup="full"]');
  const Q = w.__QSE, I = w.__IMGE;
  // Cohen's kappa = sklearn
  near(Q.kappa([1,1,0,0,1,0,1,1,0,0,1,0],[1,0,0,0,1,1,1,1,0,0,0,0]).k, 0.5);
  // UPGMA = scipy linkage average
  assert.strictEqual(JSON.stringify(Q.upgma([[0,.2,.9,.8],[.2,0,.7,.85],[.9,.7,0,.3],[.8,.85,.3,0]]).map(z=>[z[0],z[1],+z[2].toFixed(6),z[3]])), JSON.stringify([[0,1,0.2,2],[2,3,0.3,2],[4,5,0.8125,4]]));
  // skala: α & ω pada contoh KH1–KH4 (150 responden) = NumPy & ULS
  go('scale'); click('#bScSample'); step('sc-res'); const sc = w.__scCalc(); assert(sc.ok); near(sc.alpha, 0.8091140642303434, 1e-9); near(sc.omega, 0.81162203, 2e-7); assert.strictEqual(sc.n, 150); assert($('#v27_sc_res table'));
  // kualitatif: contoh, semua langkah, κ & matrix
  go('qdas'); click('#bQsSample'); ['qs-code','qs-query','qs-matrix','qs-viz','qs-kappa'].forEach(s => { step(s); assert($('#v27_' + s.replace(/-/g,'_') + ' h1'), s); });
  const K = w.__qsCalc.kappa(), bj = K.find(r => r.n.name === 'Banjir musiman'); assert.strictEqual([bj.a,bj.b,bj.c,bj.d].join(), '3,1,1,7'); near(bj.k, 0.625);
  const M = w.__qsCalc.matrix(); assert.strictEqual(M.cols.length, 4); assert.strictEqual(M.M[0].reduce((s,x)=>s+x,0), 7);
  assert.strictEqual(w.__qsCalc.freq().list[0].w, 'air');
  step('qs-code'); d.querySelector('[data-qsu]').click(); const nb = d.querySelector('[data-qscode]'); nb.click(); assert(w.__QSD().seg[w.__QSD().cur + '|0'].A.length === 1, 'coding paragraf');
  // citra: fitur = scikit-image / NumPy, Image Grid = SciPy
  let s = 11; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; const W = 24, H = 18, px = new Uint8ClampedArray(W*H*4);
  for (let i = 0; i < W*H; i++) { px[4*i] = Math.floor(rnd()*256); px[4*i+1] = Math.floor((i%W)/W*255); px[4*i+2] = Math.floor(rnd()*120); px[4*i+3] = 255; }
  const G = I.glcm(I.gray(px,W,H),W,H); near(G.contrast, 1.152919863597613, 1e-9); near(G.homogeneity, 0.6277813299232737, 1e-9); near(G.energy, 0.2237910601149703, 1e-9); near(G.correlation, 0.7427617028219279, 1e-9);
  near(I.colourfulness(px,W,H), 142.02070828239079, 1e-9); near(I.entropy(I.gray(px,W,H)), 4.544282855125551, 1e-9);
  const P = [...Array(13)].map(() => [rnd()*3, rnd()*rnd()*5]), C = [...Array(7)].map(() => [...Array(7)].map(() => Math.round(rnd()*100)));
  assert.strictEqual(I.hungarian(C).reduce((t,j,i)=>t+C[i][j],0), 84); const gr = I.imageGrid(P); assert.strictEqual([gr.gx,gr.gy].join(),'6,4'); near(gr.cost, 0.22515685371463806, 1e-12);
  // kanvas: template analisis citra → klaster sesuai kategori, kNN sempurna pada citra sintetis
  go('orange'); click('[data-owtpl="citra"]'); const ow = w.__OW(); const hc = ow.nodes.find(n => n.t === 'hclust'); const r = w.__owEval(hc.id); assert(r.data && r.data.cols.find(c => c.name === 'Klaster'), 'hclust citra');
  const ig = ow.nodes.find(n => n.t === 'imggrid'); const g = w.__owEval(ig.id); assert(g.G && g.keep.length === 24);
  assert.deepStrictEqual(errs, []);
  console.log('v29 OK');
}, 300);
