// v3.18.1: Tentang — cara mengutip Studio Keputusan (APA 7, IEEE, Harvard, BibTeX, RIS) dengan nomor pencatatan ciptaan DJKI.
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo|scrollIntoView|getScreenCTM|getContext|toDataURL/.test(e.message)) errs.push(e.message); });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc });
const w = dom.window; w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
const d = w.document, $ = s => d.querySelector(s);
setTimeout(() => {
  const s = $('[data-setup="full"]'); if (s) s.click();
  const b = d.createElement('button'); b.dataset.modgo = 'about'; d.body.appendChild(b); b.click();
  const card = $('#skCiteCard'); assert(card, 'kartu sitasi di Tentang');
  const v = w.__APP_VERSION, C = w.__skCite('id'), E = w.__skCite('en');
  assert(C.apa.startsWith('Tutuko, P. (2026). <i>Studio Keputusan: Aplikasi Analisis Strategis'), C.apa);
  assert(C.apa.includes('(Versi ' + v + ') [Program komputer; Pencatatan Ciptaan DJKI No. 001594558]'));
  assert(E.apa.includes('(Version ' + v + ') [Computer software; DJKI copyright record No. 001594558]'));
  assert(/@software\{tutuko2026studiokeputusan,[\s\S]*version = \{[\d.]+\}[\s\S]*EC002026221331/.test(C.bib));
  assert(C.ris.split('\n')[0] === 'TY  - COMP' && C.ris.includes('ET  - ' + v) && C.ris.trim().endsWith('ER  -'));
  assert(C.intext === '(Tutuko, 2026)' && /IEEE/.test(card.textContent));
  card.querySelector('[data-skcl="en"]').click(); assert(/Computer software/.test($('#skCiteCard').textContent), 'ganti EN');
  assert.deepStrictEqual(errs, []);
  console.log('v3.18.1 sitasi OK');
}, 50);
