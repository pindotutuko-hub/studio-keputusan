# Changelog

## 3.12.1 — 2026-11-09
- Kebijakan keamanan konten (CSP) mengizinkan `api.crossref.org` dan perantara `pindotutuko.id/sk-api` (juga untuk versi desktop), sehingga cadangan Crossref benar-benar berjalan.

## 3.12.0 — 2026-11-09
- **Literatur untuk banyak pengguna:** pencarian kini lewat perantara di server pindotutuko.id (`server/openalex.php` → `/sk-api/openalex.php`) yang memakai satu kunci API OpenAlex milik pengelola (disimpan di luar public_html), menyimpan hasil yang sama 7 hari (cache), dan membatasi 60 pencarian baru per jaringan per hari. Urutan: kunci pribadi pengguna (bila diisi) → perantara server → OpenAlex tanpa kunci → **cadangan otomatis Crossref** (judul, penulis, tahun, jurnal, sitasi, sebagian abstrak; peta kata kunci dibentuk dari judul/abstrak).
- Pemandu tujuan: “mencari tapak yang potensial untuk bangunan …” kini mengarah ke Analisis Tapak (sebelumnya optimasi yang belum tersedia).

## 3.11.1 — 2026-11-09
- **Saran metode mengikuti bidang ilmu:** bila bidang dikenali, rumusan yang lazim di bidang itu didahulukan; bila tujuan masih umum, ditampilkan “rumusan penelitian yang lazim di bidang …”. Bidang yang sama-sama cocok dengan satu kata (mis. “farmasi”) kini diputuskan ke bidang yang paling spesifik.
- **Teknik Elektro — elektronika & instrumentasi:** alat baru *analisis sinyal* (spektrum FFT radix-2 dengan jendela persegi/Hann dan koreksi ENBW, DC, RMS, puncak-ke-puncak, faktor puncak, frekuensi dominan, THD, SNR, SINAD, tapis RC lolos-rendah) dan *karakteristik statis instrumen* (sensitivitas, ofset, nonlinearitas % FSO, histeresis, galat akurasi, keterulangan); 5 rumusan riset elektronika/instrumentasi. Teknik Sipil: rumusan analisis struktur (rangka batang, balok, kolom).
- **Literatur:** tombol pencarian di Google Scholar, Garuda (artikel jurnal nasional/SINTA), daftar jurnal SINTA, dan Scopus pada kartu literatur dan panel Pustaka; bila kuota OpenAlex tanpa kunci habis, tampil pesan jelas dengan kolom kunci API, tautan membuat kunci gratis, dan alternatif impor CSV; tombol Cari menampilkan status “Mencari…”.
- Rujukan baru: Cooley & Tukey (1965), Harris (1978), Bentley (2005).

## 3.11.0 — 2026-11-09
- **Ilmu Komunikasi:** bidang analisis baru (terpisah dari Sosial & Politik) dengan konsep humas/public relations, komunikasi, warga/partisipasi, dan reputasi; 7 tujuan riset komunikasi (evaluasi efektivitas humas, pengaruh komunikasi → kepercayaan/partisipasi dengan SEM, studi kasus kualitatif relasi humas–warga, jejaring komunikasi warga, partisipasi warga, analisis isi/framing, strategi komunikasi). Perbaikan salah kenal: “komunikasi” tidak lagi dibaca “komunitas” (ekologi), “warga kampung” tidak lagi dibaca “rumah”. Prodi komunikasi pada Lampiran I dipetakan ke bidang ini.
- **Langkah 1 · Bidang ilmu di beranda:** bilah di atas kotak tujuan untuk memilih rumpun ilmu & program studi (Kepdirjen Diktiristek 163/E/KPT/2022) sebelum mulai; menampilkan jalur rumpun › kelompok › prodi yang dipakai, dan menyarankan prodi bila kalimat tujuan menyebut nama program studi (mis. “di bidang ilmu komunikasi”). - **Jendela Rumpun ilmu & program studi diperbesar dan dipandu:** tampil di tengah layar (hampir layar penuh, latar diredupkan), dengan langkah 1 Rumpun ilmu → 2 Kelompok ilmu → 3 Program studi → 4 Pakai; kartu rumpun memuat jumlah kelompok/prodi, ada kartu Profesi & spesialis, pencarian langsung lintas rumpun, dan bidang yang sedang dipakai tampil di judul. Uji `tests/v311.test.js`.

## 3.10.1 — 2026-11-09
- **Peta riset:** tombol “Peta riset” dan klik peta di kartu latar belakang kini membuka peta yang sama (ko-okurensi kata kunci, overlay tahun) — sebelumnya membuka jenis peta terakhir yang dipilih (mis. ko-kepengarangan). Jejaring kecil digambar rapat di tengah, tinggi peta dibatasi agar tidak terpotong, dan ada petunjuk bila simpul terlalu sedikit.

## 3.10.0 — 2026-11-09
- **Grafik teknik lintas bidang:** diagram Cremona utuh (diagram resiprokal Maxwell–Cremona, notasi Bow, garis beban, cek ketertutupan) pada alat rangka batang; denah skematik dari program ruang (zona publik–privat–servis, sirkulasi); diagram psikrometrik (Magnus–Alduchov & Eskridge, titik embun, rasio kelembapan, entalpi); hidrograf banjir (SCS-CN, hidrograf satuan segitiga NRCS); kurva S proyek (rencana vs realisasi); diagram interaksi kolom beton P–M (Whitney, φ ACI 318-14/SNI 2847:2019).
- **Kanvas gaya Orange — widget tersisa:** Color (palet, termasuk Okabe–Ito), Apply Domain, Select by Data Index, Create Instance, FreeViz, Pythagorean Forest, Calibrated Learner (sigmoid/Platt, isotonik), Curve Fit (Levenberg–Marquardt; model siap pakai atau rumus sendiri), Save Model / Load Model (.skmodel.json).
- **Rumpun ilmu:** Lampiran II Kepdirjen Diktiristek 163/E/KPT/2022 bagian I (20 program profesi) dan II (61 program spesialis) ditambahkan; subspesialis (bagian III) belum dimuat.
- Rujukan baru (Demšar dkk. 2007, Platt 1999, Zadrozny & Elkan 2002, Marquardt 1963, Okabe & Ito 2008, Alduchov & Eskridge 1996, ASHRAE 2017, USDA NRCS 2007, ACI 318-14, SNI 2847:2019); uji `tests/v310.test.js`.

## 3.9.0 — 2026-11-09
- **Kanvas gaya Orange dilengkapi:** PLS (NIPALS), SVM kernel RBF/polinomial (SMO; regresi kernel = kernel ridge), CN2 Rule Induction + CN2 Rule Viewer, Scoring Sheet (poin bilangan bulat, ambang terbaik tiap fitur), Stacking (prediksi validasi silang → model meta), Nomogram (regresi logistik & Scoring Sheet), Paint Data, Datasets luring (Iris, kuartet Anscombe, harga rumah fiktif, 40 kelurahan fiktif), SQL lokal (SELECT/WHERE/GROUP BY/ORDER BY/LIMIT, agregat), Python Script (ekspor skrip pandas/scikit-learn + CSV).
- **Save Images:** foto yang dibuka pada sesi berjalan disimpan dalam ukuran asli; daftar CSV mencatat asli/pratinjau.
- Rujukan baru (Clark & Niblett 1989, Wold dkk. 2001, Wolpert 1992, Platt 1998, Možina dkk. 2004, Ustun & Rudin 2016, Anscombe 1973); uji `tests/v39.test.js`.

## 3.8.0 — 2026-11-09
- **Akuntansi forensik & lintas bidang:** Hukum Benford (digit pertama/dua digit, χ², z, MAD Nigrini), Altman Z/Z′/Z″, akrual diskresioner model Jones modifikasian, Piotroski F-Score, Difference-in-Differences, rantai Markov (perubahan lahan/pangsa). Pemandu tujuan mengenali fraud triangle/diamond, manajemen laba, financial distress, uji Benford, dampak kebijakan, dan perubahan penggunaan lahan.
- **Visualisasi & grafik teknik:** peta pikiran (mind map), diagram alir (simbol ISO 5807), rangka batang 2D (gaya batang, reaksi, poligon gaya titik buhul/Cremona), balok (SFD, BMD, lendutan), aliran pipa (Reynolds, Colebrook, Darcy–Weisbach, diagram Moody), diagram hubungan ruang (bubble diagram).
- **Rumpun ilmu & program studi:** 5 rumpun, 53 kelompok, 574 program studi dari Kepdirjen Diktiristek 163/E/KPT/2022 (Lampiran I); pencarian per rumpun, kata kunci Indonesia/Inggris, metode lazim, contoh tujuan, dan pilihan bidang yang memfokuskan pemandu metode dan Pustaka. Bidang baru: Humaniora, Pertahanan & Militer, Matematika & Logika, Kebumian & Kebencanaan, Keolahragaan, Transportasi & Logistik.
- **Kanvas gaya Orange — widget baru:** Data (Data Info, Column Statistics, Edit Domain, Save Data), Transform (Data Sampler, Select Rows, Transpose, Merge Data, Concatenate, Unique, Aggregate Columns, Group by, Pivot Table, Preprocess, Continuize, Discretize, Randomize, Purge Domain, Melt, Formula, Create Class, Split), Visualize (Violin Plot, Bar Plot, Line Plot, Heat Map, Silhouette Plot, Mosaic Display, Sieve Diagram, Venn Diagram, Linear Projection/LDA, Radviz, Tree Viewer, Pythagorean Tree), Model (Constant, Logistic Regression, Random Forest, AdaBoost, Gradient Boosting, SVM linear, Neural Network, SGD), Evaluate (Predictions, ROC Analysis, Performance Curve, Calibration Plot, Feature as Predictor, Permutation Plot, Parameter Fitter; AUC di Test & Score), Image Analytics (Save Images ke ZIP). Setiap widget menautkan ke dokumentasi Orange dan mencantumkan kredit Orange (Demšar dkk., 2013); kode dan ikon ditulis ulang.
- Rujukan baru di Sumber & Referensi; uji angka `tests/v38.test.js` (numpy/hitung tangan).

## 3.7.0 — 2026-11-06
- **Biologi laut & perikanan (Sains & Matematika)**: struktur komunitas (kepadatan & kepadatan relatif, frekuensi, pola sebaran Morisita dengan uji χ², ketidakmiripan Bray–Curtis + dendrogram UPGMA); hubungan panjang–berat (W = aLᵇ, uji b = 3, faktor kondisi Fulton K dan Kn); CPUE & model surplus produksi Schaefer (E-MSY, MSY, 80% MSY); bioakumulasi logam berat (BCF, BSAF, perbandingan dengan batas yang diisi pengguna, THQ konsumsi).
- **Farmakologi & toksikologi (Kesehatan)**: dosis–respons 4 parameter (EC50 relatif, IC50 absolut, IK 95%) dan IC50 regresi linear untuk uji antioksidan DPPH; LD50/LC50 probit Finney (kemungkinan maksimum, koreksi Abbott, IK 95%, uji χ²); farmakokinetik non-kompartemen (Cmax, Tmax, AUC linear atau linear-naik/log-turun, λz, t½, AUC₀–∞, MRT, CL/F, Vz/F).
- **Pemandu tujuan**: bidang baru *Kelautan, Perikanan & Biologi Perairan* dan *Farmasi & Farmakologi*; kosakata terumbu karang, plankton, bentos, lamun, mangrove, ikan, kerang, logam berat, ekstrak, antioksidan, DPPH, IC50, LD50, toksisitas, farmakokinetik; delapan rumusan maksud baru langsung menuju alat yang tepat. Pustaka mengenali metode-metode ini dan menerjemahkan istilahnya.
- Semua hasil diuji terhadap scipy/numpy. Rujukan baru: Morisita (1959), Bray & Curtis (1957), Sokal & Michener (1958), Le Cren (1951), Froese (2006), Schaefer (1954), Arnot & Gobas (2006), U.S. EPA (1989), Motulsky & Christopoulos (2004), Brand-Williams dkk. (1995), Finney (1971), Abbott (1925), Yamaoka dkk. (1978).

## 3.6.4 — 2026-11-06
- Tautan **‹ pindotutuko.id** di kiri atas untuk kembali ke beranda situs (hanya pada versi web; tidak tampil di aplikasi desktop).

## 3.6.3 — 2026-11-06
- **Saran kata kunci** di Pustaka (minimal 5): dari topik (diterjemahkan ke istilah bahasa Inggris), istilah terkait/sinonim, metode yang disarankan, bidang ilmu, konteks lokasi (mis. Indonesia, Malang), dan kata kunci dari artikel yang sudah ditemukan.
- Kata kunci **wajib** (DAN) dan **alternatif** (ATAU) dipisah dan tetap dapat diketik manual; pratinjau kueri ditampilkan. Bawaan kini 3 istilah inti agar hasil tidak terlalu sempit; istilah yang tumpang tindih (mis. housing vs housing adequacy) dirapikan.

## 3.6.2 — 2026-11-06
- Perbaikan: tombol **📚 Literatur** di kotak tujuan kini terlihat jelas (sebelumnya teks putih di atas putih); bila tujuan belum ditulis, tombol membuka laci Pustaka dan memberi petunjuk, tidak lagi diam.

## 3.6.1 — 2026-11-06
- **Literatur langsung di kotak "Apa yang ingin Anda putuskan atau ketahui?"**: tombol **📚 + Literatur** (di samping Sarankan metode) atau **🔎 Cari literatur** pada kartu saran mencari artikel OpenAlex untuk tujuan itu, lalu menampilkan di tempat: jumlah artikel, sitasi, indeks-h; peta kata kunci (overlay tahun); tema utama dan tema baru; metode yang dipakai literatur (✓ bila sejalan dengan saran); ukuran sampel; variabel X/M/Y kandidat; celah konteks; dan draf latar belakang ringkas beserta rujukan. Tombol menuju draf pendahuluan lengkap, peta riset, variabel & hipotesis, serta matriks & daftar pustaka.
- Metode yang sering dipakai pada literatur yang ditemukan ikut menaikkan peringkat saran metode yang sesuai.

## 3.6.0 — 2026-11-06
- **Pemandu tujuan mengenali bidang ilmu** (17 bidang: Arsitektur & Desain, Perencanaan Wilayah & Kota, Teknik Sipil, Teknik Mesin & Industri, Teknik Elektro & Energi, Lingkungan, Ekonomi & Akuntansi, Manajemen & Bisnis, Kesehatan & Farmasi, Pendidikan, Psikologi, Hukum, Sosial-Politik-Komunikasi, Pertanian & Perikanan, Pariwisata, Sains/MIPA, Informatika & SI). Bidang terdeteksi dari kata dalam tujuan atau dipilih manual; saran diarahkan ke metode yang lazim di bidang itu. Bidang yang ambigu tidak dipaksakan.
- **Perbaikan salah arah**: "layak huni" tidak lagi dibaca sebagai kelayakan finansial; NPV/IRR hanya muncul untuk kelayakan finansial/ekonomi/investasi.
- Maksud baru: **menilai kelayakan huni rumah/permukiman** (POE + persepsi penghuni) dan **merumuskan usulan/arahan desain atau pengembangan** (SWOT → AHP).
- **Tujuan majemuk**: kalimat yang memuat beberapa tujuan (mis. "… dan usulan …") diurai menjadi tahap-tahap dengan metode masing-masing, disertai catatan kritis (indikator, keterkaitan antartahap, responden, keluaran sesuai bidang) dan tombol **Kerangka gabungan** yang menyusun alur bertahap dalam satu diagram.
- **📚 Pustaka — kajian pustaka & peta riset** (tombol di kepala dan di setiap kartu saran):
  - Pencarian artikel di **OpenAlex** (terbuka; kunci API gratis opsional) dan **Scopus Search API** (kunci API Elsevier milik pengguna), atau **impor CSV** dari Scopus, Web of Science, dan Publish or Perish. Kata kunci bahasa Inggris disusun otomatis dari tujuan berbahasa Indonesia dan dapat disunting; kueri Scopus (TITLE-ABS-KEY) dapat disalin.
  - **Metrik sitasi ala Publish or Perish**: jumlah artikel & sitasi, sitasi/tahun, sitasi/artikel, penulis/artikel, indeks-h, indeks-g, hI,norm, indeks-m.
  - **Peta jejaring ala VOSviewer**: ko-okurensi kata kunci (atau + frasa judul) dan ko-kepengarangan; klaster modularitas (fase lokal Louvain), tata letak gaya-berarah, tampilan klaster atau **overlay tahun terbit**; tabel simpul; ekspor berkas map & network VOSviewer, SVG/PNG.
  - **Peta keilmuan**: sebaran domain → bidang → subbidang dari topik OpenAlex.
  - **Ringkasan metodologi**: metode yang lazim (dengan tautan ke modul), ukuran sampel yang dilaporkan (median, rentang).
  - **Variabel kandidat** dari pola kalimat abstrak (Inggris & Indonesia): independen, dependen, mediasi, moderasi, kontrol; peran dapat diubah dan variabel ditambah manual; **model konseptual** (SVG) dan **hipotesis** otomatis; kirim ke Kerangka.
  - **Draf pendahuluan** per tipe riset (survei/SEM, eksperimen/klinis, observasional kesehatan, kualitatif sosial-humaniora, MIPA, rekayasa, perencanaan/MCDM, SLR/bibliometrik): latar belakang, celah penelitian, rumusan masalah, tujuan, hipotesis/proposisi, metodologi, dan daftar pustaka APA — hanya dari artikel yang benar-benar ditemukan.
  - **Matriks literatur**: penulis, judul, sumber, metode, variabel, sitasi; ekspor TSV/CSV, BibTeX, RIS (Mendeley/Zotero), salin APA.
- **Tabulasi silang (Statistik) dilengkapi**: persentase baris/kolom/total, residu terstandar disesuaikan (sel penyebab χ² bermakna), koreksi Yates dan uji eksak Fisher untuk tabel 2×2, φ, peringatan sel harapan < 5, dan grafik batang berkelompok.
- Rujukan baru: Priem dkk. (2022) OpenAlex, Scopus Search API, Harzing (2007) Publish or Perish, Hirsch (2005), Egghe (2006), van Eck & Waltman (2010) VOSviewer, Blondel dkk. (2008), Fruchterman & Reingold (1991), Fisher (1922).

## 3.5.0 — 2026-11-06
- **Alat hitung baru (Sains & Matematika):**
  - Regresi data panel: common effect (pooled OLS), fixed effect (within), random effect (Swamy–Arora), uji Chow dan uji Hausman untuk memilih model.
  - Beneish M-Score: delapan indeks dari laporan keuangan dua tahun dan nilai M dengan ambang yang dapat diubah.
  - Rekayasa nilai (value engineering): rasio biaya/nilai fungsi, indeks nilai, dan penghematan alternatif per komponen.
  - Diagram alir PRISMA 2020 untuk kajian pustaka sistematis, dengan pemeriksaan konsistensi jumlah tiap tahap.
- **Pemandu tujuan**: maksud baru SLR/PRISMA, penelitian hukum yuridis normatif/empiris, rekayasa nilai, deteksi manipulasi laba; data panel kini dikenali dari pola "N provinsi/perusahaan … tahun" dan BEI; uji sebelum–sesudah (pretest–posttest), meta-analisis, dan klasifikasi data mining lebih tepat dikenali. Perbaikan salah tangkap kata (keputusan → putusan, sesudah → sudah, pengadilan → adil).
- Rujukan baru: Baltagi (2021), Swamy & Arora (1972), Hausman (1978), Beneish (1999), Miles (1972), Page dkk. (2021).

## 3.4.0 — 2026-11-06
- **Kerangka & alur analisis** (tombol "Kerangka" di kepala dan "🧭 Kerangka" pada setiap kartu saran):
  - Kerangka dibangun otomatis dari rumusan tujuan yang dipilih: tujuan → data → uji instrumen/metode → interpretasi → kesimpulan & rekomendasi.
  - Dapat diedit: jenis langkah, nama, uraian, keluaran, metode terkait; tambah, gandakan, hapus, naik/turun; langkah "sejajar" untuk analisis paralel; ganti templat dari maksud lain.
  - Diagram alur SVG diperbarui langsung; kotak metode dapat diklik untuk membuka modulnya; unduh SVG/PNG dan salin sebagai teks; tersimpan otomatis dan ikut ekspor–impor proyek.
- **Alat hitung baru**: peramalan deret waktu (naif, rata-rata bergerak, eksponensial, Holt, tren linear; RMSE/MAE/MAPE), Location Quotient & Shift-Share, model gravitasi (Sains & Matematika); regresi logistik biner (odds ratio, IK 95%, Wald, R² McFadden), Kaplan–Meier & uji log-rank (Kesehatan & Pendidikan).
- **Pemandu tujuan diperluas** setelah uji 100 pertanyaan acak lintas bidang: maksud baru (uji beda, regresi, logistik, survival, peramalan, sektor unggulan, gravitasi, percobaan pertanian, uji diagnostik, FMEA, matriks risiko, fuzzy AHP, analisis wacana/framing, fenomenologi & grounded theory, harga hedonik, AMDAL, ergonomi, CEA, ANP, MDS/Rapfish), saran langsung membuka alat hitung yang tepat.
- Metode yang belum ada di aplikasi (GIS, konjoin, DEA, meta-analisis, bibliometrik, sentimen, optimasi/RSM, sistem dinamik, data panel, klasifikasi citra) ditandai "Sebagian/Belum tersedia" dengan rekomendasi perangkat lunak dan tautan rujukan.
- Rujukan baru di Sumber & Referensi: Dunn (1960), Isard (1960), Haynes & Fotheringham (1984), Hyndman & Athanasopoulos (2021), Hosmer dkk. (2013), Kaplan & Meier (1958), Mantel (1966).

## 3.3.0 — 2026-11-06
- **Pemandu tujuan** pada kotak "Apa yang ingin Anda putuskan atau ketahui?":
  - Korpus 49 rumusan maksud penelitian (persepsi, kepuasan, pengaruh, perbedaan kelompok, IPA, SEM, lokasi, strategi, konsensus pakar, faktor kunci, aktor, wawancara, perilaku ruang, space syntax, kelayakan, jadwal, dll.), masing-masing dengan rangkaian metode dan alasannya.
  - Pencocokan kata: sinonim Indonesia–Inggris, pelepasan imbuhan (mis. *mempengaruhi* → pengaruh), toleransi salah ketik, pembobotan istilah (IDF); kata yang dikenali dan yang belum dikenali ditampilkan.
  - Bila tujuan masih umum (mis. "penelitian tentang persepsi"): beberapa rumusan yang lebih fokus untuk dipilih, tombol "Pakai rumusan", serta pertanyaan penajam — data yang dimiliki dan hasil yang ingin diperoleh — yang langsung menyaring saran.
  - Bila tidak ditemukan: tautan pencarian rujukan metode di Google Scholar, Semantic Scholar, dan repositori kampus (.ac.id).
  - Saran diperbarui saat mengetik (tanpa menekan tombol) dan dengan tombol Enter.
- Perbaikan: nomor versi aplikasi.

## 3.2.2 — 2026-11-05
- **Pilih tampilan saat pertama dibuka**: setelah paket instalasi dipilih, muncul jendela pilihan tampilan (Tujuan & panduan · Langkah demi langkah · Alur & grafik · Klasik) dengan gambar pratinjau dan tema warna. *Tujuan & panduan* bertema *Senja* sudah terpilih sebagai bawaan; pilihan langsung terlihat di belakang jendela. Hanya muncul sekali, dapat dibuka lagi lewat tombol "Pilih tampilan…" di kepala aplikasi.

## 3.2.1 — 2026-11-05
- Tampilan *Tujuan & panduan* disamakan dengan desain Opsi B: tema **Senja** menjadi bawaan untuk pengguna baru (pilihan tema yang sudah tersimpan tidak diubah); judul besar, tombol oranye "Sarankan metode", contoh saran langsung tampil (Paling cocok / Alternatif) beserta keterangan singkat.
- Kartu "Atau pilih jenis tujuan" dipindah tepat di bawah kotak tujuan, diberi ikon berwarna dan jumlah metode · rumpun ilmu; menu data dan riwayat pemakaian di bawahnya.
- Perbaikan: nama metode tampil terbaca (BWM, Sintesis lintas metode) — sebelumnya muncul kode mentah seperti "bwm" dan "sy-res".
- Perbaikan: nomor versi di aplikasi kini sama dengan paket (3.2.1).

## 3.2.0 — 2026-11-05
- **Empat pilihan tampilan** (menu Tampilan di kepala aplikasi; tersimpan per perangkat):
  - *Klasik* — tampilan sebelumnya.
  - *Langkah demi langkah* — penanda tahap tiap metode, bilah kemajuan, kartu bantuan (apa yang ditanyakan, data yang perlu disiapkan, yang dihitung otomatis), tombol "Simpan & lanjut".
  - *Tujuan & panduan* (**bawaan**) — tulis tujuan dengan kalimat biasa → saran metode; kartu jenis tujuan; kartu metode ramah pemula dengan "Mulai dengan panduan" dan "Buka contoh terisi".
  - *Alur & grafik* — bilah alur metode yang sudah berisi data.
- **Tema warna**: Asli, Senja, Laut, Hutan, Terakota (mode terang).
- **Menu data di awal**: ketik/tempel data, buka berkas proyek, impor hasil aplikasi lain (CSV/Excel, .txt/.docx, DXF/GeoJSON, IFC, JSON), buat grafik dari data.
- **Riwayat pemakaian** (perangkat ini): metode paling sering dipakai dan terakhir dibuka.
- **Galeri grafik**: 14 jenis grafik dari tabel mana pun di halaman atau data tempel/CSV (batang, batang horizontal, lollipop, bertumpuk, tornado, garis, area, pai, donat, radar, scatter, histogram, box plot, peta panas) + pintasan ke hierarki/MICMAC, graf jaringan, Gantt; saran ★ otomatis, palet ramah buta warna, teks penjelasan, unduh SVG/PNG.
- Judul tampilan menjadi **Studio Keputusan** (nama produk installer tetap agar data pengguna desktop tidak hilang).

## 3.1.1
- Versi Inggris dilengkapi: kartu tautan Javanese House & Ruang Syntax, tombol "Denah di Javanese House", dialog Bantu saya memilih, dialog Video tutorial, dan ±190 teks lain yang hanya tampil di situs web atau setelah interaksi. Diaudit di Chromium dengan alamat situs asli (`tools/i18n-audit-browser.js`): semua langkah, data contoh, menu atas, dan dialog — tidak ada teks Indonesia tersisa selain sitasi/judul resmi.

## 3.1.0
- **Versi bahasa Inggris (English version)**: tombol **EN / ID** di bilah atas mengganti seluruh antarmuka ke bahasa Inggris dan kembali, pilihan diingat per perangkat. Kamus ±5.100 entri mencakup semua 111 langkah (audit otomatis: 13.571 teks, sisa 5 berupa sitasi dan judul resmi SNI/Kepmen yang sengaja tidak diubah).
- Mode EN memakai format angka Inggris (0.25; 1,234,567). Salin ke Excel, ekspor .xlsx, dan CSV ikut berbahasa Inggris; CSV mode EN memakai pemisah koma. Berkas proyek .json tidak diubah sehingga tetap dapat dibuka di mode mana pun.
- Rujukan/sitasi tidak diterjemahkan (kebijakan tanpa halusinasi). Alat: `tools/i18n-collect.js` (kumpulkan teks), `tools/i18n-embed.js` (tanam kamus), `tools/i18n-audit.js` (audit cakupan); uji `tests/i18n.test.js`.

## 3.0.1
- Gelar pengembang di halaman Tentang dilengkapi: Prof. Pindo Tutuko, ST., MT., PhD., PgDip.

## 3.0.0
- **Rumpun baru: Sains & Matematika (MIPA)** — Kalkulator Sains: aljabar linear (determinan, invers, Ax = b, nilai eigen), akar persamaan (bagi dua & Newton–Raphson), integral (Simpson & trapesium), PD biasa (Runge–Kutta 4), regresi & kurva kalibrasi, ketidakpastian pengukuran (GUM), massa molar & penyetaraan reaksi, pH, keanekaragaman spesies, Hardy–Weinberg, Michaelis–Menten, proyeksi penduduk, indeks pencemaran air, Streeter–Phelps.
- **Rumpun baru: Kesehatan, Farmasi, Pendidikan & Pertanian** — Kalkulator Kesehatan & Terapan: tabel 2×2 (OR, RR, χ² Pearson & Yates), uji diagnostik (IK Wilson), farmakokinetik 1 kompartemen, analisis butir soal (KR-20/21), RAL/RAK dengan uji BNT dan notasi huruf.
- Nilai p (χ², F, t) dihitung dengan fungsi gamma/beta tak lengkap; diverifikasi terhadap SciPy (tests/v30.test.js).

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
