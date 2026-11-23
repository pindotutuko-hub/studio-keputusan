// v3.17.1: pencarian riset terdahulu minimal 40 artikel (perluasan kueri + Crossref)
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const W = (i, t) => ({ id: 'https://openalex.org/W' + i, doi: 'https://doi.org/10.1/x' + i, title: t + ' ' + i, display_name: t + ' ' + i, publication_year: 2020, cited_by_count: i,
  authorships: [{ author: { display_name: 'Budi Santoso' } }], primary_location: { source: { display_name: 'Jurnal' } }, abstract_inverted_index: { housing: [0] }, keywords: [] });
const seen = []; const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo/.test(e.message)) errs.push(e.message); });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc, beforeParse(w) { w.scrollTo = () => {}; w.TextEncoder = TextEncoder; w.TextDecoder = TextDecoder;
  w.fetch = async (u) => { u = decodeURIComponent(String(u)); seen.push(u); let R = [];
    if (/crossref/.test(u)) return { ok: true, status: 200, headers: { get: () => null }, json: async () => ({ message: { items: [], 'total-results': 0 } }) };
    if (/ OR /.test(u)) R = Array.from({ length: 30 }, (_, i) => W(100 + i, 'Broad study'));
    else if ((u.match(/ AND /g) || []).length >= 2) R = Array.from({ length: 12 }, (_, i) => W(i, 'Strict study'));
    else R = Array.from({ length: 15 }, (_, i) => W(i + 5, 'Mid study'));
    return { ok: true, status: 200, headers: { get: () => null }, json: async () => ({ results: R, meta: { count: R.length } }) }; }; } });
const w = dom.window;
setTimeout(async () => {
  const d = w.document, R = w.__rs;
  R.blank(); const st = R.get(); st.judul = 'Pengaruh kualitas hunian terhadap kepuasan bermukim penghuni rusunawa'; R.set(st);
  d.querySelector('[data-step="rs-pend"]').click(); d.querySelector('#bRsCari').click(); await new Promise(r => setTimeout(r, 300));
  const c = R.get().cari;
  assert(c.res.length >= 40, 'minimal 40, dapat ' + c.res.length + ' · ' + c.msg);
  assert.strictEqual(c.res.length, 12 + 8 + 30, c.msg); // 12 ketat + 8 baru dari 2 kata kunci + 30 dari OR
  assert(c.res[0].title.startsWith('Strict study'), 'hasil ketat di urutan awal');
  assert(/perluasan 2 kata kunci utama \+8/.test(c.msg) && /perluasan salah satu kata kunci \+30/.test(c.msg), c.msg);
  assert(seen.some(u => /per_page=50/.test(u)));
  assert.deepStrictEqual(errs, []);
  console.log('v3.17.1 minimal 40 artikel: OK'); process.exit(0);
}, 1500);
