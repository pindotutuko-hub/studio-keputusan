# Panduan untuk agen AI (ChatGPT/Codex, Claude, dll.)

Proyek: **Studio Keputusan** — aplikasi analisis strategis & keputusan lintas rumpun ilmu (web + desktop Electron). Pemilik: Prof. Pindo Tutuko (UNMER Malang). Baca `docs/ARCHITECTURE.md` sebelum mengubah kode.

## Aturan kerja
1. Edit **`app.html`** (sumber tunggal). Jangan edit `src/index.html`; regenerasi dengan `node build-page.js`.
2. Setelah perubahan: `npm install` (sekali) lalu **`npm test` harus lulus**. Tambahkan pemeriksaan angka untuk fitur baru di `tests/smoke.test.js`.
3. Bahasa antarmuka: Indonesia; istilah teknis Inggris + padanan Indonesia dalam kurung.
4. **Tanpa halusinasi rujukan.** Rujukan metode di objek `CREDIT` wajib dapat diverifikasi. Jika ragu, jangan cantumkan detail yang tidak pasti.
5. Pertahankan kredit: “Dikembangkan versi lain oleh: Pindo Tutuko” (footer kiri bawah) dan rujukan SmartISM (Ahmad & Qahmash, 2021, *Sustainability* 13(16), 8801, doi:10.3390/su13168801).
6. Jangan menambah library/CDN runtime; semua diagram SVG manual. Warna hanya lewat token CSS (dukung mode gelap).
7. Jangan memakai `alert/confirm/prompt`; gunakan `confirmArm()`.
8. Rilis: naikkan `version` di `package.json`, push ke `main`; CI membangun .exe/.dmg dan menerbitkan GitHub Release.

## Perintah
```bash
npm install
npm test
node build-page.js
npm start
```

## Status & ide lanjutan
Lihat `CHANGELOG.md` (yang sudah ada) dan bagian “Ide lanjutan” di `docs/HANDOFF-CHATGPT.md`.
