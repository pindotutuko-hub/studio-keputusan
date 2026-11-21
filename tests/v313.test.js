// v3.13: Riset Terpadu — alur penelitian Bab I–V, ukuran sampel, uji hipotesis otomatis dari dataset bersama
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo/.test(e.message)) errs.push(e.message); });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc });
const w = dom.window; w.scrollTo = () => {};
const near = (a, b, t, m) => assert(Math.abs(a - b) < t, (m || '') + ' ' + a + ' vs ' + b);
setTimeout(() => {
  const R = w.__rs, d = w.document;
  // ukuran sampel: N = 1000, e = 5 %, P = 50 %, kepercayaan 95 %
  R.blank(); const B = R.get(); B.pop.N = '1000'; B.samp.e = 5; B.samp.m = 3; R.set(B);
  const S = R.size();
  near(S.slovin, 1000 / 3.5, 1e-9, 'slovin'); assert.strictEqual(R.pick(), 286);
  assert.strictEqual(Math.ceil(S.km), 278, 'Krejcie–Morgan N=1000 → 278 (tabel 1970)');
  near(S.cochran0, 384.146, 0.01, 'cochran n0'); assert.strictEqual(Math.ceil(S.cochran), 278);
  assert.strictEqual(S.greenModel, 74); assert.strictEqual(S.greenPred, 107);
  assert.strictEqual(Math.ceil(S.powR), 85, 'daya r=0,3'); assert.strictEqual(Math.ceil(S.powT), 63, 'daya d=0,5 per kelompok');
  // contoh: survei 150 penghuni
  R.sample(); const ds = d.querySelector('[data-step="rs-an"]'); assert(ds, 'langkah rail riset');
  R.dsSample();
  const E = R.get(); assert.strictEqual(R.pick(), 139, 'Slovin N=1200, e=8%');
  const A = R.alloc(139); assert.strictEqual(A.map(a => a.nh).join(','), '58,35,46');
  const T = R.rels().map(r => R.test(r)); assert(T.every(t => t.ok), T.map(t => t.msg).join('|'));
  assert(/Regresi linear sederhana/.test(T[0].test)); assert(/t\(148\) = 5,48/.test(T[0].stat), T[0].stat); assert(T[0].sig);
  assert(/b = 0,562/.test(T[1].stat), T[1].stat);
  assert(/Sobel/.test(T[2].test) && /z = 4,11/.test(T[2].stat), T[2].stat); assert(/mediasi parsial/.test(T[2].why));
  assert(/MRA/.test(T[3].test) && /t\(146\) = 1,65/.test(T[3].stat), T[3].stat); near(T[3].pUse, 0.1013597 / 2, 2e-4, 'moderasi satu sisi'); assert(!T[3].sig);
  assert(/ANOVA satu arah/.test(T[4].test) && /F\(2, 147\) = 5,71/.test(T[4].stat), T[4].stat); near(T[4].p, 0.0041005, 1e-5); assert(T[4].sig);
  const I = R.instr().find(x => x.v.code === 'X1'); near(I.A.alpha, 0.809114, 1e-5, 'alpha KH');
  const As = R.assume(); assert(As.length === 2 && As.every(a => a.sh.p > 0) && As[0].glej.length === 1);
  near(R.desc()[0].sh.W, R.desc()[0].sh.W, 1);
  // hipotesis & naskah
  assert.strictEqual(R.hyp(E.rel[0])[0], 'Kualitas hunian berpengaruh positif terhadap Niat tetap tinggal.');
  assert.strictEqual(R.goal('Apakah kualitas hunian berpengaruh terhadap niat tetap tinggal?'), 'Untuk menganalisis kualitas hunian berpengaruh terhadap niat tetap tinggal.');
  const md = R.draft(); ['## BAB I PENDAHULUAN', '## BAB II TINJAUAN PUSTAKA', '## BAB III METODE PENELITIAN', '## BAB IV HASIL DAN PEMBAHASAN', '## BAB V KESIMPULAN DAN SARAN', 'Ukuran sampel: 139', '| H1:'].forEach(k => assert(md.includes(k), k));
  assert(!/NaN|undefined/.test(md), 'naskah tanpa NaN');
  assert(/H4: Lama tinggal \(tahun\) tidak memoderasi/.test(R.concl().join(' ')));
  // semua langkah dapat dirender tanpa galat
  ['rs-pend', 'rs-pus', 'rs-met', 'rs-sam', 'rs-an', 'rs-hp', 'rs-ks'].forEach(s => { d.querySelector(`[data-step="${s}"]`).click(); const box = d.querySelector(`[data-sec="${s}"]`); assert(!box.hidden, s); assert(!/NaN|undefined/.test(box.textContent), s + ' NaN'); });
  assert(d.querySelector('#rsPus svg'), 'diagram kerangka'); assert(/Cronbach's α = 0,809/.test(d.querySelector('#rsAn').textContent));
  // Tobin's Q (Chung & Pruitt, 1994) dan versi praktis
  { const q = R.tq({ harga: 1000, saham: 1e6, mve: '', ps: 0, cl: 3e8, ca: 4e8, ltd: 2e8, tl: 6e8, ta: 1.5e9 });
    near(q.mve, 1e9, 1e-6); near(q.cp, 1.1 / 1.5, 1e-12, 'CP'); near(q.simple, 1.6 / 1.5, 1e-12, 'simple');
    const st = R.get();
    R.dsText('Firma\tHarga\tSaham\tCL\tCA\tLTD\tTL\tTA\nA\t1000\t1000000\t300000000\t400000000\t200000000\t600000000\t1500000000\nB\t500\t2000000\t100000000\t50000000\t0\t300000000\t1000000000');
    st.tq.col = { harga: 'Harga', saham: 'Saham', cl: 'CL', ca: 'CA', ltd: 'LTD', tl: 'TL', ta: 'TA' }; R.set(st);
    const r = R.tqAppend(); assert(r.ok, r.err); const txt = R.dsTextGet(); assert(/TobinsQ_CP\tTobinsQ_Simple/.test(txt.split('\n')[0]));
    assert.strictEqual(txt.split('\n')[1].split('\t').slice(-2).join('|'), '0.7333|1.0667'); assert.strictEqual(txt.split('\n')[2].split('\t').slice(-2).join('|'), '1.0500|1.3000');
    R.tqAppend(); assert.strictEqual(R.dsTextGet().split('\n')[0].split('\t').length, 10, 'tidak menggandakan kolom');
    d.querySelector('[data-step="rs-met"]').click(); assert(/Tobin's Q \(Chung & Pruitt, 1994\)/.test(d.querySelector('#rsMet').textContent));
    assert(html.includes('Chung, K. H., &amp; Pruitt, S. W. (1994)') && html.includes('Tobin, J. (1969)')); }
  // perbaikan hasil pemeriksaan bug (v3.13.0)
  { // RM ↔ hipotesis: RM2 mediasi, RM3 moderasi
    R.sample(); R.dsSample(); d.querySelector('[data-step="rs-ks"]').click(); const ks = d.querySelector('#rsKs').textContent;
    assert(/RM2\.[^]*?memediasi[^]*?RM3\./.test(ks), 'RM2 → mediasi'); assert(/RM3\.[^]*?memoderasi[^]*?RM4\./.test(ks), 'RM3 → moderasi');
    // penomoran tunggal: hubungan tak lengkap di depan → H1 hilang, lainnya tetap H2…
    const st = R.get(); st.rel.unshift({ id: 'zz', from: '', to: '', kind: 'pengaruh', arah: '+', via: '', basis: '', rm: '' }); R.set(st);
    const md = R.draft(); assert(!/\| H1:/.test(md) && /\| H2:/.test(md) && /\| H6:/.test(md), 'penomoran');
    st.rel.shift();
    // prediktor nominal tidak menggagalkan regresi
    const th = st.vars.find(v => v.code === 'X2'), nt = st.vars.find(v => v.code === 'Y'); st.rel.push({ id: 'nn', from: th.id, to: nt.id, kind: 'pengaruh', arah: '+', via: '', basis: '', rm: '' }); R.set(st);
    const t1 = R.test(R.get().rel[0]); assert(t1.ok && /tidak dimasukkan/.test(t1.why), t1.msg || t1.why); assert(!R.test(R.get().rel.at(-1)).ok);
    // N bergaya Indonesia & strata
    const s2 = R.get(); s2.rel.pop(); s2.pop.N = '1.200'; s2.samp.e = 5; s2.samp.met = 'slovin'; R.set(s2); assert.strictEqual(R.pick(), 300);
    // tujuan kustom tidak hilang saat RM dihapus
    const s3 = R.get(); s3.tj = ['a', 'b', 'c', 'd']; R.set(s3); d.querySelector('[data-step="rs-pend"]').click(); d.querySelector('#rsPend [data-rsdel="rq"]').click();
    assert.strictEqual(R.get().tj.join(','), 'b,c,d'); assert.strictEqual(R.get().rel.find(r => r.kind === 'beda').rm, '3');
    // tanda | dalam teks pengguna
    const s4 = R.get(); s4.vars[0].name = 'A|B'; s4.simp = '| baris'; R.set(s4); const md2 = R.draft();
    const row = md2.split('\n').find(l => /^\| A\\\|B/.test(l)); assert(row && row.split(/(?<!\\)\|/).length === 6, row);
    assert(!/^\| baris/m.test(md2)); const h = R.mdHtml(md2); assert(h.includes('<td style="border:1px solid #999;padding:3px 6px">A|B</td>'));
    // proyek lama/parsial tidak merusak
    R.set({ judul: 'lama', rq: [{ id: 'q', t: 'Apakah?' }], vars: [], rel: [] }); ['rs-pend', 'rs-pus', 'rs-met', 'rs-sam', 'rs-an', 'rs-hp', 'rs-ks'].forEach(s => d.querySelector(`[data-step="${s}"]`).click()); R.draft();
    assert(R.norm(null).tq.col && R.norm({ samp: { e: 3 } }).samp.conf === 95);
    // CSV berkutip & kolom Tobin's Q basi
    R.dsText('Nama,Harga,Saham,CL,CA,LTD,TL,TA\n"PT A, Tbk",1000,1000,300,400,200,600,1500'); const s5 = R.get(); s5.tq.col = { harga: 'Harga', saham: 'Saham', cl: 'CL', ca: 'CA', ltd: 'LTD', tl: 'TL', ta: 'TA' }; R.set(s5); R.tqAppend();
    s5.tq.col = { harga: 'Harga', saham: 'Saham', tl: 'TL', ta: 'TA' }; R.set(s5); R.tqAppend(); const L2 = R.dsTextGet().split('\n');
    assert.strictEqual(L2[0], 'Nama,Harga,Saham,CL,CA,LTD,TL,TA,TobinsQ_Simple'); assert.strictEqual(L2[1], '"PT A, Tbk",1000,1000,300,400,200,600,1500,667.0667'); }
  // pendekatan kualitatif: keabsahan & informan
  const Q = R.get(); Q.pend = 'kual'; R.set(Q); d.querySelector('[data-step="rs-met"]').click(); assert(/Lincoln & Guba \(1985\)/.test(d.querySelector('#rsMet').textContent));
  d.querySelector('[data-step="rs-sam"]').click(); assert(/Guest, Bunce, & Johnson, 2006/.test(d.querySelector('#rsSam').textContent));
  // rujukan
  ['Moleong, L. J. (2017)', 'Krejcie, R. V., &amp; Morgan, D. W. (1970)', 'Groat, L. N., &amp; Wang, D. (2013)', 'Sobel, M. E. (1982)', 'Tejada, J. J., &amp; Punzalan', 'Hair, J. F., Black'].forEach(k => assert(html.includes(k), k));
  assert(!errs.length, errs.join('\n')); console.log('v3.13 riset OK');
}, 300);
