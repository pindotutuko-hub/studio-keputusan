# Changelog

## 2.9.3
- Kredit "Contributor" dihapus dari footer kiri bawah menu (atas permintaan pemilik). Kredit "Dikembangkan versi lain oleh: Pindo Tutuko" tetap.

## 2.9.2
- Video tutorial kini bernarasi suara (narator laki-laki, bahasa Indonesia) pada keempat video singkat.
- Video baru **Panduan lengkap seluruh fitur** (±11 menit): direkam langsung dari aplikasi yang sedang dioperasikan, dengan narasi dan keterangan teks.

## 2.9.1
- **Proyek terpisah** dalam satu browser: pilih/ganti/gandakan/hapus proyek di header (＋ Proyek). Tiap proyek menyimpan datanya sendiri, laporan gabungan hanya berisi proyek aktif.
- Data dari **Lensa Preseden** otomatis dibuka di proyek tersendiri "Lensa Preseden (foto)"; proyek lain (mis. perbankan) tetap utuh.
- Tombol "Baru" diganti "Kosongkan" (mengosongkan proyek aktif).
- Laporan tidak lagi mencentang Lingkungan Bangunan bila modul itu belum dipakai.

## 2.9.0 — 2026-10-30
- **Studio Kualitatif (gaya NVivo)**, enam langkah:
  - **Sumber & kasus**: transkrip/dokumen (tempel, impor .txt/.docx), kasus per sumber atau **per nama pembicara** (FGD), *classification sheet* atribut; panduan 6 fase analisis tematik (Braun & Clarke 2006); ambil data dari Analisis Kualitatif lama.
  - **Coding**: node bertingkat (induk–anak) dengan memo, coding stripes, anotasi paragraf, **dua pengode** (A/B).
  - **Query**: frekuensi kata + word cloud (stopword Indonesia/Inggris), pencarian teks dengan konteks (KWIC) + kodekan hasil, query coding dengan saringan atribut kasus.
  - **Matrix coding** (node × kasus/nilai atribut; jumlah, % baris, % kolom) dan **framework matrix** (kasus × tema).
  - **Visualisasi**: hierarchy chart (treemap), cluster analysis node (Jaccard, average linkage), ko-okurensi.
  - **Perbandingan pengode**: persen kesepakatan dan **Cohen's κ** per node (tafsiran Landis & Koch).
- **Analisis Skala Psikologi**: butir unfavorable, korelasi butir-total terkoreksi, α jika butir dihapus, **Cronbach α**, **McDonald ω**, skor total, z, T, persentil, kategori norma (3 atau 5); skor bisa ditambahkan ke dataset.
- **Analisis Citra di kanvas (gaya Orange Image Analytics)**: widget Import Images (subfolder = kategori), Image Embedding (fitur visual lokal: warna HSV, colourfulness, tekstur GLCM, arah tepi, entropi, perkiraan hijau/langit, piksel mini — bukan jaringan saraf), Image Viewer, **Image Grid** (algoritma Orange: ukuran grid berkurtosis + penugasan Hungarian); template *Analisis citra* dengan 24 citra sintetis.
- Perbaikan: menu langkah di kiri tidak lagi tertutup panel kredit.
- Angka diverifikasi terhadap scikit-learn, SciPy, scikit-image, dan NumPy — `tests/v29.test.js`.

## 2.8.0 — 2026-10-30
- **Metode baru: Lingkungan Bangunan (gaya Ecotect)** di jalur *Ruang, bangunan & lingkungan*, tujuh langkah:
  - **Lintasan matahari** stereografik (tanggal 21 tiap bulan + garis jam/analema), tabel posisi per jam, terbit/terbenam, panjang bayangan; 17 kota preset (Indonesia + Kanazawa) atau koordinat sendiri. Algoritma NOAA/Meeus, selisih < 0,01° terhadap NREL SPA (pvlib).
  - **Peneduh**: overhang + sirip, HSA/VSA (Olgyay & Olgyay 1957), **topeng bayangan** pada lintasan matahari, % kaca terkena sinar per bulan × jam, kedalaman overhang minimum.
  - **Radiasi langit cerah** pada 8 orientasi dinding + atap (Hottel 1976, Liu & Jordan 1960, model isotropik), harian, per jam, dan sepanjang tahun.
  - **Faktor cahaya alami rata-rata** (BRE, Littlefair 1988), kriteria BS 8206-2, uji kedalaman ruang, luas kaca untuk target DF.
  - **Kenyamanan termal PMV/PPD** (ISO 7730, cocok dengan pythermalcomfort), kategori A/B/C, peringatan rentang berlaku, **diagram psikrometrik** dengan zona |PMV| ≤ 0,5, pengaruh kecepatan udara.
  - **Akustik ruang**: waktu dengung Sabine & Eyring per pita oktaf 125–4000 Hz.
  - **Mawar angin** dari data tempelan (derajat atau U/TL/…/N/NE).
- **CFD · ENVI-met · UHI** dilengkapi: tempel CSV hasil ENVI-met/CFD (kolom dikenali otomatis), MRT dari **termometer bola** (ISO 7726), **heat index** (Rothfusz 1990), grafik antarskenario.
- **Space Syntax › VGA**: metrik **isovist** per titik (luas, keliling, radial maks/min, kekompakan, drift; Benedikt 1979); klik sel peta untuk melihat poligon isovist.
- **Dua pilihan tampilan: Sederhana dan Lanjutan** (tombol di kepala halaman dan beranda). Sederhana menampilkan metode tingkat Dasar–Menengah dan menu ringkas; Lanjutan menampilkan semuanya. Pilihan diingat.
- **Kanvas layar penuh** (⛶): kanvas di kiri, isian & hasil metode di panel kanan; Esc untuk keluar.
- Glosarium bertambah 12 istilah (sun path, HSA/VSA, PMV/PPD, clo/met, isovist, MRT, dll.).
- Angka diverifikasi terhadap pvlib dan pythermalcomfort — `tests/v28.test.js`.

## 2.7.2 — 2026-10-30
- **Galeri video tutorial** di aplikasi: tombol 🎬 Video tutorial (beranda dan Panduan) membuka keempat video sekaligus dengan gambar sampul; bab *Video tutorial* di Panduan memuat pemutar langsung.

## 2.7.1 — 2026-10-30
- Kanvas: satu klik pada ikon metode (AHP, ISM, SWOT, …) langsung membuka formulir isiannya di bawah kanvas dan menggulir ke sana, dengan petunjuk "isi di bawah". Kartu metode menjelaskan tempat mengisi data.
- Situs: lencana "Data dari Lensa Preseden" kini punya tombol ✕ (pt-bridge.js di tema situs).

## 2.7.0 — 2026-10-29
- **Beranda baru menurut tujuan analisis**: 10 jalur belajar (memahami konteks → menggali pendapat → memetakan hubungan → membobot & memilih → ketidakpastian & kelayakan → statistik → penggalian data → ruang & bangunan → rekayasa → melaporkan), peta alur keputusan, kotak cari, label tingkat (Dasar/Menengah/Lanjut), dan **pemandu memilih metode**. Tampilan lama per rumpun ilmu tetap tersedia.
- **Panduan metode** di setiap metode: pertanyaan yang dijawab, contoh pemakaian, diagram Masukan → Proses → Keluaran, **animasi cara kerja**, tautan ke panduan/PDF, video, dan ekspor/impor.
- **Metode baru**
  - **MCDM Lab**: SAW, WP, TOPSIS, VIKOR, PROMETHEE II (usual/linear), MOORA; bobot Manual, AHP, **Entropy**, **CRITIC**, **BWM** (model linear Rezaei 2016, simpleks); peringkat konsensus, Spearman antarmetode, **uji sensitivitas bobot**.
  - **Keputusan dalam ketidakpastian**: maximax, maximin, Hurwicz (+ sensitivitas α), Laplace, minimax regret, EMV, EVPI, **pohon keputusan**.
  - **Analisis kuadran (Diagram Kartesius)**: variabel X/Y bebas, pembagi rerata/median/acuan, nomor & nama kuadran bebas; preset IPA (Martilla & James 1977) dan Tipologi Klassen (Klaassen 1965); narasi temuan otomatis.
  - **Statistik › Visualize**: histogram, box plot, scatter + regresi, diagram batang, heatmap korelasi, Q-Q plot (unduh SVG/PNG).
- **Kanvas alur kerja gaya Orange Data Mining** (kredit: Demšar dkk., 2013, JMLR 14): widget Data, Data Table, Select Columns, Impute, Normalize, Distributions, Box Plot, Scatter Plot, Correlations, k-Means (k otomatis via silhouette), Hierarchical Clustering (dendrogram), PCA, kNN, Tree (CART, pohon digambar), Naive Bayes, Linear Regression, Test & Score (validasi silang berstrata), Confusion Matrix, Rank; plus **ikon semua metode Studio** yang bisa ditarik, disambung (Ambil: bobot AHP → TOPSIS, data → dataset/kuadran/MCDM, dst.), dan dibuka langsung di kanvas termasuk tab **Tabel & grafik** dan Laporan. Template: klasterisasi, klasifikasi, eksplorasi, alur keputusan, alur masalah, alur survei.
- **Pusat ekspor–impor**: proyek lengkap, paket metode terpilih (.json), Excel per metode/semua, CSV, grafik SVG/PNG; impor .json dengan pilihan metode, impor tabel .xlsx/.csv ke dataset, MCDM, TOPSIS, kuadran, payoff, atau kanvas. Modul baru otomatis ikut lewat `regStore()`. Menu ⇅ di setiap metode.
- **Glosarium pop-up**: 95 istilah ditandai otomatis di halaman metode, definisi singkat + tautan sumber; halaman Glosarium yang bisa dicari.
- **Panduan (manual)** di aplikasi + **PDF** (`docs/Panduan-Studio-Keputusan-2-v2.7.0.pdf`), dengan tautan langsung ke halaman PDF tiap bab; bab *Belajar statistik* (memilih uji).
- **4 video tutorial** di aplikasi (`src/video/`).
- Kredit: Contributor **You Ari Faeni** di kiri bawah menu. Lencana integrasi situs dipindah ke kanan bawah agar kredit tidak tertutup.
- Catatan rilis GitHub kini berbahasa awam (unduh yang mana, cara membuka pertama kali).
- Angka baru diverifikasi terhadap NumPy/SciPy (linprog, linkage) dan scikit-learn (KMeans, silhouette, PCA, GaussianNB, DecisionTree, KNN, f_classif) — `tests/v27.test.js`.

## 2.6.0 — 2026-10-26
- **Tautan dengan Javanese House dan Ruang Syntax** (versi web di pindotutuko.id, satu origin, lewat localStorage):
  - Dari Javanese House/Ruang Syntax, tombol *⇄ Studio Keputusan* mengirim indikator desain (kedalaman, integrasi, cincin, VGA, intelligibility axial, NACH/NAIN, UNA). Di beranda muncul kartu data masuk: pilih indikator, tetapkan benefit/cost, lalu tambahkan sebagai **alternatif desain TOPSIS**, jadikan **ruang sebagai alternatif TOPSIS**, atau muat graf ruangnya ke **Javanese House Depth** / **Space Syntax (convex)**.
  - Arah balik: tombol *⇄ Denah 2D/3D di Javanese House* pada modul Javanese House Depth dan Space Syntax (convex) membuka graf ruang sebagai denah yang disusun otomatis per kedalaman.
- Uji `tests/link.test.js`.

## 2.5.0 — 2026-10-13
- **Impor IFC (IFC2X3/IFC4)** tanpa pustaka luar — pembaca STEP sendiri (satuan, placement, property/quantity set, material, bukaan, space boundary, sumbu dinding):
  - **OTTV · RTTV**: dinding luar (luas dari quantity set, arah hadap dari placement → 8 oktan SNI, koreksi utara sejati), jendela pada bukaan, atap (IfcSlab ROOF/IfcRoof), lapisan material (IfcMaterialLayerSet; IfcMaterialList dibaca namanya, tebal diisi pengguna), laporan per dinding, tombol batalkan impor. Aturan mengikuti EnvelopeSim; diuji sama dengan `read_ifc` EnvelopeSim pada contoh kantor dan model ArchiCAD.
  - **Space Syntax**: graf ruang dari IfcSpace + pintu pada IfcRelSpaceBoundary (pintu luar → ruang "Luar"); dinding VGA dari sumbu IfcWall dengan celah pintu.
  - **Javanese House Depth**: ruang dari IfcSpace, akses dari pintu, akar = ruang berpintu luar.

## 2.4.0 — 2026-10-11
- Penyempurnaan identitas visual: menu atas memakai indigo gelap, panel langkah kiri memakai lavender–slate, dan pilihan aktif memakai aksen terakota.
- Token warna navigasi terpisah untuk mode terang dan gelap dengan kontras teks yang lebih jelas.
- Tombol, pemilih metode, judul proyek, panel kredit, hover, dan status aktif diselaraskan dalam satu tema warna.
- Buku panduan versi 2.4.0 mencakup instalasi Windows/macOS, konfigurasi Basic/Tipikal/Custom/Lengkap, seluruh rumpun analisis, Data & Model Hub, lintas metode, sintesis, laporan, dan add-on.

## 2.3.0 — 2026-10-11
- Konfigurasi pembukaan pertama: pilih **Basic/Core**, **Tipikal**, **Custom**, atau **Lengkap**. Profil Tipikal menyediakan preset kota dan bangunan, manusia dan tata kelola, serta rekayasa dan operasi.
- **Add-on Manager** untuk mengaktifkan dan menonaktifkan paket hukum, psikologi, mikroklimat, mesin, industri, sipil, dan elektro setelah aplikasi terpasang.
- Impor/ekspor manifest paket JSON yang aman: hanya ID add-on resmi yang diterima; kode eksternal tidak dieksekusi.
- Tautan katalog add-on menuju GitHub Releases resmi.
- Menu dan kartu metode otomatis mengikuti add-on yang aktif tanpa menghapus data proyek.

## 2.2.0 — 2026-10-11
- Memperluas tujuh paket multidisiplin dari penyaringan dasar menjadi analisis lanjutan.
- Hukum: kekuatan bukti dan penanda konflik norma memengaruhi prioritas telaah.
- Psikologi: evaluasi berpasangan pre–post, perubahan rerata, dan Cohen's dz bersama Cronbach's alpha.
- Mikroklimat: temperatur permukaan, reduksi temperatur terhadap baseline, dan selisih MRT–temperatur udara.
- Mesin: margin termal, MTBF, MTTR, dan availability bersama FMEA dan faktor keamanan.
- Industri: Economic Order Quantity (EOQ) bersama OEE dan antrian M/M/1.
- Sipil: utilisasi demand/capacity struktur dan debit puncak metode rasional bersama prioritas aset.
- Elektro: jatuh tegangan tiga fase dan energi operasi bersama SAIFI, SAIDI, daya aktif, dan faktor daya.

## 2.1.0 — 2026-10-11
- Mengaktifkan seluruh kartu analisis yang sebelumnya masih **Tahap berikutnya**.
- **Legal & Regulatory Analysis**: matriks hierarki instrumen, kemungkinan, dampak, gap kepatuhan, skor risiko, dan prioritas.
- **Psychometrics & Intervention**: data respons per item, statistik item, dan konsistensi internal Cronbach's alpha.
- **CFD · ENVI-met · UHI**: analisis keluaran skenario berupa intensitas UHI, apparent temperature, MRT, angin, kelembapan, dan kategori beban panas. Modul membaca ringkasan hasil—bukan menggantikan solver CFD/ENVI-met.
- **Mechanical & Thermal**: FMEA/RPN, tegangan, kekuatan izin, faktor keamanan, dan status tindakan.
- **Industrial Systems**: OEE, utilisasi, serta indikator antrian M/M/1.
- **Civil Infrastructure**: kondisi aset, risiko, biaya, indeks prioritas, dan rekomendasi penanganan.
- **Electrical Systems**: daya aktif, faktor daya, SAIFI, SAIDI, dan status sistem.
- Semua modul baru memiliki data contoh, penyimpanan lokal, ekspor/impor proyek, salin tabel, interpretasi, rujukan, dan pengujian otomatis.

## 2.0.0 — 2026-10-11
- Identitas visual baru dengan palet **indigo–terakota**, tetap mendukung mode terang dan gelap, untuk membedakan generasi v2 tanpa mengubah pola navigasi yang telah dikenal.
- **Data & Model Hub** sebagai pintu masuk aset penelitian: gambar, model 3D OBJ/STL/GLB/glTF, BIM/CAD IFC/DXF, GIS GeoJSON, tabel, cuaca EPW, dan hasil simulasi NetCDF/VTK.
- Pratinjau gambar dan ilustrasi isometrik lokal untuk OBJ/STL; metadata aset ikut tersimpan dalam proyek tanpa memasukkan berkas besar ke JSON.
- Peta pengembangan lintas disiplin untuk hukum, psikologi, CFD/ENVI-met/UHI, teknik mesin, industri, sipil, dan elektro. Kartu yang belum aktif ditandai jelas sebagai tahap berikutnya.
- Ekspor/impor proyek v2 kini menyertakan metadata Data & Model Hub; pengosongan proyek juga membersihkan daftar aset.

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
