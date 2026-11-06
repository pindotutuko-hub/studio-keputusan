// v3.7: biologi laut & perikanan, farmakologi & toksikologi — dibandingkan dengan scipy/numpy
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo/.test(e.message)) errs.push(e.message); });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc });
const w = dom.window; w.scrollTo = () => {};
const near = (a, b, t = 1e-6) => assert(Math.abs(a - b) < t, `${a} != ${b}`);
setTimeout(() => {
  const X = w.__SKX, T = w.__SCI_TOOLS, U = w.__ui, tool = (m, id) => T[m].find(t => t.id === id), ex = t => Object.fromEntries(t.f.map(f => [f[0], f[3]]));
  // komunitas: Morisita & Bray–Curtis (scipy.spatial.distance.braycurtis)
  const C = X.comm(['a', 'b'], [[5, 0, 3], [1, 4, 0]]);
  near(C.rows[0].Id, 3 * 26 / (8 * 7)); near(C.rows[0].chi, 4.75); near(C.BC[0][1], 0.8); near(C.BC[0][2], 1 / 3); near(C.BC[1][2], 1);
  assert(/<path/.test(X.dendroSVG(C.tree, ['S1', 'S2', 'S3'])));
  assert(/Mengelompok/.test(tool('sains', 'comm').run(ex(tool('sains', 'comm'))).html));
  // panjang–berat (numpy.polyfit pada log10)
  const lw = tool('sains', 'lw'), L = lw.f[0][3].split(' ').map(Number), Wt = lw.f[1][3].split(' ').map(Number), R = X.lw(L, Wt);
  near(R.a, 0.008340215556896787, 1e-12); near(R.b, 3.139851324108614, 1e-10); near(R.K[0], 100 * 6.1 / 8.2 ** 3, 1e-12);
  // CPUE & Schaefer: MSY = −a²/(4b)
  const M = X.cpue([{ c: 100, e: 10 }, { c: 160, e: 20 }, { c: 180, e: 30 }, { c: 160, e: 40 }]);
  near(M.a, 12, 1e-9); near(M.b, -0.2, 1e-9); near(M.Emsy, 30, 1e-9); near(M.MSY, 180, 1e-9);
  // bioakumulasi & THQ
  const rb = tool('sains', 'bcf').run(ex(tool('sains', 'bcf'))); near(rb.tsv[1][4], 105, 1e-9); near(rb.tsv[1][6], (365 * 30 * 0.03 * 0.42) / (0.0035 * 60 * 365 * 30), 1e-12);
  // dosis–respons 4PL (scipy.optimize.curve_fit)
  const F = X.fourPL([10, 20, 40, 60, 80, 100, 150], [12.1, 21.4, 35.2, 48.7, 60.3, 71.8, 84.5]);
  near(F.EC50, 84.26644437703693, 1e-3); near(F.hill, 1.48919851, 1e-4); near(F.bottom, 8.51418308, 1e-3);
  assert(Math.abs(F.f(Math.log10(F.abs50)) - 50) < 1e-6);
  const Lr = X.linIC50([10, 20, 40, 60, 80, 100, 150], [12.1, 21.4, 35.2, 48.7, 60.3, 71.8, 84.5]); near(Lr.IC50, 70.03116434498553, 1e-9);
  const F2 = X.fourPL([1, 3, 10, 30, 100, 300, 1000], [4.2, 9.8, 23.5, 48.9, 74.1, 89.6, 95.3]); near(F2.logEC50, 1.50897922, 1e-6); near(F2.se[2], 0.01748746, 1e-5);
  // probit (MLE scipy Nelder–Mead)
  const P = X.probit([10, 18, 32, 56, 100], [10, 10, 10, 10, 10], [1, 2, 4, 6, 9], 0);
  near(P.b0, -3.92196042, 1e-5); near(P.b1, 2.47671632, 1e-5); near(P.LD50, 38.3294295, 1e-4); assert(P.lo < P.LD50 && P.hi > P.LD50);
  near(X.ninv(0.975), 1.959963984540054, 1e-8); near(X.ninv(0.01), -2.3263478740408408, 1e-8);
  // farmakokinetik non-kompartemen
  const t = [0, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 24], c = [0, 2.8, 4.6, 5.4, 5.2, 4.3, 3.5, 2.3, 1.5, 0.65, 0.06];
  const N1 = X.nca(t, c, 500, 'lin'); near(N1.auc, 34.51, 1e-9); near(N1.aumc, 183.39, 1e-9); near(N1.lz, 0.20359864032524233, 1e-10);
  const N2 = X.nca(t, c, 500, 'log'); near(N2.auc, 32.81847061606372, 1e-9); assert.strictEqual(N2.Cmax, 5.4); assert.strictEqual(N2.Tmax, 1.5); near(N2.t12, Math.LN2 / N2.lz, 1e-12); near(N2.cl, 500 / N2.aucInf, 1e-12);
  // semua alat baru berjalan dengan contoh bawaan
  [['sains', 'comm'], ['sains', 'lw'], ['sains', 'cpue'], ['sains', 'bcf'], ['kes', 'dr'], ['kes', 'probit'], ['kes', 'nca']].forEach(([m, id]) => { const r = tool(m, id).run(ex(tool(m, id))); assert(r.html && r.tsv.length, id); });
  // pemandu tujuan & bidang
  const top = q => (U.skAdvise(q).top[0] || { it: [''] }).it[0];
  assert.strictEqual(top('keanekaragaman ikan karang di terumbu karang Bali'), 'komunitas_biota');
  assert.strictEqual(top('kandungan logam berat pada kerang hijau di teluk Jakarta'), 'bioakumulasi');
  assert.strictEqual(top('uji aktivitas antioksidan ekstrak rumput laut'), 'dosis_respon');
  assert.strictEqual(top('uji toksisitas akut LD50 ekstrak tanaman'), 'toksisitas');
  assert.strictEqual(top('farmakokinetik parasetamol pada pasien'), 'farmakokinetik');
  assert.strictEqual(top('hubungan panjang berat ikan tongkol'), 'panjang_berat');
  assert.strictEqual(top('status stok ikan layang berdasarkan CPUE'), 'stok_ikan');
  assert.strictEqual(U.advField('kelimpahan plankton di perairan pesisir').k, 'laut'); assert.strictEqual(U.advField('uji toksisitas ekstrak').k, 'farm');
  assert(U.litTerms('aktivitas antioksidan ekstrak rumput laut').some(x => /antioxidant/.test(x)));
  assert(html.includes('Morisita, M. (1959)') && html.includes('Finney, D. J. (1971)') && html.includes('Yamaoka, K.'));
  assert.strictEqual(errs.length, 0, errs.join('\n')); console.log('v37 ok'); process.exit(0);
}, 2500);
