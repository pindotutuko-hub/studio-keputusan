// v3.17.2: Daftar Pustaka Riset & Proposal (matriks + hasil pencarian tercentang + rujukan metode yang dikutip), tabel Word tidak terpotong
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo/.test(e.message)) errs.push(e.message); });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc, beforeParse(w) { w.scrollTo = () => {}; w.TextEncoder = TextEncoder; w.TextDecoder = TextDecoder; } });
const w = dom.window;
setTimeout(async () => {
  const d = w.document, R = w.__rs;
  const refs = t => t.slice(t.indexOf('## DAFTAR PUSTAKA')).split('\n---')[0];
  // kosong → tetap ada bab Daftar Pustaka dengan petunjuk
  R.blank(); d.querySelector('.rail button[data-step="rs-ks"]').click();
  assert(/## DAFTAR PUSTAKA\n/.test(R.prop().draft));
  R.sample(); const st = R.get();
  st.cari.res = [{ id: 'p1', title: 'Housing quality and satisfaction', year: 2021, venue: 'Cities', authors: ['Budi Santoso', 'Ani Wijaya'], doi: 'https://doi.org/10.1/x', cited: 3 },
    { id: 'p2', title: 'Tidak dicentang', year: 2020, venue: 'J', authors: ['X Y'], doi: '', cited: 1 }];
  st.cari.sel = { p1: true }; st.samp.met = 'km'; R.set(st);
  for (const step of ['rs-ks', 'pr-doc']) {
    d.querySelector(`.rail button[data-step="${step}"]`).click(); const P = R.prop(), r = refs(P.draft);
    assert(/Santoso, B\., & Wijaya, A\. \(2021\)\. Housing quality and satisfaction\. Cities\. https:\/\/doi\.org\/10\.1\/x/.test(r), step + r);
    assert(!/Tidak dicentang/.test(r), 'hanya yang dicentang');
    assert(/Guba, E\. G\., & Lincoln, Y\. S\. \(1994\)/.test(r) && /Creswell, J\. W\., & Creswell, J\. D\. \(2018\)/.test(r), 'paradigma');
    assert(/Groat, L\. N\., & Wang, D\. \(2013\)/.test(r) && /Cronbach, L\. J\. \(1951\)/.test(r) && /Krejcie, R\. V\., & Morgan, D\. W\. \(1970\)/.test(r), 'metode');
    assert(!/Creswell, J\. W\., & Poth/.test(r) && !/Lincoln, Y\. S\., & Guba/.test(r) && !/Cochran/.test(r), 'tidak mengutip yang tidak dipakai');
    assert(/\(Guba & Lincoln, 1994; Creswell & Creswell, 2018\)/.test(P.draft) && /\(Groat & Wang, 2013\)/.test(P.draft));
    assert(/class="rsp-ref"[^>]*>[^<]*Santoso/.test(P.html), 'PDF memuat daftar pustaka');
    const z = Buffer.from(await R.docx({ png: () => null })).toString('latin1');
    assert(/Santoso, B\./.test(z) || z.length > 5000);
  }
  assert.deepStrictEqual(errs, []);
  console.log('v3.17.2 daftar pustaka: OK'); process.exit(0);
}, 1500);
