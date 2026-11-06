// v3.5: data panel, Beneish M-Score, rekayasa nilai, PRISMA 2020, pemandu tujuan
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo/.test(e.message)) errs.push(e.message); });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc });
const w = dom.window; w.scrollTo = () => {};
const near = (a, b, t = 1e-6) => assert(Math.abs(a - b) < t, `${a} != ${b}`);
setTimeout(() => {
  const U = w.__ui, X = w.__SKX, T = w.__SCI_TOOLS, tool = id => T.sains.find(t => t.id === id), ex = t => Object.fromEntries(t.f.map(f => [f[0], f[3]]));
  // panel — dibandingkan dengan numpy (FE = LSDV dengan dummy unit; RE Swamy–Arora; Hausman)
  const pn = tool('panel'), L = pn.f[0][3].split('\n').slice(1).map(l => l.split(';'));
  const P = X.panel(L.map(r => ({ u: r[0], t: r[1], y: +r[2], x: [+r[3], +r[4]] })));
  near(P.pooled.b[0], 10.54252541); near(P.pooled.b[1], -1.23788545); near(P.pooled.b[2], -0.47906895);
  near(P.fe.b[0], -0.69130621); near(P.fe.b[1], -0.32109646); near(P.fe.se[0], 0.18356303); near(P.fe.se[1], 0.04712538);
  near(P.Fs, 70.33236841, 1e-5); assert(P.Fp < 1e-6);
  near(P.re.th, 0.88991492); near(P.re.b[0], 8.29255241, 1e-5); near(P.re.b[1], -0.71356867); near(P.re.se[1], 0.18104748); near(P.re.H, 1.28877957, 1e-5);
  assert(/REM \(random effect\)/.test(pn.run(ex(pn)).html), 'Chow p<0,05 lalu Hausman p≥0,05 → REM');
  // Beneish: indeks dan M dari contoh bawaan (dihitung manual)
  const bn = tool('beneish'), rb = bn.run(ex(bn)), get = k => rb.tsv.find(r => r[0] === k)[1];
  near(get('DSRI'), (1150 / 12800) / (820 / 10000)); near(get('SGI'), 1.28); near(get('TATA'), (980 - 310) / 15300);
  near(get('M'), -4.84 + 0.920 * get('DSRI') + 0.528 * get('GMI') + 0.404 * get('AQI') + 0.892 * get('SGI') + 0.115 * get('DEPI') - 0.172 * get('SGAI') + 4.679 * get('TATA') - 0.327 * get('LVGI'));
  near(get('M'), -1.83894823); assert(/Tidak terindikasi/.test(rb.html)); assert(/Terindikasi manipulasi/.test(bn.run({ ...ex(bn), cut: '-2.22' }).html));
  // rekayasa nilai
  const ve = tool('ve'), rv = ve.run(ex(ve)), fac = rv.tsv.find(r => r[0] === 'Dinding fasad kaca');
  near(fac[4], 960 / 350); near(fac[5], 350 / 960); near(fac[7], 350); assert.strictEqual(rv.tsv[1][0], 'Dinding fasad kaca', 'diurutkan menurut biaya/nilai');
  assert(/1\.240|1,240|1240/.test(rv.html.replace(/\s/g, '')) || rv.html.includes('Penghematan'), 'penghematan');
  // PRISMA 2020: alur jumlah konsisten
  const pr = X.prisma(ex(tool('prisma')));
  assert.deepStrictEqual([pr.scr, pr.sought, pr.elig, pr.exr, pr.inc], [478, 107, 98, 54, 44]); assert.strictEqual(pr.warn.length, 0);
  const sv = X.prismaSVG(pr); assert(/^<svg/.test(sv) && (sv.match(/<rect/g) || []).length === 9 && sv.includes('n = 44'));
  assert(X.prisma({ db: '10', dup: '20' }).warn.length > 0, 'peringatan tidak konsisten');
  // pemandu tujuan
  const top = q => (U.skAdvise(q).top[0] || { it: [''] }).it[0];
  assert.strictEqual(top('Deteksi kecurangan laporan keuangan perusahaan BUMN'), 'fraud');
  assert.strictEqual(top('Bagaimana cara menekan biaya konstruksi gedung tanpa mengurangi fungsi?'), 've');
  assert.strictEqual(top('kajian pustaka sistematis tentang smart city'), 'slr');
  assert.strictEqual(top('Keputusan hakim dalam perkara korupsi dana desa: pertimbangan apa yang dipakai?'), 'yuridis');
  assert.strictEqual(top('Pengaruh profitabilitas dan leverage terhadap nilai perusahaan manufaktur di BEI'), 'panel');
  assert.strictEqual(top('Pengaruh pelatihan terhadap keterampilan sebelum dan sesudah program'), 'eksperimen');
  assert.notStrictEqual(top('Pengaruh promosi terhadap keputusan pembelian dimediasi brand trust'), 'yuridis', 'keputusan ≠ putusan');
  const ps = U.advHTML('Pengaruh upah minimum terhadap pengangguran data panel 38 provinsi'); assert(/data-skt="sains#panel"/.test(ps) || /Regresi data panel/.test(ps), 'tautan alat panel');
  assert(html.includes('Beneish, M. D. (1999)') && html.includes('doi.org/10.1136/bmj.n71') && html.includes('Baltagi, B. H. (2021)') && html.includes('Miles, L. D. (1972)'));
  assert.deepStrictEqual(errs, []); console.log('v35 ok'); process.exit(0);
}, 2500);
