# Studio Keputusan 2

Aplikasi analisis strategis, pengelolaan model, dan pengambilan keputusan lintas rumpun ilmu untuk Windows, macOS, dan browser. Versi 2 memakai identitas visual indigo–terakota dan menambahkan pusat data/model sebagai landasan integrasi analisis multidisiplin. Setiap metode bisa dipakai sendiri atau digabung (mis. Delphi → ISM → MICMAC, ISM–DEMATEL, AHP–TOPSIS, PESTEL → SWOT, SWOT → AHP/A'WOT).

| Rumpun ilmu | Metode |
|---|---|
| Data, Model & Visualisasi | Data & Model Hub: gambar, OBJ/STL, GLB/glTF, IFC/DXF, GeoJSON, CSV/XLSX, NetCDF/VTK, dan EPW |
| Perencanaan Wilayah & Kota | Delphi (+ Kendall's W), ISM–MICMAC (multi-pakar, Fuzzy MICMAC, TISM), AHP (+ Fuzzy AHP), SWOT, DEMATEL |
| Ekonomi, Bisnis & Manajemen | PESTEL, Porter's Five Forces, Cost-Benefit Analysis, CPM/PERT, Balanced Scorecard, TOPSIS (+ VIKOR) |
| Sosial, Humaniora & Politik | Social Network Analysis, analisis kualitatif (CDA, etnografi, FGD) |
| Arsitektur, Desain & Teknik | Space Syntax (convex, axial, segmen angular, VGA), Site Analysis, Behavioral Mapping, Post-Occupancy Evaluation (IPA), Javanese House Depth, OTTV · RTTV (SNI 6389:2020) |
| Statistik & Pemodelan Kuantitatif | Statistik setara SPSS/Stata (deskriptif, Shapiro–Wilk, korelasi, regresi OLS + robust, uji t + Levene, ANOVA + Welch + Bonferroni, Mann–Whitney, Wilcoxon, Kruskal–Wallis, crosstab χ², Cronbach's α, analisis faktor), PLS-SEM (+ bootstrapping), CB-SEM/CFA (ML) |
| Hukum & Kebijakan Publik | Legal & Regulatory Analysis: hierarki instrumen, kepatuhan, risiko, dan prioritas |
| Psikologi & Perilaku | Psychometrics & Intervention: statistik item dan Cronbach's α |
| Rekayasa Multidisiplin | CFD/ENVI-met/UHI, Mechanical & Thermal/FMEA, Industrial Systems/OEE/antrian, Civil Infrastructure, Electrical Systems/SAIFI/SAIDI |

## Analisis lintas disiplin v2
Data & Model Hub memproses gambar serta OBJ/STL secara lokal dan mendaftarkan metadata format BIM, GIS, cuaca, serta hasil simulasi. Versi 2.1 mengaktifkan analisis hukum dan kepatuhan, psikometri, hasil CFD/ENVI-met dan UHI, FMEA mesin, OEE dan antrian industri, prioritas aset sipil, serta beban dan keandalan sistem elektro. Modul CFD/ENVI-met menganalisis keluaran skenario; solver fisika, pembuatan mesh, dan validasi model tetap dilakukan pada perangkat lunak khusus.

## Core dan add-on
Pada pembukaan pertama, pengguna memilih profil **Basic/Core**, **Tipikal**, **Custom**, atau **Lengkap**. Profil Tipikal menyediakan konfigurasi yang lazim untuk kelompok kebutuhan tertentu. Add-on Manager dapat mengaktifkan atau menonaktifkan paket bidang kapan saja, serta memasang manifest `.skaddon.json` yang diunduh dari GitHub Releases. Manifest hanya memuat ID paket resmi dan tidak mengeksekusi kode eksternal. Pemisahan ini terutama menyiapkan distribusi solver, pustaka GIS/3D, model AI, atau aset besar di masa depan; pada versi sekarang ukuran installer masih didominasi runtime Electron.

Dikembangkan versi lain oleh **Pindo Tutuko**. Rujukan lengkap setiap metode ada di menu **Sumber & Referensi** di dalam aplikasi. Modul ISM merujuk pada Ahmad, N., & Qahmash, A. (2021). SmartISM: Implementation and Assessment of Interpretive Structural Modeling. *Sustainability*, 13(16), 8801. https://doi.org/10.3390/su13168801 — rujukan metode lain tampil di aplikasi.

## Lintas metode
- **Sumber & Referensi**: menu tersendiri berisi pernyataan keaslian, rujukan setiap metode, lisensi komponen, dan cara mensitasi aplikasi.
- **Ekspor Excel (.xlsx)** dari semua tabel hasil (aplikasi desktop).
- **Sintesis & komparasi**: gabungkan ukuran beberapa metode untuk butir yang sama (normalisasi min–maks, bobot), peringkat gabungan, dan korelasi peringkat Spearman antarmetode.
- **Laporan gabungan**: tabel, diagram, dan rujukan semua metode dalam satu dokumen; salin ke Word atau simpan PDF (desktop).
- **Kirim antarmodul**: hasil setiap metode bisa dikirim menjadi butir Delphi, elemen ISM, atau kriteria/alternatif AHP.

## Space Syntax
Mode graf ruang convex, **peta axial**, **segmen angular** (radius metrik), dan **VGA** (grid visibilitas), dengan pembersihan segmen duplikat DXF dan ringkasan statistik per metrik (alur RuangSyntax). Mode graf ruang convex dan **peta axial** (gambar garis di atas denah/peta, atau impor DXF/GeoJSON). Ukuran: Connectivity, Mean depth, Integration [HH] global dan R3, Choice, NACH/NAIN (versi topologis), Control, intelligibility, synergy. Peta gradasi warna; ekspor CSV dan GeoJSON. Selaras dengan roadmap [space-syntax-analyzer](https://github.com/pindotutuko-hub/space-syntax-analyzer).

## Modul yang diadaptasi dari aplikasi pengembang
- **Javanese House Depth**: dari House Depth Calculation v1.0 (Java; pemrograman Tristiyanto) dan Javanese House Depth Calculation (Pindo Tutuko), metode Basic Depth Ratio (Tutuko, 2014).
- **OTTV · RTTV**: dari EnvelopeSim (Dara Citra Saraswati Tutuko & Pindo Tutuko, MIT), diuji terhadap contoh Lampiran B.4, C, dan D SNI 6389:2020.
- **Space Syntax segmen/VGA**: mengikuti alur RuangSyntax (Pindo Tutuko); dihitung ulang mandiri tanpa kode DepthmapX.

Studio Keputusan tidak berafiliasi dengan IBM SPSS Statistics, Stata, SmartPLS, IBM SPSS Amos, maupun DepthmapX; nama tersebut hanya menjelaskan padanan analisis.

## Unduh installer
Buka tab **Actions → Build installers → Run workflow**. Setelah selesai (±10 menit), unduh artifact `Studio-Keputusan-Windows` (.exe) atau `Studio-Keputusan-macOS` (.dmg). Setiap pembaruan di cabang `main` juga otomatis menerbitkan installer di halaman **Releases** (versi mengikuti `package.json`).

## Buku panduan
Panduan instalasi, konfigurasi awal, seluruh rumpun analisis, Data & Model Hub, lintas metode, sintesis, ekspor, dan add-on tersedia pada [Buku Panduan Studio Keputusan 2 versi 2.4.0](docs/Panduan-Studio-Keputusan-2-v2.4.0.pdf).

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
Tutuko, P. (2026). *Studio Keputusan* (Versi 2.4.0) [Perangkat lunak]. https://github.com/pindotutuko-hub/studio-keputusan
