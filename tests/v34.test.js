// v3.4: kerangka & alur analisis (dapat diedit), alat hitung baru, korpus pemandu tujuan diperluas
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo/.test(e.message)) errs.push(e.message); });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc });
const w = dom.window; w.scrollTo = () => {}; const d = w.document;
const near = (a, b, t = 1e-6) => assert(Math.abs(a - b) < t, `${a} != ${b}`);
setTimeout(() => {
  const U = w.__ui, X = w.__SKX, T = w.__SCI_TOOLS; assert(U && X && T, 'ekspor');
  const tool = (m, id) => T[m].find(t => t.id === id);

  // regresi logistik: prediktor biner → b1 = ln(OR) tabel 2×2, b0 = ln(odds kelompok 0)
  const Xb = [0, 0, 0, 0, 1, 1, 1, 1].map(v => [v]), yb = [1, 0, 0, 0, 1, 1, 1, 0];
  const L = X.logit(Xb, yb); near(L.b[1], Math.log(9)); near(L.b[0], Math.log(1 / 3)); near(L.acc, 0.75);
  near(L.se[1], Math.sqrt(1/1 + 1/3 + 1/3 + 1/1), 1e-5); // SE Woolf = √(1/a+1/b+1/c+1/d)
  assert(L.r2 > 0 && L.r2 < 1);
  // contoh bawaan (n = 30) — dibandingkan dengan IRLS numpy
  const lg = tool('kes', 'logit'), Ld = lg.f[0][3].split('\n').slice(1).map(l => l.split(';').map(Number));
  const Lb = X.logit(Ld.map(r => r.slice(0, 3)), Ld.map(r => r[3]));
  near(Lb.b[0], -22.73495762, 1e-5); near(Lb.b[1], 0.17543053, 1e-6); near(Lb.b[2], 0.57271528, 1e-6); near(Lb.b[3], 1.7206992, 1e-5);
  near(Lb.se[1], 0.07261378, 1e-5); assert(/Odds ratio/.test(lg.run({ data: lg.f[0][3] }).html));

  // Kaplan–Meier: 3 kejadian tanpa sensor → S = 2/3, 1/3, 0; median = 2
  const K1 = X.km([{ t: 1, e: 1, g: 'A' }, { t: 2, e: 1, g: 'A' }, { t: 3, e: 1, g: 'A' }]);
  const tab = K1.G.A.tab; near(tab[0][3], 2 / 3); near(tab[1][3], 1 / 3); near(tab[2][3], 0); assert.strictEqual(K1.G.A.med, 2); assert.strictEqual(K1.lr, null);
  // sensor: t=1 kejadian, t=2 sensor, t=3 kejadian → S(1)=2/3, S(3)=0
  const K2 = X.km([{ t: 1, e: 1, g: 'A' }, { t: 2, e: 0, g: 'A' }, { t: 3, e: 1, g: 'A' }]); near(K2.G.A.tab[0][3], 2 / 3); near(K2.G.A.tab[1][3], 0);
  // log-rank dua kelompok identik → χ² = 0, p = 1
  const same = [1, 2, 3].flatMap(t => [{ t, e: 1, g: 'A' }, { t, e: 1, g: 'B' }]); const K3 = X.km(same); near(K3.lr.chi2, 0); near(K3.lr.p, 1);
  // contoh bawaan (kelompok A jauh lebih cepat mengalami kejadian) → bermakna
  const km = tool('kes', 'km'); const rk = km.run({ data: km.f[0][3] }); assert(/Log-rank/.test(rk.html));
  const Kd = X.km(km.f[0][3].split('\n').map(l => l.split(';')).map(r => ({ t: +r[0], e: +r[1], g: r[2] })));
  assert(Kd.lr.p < 0.05 && Kd.lr.O > Kd.lr.E, 'log-rank contoh');

  // peramalan: data linear sempurna → tren linear RMSE 0 dan ramalan tepat
  const y = [...Array(10)].map((_, i) => 5 + 2 * i); const M = X.fcst(y, 3), tr = M.find(m => /Tren linear/.test(m.k));
  near(tr.e.rmse, 0, 1e-9); near(tr.fc[0], 25); near(tr.fc[2], 29);
  const naif = M.find(m => /Naif/.test(m.k)); near(naif.e.rmse, 2); near(naif.e.mae, 2);
  const rf = tool('sains', 'fcst').run({ y: y.join(' '), h: '3' }); assert(/Metode terbaik/.test(rf.html));

  // LQ & shift-share: NS + IM + CS = Δ untuk tiap sektor; Σ NS = eₜ₀·gₙ
  const lq = tool('sains', 'lq'), rl = lq.run({ rows: lq.f[0][3] });
  rl.tsv.slice(1).forEach(r => near(r[3] + r[4] + r[5], r[6], 1e-6));
  const pert = rl.tsv.find(r => r[0] === 'Pertanian'); near(pert[2], (4500 / 13350) / (322000 / 1449000), 1e-9);

  // gravitasi: I = P0·P/d², pangsa total = 100
  const gv = tool('sains', 'grav'), rg = gv.run({ rows: 'A;100;10\nB;400;20', P0: '1000', b: '2' });
  near(rg.tsv[1][3], 1000 * 100 / 100); near(rg.tsv[2][3], 1000 * 400 / 400); near(rg.tsv[1][4] + rg.tsv[2][4], 100);

  // pemandu tujuan: kasus-kasus baru
  const top = q => (U.skAdvise(q).top[0] || { it: [''] }).it[0];
  assert.strictEqual(top('Sektor ekonomi unggulan apa saja di Kabupaten Malang?'), 'lq');
  assert.strictEqual(top('Berapa lama pasien kanker bertahan setelah kemoterapi?'), 'survival');
  assert.strictEqual(top('Bagaimana media online membingkai pemberitaan banjir?'), 'wacana');
  assert.strictEqual(top('Apakah kenaikan upah minimum memengaruhi pengangguran? data panel 38 provinsi'), 'panel');
  assert.strictEqual(top('Penilaian dampak lingkungan pembangunan pabrik semen'), 'amdal');
  assert.strictEqual(top('Efektivitas penerapan Perda kawasan tanpa rokok'), 'regulasi');
  assert.strictEqual(top('membangun teori tentang bagaimana pedagang kaki lima bertahan di tengah penggusuran'), 'pengalaman');
  assert.strictEqual(top('Faktor risiko apa yang berhubungan dengan kejadian hipertensi (ya/tidak)?'), 'logit');
  assert.strictEqual(U.skAdvise('blockchain kuantum').top.length, 0, 'tidak dikenal → tanpa saran');
  // kartu metode yang belum tersedia → rekomendasi alat luar
  const hb = U.advHTML('Pemetaan tren penelitian smart city dengan bibliometrik');
  assert(/advna/.test(hb) && /VOSviewer/.test(hb), 'rekomendasi bibliometrik');

  // kerangka & alur: dari maksud → langkah berurutan, diagram SVG, teks
  const F = U.fwFromIntent('logit');
  assert.deepStrictEqual([F.steps[0].k, F.steps[1].k, F.steps[F.steps.length - 1].k], ['tujuan', 'data', 'keputusan']);
  assert(F.steps.some(s => s.k === 'metode'), 'langkah metode');
  const svg = U.fwSVG(F); assert(/^<svg/.test(svg) && (svg.match(/<rect/g) || []).length >= F.steps.length, 'kotak per langkah');
  assert((svg.match(/marker-end/g) || []).length >= F.steps.length - 1, 'panah antarlangkah');
  // langkah sejajar berbagi satu baris → lebih sedikit baris (tinggi) dibanding tanpa sejajar
  const h = s => +s.match(/viewBox="0 0 [\d.]+ ([\d.]+)"/)[1];
  const F2 = JSON.parse(JSON.stringify(F)); F2.steps[2].p = false; F2.steps.splice(3, 0, { ...F2.steps[2], n: 'Paralel', p: true });
  const F3 = JSON.parse(JSON.stringify(F2)); F3.steps[3].p = false; assert(h(U.fwSVG(F2)) < h(U.fwSVG(F3)), 'sejajar menghemat baris');
  assert(/1\./.test(U.fwText(F)) && U.fwText(F).includes(F.steps[0].n), 'teks kerangka');
  // laci kerangka terbuka dan dapat diedit
  U.openFw('lq'); const dr = d.querySelector('#skFw'); assert(dr && dr.querySelector('#fwDiag svg'), 'laci + diagram');
  const n0 = dr.querySelectorAll('#fwDiag rect').length; const add = dr.querySelector('[data-fwadd]'); add.click();
  assert(d.querySelectorAll('#fwDiag rect').length > n0, 'tambah langkah memperbarui diagram');
  // rujukan baru terdaftar di CREDIT (menu Sumber & Referensi)
  assert(html.includes('Kaplan, E. L., &amp; Meier') && html.includes('Mantel, N. (1966)') && html.includes('Hosmer, D. W.') && html.includes('Dunn, E. S. (1960)') && html.includes('otexts.com/fpp3'));

  assert.deepStrictEqual(errs, []); console.log('v34 ok'); process.exit(0);
}, 2500);
