# Studio Keputusan

Aplikasi analisis strategis dan pengambilan keputusan lintas rumpun ilmu, untuk Windows, macOS, dan browser. Setiap metode bisa dipakai sendiri atau digabung (mis. Delphi → ISM → MICMAC, ISM–DEMATEL, AHP–TOPSIS, PESTEL → SWOT, SWOT → AHP/A'WOT).

| Rumpun ilmu | Metode |
|---|---|
| Perencanaan Wilayah & Kota | Delphi (+ Kendall's W), ISM–MICMAC (multi-pakar, Fuzzy MICMAC, TISM), AHP (+ Fuzzy AHP), SWOT, DEMATEL |
| Ekonomi, Bisnis & Manajemen | PESTEL, Porter's Five Forces, Cost-Benefit Analysis, CPM/PERT, Balanced Scorecard, TOPSIS (+ VIKOR) |
| Sosial, Humaniora & Politik | Social Network Analysis, analisis kualitatif (CDA, etnografi, FGD) |
| Arsitektur, Desain & Teknik | Space Syntax, Site Analysis, Behavioral Mapping, Post-Occupancy Evaluation (IPA) |

Dikembangkan versi lain oleh **Pindo Tutuko**. Rujukan lengkap setiap metode ada di menu **Sumber & Referensi** di dalam aplikasi. Modul ISM merujuk pada Ahmad, N., & Qahmash, A. (2021). SmartISM: Implementation and Assessment of Interpretive Structural Modeling. *Sustainability*, 13(16), 8801. https://doi.org/10.3390/su13168801 — rujukan metode lain tampil di aplikasi.

## Lintas metode
- **Sumber & Referensi**: menu tersendiri berisi pernyataan keaslian, rujukan setiap metode, lisensi komponen, dan cara mensitasi aplikasi.
- **Ekspor Excel (.xlsx)** dari semua tabel hasil (aplikasi desktop).
- **Sintesis & komparasi**: gabungkan ukuran beberapa metode untuk butir yang sama (normalisasi min–maks, bobot), peringkat gabungan, dan korelasi peringkat Spearman antarmetode.
- **Laporan gabungan**: tabel, diagram, dan rujukan semua metode dalam satu dokumen; salin ke Word atau simpan PDF (desktop).
- **Kirim antarmodul**: hasil setiap metode bisa dikirim menjadi butir Delphi, elemen ISM, atau kriteria/alternatif AHP.

## Space Syntax
Mode graf ruang convex dan **peta axial** (gambar garis di atas denah/peta, atau impor DXF/GeoJSON). Ukuran: Connectivity, Mean depth, Integration [HH] global dan R3, Choice, NACH/NAIN (versi topologis), Control, intelligibility, synergy. Peta gradasi warna; ekspor CSV dan GeoJSON. Selaras dengan roadmap [space-syntax-analyzer](https://github.com/pindotutuko-hub/space-syntax-analyzer).

## Unduh installer
Buka tab **Actions → Build installers → Run workflow**. Setelah selesai (±10 menit), unduh artifact `Studio-Keputusan-Windows` (.exe) atau `Studio-Keputusan-macOS` (.dmg). Setiap pembaruan di cabang `main` juga otomatis menerbitkan installer di halaman **Releases** (versi mengikuti `package.json`).

macOS: aplikasi ditandatangani ad-hoc tetapi belum dinotarisasi Apple. Setelah menyeret ke Applications, bila macOS menolak membukanya ("Malware Blocked" atau "damaged"), jalankan di Terminal:

    xattr -cr "/Applications/Studio Keputusan.app"
    codesign --force --deep --sign - "/Applications/Studio Keputusan.app"

lalu buka kembali (atau System Settings → Privacy & Security → Open Anyway).

## Melanjutkan dengan AI lain
Panduan untuk ChatGPT/Codex atau agen AI lain ada di [`AGENTS.md`](AGENTS.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), dan prompt siap tempel di [`docs/HANDOFF-CHATGPT.md`](docs/HANDOFF-CHATGPT.md).

## Pengembangan
    npm install
    node build-page.js   # setelah mengubah app.html
    npm start

`app.html` adalah sumber tunggal antarmuka (juga versi web); `build-page.js` membungkusnya menjadi `src/index.html` dengan font terbundel agar berjalan offline.

## Lisensi
Hak cipta © 2026 Pindo Tutuko. Lisensi distribusi belum ditetapkan (`UNLICENSED`); komponen pihak ketiga mengikuti lisensinya masing-masing (lihat menu Sumber & Referensi).

## Cara mensitasi
Tutuko, P. (2026). *Studio Keputusan* (Versi 1.5.0) [Perangkat lunak]. https://github.com/pindotutuko-hub/studio-keputusan
