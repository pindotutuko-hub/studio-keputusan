# Melanjutkan pengembangan di ChatGPT

Repo: https://github.com/pindotutuko-hub/studio-keputusan

## Cara 1 — ChatGPT/Codex yang terhubung ke GitHub (disarankan)
1. Di ChatGPT, hubungkan akun GitHub dan beri akses ke repo `pindotutuko-hub/studio-keputusan` (repo privat butuh izin akses).
2. Pakai Codex atau mode agen yang dapat membaca/menulis repo; agen akan membaca `AGENTS.md` otomatis.
3. Tempel prompt di bawah, lalu tulis permintaan Anda di bagian akhir.

## Cara 2 — ChatGPT tanpa akses repo
Unggah berkas `app.html`, `AGENTS.md`, dan `docs/ARCHITECTURE.md` (unduh dari GitHub: tombol **Code → Download ZIP**), lalu tempel prompt di bawah. Hasil perubahan disalin kembali ke `app.html` dan di-commit melalui GitHub (ikon pensil “Edit” di halaman berkas).

## Prompt siap tempel

```
Anda melanjutkan pengembangan "Studio Keputusan" (repo GitHub: pindotutuko-hub/studio-keputusan),
aplikasi analisis strategis & keputusan lintas rumpun ilmu milik Prof. Pindo Tutuko (UNMER Malang).
Versi web = app.html; versi desktop = Electron (main.js, preload.js, build-page.js); installer dibangun
otomatis oleh GitHub Actions saat versi di package.json dinaikkan dan di-push ke main.

Sebelum mengubah apa pun, baca AGENTS.md dan docs/ARCHITECTURE.md, lalu patuhi:
- Edit app.html saja (sumber tunggal); src/index.html dihasilkan oleh `node build-page.js`.
- Ikuti pola modul (state + persist, fungsi hitung murni, renderXIn/renderXRes, TSVX, MODS, CREDIT, METHODS).
- UI berbahasa Indonesia; istilah teknis Inggris + padanan Indonesia dalam kurung.
- Kebijakan tanpa halusinasi untuk rujukan akademik: hanya rujukan yang bisa diverifikasi.
- Pertahankan kredit "Dikembangkan versi lain oleh: Pindo Tutuko" dan rujukan SmartISM (Ahmad & Qahmash, 2021).
- Tanpa library/CDN runtime; diagram SVG manual; warna lewat token CSS (mode terang & gelap).
- Tambahkan uji angka di tests/smoke.test.js dan pastikan `npm test` lulus.
- Bila merilis, naikkan "version" di package.json dan jelaskan perubahan di CHANGELOG.md.
Jawab ringkas dan langsung; tunjukkan diff atau berkas lengkap yang diubah.

Permintaan saya:
<tulis permintaan di sini>
```

## Ide lanjutan (belum dikerjakan)
- **Fuzzy ISM / Fuzzy MICMAC** (sejalan dengan SmartISM 2.0) dan **TISM** (interpretasi tautan).
- **Fuzzy AHP**, **VIKOR**, **Fuzzy DEMATEL** (DEMATEL, TOPSIS, dan ISM multi-pakar sudah tersedia sejak v1.4.0).
- **Space Syntax**: segment angular analysis, radius metrik, VGA berbasis grid — selaraskan dengan repo `pindotutuko-hub/space-syntax-analyzer` (Python) agar hasil bisa divalidasi silang.
- **Ekspor .xlsx** langsung (saat ini via salin ke Excel) dan ekspor Word (.docx) untuk laporan.
- **Penandatanganan kode** installer (Windows Authenticode, Apple notarization) agar tidak muncul peringatan keamanan.
