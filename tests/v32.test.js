// v3.2: pilihan tampilan, tema, menu data awal, riwayat pemakaian, galeri grafik
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo/.test(e.message)) errs.push(e.message); });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc });
const w = dom.window; w.scrollTo = () => {}; const d = w.document;
const near = (a, b, t = 1e-9) => assert(Math.abs(a - b) < t, `${a} != ${b}`);
setTimeout(async () => {
  const U = w.__ui; assert(U, '__ui');
  // pilihan tampilan saat pertama dibuka: Tujuan & panduan + Senja terpilih sebagai bawaan
  const FS = d.querySelector('#firstSetup [data-setup="full"]'); if (FS) { assert(!d.querySelector('#lookPick'), 'menunggu paket instalasi dipilih'); FS.click(); }
  await new Promise(r => setTimeout(r, 20));
  const LP = d.querySelector('#lookPick'); assert(LP, 'pemilih tampilan muncul saat pertama dibuka');
  assert.strictEqual(LP.querySelectorAll('[data-lpview]').length, 4); assert.strictEqual(LP.querySelector('.lpcard.on').dataset.lpview, 'tujuan');
  assert.strictEqual(LP.querySelector('.lpsw.on').dataset.lppal, 'senja'); assert(LP.querySelectorAll('.lpcard svg').length === 4, 'pratinjau tiap tampilan');
  LP.querySelector('[data-lpview="alur"]').click(); assert(d.body.classList.contains('uv-alur'), 'pratinjau langsung');
  d.querySelector('#lpSkip').click(); assert(!d.querySelector('#lookPick') && d.body.classList.contains('uv-tujuan') && d.documentElement.dataset.pal === 'senja', 'pakai bawaan');
  assert.strictEqual(w.localStorage.getItem('sk-look-chosen-v1'), '1'); U.showLookPick(); assert(!d.querySelector('#lookPick'), 'tidak muncul lagi');
  d.querySelector('#lookPickBtn').click(); assert(d.querySelector('#lookPick'), 'dapat dibuka lagi dari kepala'); d.querySelector('#lpGo').click(); assert(!d.querySelector('#lookPick'));
  // tampilan bawaan = Tujuan & panduan (opsi 2), dapat diganti ke Klasik / Alur
  assert(d.querySelector('#uiView') && d.querySelector('#uiView').value === 'tujuan', 'tampilan bawaan tujuan');
  assert(d.body.classList.contains('uv-tujuan'));
  const sel = d.querySelector('#uiView'); sel.value = 'alur'; sel.dispatchEvent(new w.Event('change', { bubbles: true })); assert(d.body.classList.contains('uv-alur') && d.querySelector('#skPipe'), 'mode alur + bar alur');
  sel.value = 'klasik'; sel.dispatchEvent(new w.Event('change', { bubbles: true })); assert(d.body.classList.contains('uv-klasik'));
  sel.value = 'langkah'; sel.dispatchEvent(new w.Event('change', { bubbles: true })); assert(d.body.classList.contains('uv-langkah')); d.querySelector('.rail button[data-step="ahp-crit"]').click(); assert(d.querySelector('.skstep li.on') && d.querySelector('.sknext [data-goto="ahp-cmp"]'), 'opsi A: penanda tahap + tombol lanjut'); d.querySelector('.sknext [data-goto="ahp-cmp"]').click(); assert(d.querySelectorAll('.skstep li.done').length === 1, 'tahap 1 selesai'); d.querySelector('[data-modgo="home"]').click();
  sel.value = 'tujuan'; sel.dispatchEvent(new w.Event('change', { bubbles: true }));
  // tata letak Opsi B: tema Senja bawaan, saran contoh langsung tampil, kartu tujuan berikon di atas menu data, nama metode terbaca
  assert.strictEqual(d.documentElement.dataset.pal, 'senja', 'tema bawaan Senja');
  const B = d.querySelector('#skB'); assert(B && B.querySelector('.bsug .bs'), 'saran contoh tampil tanpa mengetik');
  assert(/AHP/.test(B.querySelector('.bsug .bs b').textContent), 'contoh lokasi → AHP');
  const gs = B.querySelectorAll('.bgoal .gico svg'); assert(gs.length >= 9, 'ikon tiap kartu tujuan');
  assert(B.innerHTML.indexOf('bgoals') < B.innerHTML.indexOf('skstart'), 'kartu tujuan sebelum menu data');
  assert(/\d+ metode · \d+ rumpun ilmu/.test(B.querySelector('.bhrow').textContent), 'jumlah metode');
  const gtxt = [...B.querySelectorAll('.bgoal span')].map(x => x.textContent).join(' | ');
  assert(!/\bbwm\b|sy-res|\bsynth\b/.test(gtxt), 'tak ada kode metode mentah: ' + gtxt);
  // tema warna
  const pal = d.querySelector('#uiPal'); pal.value = 'senja'; pal.dispatchEvent(new w.Event('change', { bubbles: true })); assert.strictEqual(d.documentElement.dataset.pal, 'senja');
  // saran metode dari kalimat
  assert.strictEqual(U.suggestMethods('Saya ingin memilih lokasi terbaik dari 4 calon lahan')[0], 'ahp');
  assert(U.suggestMethods('menyusun hubungan pengaruh antar faktor kunci').includes('ism'));
  assert(U.suggestMethods('konsensus para pakar').includes('delphi'));
  // angka format Indonesia & tabel tempel
  near(U.numOf('1.234,5'), 1234.5); near(U.numOf('12.500'), 12500); near(U.numOf('0,38'), 0.38); near(U.numOf('45%'), 45); assert(Number.isNaN(U.numOf('Aksesibilitas')));
  const D = U.parseText('Kriteria\tBobot\nAksesibilitas\t0,38\nHarga lahan\t0,27\nRisiko banjir\t0,21\nFasilitas\t0,14');
  assert.strictEqual(D.cols.length, 1); assert.strictEqual(JSON.stringify(D.labels), JSON.stringify(['Aksesibilitas', 'Harga lahan', 'Risiko banjir', 'Fasilitas'])); near(D.cols[0].vals.reduce((a, b) => a + b, 0), 1, 1e-12);
  assert(U.suggestChart(D).includes('donut'), 'bobot berjumlah 1 → donat disarankan');
  const M = U.parseText('X;A;B;C\nA;1;3;5\nB;0,33;1;2\nC;0,2;0,5;1'); assert(U.suggestChart(M)[0] === 'heat', 'matriks persegi → peta panas');
  const P = U.parseText('n,x,y\na,1,2\nb,2,4\nc,3,6\nd,4,8'); assert(/r = 1,00/.test(U.chartExplain('scatter', P)), 'korelasi sempurna r = 1');
  // semua jenis grafik menghasilkan SVG sah
  const DP = new w.DOMParser(); let k = 0;
  U.CTYPES.filter(c => !c.go).forEach(c => { [D, M, P].forEach(X => { const s = U.drawChart(c.k, X, { sort: true, vals: true, w: 640 }); const m = s.match(/<svg[\s\S]*<\/svg>/); if (!m) return; const doc = DP.parseFromString(m[0].replace(/var\(--[\w-]+\)/g, '#888'), 'image/svg+xml'); assert(!doc.getElementsByTagName('parsererror').length, 'SVG sah ' + c.k); k++; }); });
  assert(k >= 30, 'grafik terbentuk: ' + k); assert(U.CTYPES.length >= 16, '16+ jenis grafik');
  // riwayat pemakaian
  U.noteUse('ism'); U.noteUse('ism'); U.noteUse('ism'); assert(/ISM|Interpretive/.test(U.usageHTML()) && /3×/.test(U.usageHTML()), 'riwayat pemakaian');
  // menu data awal & galeri di beranda
  assert(d.querySelector('[data-skin="open"]') && d.querySelector('[data-skin="import"]') && d.querySelector('[data-skin="type"]'), 'menu data awal');
  d.querySelector('[data-skin="chart"]').click(); assert(d.querySelector('#skChart #chOut svg'), 'galeri grafik terbuka');
  assert.deepStrictEqual(errs, []); console.log('v32 OK'); process.exit(0);
}, 600);
