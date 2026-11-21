// v3.16: Riset Terpadu — cari riset terdahulu (OpenAlex tiruan) dan draf Bab I sementara
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const inv = t => { const o = {}; t.split(' ').forEach((w, i) => (o[w] = o[w] || []).push(i)); return o; };
const W = (i, title, abs, cited) => ({ id: 'https://openalex.org/W' + i, doi: 'https://doi.org/10.1/x' + i, title, display_name: title, publication_year: 2018 + i, cited_by_count: cited,
  authorships: [{ author: { display_name: 'Budi Santoso' } }, { author: { display_name: 'Ani Wijaya' } }], primary_location: { source: { display_name: 'Jurnal Permukiman' } }, abstract_inverted_index: inv(abs), keywords: [] });
const RES = [W(1, 'Housing transformation in urban kampung', 'This study examines housing transformation and residents satisfaction using a survey of 200 households and regression analysis. Housing quality influences residential satisfaction.', 40),
  W(2, 'Residential satisfaction and housing quality', 'Housing quality affects residential satisfaction and intention to stay. Structural equation modeling was applied to 312 respondents.', 25),
  W(3, 'Self-built housing extensions', 'Qualitative interviews reveal motives of house extension in informal settlements.', 10)];
let calls = 0; const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo/.test(e.message)) errs.push(e.message); });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc, beforeParse(w) { w.scrollTo = () => {}; w.TextEncoder = TextEncoder; w.TextDecoder = TextDecoder;
  w.fetch = async (u) => { calls++; return { ok: true, status: 200, headers: { get: () => null }, json: async () => ({ results: RES, meta: { count: 3 } }) }; }; } });
const w = dom.window;
setTimeout(async () => {
  const d = w.document, R = w.__rs;
  // judul → variabel & hubungan
  const TM = R.titleModel;
  let m = TM('Pengaruh Kualitas Hunian dan Aksesibilitas terhadap Niat Tetap Tinggal dengan Kepuasan Bermukim sebagai Variabel Mediasi pada Rusunawa Kota Malang');
  assert.strictEqual(m.vars.map(v => v.role + ':' + v.name).join('|'), 'X:Kualitas Hunian|X:Aksesibilitas|Y:Niat Tetap Tinggal|M:Kepuasan Bermukim', JSON.stringify(m.vars));
  assert(m.rels.some(r => r.kind === 'mediasi') && m.rels.filter(r => r.kind === 'pengaruh').length === 4);
  m = TM('Persepsi penghuni rumah tinggal di real estate dan motivasi melakukan renovasi'); assert.strictEqual(m.vars.map(v => v.role + ':' + v.name).join('|'), 'X:Persepsi penghuni rumah tinggal|Y:Motivasi melakukan renovasi'); assert.strictEqual(m.rels[0].kind, 'hubungan');
  m = TM('Hubungan lama tinggal dengan keterikatan tempat'); assert.strictEqual(m.rels[0].kind, 'hubungan');
  m = TM('Perbedaan kepuasan bermukim berdasarkan tipe hunian'); assert.strictEqual(m.vars.find(v => v.role === 'X').name, 'Tipe hunian');
  m = TM('Pengaruh harga terhadap minat beli dengan citra merek sebagai variabel moderasi'); assert(m.rels.some(r => r.kind === 'moderasi') && m.vars.some(v => v.role === 'Z'));
  R.blank(); const st = R.get(); st.judul = 'Pengaruh kualitas hunian terhadap kepuasan bermukim di perumahan'; st.fen = 'Banyak penghuni mengubah bentuk rumah.'; R.set(st);
  d.querySelector('[data-step="rs-pend"]').click(); assert(d.querySelector('#bRsCari'), 'tombol cari');
  d.querySelector('#bRsCari').click(); await new Promise(r => setTimeout(r, 200));
  assert(calls >= 1); assert.strictEqual(R.get().cari.res.length, 3); assert(/3 artikel teratas/.test(R.get().cari.msg), R.get().cari.msg);
  const boxes = d.querySelectorAll('#rsPend [data-rscs]'); assert.strictEqual(boxes.length, 3);
  d.querySelector('#rsPend #bRsCsAll').click(); assert.strictEqual(Object.values(R.get().cari.sel).filter(Boolean).length, 3, 'centang semua');
  assert(d.querySelector('#rsPend .fwdiag svg'), 'peta jejaring'); d.querySelector('#rsPend [data-rsview="yr"]').click(); assert.strictEqual(R.get().cari.view, 'yr');
  d.querySelector('#rsPend #bRsCsNone').click(); assert.strictEqual(Object.values(R.get().cari.sel).filter(Boolean).length, 0);
  // kartu pencarian juga ada di langkah 2 (tidak lagi pindah ke Beranda)
  d.querySelector('[data-step="rs-pus"]').click(); assert(d.querySelector('#rsPus #bRsCari') && !d.querySelector('#rsPus [data-modgo="home"]')); d.querySelector('[data-step="rs-pend"]').click();
  [0, 1].forEach(i => { const b = d.querySelectorAll('#rsPend [data-rscs]')[i]; b.checked = true; b.dispatchEvent(new w.Event('change', { bubbles: true })); });
  const btn = d.querySelector('#bRsCariDraft'); assert(btn && !btn.disabled); btn.click();
  const S = R.get(); assert.strictEqual(S.fen, 'Banyak penghuni mengubah bentuk rumah.', 'fenomena pengguna dipertahankan');
  assert(/Santoso/.test(S.mas) && /2019|2020/.test(S.mas), S.mas); assert(S.gap.length > 20 && /Celah/.test(S.gap), S.gap); assert(S.rq.length >= 1 && S.rq[0].t.length > 5, JSON.stringify(S.rq));
  assert(S.lit.filter(x => x.ttl).length === 2 && S.lit.some(x => /Santoso/.test(x.a))); assert.strictEqual(S.vars.map(v => v.name).join('|'), 'Kualitas hunian|Kepuasan bermukim', 'variabel dari judul'); assert(S.rel.length >= 1, 'hipotesis awal'); assert(/\[konteks\/lokasi studi\]/.test(S.kontrib));
  assert(!/NaN|undefined/.test(d.querySelector('#rsPend').textContent));
  // klik kedua kali harus dikonfirmasi (isian sudah ada)
  const before = S.mas; S.mas = 'TULISAN SAYA'; R.set(S); d.querySelector('[data-step="rs-pend"]').click(); d.querySelector('#bRsCariDraft').click(); assert.strictEqual(R.get().mas, 'TULISAN SAYA'); d.querySelector('#bRsCariDraft').click(); assert.notStrictEqual(R.get().mas, 'TULISAN SAYA');
  // naskah A4: blok, gambar, daftar pustaka, docx
  const S2 = R.get(); assert(R.refs().length === 2 && /^Santoso, B\., & Wijaya, A\. \(20(19|20)\)/.test(R.refs()[0]), JSON.stringify(R.refs()));
  const ph = R.printHTML(); assert(/rsp-cover/.test(ph) && /<svg/.test(ph) && /Gambar 2\.1\./.test(ph) && /DAFTAR PUSTAKA/.test(ph) && !/var\(--/.test(ph) && !/color-mix/.test(ph), 'HTML cetak');
  const z = await R.docx(); assert(z.length > 2000);
  const PNG = new Uint8Array(require('fs').readFileSync(require('path').join(__dirname, '..', 'build', 'icon.png'))); const z2 = await R.docx({ png: () => PNG }); require('fs').writeFileSync('/tmp/rs-test-img.docx', Buffer.from(z2)); require('fs').writeFileSync('/tmp/rs-test.docx', Buffer.from(z));
  d.querySelector('[data-step="rs-ks"]').click(); assert(d.querySelector('#rsKs #bRsDocx') && d.querySelector('#rsKs #bRsPdf'));
  assert(!errs.length, errs.join('\n')); console.log('v3.16 cari riset OK');
}, 400);
