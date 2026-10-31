// Audit cakupan EN: buka semua langkah (dengan data contoh) dalam mode EN, daftar teks yang masih tampak Indonesia.
const { JSDOM, VirtualConsole } = require('jsdom'); const fs = require('fs'), path = require('path');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: new VirtualConsole() });
const w = dom.window; w.scrollTo = () => {}; const d = w.document;
const ID = /\b(yang|dan|dengan|untuk|tidak|belum|sudah|hasil|pilih|tambah|hapus|simpan|isi|nilai|baris|kolom|langkah|berkas|proyek|metode|contoh|dapat|atau|dari|pada|ini|baru|lihat|buka|unduh|salin|jumlah|bobot|tabel|ringkasan|kriteria|data contoh|masukkan|klik)\b/i;
const miss = new Map(); let total = 0;
const scan = root => { const tw = d.createTreeWalker(root, w.NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) { const p = n.parentElement; if (!p || /^(SCRIPT|STYLE|TEXTAREA)$/.test(p.tagName) || p.closest('.no-i18n')) continue; const s = n.nodeValue.replace(/\s+/g, ' ').trim(); if (!s || !/[A-Za-z]{3}/.test(s)) continue; total++; if (ID.test(s)) miss.set(s, (miss.get(s) || 0) + 1); } };
setTimeout(async () => {
  w.skLang.set('en'); await new Promise(r => setTimeout(r, 20));
  const steps = [...new Set([...d.querySelectorAll('.rail button[data-step]')].map(b => b.dataset.step))];
  for (const s of steps) { try { d.querySelector(`.rail button[data-step="${s}"]`).click(); const sec = d.querySelector(`section[data-sec="${s}"]`); for (const b of (sec ? sec.querySelectorAll('button[id$="Sample"],#dmSample') : [])) { try { b.click(); } catch (e) {} } await new Promise(r => setTimeout(r, 5)); scan(sec || d.body); } catch (e) {} }
  scan(d.querySelector('header.top')); scan(d.querySelector('nav.rail'));
  const L = [...miss.keys()]; fs.writeFileSync(path.join(__dirname, 'i18n-miss.json'), JSON.stringify(L, null, 0));
  console.log('teks diperiksa', total, 'masih Indonesia (unik)', L.length); console.log(L.slice(0, 25).join('\n')); process.exit(0);
}, 1500);
