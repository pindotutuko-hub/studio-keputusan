// v3.11: bidang Ilmu Komunikasi (humas, warga) dan bilah "Langkah 1 · Bidang ilmu" berbasis Kepdirjen 163/E/KPT/2022
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo/.test(e.message)) errs.push(e.message); });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc });
const w = dom.window; w.scrollTo = () => {};
setTimeout(async () => {
  const U = w.__ui, K = w.__kp, q = 'Studi tentang public relation dengan warga kampung di bidang ilmu komunikasi';
  const r = U.skAdvise(q); assert.strictEqual(r.fd.k, 'kom'); const cs = r.hit.map(h => h.c);
  assert(cs.includes('humas') && cs.includes('warga') && cs.includes('komunikasi') && !cs.includes('komunitas') && !cs.includes('rumah'), cs.join(' '));
  assert(r.top.length >= 3 && r.top.every(x => /^kom_/.test(x.it[0])), r.top.map(x => x.it[0]).join(' '));
  const top = s => (U.skAdvise(s).top[0] || { it: [''] }).it[0];
  assert.strictEqual(top('pengaruh komunikasi humas terhadap kepercayaan dan partisipasi warga'), 'kom_humas_pengaruh');
  assert.strictEqual(top('memetakan jejaring komunikasi warga dan tokoh kunci penyebar informasi'), 'kom_jejaring');
  assert.strictEqual(top('analisis framing berita rilis humas pemerintah kota'), 'kom_isi');
  // bidang lain tidak bergeser
  assert.strictEqual(top('dampak program bantuan sosial terhadap pendapatan rumah tangga'), 'did');
  assert.strictEqual(U.skAdvise('kelimpahan komunitas plankton di teluk').fd.k, 'laut');
  // prodi komunikasi Lampiran I → bidang kom; deteksi prodi dari kalimat
  const P = K.KP_P.filter(p => p[4] === 'kom'); assert(P.length >= 6 && P.some(p => p[1] === 'Ilmu atau Sains Komunikasi'), P.length);
  assert.strictEqual(K.kpDetect(q)[1], 'Ilmu atau Sains Komunikasi'); assert.strictEqual(K.kpDetect('evaluasi pascahuni rumah susun di bidang arsitektur')[1], 'Arsitektur'); assert.strictEqual(K.kpDetect('memilih lokasi terbaik dari 4 calon lahan'), null);
  // bilah langkah 1: saran prodi terdeteksi, lalu setelah dipilih menampilkan jalur rumpun
  const d = w.document; assert(d.querySelector('#kpBar')); const b0 = K.kpBar(q); assert(/data-kpuse="294"/.test(b0) && /Pakai Ilmu atau Sains Komunikasi/.test(b0));
  K.kpSet(294); assert(/Rumpun Ilmu <b>Terapan<\/b> › Komunikasi/.test(K.kpBar(q)) && /Ilmu atau Sains Komunikasi/.test(K.kpBar(q))); assert.strictEqual(U.skAdvise('studi tentang relasi lembaga dengan masyarakat').fd.k, 'kom'); K.kpSet(null);
  // v3.11.1: saran mengikuti bidang; alat sinyal & instrumen; tautan Scholar/Garuda/SINTA; pesan kuota OpenAlex
  { const r1 = U.skAdvise('Studi instrumentasi elektronika dan sinyal dan sistem elektronika'); assert.strictEqual(r1.fd.k, 'elektro'); assert(r1.top.length && r1.top.every(x => /^el_/.test(x.it[0])), r1.top.map(x => x.it[0]).join(' '));
    assert.strictEqual(top('analisis struktur bangunan gedung di bidang teknik sipil'), 'sipil_struktur'); assert.strictEqual(U.skAdvise('penelitian tentang farmasi').fd.k, 'farm'); assert(U.skAdvise('penelitian tentang farmasi').top.length >= 3);
    const S = w.__SCI_TOOLS.sains, sig = S.find(t => t.id === 'sig'), inst = S.find(t => t.id === 'inst'), VG = w.__VG;
    // sinyal 50 Hz amplitudo 2 + harmonik 3 (0,3) dan 5 (0,12): THD = √(0,3²+0,12²)/2
    const x = [...Array(1024)].map((_, i) => { const t = i / 1024; return 1 + 2 * Math.sin(2 * Math.PI * 50 * t) + 0.3 * Math.sin(2 * Math.PI * 150 * t) + 0.12 * Math.sin(2 * Math.PI * 250 * t); });
    for (const win of ['rect', 'hann']) { const G = VG.signal(x, 1024, win, 0, 10); assert(Math.abs(G.f1 - 50) < 1e-9, G.f1); assert(Math.abs(G.A1 - 2) < 0.01, win + ' ' + G.A1); assert(Math.abs(G.thd - Math.sqrt(0.09 + 0.0144) / 2) < 0.002, win + ' ' + G.thd); assert(Math.abs(G.mean - 1) < 1e-9); }
    const G2 = VG.signal(x, 1024, 'rect', 0, 10); assert(Math.abs(G2.rmsac - Math.sqrt((4 + 0.09 + 0.0144) / 2)) < 1e-9); assert(G2.snr > 100);
    const v = {}; sig.f.forEach(f => v[f[0]] = f[3]); assert(!/NaN/.test(sig.run(v).html));
    // karakteristik statis: garis sempurna → nonlinearitas 0; histeresis = selisih naik–turun / FSO
    const I = VG.instStatic([[0, 0, 0.1], [10, 2, 2.1], [20, 4, 4.1], [30, 6, 6.1]], [1, 1.2, 0.8], 0); assert(Math.abs(I.L.b - 0.2) < 1e-12 && Math.abs(I.nlp) < 1e-9); assert(Math.abs(I.hyp - 100 * 0.1 / 6) < 1e-9); assert(Math.abs(I.sd - 0.2) < 1e-12);
    const v2 = {}; inst.f.forEach(f => v2[f[0]] = f[3]); assert(!/NaN/.test(inst.run(v2).html));
    assert(html.includes('Cooley, J. W., &amp; Tukey, J. W. (1965)') && html.includes('Harris, F. J. (1978)') && html.includes('Bentley, J. P. (2005)'));
    const L = w.__litInline('studi public relation warga kampung'); assert(/scholar\.google\.com\/scholar\?q=/.test(L) && /garuda\.kemdiktisaintek\.go\.id\/documents\?q=/.test(L) && /sinta\.kemdiktisaintek\.go\.id\/journals\?q=/.test(L), L.slice(0, 300)); }
  // v3.12: perantara server → OpenAlex tanpa kunci → cadangan Crossref
  { const X = w.__lit312, calls = [], f0 = w.fetch;
    const cr = { message: { 'total-results': 2, items: [{ DOI: '10.1/a', title: ['Site selection for <i>office</i> buildings'], author: [{ given: 'A', family: 'Budi' }, { given: 'C', family: 'Dewi' }], issued: { 'date-parts': [[2021, 3]] }, 'is-referenced-by-count': 7, 'container-title': ['J. Plan'], abstract: '<jats:p>Abstract We rank sites.</jats:p>' }, { DOI: '10.1/b', title: ['Office site suitability'], author: [{ given: 'A', family: 'Budi' }], issued: { 'date-parts': [[2023]] }, 'is-referenced-by-count': 2 }] } };
    const p0 = X.litFromCR(cr.message.items[0]); assert.strictEqual(p0.title, 'Site selection for office buildings'); assert.strictEqual(p0.year, 2021); assert.deepStrictEqual(Array.from(p0.authors), ['A Budi', 'C Dewi']); assert.strictEqual(p0.abs, 'We rank sites.'); assert.strictEqual(p0.cited, 7);
    const resp = (st, body, h) => ({ ok: st === 200, status: st, json: async () => body, headers: { get: k => (h || {})[k] || null } });
    w.fetch = async u => { calls.push(String(u)); if (/sk-api\/openalex\.php/.test(u)) return resp(503, { error: 'nokey' }); if (/api\.openalex\.org/.test(u)) return resp(429, {}); if (/api\.crossref\.org/.test(u)) return resp(200, cr); return resp(404, {}); };
    X.LIT.q = 'mencari tapak kantor'; X.LIT.terms = ['site', 'office']; X.LIT.srcs = { oa: true, sc: false }; await X.search();
    assert(/sk-api\/openalex\.php\?search=/.test(calls[0]) && /api\.openalex\.org/.test(calls[1]) && !/api_key/.test(calls[1]) && /api\.crossref\.org\/works\?query\.bibliographic=site%20office/.test(calls[2]), calls.join(' | '));
    assert.strictEqual(X.LIT.papers.length, 2); assert(/Crossref: 2/.test(X.LIT.msg) && /Kuota OpenAlex habis/.test(X.LIT.msg), X.LIT.msg); assert(!X.LIT.quota);
    calls.length = 0; w.fetch = async u => { calls.push(String(u)); return /sk-api/.test(u) ? resp(200, { meta: { count: 9 }, results: [{ id: 'W1', title: 'T one', publication_year: 2020, authorships: [], cited_by_count: 1 }] }, { 'X-SK-Cache': 'hit' }) : resp(500, {}); };
    await X.search(); assert.strictEqual(calls.length, 1); assert(/via server, cache/.test(X.LIT.msg), X.LIT.msg); w.fetch = f0;
    assert.strictEqual(top('mencari tapak yang potensial utk bangunan kantor'), 'tapak'); }
  // jendela rumpun ilmu terpandu: rumpun → kelompok → prodi → pakai
  { const click = el => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })), b = d.createElement('button'); b.dataset.kpopen = ''; d.body.appendChild(b); click(b); b.remove();
    const M = d.querySelector('#skKp'); assert(M && !M.hidden && M.classList.contains('kpmodal') && !d.querySelector('#skKpBd').hidden); assert.strictEqual(M.querySelectorAll('.kprc').length, 6); assert.strictEqual(M.querySelectorAll('.kpsteps li').length, 4);
    click(M.querySelector('[data-kpr="Terapan"]')); const g = d.querySelector('#skKp [data-kpg="32"]'); assert(g && /Komunikasi/.test(g.textContent)); click(g);
    const it = d.querySelector('#skKp [data-kpsel="294"]'); assert(it, 'prodi 294'); click(it); const use = d.querySelector('#skKp .kpright [data-kpuse="294"]'); assert(use); click(use);
    assert.strictEqual(K.sel, 294); assert(/Bidang Anda: <b>Ilmu atau Sains Komunikasi/.test(d.querySelector('#skKp').innerHTML)); assert(d.querySelector('#skKp .kpsteps li:last-child').classList.contains('done'));
    click(d.querySelector('[data-kpr="__pro"]')); assert.strictEqual(d.querySelectorAll('#skKp [data-kpg]').length, 3);
    click(d.querySelector('#skKpBd')); assert(d.querySelector('#skKp').hidden); K.kpSet(null); }
  assert.strictEqual(errs.length, 0, errs.join('\n')); console.log('v311 ok'); process.exit(0);
}, 2500);
