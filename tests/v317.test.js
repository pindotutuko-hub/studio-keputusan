// v3.17: Proposal Riset (tim, jadwal, RAB, luaran, naskah Bab I–IV) dan ekspor metadata artikel BibTeX/RIS
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo/.test(e.message)) errs.push(e.message); });
const saved = [];
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc, beforeParse(w) { w.scrollTo = () => {}; w.TextEncoder = TextEncoder; w.TextDecoder = TextDecoder; } });
const w = dom.window;
setTimeout(async () => {
  const d = w.document, R = w.__rs;
  // --- BibTeX & RIS ---
  const P = [{ authors: ['Pindo Tutuko', 'Hideo Shiraishi'], title: 'Space & form: 50% {test}', year: 2020, venue: 'Journal of Asian Architecture and Building Engineering', doi: 'https://doi.org/10.1080/x', abs: 'An abstract.', kw: ['space syntax', 'kampung'] },
    { authors: ['Pindo Tutuko'], title: 'Another space study', year: 2020, venue: '', doi: '' }, { authors: ['Pindo Tutuko'], title: 'Space study', year: 2020, venue: 'J', doi: '' }];
  const bib = R.bib(P);
  assert.strictEqual((bib.match(/^@/gm) || []).length, 3);
  assert(/@article\{tutuko2020space,/.test(bib) && /@misc\{tutuko2020another,/.test(bib) && /@article\{tutuko2020spaceb,/.test(bib), bib);
  assert(/author = \{Tutuko, Pindo and Shiraishi, Hideo\}/.test(bib));
  assert(/title = \{\{Space \\& form: 50\\% \\\{test\\\}\}\}/.test(bib), bib);
  assert(/doi = \{10\.1080\/x\}/.test(bib) && /url = \{https:\/\/doi\.org\/10\.1080\/x\}/.test(bib));
  const ris = R.ris(P);
  assert.strictEqual((ris.match(/^TY  - /gm) || []).length, 3); assert.strictEqual((ris.match(/^ER  - /gm) || []).length, 3);
  assert(/TY  - JOUR\r\nAU  - Tutuko, Pindo\r\nAU  - Shiraishi, Hideo\r\nTI  - Space & form/.test(ris)); assert(/DO  - 10\.1080\/x/.test(ris) && /TY  - GEN/.test(ris));
  assert(/KW  - space syntax\r\nKW  - kampung/.test(ris));
  // matriks Riset Terpadu → rekaman
  R.blank(); const st = R.get(); st.lit = [{ id: 'a', a: 'Budi Santoso; Ani Wijaya', y: '2019', ttl: 'Kualitas hunian', met: '', tem: '', gap: '' }, { id: 'b', a: '', y: '', ttl: '', met: '', tem: '', gap: '' }]; R.set(st);
  const L = R.litRecs(); assert.strictEqual(L.length, 1); assert.strictEqual(L[0].authors.join('|'), 'Budi Santoso|Ani Wijaya');
  assert(/Santoso, Budi and Wijaya, Ani/.test(R.bib(L)));
  // --- Proposal Riset ---
  assert.strictEqual(R.prNum('1.500.000'), 1500000); assert.strictEqual(R.prNum('2,5'), 2.5); assert.strictEqual(R.prNum('12500'), 12500); assert.strictEqual(R.prRp(1234567), '1.234.567');
  R.sample();
  ['pr-pend', 'pr-pus', 'pr-met', 'pr-sam', 'pr-plan', 'pr-doc'].forEach(s => { d.querySelector(`.rail button[data-step="${s}"]`).click(); const sec = d.querySelector(`section[data-sec="${s}"]`); assert(!sec.hidden && /^Proposal Riset · /.test(sec.querySelector('h1').textContent), s); assert.strictEqual(sec.querySelectorAll('.tabx[data-go^="pr-"]').length, 6, s); });
  d.querySelector('.rail button[data-step="pr-plan"]').click();
  ['tim', 'jad', 'ang', 'luar'].forEach(k => d.querySelector(`#prPlan [data-prtpl="${k}"]`).click());
  const g = R.get(); assert.strictEqual(g.prTim.length, 3); assert.strictEqual(g.prJad.length, 7); assert.strictEqual(g.prAng.length, 8); assert.strictEqual(g.prLuar.length, 4);
  assert.strictEqual(g.prJad.map(x => x.m0 + '-' + x.m1).join(','), '1-1,1-2,2-2,2-4,4-5,5-6,6-6');
  const set = (sel, v) => { const e = d.querySelector(sel); e.value = v; e.dispatchEvent(new w.Event('input', { bubbles: true })); };
  const id0 = g.prAng[0].id, id1 = g.prAng[1].id;
  set(`#prPlan [data-rsl="prAng"][data-id="${id0}"][data-f="h"]`, '150.000');
  set(`#prPlan [data-rsl="prAng"][data-id="${id1}"][data-f="v"]`, '10'); set(`#prPlan [data-rsl="prAng"][data-id="${id1}"][data-f="h"]`, '200000');
  assert.strictEqual(d.querySelector('#prTot').textContent, '2.150.000');
  set('#prPlan [data-rs="prp.skema"]', 'Hibah internal'); set('#prPlan [data-rs="prp.bulan"]', '12');
  const pr = R.prop(); assert.strictEqual(pr.flow, 'prop'); assert.strictEqual(pr.total, 2150000);
  assert(/^## BAB IV TIM, JADWAL, ANGGARAN, DAN LUARAN$/m.test(pr.draft) && !/HASIL DAN PEMBAHASAN|BAB V/.test(pr.draft), 'bab proposal');
  assert(/\| 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9 \| 10 \| 11 \| 12 \|/.test(pr.draft), 'kolom 12 bulan');
  assert(/\*\*2\.150\.000\*\*/.test(pr.draft) && /Bahan: Rp 150\.000 \(7,0%\)/.test(pr.draft) && /Pengumpulan data: Rp 2\.000\.000 \(93,0%\)/.test(pr.draft), 'rekap RAB');
  assert(/PROPOSAL PENELITIAN/.test(pr.html) && /Skema: Hibah internal/.test(pr.html) && /Proposal Riset/.test(pr.html));
  assert(/^Proposal - /.test(pr.fname)); assert.strictEqual(pr.checks.length, 12);
  const z = await R.docx({ png: () => null }); assert(z.length > 5000 && z[0] === 0x50 && z[1] === 0x4b, 'docx');
  // naskah Riset Terpadu tetap Bab I–V
  d.querySelector('.rail button[data-step="rs-ks"]').click(); const rk = R.prop(); assert.strictEqual(rk.flow, 'riset'); assert(/BAB V KESIMPULAN/.test(rk.draft) && /NASKAH PENELITIAN/.test(rk.html));
  assert(d.querySelector('[data-modgo="prop"]') && w.document.querySelector('#modSel option[value="prop"]'), 'menu');
  d.querySelector('.rail button[data-step="pr-doc"]').click(); assert(/Punch, K\. F\. \(2016\)/.test(d.querySelector('#creditRef').textContent) && /Locke, L\. F\./.test(d.querySelector('#creditRef').textContent), 'rujukan');
  assert.deepStrictEqual(errs, []);
  console.log('v3.17 proposal riset & BibTeX/RIS: OK'); process.exit(0);
}, 1500);
