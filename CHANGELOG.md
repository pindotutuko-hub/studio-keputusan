# Changelog

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
