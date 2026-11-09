// v3.8: fraud & lintas bidang, visualisasi teknik, widget gaya Orange, rumpun ilmu Kepdirjen 163/E/KPT/2022 — dibandingkan dengan numpy / hitungan tangan
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo/.test(e.message)) errs.push(e.message); });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc });
const w = dom.window; w.scrollTo = () => {};
const near = (a, b, t = 1e-6) => assert(Math.abs(a - b) < t, `${a} != ${b}`);
setTimeout(() => {
  const X = w.__SKX, T = w.__SCI_TOOLS, U = w.__ui, G = w.__VG, OV = w.__OV, V = w.__v27, tool = (m, id) => T[m].find(t => t.id === id), ex = t => Object.fromEntries(t.f.map(f => [f[0], f[3]]));
  // Benford (hitungan Python): χ² dan MAD digit pertama
  const bf = tool('sains', 'benford'), vals = ex(bf).v.split(' ').map(Number), B = X.benford(vals, 1);
  near(B.chi, 13.540753972891027, 1e-9); near(B.mad, 0.0553266676302264, 1e-12); assert.strictEqual(B.N, 40); assert(/Tidak sesuai/.test(B.conf));
  near(B.rows[0].ep, Math.log10(2), 1e-12); assert.strictEqual(X.benford(vals, 2).rows.length, 90);
  // Altman (hitung tangan)
  const A = { wc: 1200, re: 2500, ebit: 900, mve: 6000, bve: 4200, tl: 5100, sales: 9800, ta: 9300 };
  near(X.altman(A, 'zpp').Z, 3.2378241619228336, 1e-12); near(X.altman(A, 'z').Z, 2.610183428209994, 1e-12); assert.strictEqual(X.altman(A, 'zpp').zone, 'Aman'); assert.strictEqual(X.altman(A, 'z').zone, 'Abu-abu');
  // Jones modifikasian (numpy.linalg.lstsq)
  const jr = tool('sains', 'jones'), R = ex(jr).rows.split('\n').map(l => l.split(';')).map(r => ({ k: r[0], ni: +r[1], cfo: +r[2], a: +r[3], drev: +r[4], drec: +r[5], ppe: +r[6] }));
  const J = X.jones(R); near(J.b[0], 73.26000552993374, 1e-7); near(J.b[1], 0.5043800474452491, 1e-10); near(J.b[2], -0.07707437506764982, 1e-10); near(J.da[0], -0.01512970766548331, 1e-10);
  // Piotroski, DiD, Markov
  assert.strictEqual(X.piotroski({ ni: 420, cfo: 600, ta: 8000, ltd: 2400, ca: 3100, cl: 2000, shares: 1000, sales: 9600, cogs: 7000 }, { ni: 510, cfo: 720, ta: 8300, ltd: 2100, ca: 3500, cl: 2050, shares: 1000, sales: 10400, cogs: 7400 }).F, 9);
  const D = X.did(ex(tool('sains', 'did')).rows.split('\n').map(l => l.split(';').map(Number)).map(r => ({ g: r[0], t: r[1], y: r[2] }))); near(D.did, 7.5, 1e-9); near(D.b[3], 7.5, 1e-9);
  const M = X.markov([[8, 2], [1, 9]], [100, 100], 2); near(M.P[0][1], 0.2); near(M.traj[1][0], 90); near(M.steady[0], 200 / 3, 1e-6);
  // rangka segitiga: reaksi 5 kN, batang miring −7,071 (tekan), batang bawah +5 (tarik)
  const tr = G.truss([[0, 0], [4, 0], [2, 2]], [[0, 1], [1, 2], [0, 2]], [[0, 'sendi'], [1, 'rol']], [[2, 0, -10]]);
  near(tr.N[0], 5, 1e-6); near(tr.N[1], -5 * Math.SQRT2, 1e-6); near(tr.N[2], -5 * Math.SQRT2, 1e-6); assert.strictEqual(tr.deg, 0); near(G.jointPoly([[0, 0], [4, 0], [2, 2]], tr, [[2, 0, -10]], 2).close, 0, 1e-6);
  // balok: wL²/8 dan 5wL⁴/(384EI)
  const bm = G.beam(8, 'simple', [], [[0, 8, 10]], 50000); near(bm.Mmax, 80, 1e-6); near(bm.Ra, 40, 1e-9); near(bm.ymax, -5 * 10 * 8 ** 4 / (384 * 50000), 1e-6);
  const kc = G.beam(3, 'cant', [[3, 12]], [], 1000); near(kc.Ma, -36, 1e-9); near(kc.ymax, -12 * 27 / 3000, 1e-6);
  // pipa (Colebrook, Python)
  const P = G.pipe(0.02, 0.1, 250, 0.000045, 0.00000089, 997); near(P.Re, 286121.24600790173, 1e-6); near(P.f, 0.017987385213841012, 1e-9); near(P.hf, 14.862411094777212, 1e-6); near(G.colebrook(1000, 0), 0.064, 1e-12);
  // semua alat baru berjalan dengan contoh bawaan
  ['benford', 'altman', 'jones', 'piotroski', 'did', 'markov', 'mind', 'flow', 'truss', 'beam', 'pipe', 'bubble'].forEach(id => { const r = tool('sains', id).run(ex(tool('sains', id))); assert(r.html && r.tsv.length, id); });
  assert(/<polygon/.test(G.flow('(Mulai) -> {Lanjut?} -> |ya| [Proses] -> (Selesai)').svg)); assert.strictEqual(G.mind('Topik\n  A\n    A1\n  B').n, 4);
  // model gaya Orange pada Iris (validasi silang)
  const iris = w.__IRIS.split(';').map(r => r.split(',').map(Number)), Xi = iris.map(r => r.slice(0, 4)), yi = iris.map(r => 'c' + r[4]);
  for (const [k, min] of [['logreg', 0.9], ['rf', 0.9], ['adaboost', 0.85], ['gb', 0.9], ['svm', 0.8], ['nn', 0.9], ['sgd', 0.8], ['constant', 0.3]]) { const r = V.evaluate(Xi, yi, k, {}, true, 'cv', 5, 1); assert(r.ca >= min, k + ' CA ' + r.ca); if (k !== 'constant') assert(r.auc > 0.85, k + ' AUC ' + r.auc); }
  near(OV.auc([.9, .8, .7, .6, .5, .4], [1, 1, 0, 1, 0, 0]).auc, 8 / 9, 1e-12); near(OV.calib([.1, .9], [0, 1]).brier, 0.01, 1e-12);
  // pengurai rumus, CRC32 ZIP
  const tab = { cols: [{ name: 'p', num: true, vals: [2] }, { name: 'l b', num: true, vals: [3] }], n: 1, role: {} };
  near(OV.formula('[p] * [l b] + 2^3', tab, 0), 14); assert.strictEqual(OV.formula('if([p] > 1; "besar"; "kecil")', tab, 0), 'besar'); near(OV.formula('round(sqrt(2); 3)', tab, 0), 1.414);
  assert.strictEqual(OV.crc(new TextEncoder().encode('hello')), 907060870);
  // widget kanvas: Data → Formula/Group by/Pivot, Data → LogReg → Test & Score → ROC
  const O = w.__OW(); O.nodes = [{ id: 'd', t: 'data', x: 0, y: 0, p: { src: 'iris' } }, { id: 'g', t: 'groupby', x: 0, y: 0, p: { g: 'iris', ops: 'count,mean' } }, { id: 'l', t: 'logreg', x: 0, y: 0, p: {} }, { id: 't', t: 'test', x: 0, y: 0, p: { k: 5 } }, { id: 'r', t: 'roc', x: 0, y: 0, p: {} }, { id: 'pv', t: 'pivot', x: 0, y: 0, p: { r: 'iris' } }, { id: 'pr', t: 'predictions', x: 0, y: 0, p: {} }];
  O.links = [['d', 'g'], ['d', 'l'], ['d', 't'], ['l', 't'], ['t', 'r'], ['d', 'pv'], ['d', 'pr'], ['l', 'pr']].map(([a, b], i) => ({ id: 'L' + i, a, b }));
  const gb = w.__owEval('g'); assert.strictEqual(gb.data.n, 3); near(gb.data.cols.find(c => c.name === 'n').vals[0], 50);
  const ts = w.__owEval('t'); assert(ts.results.out[0].auc > 0.9); assert(ts.results.out[0].prob.length === 150);
  assert(!w.__owEval('r').err); assert.strictEqual(w.__owEval('pv').data.cols[1].vals[0], 50); assert(w.__owEval('pr').out[0].ca > 0.9);
  // semua panel widget baru dirender tanpa galat
  { const d = w.document, go = m => { const b = d.createElement('button'); b.dataset.modgo = m; d.body.appendChild(b); b.click(); b.remove(); }; go('orange');
    const O2 = w.__OW(), kinds = ['info','colstats','editdom','savedata','sampler','selrows','transpose','unique','aggcols','groupby','pivot','preproc','continuize','discretize','randomize','purge','melt','formula','mkclass','splitcol','violin','barplot','lineplot','heatmap','mosaic','sieve','linproj','radviz','featpred','constant','logreg','rf','adaboost','gb','svm','nn','sgd'];
    O2.nodes = [{ id: 'd', t: 'data', x: 0, y: 0, p: { src: 'iris' } }, { id: 'km', t: 'kmeans', x: 0, y: 0, p: { k: 3 } }, { id: 'sil', t: 'silplot', x: 0, y: 0, p: {} }, { id: 'tr', t: 'tree', x: 0, y: 0, p: {} }, { id: 'tv', t: 'treeview', x: 0, y: 0, p: {} }, { id: 'py', t: 'pytree', x: 0, y: 0, p: {} }, { id: 'ts', t: 'test', x: 0, y: 0, p: { k: 5 } }, { id: 'ca', t: 'calib', x: 0, y: 0, p: {} }, { id: 'pc', t: 'perfcurve', x: 0, y: 0, p: {} }, { id: 'pf', t: 'paramfit', x: 0, y: 0, p: {} }, { id: 'pp', t: 'permplot', x: 0, y: 0, p: { n: 5 } }, { id: 'd2', t: 'data', x: 0, y: 0, p: { src: 'iris' } }, { id: 'mg', t: 'merge', x: 0, y: 0, p: {} }, { id: 'cc', t: 'concat', x: 0, y: 0, p: {} }, { id: 'vn', t: 'venn', x: 0, y: 0, p: {} }, ...kinds.map(k => ({ id: 'w_' + k, t: k, x: 0, y: 0, p: {} }))];
    O2.links = [['d', 'km'], ['km', 'sil'], ['d', 'tr'], ['tr', 'tv'], ['tr', 'py'], ['d', 'ts'], ['tr', 'ts'], ['ts', 'ca'], ['ts', 'pc'], ['d', 'pf'], ['tr', 'pf'], ['d', 'pp'], ['tr', 'pp'], ['d', 'mg'], ['d2', 'mg'], ['d', 'cc'], ['d2', 'cc'], ['d', 'vn'], ['d2', 'vn'], ...kinds.map(k => ['d', 'w_' + k])].map(([a, b], i) => ({ id: 'K' + i, a, b }));
    for (const nd of O2.nodes) { O2.sel = nd.id; const box = d.querySelector('#v27_ow_canvas') || d.body, b = d.createElement('button'); b.dataset.owpv = '_t'; b.dataset.v = '1'; box.appendChild(b); b.click(); b.remove(); const r = w.__owEval(nd.id); if (nd.t !== 'data') assert(!r.err || /target|belum/i.test(r.err), nd.t + ': ' + r.err); }
    assert(w.__owEval('pf').best && w.__owEval('pp').pv > 0 && w.__owEval('vn').sets[0].size === w.__owEval('vn').sets[1].size && w.__owEval('vn').sets[0].size > 140 && w.__owEval('mg').data.n === 150 && w.__owEval('cc').data.n === 300 && w.__owEval('sil').sil.mean > 0.3); }
  // rumpun ilmu (Kepdirjen Diktiristek 163/E/KPT/2022)
  const K = w.__kp; assert.strictEqual(K.KP_P.length, 574); assert.strictEqual(K.KP_S.length, 53); assert(K.kpSearch('arsitektur', '').some(p => p[1] === 'Arsitektur'));
  assert.strictEqual(K.kpSearch('', 'Formal').length, K.KP_P.filter(p => [17, 18, 19].includes(p[3])).length); K.kpSet(K.KP_P.find(p => p[1] === 'Rekayasa Sipil')[0]); assert.strictEqual(U.advField('apa saja').k, 'sipil'); K.kpSet(null);
  assert(K.kpKeywords(K.KP_P.find(p => p[1] === 'Farmasi')).some(k => k[0] === 'Pharmacy'));
  // pemandu tujuan
  const top = q => (U.skAdvise(q).top[0] || { it: [''] }).it[0];
  assert.strictEqual(top('pengaruh fraud triangle terhadap kecurangan laporan keuangan'), 'fraud_faktor');
  assert.strictEqual(top('analisis manajemen laba perusahaan manufaktur'), 'akrual');
  assert.strictEqual(top('prediksi financial distress perusahaan'), 'distress');
  assert.strictEqual(top('uji hukum benford pada belanja daerah'), 'benford');
  assert.strictEqual(top('dampak program bantuan sosial terhadap pendapatan rumah tangga'), 'did');
  assert.strictEqual(top('proyeksi perubahan penggunaan lahan sawah menjadi permukiman'), 'markov');
  assert.strictEqual(top('menghitung gaya batang rangka atap baja dengan metode cremona'), 'vz_truss');
  assert.strictEqual(top('membuat diagram hubungan ruang rumah tinggal'), 'vz_bubble');
  assert(html.includes('163/E/KPT/2022') && html.includes('Nigrini, M. J. (2012)') && html.includes('Breiman, L. (2001)') && html.includes('Colebrook, C. F. (1939)'));
  assert.strictEqual(errs.length, 0, errs.join('\n')); console.log('v38 ok'); process.exit(0);
}, 2500);
