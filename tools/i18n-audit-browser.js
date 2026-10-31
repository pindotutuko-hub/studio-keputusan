// Audit EN di Chromium sungguhan dengan alamat situs asli (permintaan dicegat & dilayani dari src/index.html).
// Menelusuri semua langkah, data contoh, menu atas, dialog; memindai SELURUH DOM (termasuk tersembunyi) + atribut.
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const URL0 = 'https://pindotutuko.id/wp-content/themes/pindotutuko/assets/apps/studio-keputusan/index.html';
const html = fs.readFileSync(path.join(__dirname, '..', 'src', 'index.html'), 'utf8');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.route('**/*', r => r.request().url().split('#')[0] === URL0 ? r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html }) : r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL0); await p.waitForTimeout(1200);
  await p.evaluate(l => { try { localStorage.setItem('sk-lang', l); } catch (e) {} }, process.env.LANGMODE || 'en');
  await p.reload(); await p.waitForTimeout(1500); if (process.env.ALLMODE) await p.evaluate(() => { window.__ALLMODE = true; }); await p.evaluate(() => {  });
  const found = new Map();
  const scan = async tag => { const r = await p.evaluate(() => {
    const ALL = window.__ALLMODE; const ID = /\b(yang|dan|di|ke|dari|untuk|dengan|atau|ini|itu|pada|tidak|belum|sudah|akan|bisa|dapat|harus|jika|bila|agar|setiap|semua|tiap|serta|juga|lalu|sebagai|oleh|dalam|lebih|kurang|baru|hasil|nilai|baris|kolom|isi|pilih|tambah|hapus|simpan|buka|tutup|salin|unduh|unggah|lihat|hitung|ubah|atur|cari|contoh|langkah|metode|kriteria|bobot|rumah|ruang|denah|kota|wilayah|kawasan|bangunan|penduduk|jumlah|rata-rata|tinggi|rendah|besar|kecil|mudah|benar|salah|catatan|keterangan|tanggal|tahun|bulan|hari|orang|peserta|responden|pakar|kelompok|sumber|rujukan|panduan|kirim|terima|masukkan|klik|tekan|gunakan|tampilan|sederhana|lanjutan|proyek|laporan|tabel|grafik|gambar|berkas|data contoh|kosong|selesai|gagal|berhasil|disalin|tersimpan|ringkasan|analisis|penilaian|keputusan|alternatif|tujuan|masalah|faktor|elemen|tingkat|hubungan|pengaruh|antara|terhadap|melalui|setelah|sebelum|ketika|saat|hanya|masih|sama|beda|banyak|sedikit|baik|buruk|perlu|wajib|opsional|maks|min)\b/i;
    const AFX = /\b(?:me[mnyg]?|be[r]?|te[r]?|pe[mnyg]?|ke|se)[a-z]{3,}(?:kan|an|nya)\b|\b[a-z]{3,}nya\b/i;
    const out = new Set(); const skip = e => e.closest('script,style,textarea,input,.no-i18n,[contenteditable="true"]');
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
    while ((n = tw.nextNode())) { const el = n.parentElement; if (!el || skip(el)) continue; const s = n.nodeValue.replace(/\s+/g, ' ').trim(); if (s.length < 2 || !/[A-Za-z]{2}/.test(s)) continue; if (ALL ? /[A-Za-z]{3}/.test(s) : (ID.test(s) || AFX.test(s))) out.add(s); }
    document.querySelectorAll('[title],[placeholder],[aria-label],[data-tip]').forEach(e => { if (skip(e)) return; ['title', 'placeholder', 'aria-label', 'data-tip'].forEach(a => { const v = e.getAttribute(a); if (v && (ALL ? /[A-Za-z]{3}/.test(v) : (ID.test(v) || AFX.test(v)))) out.add(v.replace(/\s+/g, ' ').trim()); }); });
    return [...out]; });
    r.forEach(s => { if (!found.has(s)) found.set(s, tag); }); };
  await scan('awal');
  const clickAll = async sel => { const n = await p.$$eval(sel, els => els.length).catch(() => 0); for (let i = 0; i < n; i++) { try { await p.evaluate(([s, i]) => { const e = document.querySelectorAll(s)[i]; if (e) e.click(); }, [sel, i]); await p.waitForTimeout(60); await scan(sel + '#' + i); } catch (e) {} } };
  await clickAll('header.top button[data-modgo]');
  await clickAll('header.top .modpick button, header.top [data-mode], .viewmode button, [data-homeview], [data-homegroup], [data-hgroup]');
  const steps = await p.$$eval('.rail button[data-step]', bs => [...new Set(bs.map(b => b.dataset.step))]);
  for (const s of steps) {
    await p.evaluate(s => { const b = document.querySelector(`.rail button[data-step="${s}"]`); if (b) b.click(); }, s); await p.waitForTimeout(80); await scan('step:' + s);
    await p.evaluate(s => { const sec = document.querySelector(`section[data-sec="${s}"]`); if (!sec) return; sec.querySelectorAll('button[id$="Sample"],#dmSample,[data-sample]').forEach(b => { try { b.click(); } catch (e) {} }); }, s); await p.waitForTimeout(120); await scan('sample:' + s);
    await p.evaluate(s => { const sec = document.querySelector(`section[data-sec="${s}"]`); if (!sec) return; sec.querySelectorAll('[role="tab"],.tabs button,[data-tab],[data-sxmode],[data-mode],[data-view],details>summary').forEach(b => { try { b.click(); } catch (e) {} }); }, s); await p.waitForTimeout(100); await scan('tabs:' + s);
  }
  // mode Sederhana + menurut rumpun + bantu memilih + dialog-dialog
  for (const t of ['Simple', 'Advanced', 'By field of science', 'By analysis goal', 'Help me choose', 'Export–import', 'Glossary', 'Guide', 'Video tutorials', 'Canvas', 'Sederhana', 'Lanjutan', 'Menurut rumpun ilmu', 'Menurut tujuan analisis', 'Bantu saya memilih', 'Ekspor–impor', 'Glosarium', 'Panduan', 'Video tutorial', 'Kanvas']) {
    await p.evaluate(t => { const e = [...document.querySelectorAll('button,a,[role="button"]')].find(x => x.textContent.trim().replace(/^\W+/, '').startsWith(t)); if (e) e.click(); }, t); await p.waitForTimeout(150); await scan('ui:' + t);
    await p.keyboard.press('Escape').catch(() => {});
  }
  const L = [...found.entries()];
  fs.writeFileSync(path.join(__dirname, process.env.OUT || 'i18n-miss-browser.json'), JSON.stringify(L.map(x => x[0]), null, 0));
  console.log('belum diterjemahkan (unik):', L.length, ' galat halaman:', errs.length, errs.slice(0, 3));
  L.slice(0, 40).forEach(([s, t]) => console.log(' -', t, '|', s.slice(0, 140)));
  await b.close();
})();
