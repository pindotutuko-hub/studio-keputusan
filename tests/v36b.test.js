// v3.6: Kajian pustaka & peta riset (OpenAlex/Scopus/CSV), metrik ala Publish or Perish, jejaring ala VOSviewer, draf pendahuluan; tabulasi silang lengkap
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo/.test(e.message)) errs.push(e.message); });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc });
const w = dom.window; w.scrollTo = () => {}; const d = w.document;
const near = (a, b, t = 1e-9) => assert(Math.abs(a - b) < t, `${a} != ${b}`);
const inv = s => { const o = {}; s.split(' ').forEach((x, i) => (o[x] = o[x] || []).push(i)); return o; };
const W = [
 { id: 'W1', doi: 'https://doi.org/10.1/a', title: 'Effects of housing adequacy on residential satisfaction', publication_year: 2019, cited_by_count: 40, authorships: [{ author: { display_name: 'Ana Putri' } }, { author: { display_name: 'Budi Santoso' } }], primary_location: { source: { display_name: 'Habitat International' } }, abstract_inverted_index: inv('This study examines the effect of housing adequacy on residential satisfaction among 312 respondents using PLS-SEM. Place attachment mediates the relationship, controlling for income and household size.'), keywords: [{ display_name: 'housing adequacy' }, { display_name: 'residential satisfaction' }, { display_name: 'place attachment' }], open_access: { is_oa: true }, primary_topic: { display_name: 'Housing', subfield: { display_name: 'Urban Studies' }, field: { display_name: 'Social Sciences' }, domain: { display_name: 'Social Sciences' } } },
 { id: 'W2', doi: '10.1/b', title: 'Livability of informal settlements: a post-occupancy evaluation', publication_year: 2022, cited_by_count: 10, authorships: [{ author: { display_name: 'Citra Dewi' } }, { author: { display_name: 'Ana Putri' } }], primary_location: { source: { display_name: 'Cities' } }, abstract_inverted_index: inv('A post-occupancy evaluation with questionnaire survey of 150 households. Results show that thermal comfort influences residential satisfaction. The moderating role of tenure status was tested.'), keywords: [{ display_name: 'housing adequacy' }, { display_name: 'residential satisfaction' }, { display_name: 'thermal comfort' }], primary_topic: { display_name: 'Housing', subfield: { display_name: 'Urban Studies' }, field: { display_name: 'Social Sciences' }, domain: { display_name: 'Social Sciences' } } },
 { id: 'W3', doi: null, title: 'Pengaruh kualitas hunian terhadap kepuasan penghuni rusunawa', publication_year: 2024, cited_by_count: 2, authorships: [{ author: { display_name: 'Dedi Kurnia' } }], primary_location: { source: { display_name: 'Jurnal Arsitektur' } }, abstract_inverted_index: inv('Penelitian ini menguji pengaruh kualitas hunian terhadap kepuasan penghuni dengan regresi berganda pada 98 responden.'), keywords: [{ display_name: 'residential satisfaction' }, { display_name: 'place attachment' }], primary_topic: { display_name: 'Architecture', subfield: { display_name: 'Architecture' }, field: { display_name: 'Engineering' }, domain: { display_name: 'Physical Sciences' } } }];
setTimeout(async () => {
  const U = w.__ui, S = w.__st;
  // kata kunci Inggris dari tujuan berbahasa Indonesia
  const T = U.litTerms('persepsi tentang rumah layak huni dan usulan pembangunan selanjutnya untuk bidang arsitektur');
  assert(T.includes('perception') && T.some(t => /housing adequacy/.test(t)) && T.includes('architecture') && !T.includes('development'), T.join('|'));
  assert.strictEqual(U.litAbs(inv('a b c a')), 'a b c a');
  // ekstraksi variabel
  const v1 = U.litVars('the effect of housing adequacy on residential satisfaction. place attachment mediates the relationship, controlling for income and household size.');
  const has = (v, r) => v1.some(x => x.v === v && x.r === r);
  assert(has('housing adequacy', 'X') && has('residential satisfaction', 'Y') && has('place attachment', 'M') && has('income', 'C') && has('household size', 'C'), JSON.stringify(v1));
  const v2 = U.litVars('pengaruh kualitas hunian terhadap kepuasan penghuni dengan kepercayaan sebagai variabel mediasi');
  assert(v2.some(x => x.v === 'kualitas hunian' && x.r === 'X') && v2.some(x => x.v === 'kepuasan penghuni' && x.r === 'Y') && v2.some(x => x.r === 'M'), JSON.stringify(v2));
  assert(U.litVars('the moderating role of tenure status was tested').some(x => x.v === 'tenure status' && x.r === 'W'));
  assert.strictEqual(JSON.stringify(U.litMethods('using PLS-SEM with questionnaire survey').map(m => m.n).join('|')), JSON.stringify('PLS-SEM|Survei kuesioner'));
  // normalisasi + agregasi
  const P = W.map(U.litFromOA); assert.strictEqual(P[0].doi, '10.1/a'); assert(P[0].abs.includes('312 respondents') && P[0].topic.field === 'Social Sciences');
  const A = U.litAgg(P); assert.strictEqual(A.n, 3); assert.strictEqual(A.samp.med, 150); assert.strictEqual(A.samp.min, 98);
  assert(A.meth.find(m => m.n === 'PLS-SEM').c === 1 && A.meth.find(m => m.n === 'POE'));
  assert.strictEqual(A.vars.find(v => v.v === 'residential satisfaction').role, 'Y');
  // metrik ala Publish or Perish: sitasi 40,10,2 → h=2, g=3
  const M = U.litMetrics(P, 2026); assert.strictEqual(JSON.stringify([M.papers, M.cites, M.h, M.g, M.years]), JSON.stringify([3, 52, 2, 3, 8])); near(M.cpy, 52 / 8); near(M.cpp, 52 / 3); near(M.apa, 5 / 3);
  // jejaring ko-okurensi kata kunci
  const G = U.litNet(P, { mode: 'kw', min: 2 }); const k = G.nodes.map(n => n.k).sort();
  assert.strictEqual(JSON.stringify(k), JSON.stringify(['housing adequacy', 'place attachment', 'residential satisfaction']));
  const e = (a, b) => G.edges.find(x => [G.nodes[x.i].k, G.nodes[x.j].k].sort().join('|') === [a, b].sort().join('|'));
  assert.strictEqual(e('housing adequacy', 'residential satisfaction').w, 2); assert.strictEqual(e('place attachment', 'residential satisfaction').w, 2); assert.strictEqual(e('housing adequacy', 'place attachment').w, 1);
  const rs = G.nodes.find(n => n.k === 'residential satisfaction'); assert.strictEqual(rs.occ, 3); assert.strictEqual(rs.deg, 2); assert.strictEqual(rs.str, 4); near(rs.yr, (2019 + 2022 + 2024) / 3, 1e-9);
  G.nodes.forEach(n => assert(n.x >= 59 && n.x <= 941 && n.y >= 49 && n.y <= 591 && n.c >= 1));
  const sv = U.litNetSVG(G, 'cl'); assert(/^<svg/.test(sv) && (sv.match(/<circle/g) || []).length === 3 && (sv.match(/<line/g) || []).length === 3);
  assert(/linearGradient/.test(U.litNetSVG(G, 'yr')));
  const au = U.litNet(P, { mode: 'au', min: 1 }); assert(au.nodes.find(n => n.k === 'Ana Putri').occ === 2);
  const V = U.litVOS(G); assert(/^id\tlabel\tx\ty\tcluster\tweight<Occurrences>/.test(V.map) && V.net.split('\n').length === 3);
  // dua klaster terpisah dikenali Louvain
  const Q = [{ kw: ['a', 'b'] }, { kw: ['a', 'b'] }, { kw: ['c', 'd'] }, { kw: ['c', 'd'] }].map((x, i) => ({ ...x, title: '', abs: '', authors: [], year: 2020, cited: 0 }));
  const G2 = U.litNet(Q, { min: 1 }); const c = Object.fromEntries(G2.nodes.map(n => [n.k, n.c])); assert(c.a === c.b && c.c === c.d && c.a !== c.c);
  // peta keilmuan
  const F = U.litFields(P); assert.strictEqual(F['Social Sciences'].n, 2); assert.strictEqual(F['Physical Sciences'].F['Engineering'].n, 1); assert(/Urban Studies/.test(U.litFieldSVG(F, 3)));
  // rujukan
  assert.strictEqual(U.litAPA(P[0]), 'Ana Putri, & Budi Santoso (2019). Effects of housing adequacy on residential satisfaction. Habitat International. https://doi.org/10.1/a');
  assert(/@article\{santoso|@article\{putri/.test(U.litBib(P)) && /TY  - JOUR/.test(U.litRIS(P)));
  // CSV Scopus & Publish or Perish
  const csv = 'Authors,Title,Year,Source title,DOI,Abstract,Author Keywords,Cited by\n"Smith J.; Lee K.","Housing ""quality"" and health",2021,Housing Studies,10.9/x,"The effect of housing quality on health.","housing quality; health",7\n';
  const C1 = U.litCSV(csv); assert.strictEqual(C1.length, 1); assert.strictEqual(JSON.stringify(C1[0].authors), JSON.stringify(['Smith J.', 'Lee K.'])); assert.strictEqual(C1[0].title, 'Housing "quality" and health'); assert.strictEqual(C1[0].cited, 7);
  const pop = 'Cites,Authors,Title,Year,Source,DOI\n12,"A Rahman, B Ito",Urban kampung resilience,2020,Habitat International,10.2/y\n';
  const C2 = U.litCSV(pop); assert.strictEqual(JSON.stringify(C2[0].authors), JSON.stringify(['A Rahman', 'B Ito'])); assert.strictEqual(C2[0].cited, 12); assert.strictEqual(C2[0].venue, 'Habitat International');
  // draf pendahuluan: hanya merujuk artikel yang ada
  const Vs = [{ v: 'housing adequacy', role: 'X' }, { v: 'place attachment', role: 'M' }, { v: 'residential satisfaction', role: 'Y' }, { v: 'income', role: 'C' }];
  const D = U.litDraft('sem', { P, A, V: Vs, G, q: 'kelayakan huni', terms: ['perception', 'kampung'] });
  ['## Latar belakang', '## Rumusan masalah', '## Tujuan penelitian', '## Hipotesis', '## Daftar pustaka'].forEach(h => assert(D.includes(h), h));
  assert(/3 artikel/.test(D) && /indeks-h kumpulan 2/.test(D) && /“kampung”/.test(D) && /memediasi pengaruh housing adequacy terhadap residential satisfaction/.test(D));
  const refs = D.split('## Daftar pustaka')[1].split('\n').filter(l => /\(\d{4}\)/.test(l)); assert(refs.length >= 1 && refs.every(r => P.some(p => r.startsWith(U.litAPA(p).slice(0, 12)))));
  const Dq = U.litDraft('qual', { P, A, V: [], G, q: 'pengalaman penghuni', terms: [] }); assert(/Proposisi|tidak menguji hipotesis/.test(Dq) && !/H1:/.test(Dq));
  const De = U.litDraft('eng', { P, A, V: [{ v: 'facade shading', role: 'X' }, { v: 'cooling load', role: 'Y' }], G, q: 'fasad', terms: [] }); assert(/Hipotesis kerja/.test(De));
  // pencarian (fetch tiruan) → laci Pustaka berisi metrik, peta, draf
  w.fetch = async url => { assert(/api\.openalex\.org\/works\?search=/.test(url) && /primary_topic/.test(url)); return { ok: true, status: 200, json: async () => ({ meta: { count: 3 }, results: W }) }; };
  U.openLit('persepsi rumah layak huni'); await U.litSearch();
  const L = d.querySelector('#skLit'); assert(L && /OpenAlex: 3 dari/.test(L.textContent) && /Indeks-h/.test(L.textContent));
  L.querySelector('[data-littab="peta"]').click(); assert(d.querySelector('#litNet svg') && /Peta keilmuan/.test(d.querySelector('#skLit').textContent));
  d.querySelector('[data-littab="draf"]').click(); assert(/## Latar belakang/.test(d.querySelector('#litDraft').value));
  d.querySelector('[data-littab="var"]').click(); assert(d.querySelector('#litModel svg'));
  d.querySelector('#litFw').click(); assert(d.querySelector('#skFw') && /Kajian pustaka sistematis/.test(d.querySelector('#skFw').innerHTML));
  // literatur langsung di kotak tujuan: tombol → pencarian → ringkasan + draf latar belakang + metode di literatur menaikkan saran
  const q0 = 'persepsi penghuni tentang rumah layak huni';
  const box = d.createElement('div'); box.id = 'bRes'; d.body.appendChild(box);
  const h0 = U.advHTML('topik lain sama sekali'); assert(/data-litq/.test(h0) && /Tajamkan latar belakang/.test(h0));
  U.litState().q = q0; U.litState().terms = []; await U.litSearch();
  const h1 = U.advHTML(q0); assert(/Latar belakang dari literatur/.test(h1) && /Tema utama/.test(h1) && /Metode di literatur/.test(h1) && /Draf latar belakang ringkas/.test(h1) && /data-littabgo="draf"/.test(h1), 'ringkasan literatur');
  assert(/median 150/.test(h1) && /\(Putri &amp; Santoso, 2019\)|Putri &amp; Santoso, 2019/.test(h1), 'rujukan & sampel nyata');
  const lb = w.__litBoost(q0); assert(lb && lb.B.poe >= 1 && lb.n === 3);
  // saran kata kunci (≥ 5) + wajib/alternatif + manual
  const LS = U.litState(); LS.q = ''; LS.terms = []; LS.alt = []; LS.papers = [];
  assert(U.litSuggest().length >= 5, 'minimal 5 saran walau topik kosong');
  LS.q = 'persepsi penghuni tentang rumah layak huni'; const sg = U.litSuggest().map(o => o.t);
  assert(sg.length >= 5 && sg.includes('housing quality') && sg.includes('Indonesia') && sg.includes('post-occupancy evaluation') && !sg.includes('perception'), sg.join('|'));
  assert.strictEqual(U.litQB(['housing adequacy', 'perception'], ['Indonesia', 'Malaysia']), '"housing adequacy" AND perception AND (Indonesia OR Malaysia)');
  assert.strictEqual(U.litQB([], ['livability']), 'livability');
  U.openLit(LS.q); d.querySelector('#skLit [data-littab="cari"]') && d.querySelector('#skLit [data-littab="cari"]').click();
  d.querySelector('#skLit [data-litsg="housing quality"][data-to="o"]').click(); assert(LS.alt.includes('housing quality'));
  d.querySelector('#skLit [data-litsg="Indonesia"][data-to="w"]').click(); assert(LS.terms.includes('Indonesia') && LS.terms.length >= 2, LS.terms.join('|'));
  const ta = d.querySelector('#litT'); ta.value = 'kampung; perception'; ta.dispatchEvent(new w.Event('change', { bubbles: true }));
  assert.strictEqual(U.litState().terms.join('|'), 'kampung|perception'); assert(/kampung AND perception AND "housing quality"/.test(d.querySelector('.litqprev').textContent));
  // tabulasi silang: Fisher & Yates (scipy), residu disesuaikan, persentase
  const a = [], b = []; [['A', 'Y', 8], ['A', 'N', 2], ['B', 'Y', 1], ['B', 'N', 5]].forEach(([r, c, n]) => { for (let i = 0; i < n; i++) { a.push(r); b.push(c); } });
  const X = S.stCrosstab(a, b); near(X.fisher, 0.034965034965034975, 1e-9); near(X.yates, 3.8095238095238093, 1e-9); near(X.pY, 0.050961936967763424, 1e-6);
  const z = X.AR[0][X.cols.indexOf('Y')]; near(Math.abs(z), Math.sqrt(X.chi), 1e-9); assert(/<rect/.test(S.stXtabSVG(X)));
  assert(html.includes('Priem, J., Piwowar, H.') && html.includes('van Eck, N. J., &amp; Waltman') && html.includes('Hirsch, J. E. (2005)') && html.includes("connect-src") === false);
  assert.strictEqual(errs.length, 0, errs.join('\n')); console.log('v36b ok'); process.exit(0);
}, 2500);
