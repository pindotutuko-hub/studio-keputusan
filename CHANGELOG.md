# Changelog

## 1.6.0 — 2026-10-11
- Rumpun baru **Statistik & Pemodelan Kuantitatif** dengan **dataset bersama** (tempel dari Excel/CSV, data view & variable view):
  - **Statistik setara SPSS/Stata**: deskriptif (skewness/kurtosis + SE), frekuensi, Shapiro–Wilk (Royston), korelasi Pearson/Spearman, regresi OLS (dummy otomatis, beta baku, VIF, Durbin–Watson, SE robust HC1), uji t (independen + Levene + Welch, berpasangan, satu sampel), ANOVA satu arah (+ Levene, Welch, Bonferroni, η²), Mann–Whitney, Wilcoxon, Kruskal–Wallis, crosstab χ² (+ LR, Cramér's V), Cronbach's α (item-total), analisis faktor (KMO, MSA, Bartlett, PCA + varimax Kaiser); log hasil masuk Laporan.
  - **PLS-SEM**: algoritma PLS skema path weighting, mode A/B, outer loading/weight/VIF, α, ρA, ρC, AVE, HTMT, Fornell–Larcker, cross loading, R², R² adj, f², VIF inner, efek tidak langsung/total, bootstrapping (seed, t, p, IK persentil).
  - **CB-SEM/CFA**: Maximum Likelihood (Wishart, RAM, Fisher scoring), estimasi baku, S.E./C.R./P, χ², CMIN/DF, CFI, TLI, NFI, RMSEA + IK 90% + PCLOSE, SRMR, GFI, AGFI, AIC, CR/AVE, SMC.
  - Angka diverifikasi terhadap SciPy, statsmodels, pingouin, factor_analyzer, implementasi NumPy PLS (konvensi SEMinR/SmartPLS), SciPy (ML), dan semopy.
- **Javanese House Depth** (Tutuko, 2014): depth dari titik akses, Total Depth, DR ruang tamu/keluarga/dapur, pembanding Basic Depth Ratio (TD 34), banyak rumah, kirim tabel ke dataset statistik.
- **OTTV · RTTV SNI 6389:2020** (dari EnvelopeSim): rakitan berlapis (Tabel 4–7, 9), WWR, SC efektif peneduh (Lampiran A), SF 54 kota (Tabel 8), U fenestrasi (Lampiran C), simulasi orientasi, rekomendasi butir 5.1; mereproduksi contoh Lampiran D.
- **Space Syntax**: analisis segmen angular (radius metrik, choice dengan ties eksak), VGA (grid visibilitas, clustering), pembersihan segmen duplikat DXF, ringkasan statistik per metrik.
- Menu **Tentang** di kepala halaman.

## 1.5.1 — 2026-10-11
- macOS: aplikasi kini ditandatangani **ad-hoc** saat build (hook `build/adhoc-sign.js`) dan diverifikasi di CI. Sebelumnya aplikasi Mac tidak bertanda tangan sehingga macOS terbaru dapat menolaknya dengan pesan "Malware Blocked". Notarisasi resmi Apple tetap memerlukan Apple Developer ID.

## 1.5.0 — 2026-10-11
- Menu **Sumber & Referensi**: pernyataan keaslian, rujukan semua metode per rumpun ilmu, rujukan algoritma, lisensi komponen pihak ketiga, dan cara mensitasi aplikasi.
- **Fuzzy MICMAC** (pendekatan singleton, komposisi max–min sampai konvergen; Ahmad, 2024 — SmartISM 2.0): kekuatan hubungan P/F/G/VG, perbandingan kuadran biasa vs fuzzy.
- **TISM**: tafsiran setiap hubungan langsung (Sushil, 2012), tampil di panah model dan di laporan.
- **Fuzzy AHP** (rata-rata geometrik fuzzy Buckley, 1985) sebagai pembanding AHP klasik untuk kriteria dan skor global.
- **VIKOR** (Opricovic & Tzeng, 2004) pada matriks TOPSIS: S, R, Q, syarat C1/C2, solusi kompromi.
- **Ekspor buku kerja Excel (.xlsx)** di aplikasi desktop: satu lembar per tabel hasil.
- Ekspor/impor proyek menyimpan tingkat kekuatan fuzzy dan tafsiran TISM. `license` di package.json diubah ke `UNLICENSED` sampai pemilik menetapkan lisensi.

## 1.4.0 — 2026-10-11
- **ISM multi-pakar**: setiap pakar mengisi SSIM sendiri; SSIM konsensus (modus, aturan seri terdokumentasi) dipakai untuk perhitungan; % kesepakatan per sel dan rata-rata; ekspor/impor ikut menyimpan SSIM per pakar.
- **Delphi: Kendall's W** dengan koreksi peringkat seri, uji χ² dan nilai p, tafsiran mengacu Schmidt (1997).
- Metode baru **DEMATEL**: matriks hubungan total, D+R / D−R, diagram kausal, peta pengaruh dengan ambang α, multi-pakar; tombol **ISM–DEMATEL** menyusun SSIM dari matriks T.
- Metode baru **TOPSIS**: kriteria benefit/cost, normalisasi vektor, jarak ke solusi ideal, nilai kedekatan; impor kriteria & bobot dari AHP (**AHP–TOPSIS**).
- Sintesis: ukuran baru DEMATEL (D+R, D−R) dan TOPSIS (C). Uji otomatis diperluas; angka dicocokkan dengan NumPy/SciPy.

## 1.3.0 — 2026-10-11
- Modul **Sintesis & komparasi**: gabungkan ukuran beberapa metode (normalisasi min–maks, bobot), peringkat gabungan, korelasi Spearman antarmetode.
- **Laporan gabungan**: salin ke Word/Google Docs; simpan PDF di desktop.
- **Kirim antarmodul** dari PESTEL, Kualitatif, SNA, POE, BSC, SWOT, Porter, Site Analysis, ISM, AHP ke Delphi/ISM/AHP; Site Analysis → SWOT.
- **Space Syntax v2**: mode peta axial (gambar di atas denah/peta, impor DXF/GeoJSON), Integration HH global & R3, Choice, NACH/NAIN (topologis), intelligibility, synergy, peta gradasi warna, ekspor CSV/GeoJSON.
- Uji otomatis (`npm test`) di CI sebelum build.

## 1.2.0 — 2026-10-11
- Rumpun Sosial & Arsitektur: SNA, analisis kualitatif (CDA/Etnografi/FGD), Space Syntax (convex), Site Analysis, Behavioral Mapping, POE (IPA).
- Halaman awal dikelompokkan per rumpun ilmu.

## 1.1.0 — 2026-10-11
- Rumpun Ekonomi & Manajemen: PESTEL, Porter's Five Forces, CBA, CPM/PERT, Balanced Scorecard.
- Delphi, AHP, SWOT; kombinasi Delphi→ISM/AHP, ISM→AHP, SWOT→AHP, PESTEL→SWOT.
- ISM–MICMAC dengan SSIM seret-dan-lepas, istilah Indonesia, kredit Pindo Tutuko.
