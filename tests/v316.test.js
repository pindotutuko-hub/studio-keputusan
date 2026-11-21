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
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc, beforeParse(w) { w.scrollTo = () => {};
  w.fetch = async (u) => { calls++; return { ok: true, status: 200, headers: { get: () => null }, json: async () => ({ results: RES, meta: { count: 3 } }) }; }; } });
const w = dom.window;
setTimeout(async () => {
  const d = w.document, R = w.__rs; R.blank(); const st = R.get(); st.judul = 'Pengaruh kualitas hunian terhadap kepuasan bermukim'; st.fen = 'Banyak penghuni mengubah bentuk rumah.'; R.set(st);
  d.querySelector('[data-step="rs-pend"]').click(); assert(d.querySelector('#bRsCari'), 'tombol cari');
  d.querySelector('#bRsCari').click(); await new Promise(r => setTimeout(r, 200));
  assert(calls >= 1); assert.strictEqual(R.get().cari.res.length, 3); assert(/3 artikel teratas/.test(R.get().cari.msg), R.get().cari.msg);
  const boxes = d.querySelectorAll('#rsPend [data-rscs]'); assert.strictEqual(boxes.length, 3);
  [0, 1].forEach(i => { const b = d.querySelectorAll('#rsPend [data-rscs]')[i]; b.checked = true; b.dispatchEvent(new w.Event('change', { bubbles: true })); });
  const btn = d.querySelector('#bRsCariDraft'); assert(btn && !btn.disabled); btn.click();
  const S = R.get(); assert.strictEqual(S.fen, 'Banyak penghuni mengubah bentuk rumah.', 'fenomena pengguna dipertahankan');
  assert(/Santoso/.test(S.mas) && /2019|2020/.test(S.mas), S.mas); assert(S.gap.length > 20 && /Celah/.test(S.gap), S.gap); assert(S.rq.length >= 1 && S.rq[0].t.length > 5, JSON.stringify(S.rq));
  assert(S.lit.filter(x => x.ttl).length === 2 && S.lit.some(x => /Santoso/.test(x.a))); assert(S.vars.some(v => v.role === 'Y') && S.rel.length >= 1, 'variabel & hipotesis awal'); assert(/\[konteks\/lokasi studi\]/.test(S.kontrib));
  assert(!/NaN|undefined/.test(d.querySelector('#rsPend').textContent));
  // klik kedua kali harus dikonfirmasi (isian sudah ada)
  const before = S.mas; S.mas = 'TULISAN SAYA'; R.set(S); d.querySelector('[data-step="rs-pend"]').click(); d.querySelector('#bRsCariDraft').click(); assert.strictEqual(R.get().mas, 'TULISAN SAYA'); d.querySelector('#bRsCariDraft').click(); assert.notStrictEqual(R.get().mas, 'TULISAN SAYA');
  assert(!errs.length, errs.join('\n')); console.log('v3.16 cari riset OK');
}, 400);
