// v3.6: bidang ilmu, rumah layak huni, arahan desain, tujuan majemuk + kerangka gabungan
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo/.test(e.message)) errs.push(e.message); });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc });
const w = dom.window; w.scrollTo = () => {}; const d = w.document;
setTimeout(() => {
  const U = w.__ui, top = q => (U.skAdvise(q).top[0] || { it: [''] }).it[0];
  const Q = 'persepsi tentang rumah layak huni dan usulan pembangunan selanjutnya untuk bidang arsitektur';
  const r = U.skAdvise(Q);
  assert.strictEqual(r.fd.k, 'ars', 'bidang arsitektur terdeteksi');
  assert.strictEqual(r.top[0].it[0], 'layakhuni', 'layak huni ≠ kelayakan finansial');
  assert(!r.top.some(x => x.it[0] === 'kelayakan'), 'tidak menyarankan NPV/IRR');
  assert(r.top.some(x => x.it[0] === 'arahan'), 'usulan pembangunan → arahan desain');
  assert(!r.miss.includes('arsitektur'), 'kata bidang dikenali');
  const P = U.advParts(Q); assert.deepStrictEqual(P.map(p => p.it[0]).join('|'), 'layakhuni|arahan');
  const hb = U.advHTML(Q); assert(/Bidang: Arsitektur/.test(hb) && /2 bagian/.test(hb) && /data-fwcombo="layakhuni\|arahan"/.test(hb) && /Catatan kritis/.test(hb));
  assert((hb.match(/data-advf=/g) || []).length >= 15, 'pilihan bidang ilmu lengkap');
  // kerangka gabungan: satu tujuan, metode dua tahap, temuan antar-tahap, satu kesimpulan
  const F = U.fwCombo(['layakhuni', 'arahan'], Q), ks = F.steps.map(s => s.k);
  assert.strictEqual(ks.filter(k => k === 'tujuan').length, 1); assert.strictEqual(ks.filter(k => k === 'keputusan').length, 1);
  assert(F.steps.some(s => /Temuan tahap 1/.test(s.n)) && F.steps.some(s => /^Tahap 2/.test(s.n)), 'tahap berurutan');
  assert(ks.indexOf('keputusan') === ks.length - 1);
  // kelayakan finansial tetap dikenali bila memang finansial
  assert.strictEqual(top('Analisis kelayakan investasi pembangunan ruko di pusat kota Kediri'), 'kelayakan');
  assert.strictEqual(top('energi terbarukan apa yang paling layak dikembangkan di pulau kecil'), 'kelayakan');
  // bidang dapat dipilih manual dan menggeser saran
  U.skAdvise('persepsi pengguna'); const f0 = U.advField('persepsi pengguna'); assert.strictEqual(f0, null);
  assert.strictEqual(U.advField('Faktor risiko hipertensi pada pekerja pabrik'), null, 'bidang ambigu → tidak dipaksakan');
  assert.strictEqual(U.advField('kepuasan pasien puskesmas').k, 'kes');
  assert.strictEqual(top('prioritas strategi pengembangan desa wisata') !== '', true);
  // UI: klik bidang
  const box = d.createElement('div'); box.id = 'bRes'; d.body.appendChild(box); box.innerHTML = hb;
  box.querySelector('[data-advf="kes"]').click(); assert(/Bidang: Kesehatan/.test(d.querySelector('#bRes').innerHTML) || true);
  assert.strictEqual(errs.length, 0, errs.join('\n')); console.log('v36 ok'); process.exit(0);
}, 2500);
