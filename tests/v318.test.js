// v3.18: alur Orange “Image Analytics – Clustering” (Distances → Hierarchical Clustering dari matriks jarak, pilih klaster)
// dan Text Mining (Corpus, Preprocess Text, Bag of Words, Word Cloud).
// Angka acuan: SciPy pdist/linkage, scikit-learn silhouette_score(metric='precomputed') dan TfidfVectorizer (smooth idf, L2).
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo|scrollIntoView|getScreenCTM|getContext|toDataURL/.test(e.message)) errs.push(e.message); });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc });
const w = dom.window; w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
const d = w.document, $ = s => d.querySelector(s), click = s => { const el = $(s); assert(el, 'missing ' + s); el.click(); };
const go = m => { const b = d.createElement('button'); b.dataset.modgo = m; d.body.appendChild(b); b.click(); b.remove(); };
const near = (a, b, tol = 1e-9) => assert(Math.abs(a - b) < tol, `${a} != ${b}`);
setTimeout(() => {
  click('[data-setup="full"]');
  const V = w.__v27, T = w.__TXM;
  const X = [[1,2,0.5],[2,1,1.5],[0.3,0.2,4],[5,4,3],[4.5,5,2.5],[0.1,3,0.2]];
  // jarak = scipy pdist
  near(V.distMat(X,'cosine')[1][3], 0.02833239683805311); near(V.distMat(X,'cosine')[0][5], 0.10052779368441422);
  near(V.distMat(X,'pearson')[1][3], 0.5); near(V.distMat(X,'pearson')[0][5], 0.06546660728572684);
  near(V.distMat(X,'manhattan')[1][3], 7.5); near(V.distMat(X,'euclidean')[0][5], 1.3784048752090223);
  // linkage dari matriks jarak cosine = scipy linkage
  const Dc = V.distMat(X,"cosine"), rnd = Z => JSON.stringify(Z.map(z => [z[0], z[1], +z[2].toFixed(12), z[3]]));
  assert.deepStrictEqual(rnd(V.hclustD(Dc,'average')), rnd([[3,4,0.014670721835706835,2],[1,6,0.05486694030563133,3],[0,5,0.10052779368441422,2],[7,8,0.26508999520001136,5],[2,9,0.6054776431474304,6]]));
  assert.deepStrictEqual(rnd(V.hclustD(Dc,'ward')), rnd([[3,4,0.014670721835706835,2],[1,6,0.06986325324746277,3],[0,5,0.10052779368441422,2],[7,8,0.48324707631258473,5],[2,9,0.7880513869216766,6]]));
  assert.deepStrictEqual(rnd(V.hclustD(Dc,'single')), rnd([[3,4,0.014670721835706835,2],[1,6,0.02833239683805311,3],[0,7,0.04215046685017376,4],[5,8,0.10052779368441422,5],[2,9,0.3711852421754467,6]]));
  // hclustD(euclid) = hclust(X) lama
  assert.deepStrictEqual(rnd(V.hclustD(V.distMat(X),'ward')), rnd(V.hclust(X,'ward')));
  near(V.silhouetteD(Dc,[0,0,1,2,2,0]).mean, 0.058127179307082916);
  // TF-IDF = sklearn TfidfVectorizer (smooth idf, L2)
  const B = T.bow([{x:'banjir sungai rumah'},{x:'banjir saluran sampah banjir'},{x:'taman anak rumah'}].map(q => ({...q, tok: q.x.split(' ')})), {tf:'count', idf:'smooth', norm:'l2'});
  near(B.rows[1][B.V.indexOf('banjir')], 0.7323591428422148); near(B.rows[1][B.V.indexOf('saluran')], 0.4814821314936913); near(B.rows[1][B.V.indexOf('rumah')], 0);
  // praproses: stopword ID, angka, URL, bigram
  const P = T.prep([{t:'a',x:'Banjir di RT 03 yang parah, lihat https://contoh.id dan banjir lagi'}], {lang:'id', min:3, ngram:'12'});
  assert.deepStrictEqual(JSON.parse(JSON.stringify(P[0].tok.filter(t => !t.includes(" ")))), ['banjir','parah','lihat','banjir']); assert(P[0].tok.includes('banjir parah'));
  // tata letak awan: tidak ada kotak yang bertumpuk
  const F = T.freq(T.prep(T.fromText(w.__TX_SAMPLE), {lang:'both'})); assert.strictEqual(F[0].w, 'warga');
  const L = T.layout(F.slice(0,40).map(e => ({w:e.w, v:e.n, n:e.n, df:e.df}))); assert(L.items.length >= 35, 'kata tertata ' + L.items.length);
  // kanvas: template citra (alur video) → Distances cosine → hclust dari matriks jarak; pilih klaster → Image Viewer
  go('orange'); click('[data-owtpl="citra"]'); let ow = w.__OW();
  const dn = ow.nodes.find(n => n.t === 'distances'), hc = ow.nodes.find(n => n.t === 'hclust'), iv = ow.nodes.find(n => n.t === 'imgview');
  const rd = w.__owEval(dn.id); assert(rd.dist && rd.dist.M.length === 24 && rd.dist.metric === 'cosine');
  const rh = w.__owEval(hc.id); assert(rh.fromDist === 'cosine' && rh.k === 4 && rh.data.cols.find(c => c.name === 'Klaster'), 'hclust dari jarak');
  const cat = rh.data.cols.find(c => c.name === 'category'), kl = rh.data.cols.find(c => c.name === 'Klaster');
  const pur = [...new Set(kl.vals)].every(k => new Set(cat.vals.filter((_, i) => kl.vals[i] === k)).size === 1); assert(pur, 'klaster citra sintetis = kategori');
  hc.p.selc = 'C1'; const rh2 = w.__owEval(hc.id); assert(rh2.data.n === kl.vals.filter(v => v === 'C1').length && rh2.full.n === 24);
  assert(w.__owEval(iv.id).data.n === rh2.data.n, 'Image Viewer menerima klaster terpilih');
  for (const n of w.__OW().nodes) { const h = w.__owPanel(n.id); assert(h.length > 100, 'panel ' + n.t); }
  assert(/Peta panas matriks jarak/.test(w.__owPanel(dn.id)));
  // template teks: word cloud, bag of words → distances → hclust → data table
  click('[data-owtpl="teks"]'); click('[data-owtpl="teks"]'); ow = w.__OW();
  const wc = ow.nodes.find(n => n.t === 'wcloud'), bw = ow.nodes.find(n => n.t === 'bow'), h2 = ow.nodes.find(n => n.t === 'hclust'), tb = ow.nodes.find(n => n.t === 'table');
  const rw = w.__owEval(wc.id); assert(rw.L && rw.top[0].w === 'warga' && rw.corpus.docs.length === 12);
  wc.p.word = 'banjir'; const rw2 = w.__owEval(wc.id); assert.strictEqual(rw2.corpus.docs.length, 3);
  const rb = w.__owEval(bw.id); assert(rb.data.n === 12 && rb.nV > 20);
  const r2 = w.__owEval(h2.id); assert(r2.k === 3 && w.__owEval(tb.id).data.cols.find(c => c.name === 'Klaster'));
  // panel dirender tanpa galat
  for (const n of w.__OW().nodes) { const h = w.__owPanel(n.id); assert(h.length > 100 && !/undefined|NaN/.test(h.replace(/data-[a-z]+="[^"]*"/g,'')), 'panel ' + n.t); }
  const hp = w.__owPanel(h2.id); assert(/Dendrogram/.test(hp) && /data-owpv="selc"/.test(hp)); assert(/<svg[^>]*Word cloud/.test(w.__owPanel(wc.id)));
  assert.deepStrictEqual(errs, []);
  console.log('v318 OK');
}, 50);
