# Studio Keputusan

Aplikasi analisis strategis dan pengambilan keputusan lintas rumpun ilmu, untuk Windows, macOS, dan browser. Setiap metode bisa dipakai sendiri atau digabung (mis. Delphi → ISM → MICMAC, Delphi → AHP, PESTEL → SWOT, SWOT → AHP/A'WOT).

| Rumpun ilmu | Metode |
|---|---|
| Perencanaan Wilayah & Kota | Delphi, ISM–MICMAC, AHP, SWOT |
| Ekonomi, Bisnis & Manajemen | PESTEL, Porter's Five Forces, Cost-Benefit Analysis, CPM/PERT, Balanced Scorecard |
| Sosial, Humaniora & Politik | *tahap berikutnya:* Social Network Analysis, analisis kualitatif (CDA, etnografi, FGD) |
| Arsitektur, Desain & Teknik | *tahap berikutnya:* Space Syntax, Site Analysis, Behavioral Mapping, POE |

Dikembangkan versi lain oleh **Pindo Tutuko**. Modul ISM merujuk pada Ahmad, N., & Qahmash, A. (2021). SmartISM: Implementation and Assessment of Interpretive Structural Modeling. *Sustainability*, 13(16), 8801. https://doi.org/10.3390/su13168801 — rujukan metode lain tampil di aplikasi.

## Unduh installer
Buka tab **Actions → Build installers → Run workflow**. Setelah selesai (±10 menit), unduh artifact `Studio-Keputusan-Windows` (.exe) atau `Studio-Keputusan-macOS` (.dmg). Setiap pembaruan di cabang `main` juga otomatis menerbitkan installer di halaman **Releases** (versi mengikuti `package.json`).

macOS: aplikasi belum ditandatangani Apple — saat pertama dibuka, klik kanan → **Open**.

## Pengembangan
    npm install
    node build-page.js   # setelah mengubah app.html
    npm start

`app.html` adalah sumber tunggal antarmuka (juga versi web); `build-page.js` membungkusnya menjadi `src/index.html` dengan font terbundel agar berjalan offline.
