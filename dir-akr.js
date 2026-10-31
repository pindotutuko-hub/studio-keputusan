/* Direktori Jurnal UNMER — tab "Akreditasi 2026": panduan Kepdirjen Saintek 374/DST/D.D1/HM.01.01/2026,
   simulasi kesiapan & peringkat tiap jurnal, sitasi berbasis DOI, dan status masa berlaku. */
(function () {
  "use strict";
  var A = window.PT_AKR;
  if (!A) return;
  var HAS_DATA = typeof DATA !== "undefined" && DATA && DATA.semua;
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var fmt = function (x) { return (Math.round(x * 10) / 10).toString().replace(".", ","); };

  /* ---------- 1. Isi panduan (diringkas dari Lampiran Kepdirjen 374/2026) ---------- */
  var G = {
    A: { t: "Konsistensi Identitas Jurnal", w: 2, sub: [
      { id: "A", t: "Konsistensi identitas jurnal", max: 2, lv: [[2, "Nama unik/spesifik mencerminkan (super)spesialisasi, dan identitas konsisten di laman, metadata artikel, serta judul sirahan PDF."], [1, "Nama kurang unik/kurang spesifik atau identitas kurang konsisten."], [0, "Nama tidak unik, mirip jurnal lain, memuat nama lembaga lokal, atau tidak sesuai ISSN."]],
        why: "Nama jurnal didaftarkan ke ISSN dan seharusnya tidak memakai nama institusi/penerbit. Nama lokasi boleh dipertimbangkan tetapi tidak disarankan. Penulisan nama di laman, metadata, dan sirahan PDF harus sama persis dengan data ISSN.",
        ok: "“Mintakat: Jurnal Arsitektur” — nama khas, bidang jelas, ditulis sama di laman, metadata, dan sirahan PDF.",
        no: "“Jurnal Pengabdian Masyarakat Universitas Merdeka Malang” — memuat nama institusi; atau sirahan PDF menulis singkatan yang berbeda dari nama di ISSN.",
        act: ["Samakan nama di laman, metadata OJS, sirahan galley, dan portal ISSN.", "Bila nama memuat nama institusi, pertimbangkan perubahan nama melalui ISSN (laporkan ke ARJUNA)."] }] },
    B: { t: "Tata Kelola & Keberagaman Mitra Bestari/Editor/Penulis", w: 22, sub: [
      { id: "B1", t: "Mitra bestari: komposisi, rekam jejak, keberagaman", max: 6, lv: [[6, "Aktif, rekam jejak publikasi internasional 3 tahun terakhir, dari 5 negara atau lebih, minimal 3 penelaah per naskah, ada bukti telaah."], [4, "Aktif, rekam jejak internasional, minimal 6 institusi dari 3 negara atau 8 institusi, minimal 2 penelaah per naskah, ada bukti telaah."], [2, "Aktif, rekam jejak minimal nasional, minimal 6 institusi, minimal 2 penelaah per naskah."], [1, "Aktif, rekam jejak minimal nasional, minimal 4 institusi, minimal 2 penelaah per naskah."], [0, "Tidak aktif atau tidak ada bukti telaah substantif."]],
        why: "Mitra bestari berbeda dari tim editor. Nama yang hanya dicantumkan tanpa jejak telaah di OJS tidak dihitung. Rekam jejak internasional = dalam 3 tahun terakhir minimal 1 artikel sebagai penulis utama/korespondensi atau 3 artikel sebagai penulis anggota di jurnal internasional; nasional = hal yang sama di jurnal nasional terakreditasi. Telaah tidak boleh memakai AI. Identitas fiktif/pencatutan diberi nilai terendah.",
        ok: "12 mitra bestari aktif dari 9 institusi di Indonesia, Malaysia, dan Thailand; tiap naskah ditelaah 2 orang dan komentar tersimpan di OJS → memenuhi syarat nilai 4.",
        no: "8 nama tercantum, 6 di antaranya dosen sendiri, dan di OJS hanya 1 orang yang pernah menelaah → nama yang tidak aktif tidak dihitung, nilai bisa 0–1.",
        act: ["Pastikan setiap naskah punya minimal 2 (lebih baik 3) penugasan reviewer yang tercatat di OJS.", "Tambah mitra bestari dari institusi dan negara berbeda, sesuai bidang, dengan rekam jejak 3 tahun terakhir.", "Hapus nama yang tidak pernah menelaah dari daftar."] },
      { id: "B2", t: "Mutu penyuntingan substansi oleh mitra bestari", max: 4, lv: [[4, "Komentar ketat, substantif, dan signifikan sehingga mutu isi terjaga (3 tahun terakhir)."], [2, "Komentar kurang substantif dan tidak signifikan."], [0, "Komentar hanya soal tata bahasa dan tata letak."]],
        why: "Dinilai dari konsistensi kualitas komentar telaah pada terbitan 3 tahun terakhir yang terdokumentasi di platform. Daftar mitra bestari ditampilkan sebagai daftar induk, bukan per nomor atau ucapan terima kasih per volume, agar blind review terjaga.",
        ok: "Komentar reviewer meminta penguatan analisis kesenjangan, uji ulang data, dan pembandingan dengan penelitian terbaru; tercatat di ronde review OJS.",
        no: "Komentar reviewer: “perbaiki ejaan dan format tabel” saja.",
        act: ["Pakai formulir review (review form) OJS berisi pertanyaan substansi: kebaruan, metode, analisis, simpulan.", "Arsipkan semua ronde review di OJS, jangan lewat surel."] },
      { id: "B3", t: "Tim editor: pelibatan, rekam jejak, keberagaman", max: 5, lv: [[5, "Aktif, rekam jejak internasional 3 tahun terakhir, dari 5 negara atau lebih, ada bukti aktivitas."], [3, "Aktif, rekam jejak internasional, minimal 2 negara atau 6 institusi."], [2, "Aktif, rekam jejak nasional, minimal 4 institusi."], [1, "Aktif, rekam jejak nasional, dari 2 institusi."]],
        why: "Keterlibatan editor harus terbukti di OJS. Ambang h-indeks (basis data bereputasi internasional): ilmu sosial — Ketua Editor minimal 4, anggota minimal 3; sains, teknologi, keteknikan, matematika — Ketua Editor minimal 7, anggota minimal 5. Ketua Editor wajib berafiliasi pada institusi di Indonesia. Pengangkatan bukan karena jabatan (ex-officio). Anggota tidak boleh hanya dari institusi penerbit.",
        ok: "Ketua Editor dosen UNMER (h-indeks Scopus 7), anggota dari 6 institusi di 3 negara, semuanya tercatat menangani naskah di OJS → nilai 3–5.",
        no: "Seluruh editor dari prodi sendiri, diangkat karena jabatan Kaprodi/Dekan, tidak ada jejak penanganan naskah.",
        act: ["Cek h-indeks Scopus Ketua Editor dan anggota terhadap ambang bidang.", "Tambah editor dari institusi/negara lain dan beri mereka tugas nyata di OJS (section editor)."] },
      { id: "B4", t: "Keberagaman asal penulis", max: 6, lv: [[6, "Penulis dari 5 negara atau lebih per nomor (3 tahun terakhir)."], [4, "Minimal 2 negara atau 8 institusi per nomor."], [2, "Minimal 4 institusi per nomor."], [1, "Minimal 2 institusi per nomor."], [0, "Hanya 1 institusi per nomor."]],
        why: "Dihitung per nomor terbitan selama 3 tahun terakhir. Jurnal yang 3 tahun hanya memuat penulis satu institusi diberi 0. Penulis tambahan yang disisipkan setelah naskah diterima tanpa keterangan tidak diakui. Disarankan mencantumkan data keberagaman negara penulis di data terbitan.",
        ok: "Vol. 9 No. 2 memuat 10 artikel dari 9 institusi (termasuk 1 dari Malaysia) → memenuhi 8 institusi/2 negara → nilai 4.",
        no: "Satu nomor berisi 6 artikel, 5 di antaranya dari dosen dan mahasiswa UNMER → hanya 2 institusi → nilai 1.",
        act: ["Undang penulis dari kampus mitra dan luar negeri (call for paper, konferensi bersama).", "Batasi porsi penulis internal per nomor.", "Tulis afiliasi lengkap: lembaga, kota, negara."] },
      { id: "B5", t: "Pengelolaan artikel", max: 1, lv: [[1, "Sepenuhnya lewat sistem manajemen jurnal daring (OJS)."], [0.5, "Kombinasi OJS dan surel."], [0, "Hanya surel."]],
        why: "Seluruh alur — registrasi, pengiriman, telaah, penyuntingan, praterbit, terbit, DOI — harus tampak di sistem daring dengan metadata standar (Dublin Core/OAI).",
        ok: "Penulis mengunggah revisi di OJS; reviewer mengisi formulir di OJS.",
        no: "Naskah revisi dikirim lewat WhatsApp/surel, lalu editor mengunggahnya sendiri.",
        act: ["Wajibkan semua komunikasi naskah lewat OJS.", "Matikan penerimaan naskah lewat surel."] }] },
    C: { t: "Kelengkapan Laman Jurnal", w: 7, sub: [
      { id: "C1", t: "Kebijakan proses penelaahan", max: 2, lv: [[2, "Menjelaskan semua proses peer review dengan jelas."], [1, "Menjelaskan sebagian proses."], [0, "Tidak tersedia atau tidak menjelaskan prinsip dasarnya."]],
        why: "Wajib dapat diakses dari laman depan, memuat tipe telaah (single/double blind), tahapan, kriteria, kualifikasi dan jumlah mitra bestari, batas waktu, pemeriksaan similaritas, dan pengambilan keputusan; selaras dengan COPE Guidelines on Peer-review.",
        ok: "Laman “Peer Review Process”: double-blind, 2 reviewer, telaah 3 minggu, cek Turnitin maksimal 20%, alur keputusan accept/minor/major/reject.",
        no: "Hanya satu kalimat: “Semua naskah ditelaah oleh reviewer.”",
        act: ["Tulis ulang kebijakan dengan 8 butir di atas dan tautkan di menu utama."] },
      { id: "C2", t: "Petunjuk penulisan", max: 1, lv: [[1, "Rinci dan jelas di laman maupun di templat, dan tersedia templat."], [0.5, "Rinci di laman tetapi tanpa templat."], [0, "Kurang lengkap, atau ada templat tanpa petunjuk."]],
        why: "Petunjuk harus tersaji langsung di laman (bukan hanya tautan ke templat) dan menjelaskan isi setiap bagian artikel.",
        ok: "Laman Author Guidelines menjelaskan Pendahuluan–Metode–Hasil dan Pembahasan–Simpulan, gaya sitasi APA 7, minimal 15 rujukan; disertai templat .docx.",
        no: "Laman hanya berisi “Silakan unduh templat di sini.”",
        act: ["Salin isi pokok templat ke laman Author Guidelines."] },
      { id: "C3", t: "Kebijakan penggunaan kecerdasan artifisial (AI)", max: 1, lv: [[1, "Mengatur kewajiban pengungkapan oleh penulis, batasan bagi editor, dan larangan bagi mitra bestari."], [0.5, "Ada, tetapi hanya mengatur sebagian."], [0, "Tidak ada atau hanya pernyataan umum."]],
        why: "Unsur baru 2026. Mitra bestari dilarang memakai AI untuk menganalisis, menilai, menyusun komentar, atau mengunggah naskah ke aplikasi AI. AI tidak boleh menjadi penulis dan tidak boleh menggantikan penilaian ilmiah atau keputusan editorial.",
        ok: "Laman “AI Policy”: penulis wajib menyatakan alat AI yang dipakai dan untuk apa; editor hanya boleh memakai AI untuk pemeriksaan bahasa tanpa mengunggah naskah utuh; reviewer dilarang memakai AI.",
        no: "“Jurnal ini mendukung penggunaan AI secara bertanggung jawab.”",
        act: ["Buat laman kebijakan AI dengan tiga peran (penulis, editor, reviewer) dan tautkan di menu."] },
      { id: "C4", t: "Kelengkapan laman (16 klausul COPE Transparency)", max: 3, lv: [[3, "100% klausul terpenuhi."], [2, "75% sampai kurang dari 100%."], [1, "50% sampai kurang dari 75%."], [0, "Kurang dari 50%."]],
        why: "Klausul: ISSN bertaut ke portal ISSN, tujuan & ruang lingkup, jenis naskah, jadwal terbit, akses, kontak beserta alamat fisik, hak cipta, lisensi, kepemilikan/penerbit, kriteria kepengarangan, penanganan pelanggaran riset, diskusi pascaterbit, koreksi & retraksi, pengarsipan, konflik kepentingan, kebijakan plagiasi. Tampilan laman tidak boleh dua bahasa sekaligus.",
        ok: "Menu “Policies” berisi 16 subhalaman, satu per klausul.",
        no: "Tidak ada kebijakan diskusi pascaterbit dan pengarsipan → 14/16 = 87,5% → nilai 2.",
        act: ["Gunakan daftar 16 klausul ini sebagai daftar periksa laman."] }] },
    D: { t: "Keberkalaan Penerbitan", w: 3, sub: [
      { id: "D1", t: "Jadwal terbit", max: 2, lv: [[2, "Menerapkan prapublikasi (Article in Press / Issue in Progress) dan seluruh terbitan tepat periode (3 tahun)."], [1.5, "Lebih dari 75% terbitan tepat periode."], [1, "Lebih dari 25% sampai 75%."], [0.5, "25% atau kurang."], [0, "Abstract only atau menyisipkan artikel ke nomor lama (back issue)."]],
        why: "Naskah diproses berkelanjutan, tidak menunggu mendekati tanggal terbit. Article in Press harus berupa teks penuh. Dilarang menyisipkan artikel ke nomor yang sudah terbit.",
        ok: "Terbit Mei dan November setiap tahun sesuai e-ISSN; artikel yang sudah final langsung tampil di Issue in Progress.",
        no: "Nomor Juni baru terbit September, atau artikel ditambahkan ke Vol. 7 No. 1 setelah nomor itu terbit.",
        act: ["Aktifkan Issue in Progress/continuous publishing di OJS.", "Tetapkan tanggal terbit tetap dan cantumkan di laman."] },
      { id: "D2", t: "Sistem penomoran", max: 1, lv: [[1, "Penomoran volume, nomor, halaman baik dan konsisten (3 tahun)."], [0.5, "Cukup baik/cukup konsisten."], [0, "Kurang baik/kurang konsisten."]],
        why: "Pakai angka Arab, bukan Romawi. Halaman dimulai dari 1 pada artikel pertama tiap volume baru, atau pakai nomor identitas artikel.",
        ok: "Vol. 9 No. 1 hal. 1–120, No. 2 hal. 121–245.",
        no: "Vol. IX No. II, atau halaman kembali ke 1 di setiap nomor dalam volume yang sama tanpa nomor artikel.",
        act: ["Seragamkan penomoran sejak volume berikutnya."] }] },
    E: { t: "Penyebarluasan", w: 12, sub: [
      { id: "E1", t: "Dampak ilmiah (jumlah sitasi 3 tahun)", max: 6, lv: [[6, "Lebih dari 25 sitasi di basis data bereputasi internasional dan/atau lebih dari 75 di basis data DOI."], [4, "20–25 (bereputasi) dan/atau 31–75 (DOI)."], [3, "10–19 (bereputasi) dan/atau 11–30 (DOI)."], [2, "5–9 (bereputasi) dan/atau 5–10 (DOI)."], [1, "Kurang dari 5."], [0, "Tidak dapat diverifikasi secara memadai."]],
        why: "Sumber sitasi harus tepercaya dan tidak bias: basis data pengindeks bereputasi internasional (Scopus/WoS) dan/atau basis data DOI seperti Dimensions. Google Scholar tidak disebut sebagai sumber. Sitasi diri yang berlebihan dapat mengurangi nilai.",
        ok: "Artikel 3 tahun terakhir dikutip 82 kali menurut basis data DOI → nilai 6.",
        no: "Banyak dikutip di Google Scholar, tetapi DOI tidak menyetor daftar pustaka dan sitasi DOI hanya 4 → nilai 1.",
        act: ["Setor daftar pustaka (reference linking) ke Crossref untuk setiap artikel — ini juga menambah sitasi yang terlihat bagi jurnal lain.", "Sebarkan artikel lewat repositori, media sosial ilmiah, dan konferensi."] },
      { id: "E2", t: "Visibilitas dan pengindeksan", max: 6, lv: [[6, "Tercantum dan metadata terindeks di pengindeks bereputasi internasional."], [4, "Tercantum di pengindeks bereputasi internasional tetapi metadata belum terindeks."], [3, "Tercantum dan metadata terindeks di pengindeks internasional/nasional bersistem seleksi."], [2, "Tercantum tetapi metadata belum terindeks di pengindeks bersistem seleksi."], [1, "Tercantum dan terindeks di pengindeks tanpa sistem seleksi."]],
        why: "Pengindeks dibedakan menurut ketatnya seleksi. Jurnal wajib terus mengunggah dan memantau metadata di setiap pengindeks tempatnya tercantum; metadata yang tertinggal menurunkan nilai.",
        ok: "Terindeks DOAJ dan metadata seluruh artikel terbaru sudah muncul di sana.",
        no: "Tercantum di DOAJ, tetapi dua nomor terakhir belum diunggah metadatanya.",
        act: ["Daftarkan ke DOAJ dan pengindeks bersistem seleksi lain; jadwalkan unggah metadata setiap terbit."] }] },
    F: { t: "Mutu Artikel (Substansi)", w: 34, sub: [
      { id: "F1", t: "Judul", max: 2, lv: [[2, "Lugas dan memuat temuan penting."], [1, "Lugas tetapi kurang memuat temuan."], [0, "Tidak lugas dan tidak memuat temuan."]], why: "Artikel berbahasa Indonesia wajib berjudul Indonesia dan Inggris. Lokasi riset sebaiknya tidak di judul kecuali substansinya memang tentang wilayah itu.", ok: "“Kedalaman ruang menentukan privasi rumah produktif di kampung kota”", no: "“Studi tentang rumah di Kelurahan X tahun 2024”", act: ["Editor meninjau judul agar memuat temuan pokok."] },
      { id: "F2", t: "Abstrak", max: 3, lv: [[3, "Jelas dan ringkas, dalam bahasa Inggris (atau Inggris dan Indonesia)."], [2, "Kurang jelas/kurang ringkas."], [0, "Tidak jelas."]], why: "Memuat latar (jika ada), tujuan, metode singkat, hasil, dan simpulan; tanpa rujukan pustaka/gambar/tabel.", ok: "Satu paragraf 180 kata berisi tujuan–metode–hasil–simpulan.", no: "Abstrak berisi latar belakang panjang tanpa hasil.", act: ["Sediakan pola abstrak 5 kalimat di petunjuk penulisan."] },
      { id: "F3", t: "Kata kunci", max: 1, lv: [[1, "Mencerminkan konsep penting dan memudahkan pencarian."], [0.5, "Ada tetapi kurang mencerminkan."], [0, "Tidak ada."]], why: "Kata atau frasa baku yang mewakili konsep isi.", ok: "space syntax; privasi; rumah produktif; kampung kota", no: "penelitian; analisis; Malang", act: ["Wajibkan 3–6 kata kunci di metadata OJS."] },
      { id: "F4", t: "Orisinalitas dan kebaruan", max: 7, lv: [[7, "Lengkap: state of the art, justifikasi kebaruan/analisis kesenjangan, dan tujuan riset."], [5, "Dua dari tiga hal tersebut."], [3, "Satu dari tiga."], [1, "Kurang orisinal/tidak ada analisis kesenjangan."]], why: "Dilihat terutama di Pendahuluan. Jurnal mengutamakan artikel riset asli; minimal 60% artikel per nomor harus riset asli (kecuali jurnal khusus ulasan/kasus).", ok: "Pendahuluan merangkum 8 studi terbaru, menunjukkan belum ada yang mengukur X, lalu menyatakan tujuan.", no: "Pendahuluan berisi definisi umum lalu langsung tujuan.", act: ["Tambahkan paragraf “celah riset” wajib di templat."] },
      { id: "F5", t: "Analisis dan sintesis", max: 8, lv: [[8, "Sangat mendalam: metode, temuan, interpretasi, dan pembandingan dengan periset lain."], [6, "Satu dari empat aspek tidak ditemukan."], [4, "Dua aspek tidak ditemukan."], [1, "Tiga aspek tidak ditemukan."]], why: "Analisis yang hanya mendeskripsikan temuan tanpa interpretasi dan tanpa pembandingan diberi nilai terendah.", ok: "Pembahasan membandingkan hasil dengan 5 studi lain dan menjelaskan mengapa berbeda.", no: "Hasil disajikan dalam tabel lalu diulang dalam kalimat.", act: ["Reviewer diminta menilai keempat aspek secara eksplisit di formulir review."] },
      { id: "F6", t: "Penyimpulan", max: 5, lv: [[5, "Sangat baik, menjawab tujuan dan/atau memuat implikasi."], [3, "Cukup baik."], [1, "Kurang menjawab tujuan atau masih berisi pembahasan."]], why: "Simpulan menjawab tujuan, mempertegas temuan baru, didukung fakta; saran/implikasi boleh ditambahkan.", ok: "Tiga butir simpulan, masing-masing menjawab satu tujuan.", no: "Simpulan mengulang teori dan menambah kutipan baru.", act: ["Tegaskan di petunjuk: simpulan tanpa kutipan pustaka."] },
      { id: "F7", t: "Proporsi sumber primer", max: 3, lv: [[3, "Lebih dari 80% primer dan minimal 15 rujukan."], [2, "40–80% primer, minimal 15 rujukan."], [1, "Kurang dari 40%, minimal 15 rujukan."], [0.5, "Rujukan kurang dari 15."]], why: "Sumber primer: artikel jurnal, prosiding, disertasi/tesis/skripsi, manuskrip, monograf hasil riset.", ok: "25 rujukan, 22 artikel jurnal → 88%.", no: "12 rujukan, sebagian besar buku teks dan situs web.", act: ["Tetapkan minimal 15 (disarankan 25) rujukan, mayoritas artikel jurnal."] },
      { id: "F8", t: "Kemutakhiran pustaka", max: 3, lv: [[3, "Lebih dari 80% terbit 10 tahun terakhir."], [2, "40–80%."], [1, "Kurang dari 40%."]], why: "Pustaka klasik boleh untuk akar masalah/teori, tetapi tidak untuk pembandingan hasil atau justifikasi kebaruan.", ok: "20 dari 24 rujukan terbit 2016–2026.", no: "Mayoritas rujukan sebelum 2010.", act: ["Editor memeriksa tahun rujukan saat pemeriksaan awal naskah."] },
      { id: "F9", t: "Cakupan keilmuan", max: 2, lv: [[2, "100% artikel sesuai fokus dan skop."], [1.5, "90% sampai kurang dari 100%."], [1, "80% sampai kurang dari 90%."], [0.5, "Kurang dari 80%."]], why: "Jurnal “bunga rampai” (bidang tak berkaitan) dinilai terendah; kajian antardisiplin yang terfokus tidak termasuk bunga rampai.", ok: "Semua artikel jurnal arsitektur membahas arsitektur, kota, atau permukiman.", no: "Jurnal teknik sipil memuat artikel akuntansi.", act: ["Tolak di meja editor (desk reject) naskah di luar skop."] }] },
    G: { t: "Gaya Penulisan & Penyuntingan", w: 20, sub: [
      { id: "G1", t: "Kelengkapan galley/PDF", max: 3, lv: [[3, "8–9 dari 9 unsur."], [2, "6–7 unsur."], [1, "4–5 unsur."], [0.5, "Tidak tersedia atau 1–3 unsur."]], why: "Halaman pertama PDF: (1) sirahan nama jurnal sesuai ISSN, volume, tahun, halaman/ID; (2) lisensi; (3) hak cipta; (4) riwayat naskah received–revised–accepted–published; (5) DOI. Lalu deklarasi: (6) penggunaan AI; (7) kontribusi penulis; (8) pendanaan; (9) konflik kepentingan. Data PDF harus sama dengan metadata laman.", ok: "Halaman 1 memuat kelima unsur bibliografis; akhir artikel memuat 4 deklarasi.", no: "PDF tanpa riwayat naskah dan tanpa deklarasi AI → 4/9 → nilai 1.", act: ["Perbarui templat tata letak: tambahkan kotak riwayat naskah dan 4 deklarasi."] },
      { id: "G2", t: "Nama dan afiliasi penulis", max: 1, lv: [[1, "Lengkap, benar, konsisten antarartikel."], [0.5, "Lengkap dan benar tetapi tidak konsisten."], [0, "Tidak lengkap dan tidak konsisten."]], why: "Metadata nama minimal 2 kata (nama satu kata diisi sama di depan dan belakang), nama belakang tidak disingkat satu huruf, tanpa gelar/jabatan. Afiliasi utuh: lembaga, kota, negara.", ok: "Given: Pindo · Family: Tutuko · Universitas Merdeka Malang, Malang, Indonesia", no: "Dr. Ir. P. T., M.T. · Unmer", act: ["Editor memeriksa metadata penulis sebelum terbit."] },
      { id: "G3", t: "Sistematika artikel", max: 2, lv: [[2, "Lengkap, bersistem, konsisten antarartikel dan antarterbitan."], [1, "Lengkap tetapi tidak konsisten."], [0.5, "Kurang lengkap tetapi konsisten."], [0, "Kurang lengkap dan tidak konsisten."]], why: "Artikel empiris: Pendahuluan, Metode, Hasil dan Pembahasan, Simpulan; ulasan boleh berbeda sesuai petunjuk.", ok: "Semua artikel memakai empat bab yang sama.", no: "Sebagian artikel memakai “Tinjauan Pustaka” terpisah, sebagian tidak.", act: ["Seragamkan lewat templat dan penyuntingan."] },
      { id: "G4", t: "Instrumen pendukung", max: 4, lv: [[4, "Efektif dan komplementer."], [2, "Cukup efektif."], [0, "Tidak efektif."]], why: "Tabel, gambar, persamaan, simbol, tanda baca, huruf miring/tebal dipakai dengan baku dan selalu diacu dalam teks; resolusi gambar memadai.", ok: "Setiap gambar beresolusi tinggi, bernomor, dan dirujuk di teks.", no: "Gambar buram dan tidak pernah disebut di teks.", act: ["Daftar periksa tata letak untuk gambar/tabel."] },
      { id: "G5", t: "Pengacuan dan daftar pustaka", max: 3, lv: [[3, "Baku dan konsisten (100%)."], [2, "Cukup baku, 75% sampai kurang dari 100%."], [0, "Kurang dari 75%."]], why: "Gaya sitasi sesuai petunjuk dan konsisten; semua kutipan ada di daftar pustaka dan sebaliknya. Hindari “A (2013) dalam B (2015)”. Disarankan memakai aplikasi pengelola referensi.", ok: "Seluruh artikel APA 7 dibuat dengan Mendeley/Zotero.", no: "Satu nomor mencampur APA, IEEE, dan catatan kaki.", act: ["Wajibkan aplikasi pengelola referensi."] },
      { id: "G6", t: "Istilah dan kebahasaan", max: 4, lv: [[4, "Semua artikel baku dan baik."], [3, "75% sampai kurang dari 100%."], [1, "50% sampai kurang dari 75%."], [0, "Sebagian besar kurang baik."]], why: "Istilah baku bidang ilmu dan struktur kalimat baik dan benar.", ok: "Penyuntingan bahasa oleh penyunting bahasa.", no: "Kalimat terjemahan mesin tanpa penyuntingan.", act: ["Tugaskan penyunting bahasa (copyeditor) di OJS."] },
      { id: "G7", t: "Penyuntingan, gaya selingkung, tata letak", max: 3, lv: [[3, "Sesuai standar dan konsisten antarartikel."], [2, "Sesuai standar tetapi tidak konsisten."], [1, "Kurang sesuai dan/atau tidak konsisten."]], why: "Tugas utama tim editor menjaga konsistensi isi, gaya, dan tata letak.", ok: "Semua PDF satu nomor tampil seragam.", no: "Tiap artikel berbeda huruf, margin, dan gaya judul.", act: ["Gunakan satu templat tata letak final."] }] }
  };
  var ORDER = ["A", "B", "C", "D", "E", "F", "G"];
  var SUBS = []; ORDER.forEach(function (k) { G[k].sub.forEach(function (s) { s.u = k; SUBS.push(s); }); });
  var SUBK = {}; SUBS.forEach(function (s) { SUBK[s.id] = s; });

  var MIN = [
    ["e-ISSN", "Memiliki e-ISSN; nama jurnal dan penerbit identik dengan data Portal ISSN."],
    ["Umur & frekuensi", "Terbit minimal 3 tahun berturut-turut (dihitung mundur dari tanggal pengajuan), frekuensi sesuai e-ISSN, minimal 2 kali setahun secara teratur, setiap terbitan minimal 5 artikel."],
    ["Editor & mitra bestari", "Daftar Dewan Penyunting dan Mitra Bestari berkualifikasi, memuat nama dan afiliasi, dengan keberagaman yang mencukupi."],
    ["Etika publikasi", "Kebijakan publication ethics mengacu standar COPE."],
    ["Biaya penulis", "Informasi Author Fees/APC — tetap wajib dicantumkan walaupun nol rupiah."],
    ["Akun editor", "Username dan password akun berperan editor untuk asesor menelusuri proses."],
    ["DOI aktif", "DOI aktif pada setiap artikel."],
    ["Kelayakan", "Setiap artikel terbukti ditelaah mitra bestari; penerbit valid dan berintegritas."]
  ];
  var KHUSUS = ["Minimal 60% artikel tiap nomor adalah riset asli (kecuali jurnal khusus ulasan/kasus).", "Kebijakan ketersediaan data dan reproduksibilitas penelitian.", "Laman Mitra Bestari dipisahkan dari laman Tim Editor; nama mitra bestari tidak dicantumkan per nomor atau sebagai ucapan terima kasih.", "Special Issue di luar jadwal reguler atau Supplementary Issue bertema umum tidak diperhitungkan.", "Perubahan jumlah artikel/nomor boleh asal wajar dan beralasan.", "Jurnal dengan naskah memadai disarankan menambah nomor terbitan reguler melalui ISSN Center.", "Sitasi diri yang berlebihan dapat mengurangi nilai.", "APC beserta seluruh biaya, ketentuan akses, dan layanan pihak ketiga wajib transparan, termasuk bila nol.", "Dilarang menjanjikan fast track yang menjamin penerimaan.", "Keputusan editorial bebas dari intervensi penerbit, sponsor, atau kepentingan komersial.", "Dilarang memberi Letter of Acceptance sebelum naskah berstatus accepted.", "Dilarang terlibat produksi/perantaraan naskah, menjanjikan penerimaan atau hasil akreditasi, atau memanipulasi sitasi, metadata, dan tanggal terbit.", "Penerbit wajib mengembangkan kapasitas dan integritas editor dan mitra bestari secara berkelanjutan."];

  /* ---------- 2. Penilaian otomatis dari data ---------- */
  var J = HAS_DATA ? DATA.semua : [];
  var JUR = {}; if (HAS_DATA) (DATA.jur || []).forEach(function (j) { JUR[j.id] = j; });
  var normInst = function (s) {
    s = String(s || "").replace(/\s+/g, " ").trim();
    var parts = s.split(/[,;]/).map(function (x) { return x.trim(); });
    var hit = parts.filter(function (p) { return /universit|institut|politekni|sekolah tinggi|\bstie\b|\bstikes\b|akademi|college|polytechnic|kementerian|ministry|badan |balai|lembaga|rumah sakit|hospital|academy/i.test(p); })[0];
    var x = (hit || parts[0] || "").toLowerCase().replace(/^(department|departement|jurusan|program studi|prodi|fakultas|faculty)[^,]*$/, "");
    return x.replace(/[^a-z0-9 ]/g, "").replace(/\b(the|of|di)\b/g, "").replace(/\s+/g, " ").trim();
  };
  var NEG = /(malaysia|thailand|philippines|filipina|vietnam|viet nam|japan|jepang|china|taiwan|korea|india|pakistan|bangladesh|nigeria|iran|iraq|turkey|turki|australia|new zealand|united kingdom|england|usa|united states|netherlands|belanda|germany|jerman|france|perancis|spain|italy|portugal|saudi|qatar|uae|emirates|egypt|mesir|timor|brunei|singapore|singapura|cambodia|myanmar|nepal|sri lanka|kenya|ethiopia|ghana|south africa|canada|russia|poland|hungary|austria|bahrain|jordan|oman|kuwait|yemen|morocco|algeria|tunisia|libya|sudan|uzbekistan|kazakhstan)/i;
  var negaraDari = function (aff, c) { if (c) return String(c).toUpperCase(); var m = String(aff || "").match(NEG); return m ? m[1].toLowerCase() : "id"; };
  var lvlFrom = function (v, table) { for (var i = 0; i < table.length; i++) if (table[i][0]) return table[i][1]; return 0; };

  function nilaiJurnal(s) {
    var k = s.kode, O = (A.ojs || {})[k] || null, cr = (A.cr || {})[k] || null, jr = JUR[k] || null;
    var r = { kode: k, nama: s.nama, sinta: s.sinta, sc: {}, src: {}, note: {}, min: [], ok: true };
    var set = function (id, v, src, note) { r.sc[id] = v; r.src[id] = src; if (note) r.note[id] = note; };
    /* A */
    if (/merdeka|unmer/i.test(s.nama)) set("A", 0, "data", "Nama memuat nama institusi."); else set("A", 1, "asumsi", "Konsistensi laman–metadata–PDF belum dapat diukur otomatis.");
    /* B1 dari daftar mitra bestari */
    if (jr && jr.reviewers) {
      var inst = {}, neg = {};
      jr.reviewers.forEach(function (x) { inst[normInst(x.inst || x.a) || x.n] = 1; neg[x.k || "Indonesia"] = 1; });
      if (jr.internal) { inst["universitas merdeka malang"] = 1; neg.Indonesia = 1; }
      var ni = Object.keys(inst).length, nn = Object.keys(neg).length;
      var b1 = lvlFrom(0, [[nn >= 5, 6], [(nn >= 3 && ni >= 6) || ni >= 8, 4], [ni >= 6, 2], [ni >= 4, 1], [true, 0]]);
      set("B1", b1, "data", ni + " institusi, " + nn + " negara pada daftar mitra bestari. Nilai mengandaikan semuanya aktif, berekam jejak sesuai, dan minimal 2–3 penelaah per naskah.");
    } else set("B1", 0, "data", "Daftar mitra bestari tidak ditemukan di laman jurnal.");
    set("B2", 2, "asumsi", "Mutu komentar telaah hanya bisa dinilai dari arsip review di OJS.");
    /* B3 dari dewan editor eksternal + internal */
    var eds = HAS_DATA ? (DATA.editor || []).filter(function (e) { return e.kode === k; }) : [];
    var ei = { "universitas merdeka malang": 1 }, en = { Indonesia: 1 };
    eds.forEach(function (e) { ei[normInst(e.a) || e.n] = 1; en[e.k || "Indonesia"] = 1; });
    var ni3 = Object.keys(ei).length, nn3 = Object.keys(en).length;
    set("B3", lvlFrom(0, [[nn3 >= 5, 5], [nn3 >= 2 || ni3 >= 6, 3], [ni3 >= 4, 2], [true, 1]]), "data", ni3 + " institusi, " + nn3 + " negara pada dewan editor (termasuk UNMER). Rekam jejak dan h-indeks belum diperiksa.");
    /* B4, D, F3, G2 dari terbitan OJS */
    if (O && O.issues && O.issues.length) {
      var lv = [], perIssue = [];
      O.issues.forEach(function (I) {
        var ins = {}, ng = {};
        (I.arts || []).forEach(function (a) { (a.au || []).forEach(function (u) { var key = normInst(u[2]); if (key) ins[key] = 1; ng[negaraDari(u[2], u[3])] = 1; }); });
        var ni4 = Object.keys(ins).length, nn4 = Object.keys(ng).length;
        perIssue.push({ v: I.v, n: I.n, y: I.y, inst: ni4, neg: nn4, art: (I.arts || []).length });
        lv.push(lvlFrom(0, [[nn4 >= 5, 6], [nn4 >= 2 || ni4 >= 8, 4], [ni4 >= 4, 2], [ni4 >= 2, 1], [true, 0]]));
      });
      lv.sort(function (a, b) { return a - b; });
      var med = lv[Math.floor(lv.length / 2)];
      set("B4", med, "data", "Nilai tengah dari " + lv.length + " nomor (3 tahun terakhir); nomor terlemah bernilai " + lv[0] + ". Institusi dibaca dari afiliasi penulis di metadata OJS.");
      r.issues = perIssue;
      var arts = [].concat.apply([], O.issues.map(function (I) { return I.arts || []; }));
      r.nArt = arts.length;
      r.doiCov = arts.length ? arts.filter(function (a) { return a.doi; }).length / arts.length : 0;
      r.galCov = arts.length ? arts.filter(function (a) { return a.g > 0; }).length / arts.length : 0;
      var kwAvg = arts.length ? arts.reduce(function (t, a) { return t + (a.kw || 0); }, 0) / arts.length : 0;
      set("F3", kwAvg >= 3 ? 1 : kwAvg > 0 ? 0.5 : 0, "data", "Rata-rata " + fmt(kwAvg) + " kata kunci per artikel di metadata.");
      var bad = arts.filter(function (a) { return (a.au || []).some(function (u) { var f = String(u[1] || "").trim(), g = String(u[0] || ""); return !f || /^[A-Za-z]\.?$/.test(f) || /\b(dr|prof|ir|drs|dra|s\.t|m\.t|s\.e|m\.m|m\.si|ph\.?d|s\.pd|m\.pd|s\.h|m\.h)\b\.?/i.test(g + " " + f); }); }).length;
      var affBad = arts.filter(function (a) { return (a.au || []).some(function (u) { return String(u[2] || "").split(",").length < 2; }); }).length;
      var pb = arts.length ? bad / arts.length : 1, pa = arts.length ? affBad / arts.length : 1;
      set("G2", pb < 0.05 && pa < 0.25 ? 1 : pb < 0.25 ? 0.5 : 0, "data", Math.round(pb * 100) + "% artikel bermasalah pada nama penulis (gelar, nama belakang kosong/disingkat); " + Math.round(pa * 100) + "% afiliasi tanpa kota/negara.");
      /* D1: jumlah terbitan vs frekuensi */
      var fr = parseInt(String(s.frek || "").match(/\d+/) || [2], 10) || 2;
      var yrs = {}; O.issues.forEach(function (I) { yrs[I.y] = (yrs[I.y] || 0) + 1; });
      var full = [2024, 2025].map(function (y) { return Math.min(1, (yrs[y] || 0) / fr); });
      var ratio = full.reduce(function (t, x) { return t + x; }, 0) / full.length;
      var d1 = ratio >= 1 && O.pages && O.pages.inpress ? 2 : ratio > 0.75 ? 1.5 : ratio > 0.25 ? 1 : 0.5;
      set("D1", d1, "data", "Terbitan 2024–2025 memenuhi " + Math.round(ratio * 100) + "% dari frekuensi " + fr + " kali/tahun" + (O.pages && O.pages.inpress ? "; prapublikasi terdeteksi." : "; prapublikasi (Article in Press/Issue in Progress) tidak terdeteksi.") + " Ketepatan tanggal terhadap jadwal belum dinilai.");
      var roman = (O.issueAll || []).some(function (I) { return /[IVX]/.test(String(I.v) + String(I.n)); });
      set("D2", roman ? 0.5 : 1, "data", roman ? "Ditemukan penomoran berhuruf Romawi." : "Penomoran volume/nomor memakai angka Arab.");
      /* syarat minimum */
      var yearsAll = (O.issueAll || []).map(function (I) { return +I.y; }).filter(Boolean);
      var first = yearsAll.length ? Math.min.apply(null, yearsAll) : 9999;
      var minArt = perIssue.length ? Math.min.apply(null, perIssue.map(function (x) { return x.art; })) : 0;
      var perYr = [2024, 2025].map(function (y) { return yrs[y] || 0; });
      r.min.push(["Umur ≥3 tahun", first <= 2023, "Terbit sejak " + (first === 9999 ? "?" : first)]);
      r.min.push(["≥2 terbitan/tahun", perYr.every(function (x) { return x >= 2; }), "2024: " + perYr[0] + ", 2025: " + perYr[1]]);
      r.min.push(["≥5 artikel/terbitan", minArt >= 5, "Paling sedikit " + minArt + " artikel dalam satu nomor"]);
      r.min.push(["DOI tiap artikel", r.doiCov >= 0.999, Math.round(r.doiCov * 100) + "% artikel ber-DOI (3 tahun)"]);
      r.min.push(["Teks penuh", r.galCov >= 0.999, Math.round(r.galCov * 100) + "% artikel ada galley"]);
    } else {
      set("B4", 1, "asumsi", "Terbitan 3 tahun terakhir tidak terbaca dari OJS."); set("F3", 0.5, "asumsi"); set("G2", 0.5, "asumsi"); set("D1", 1, "asumsi"); set("D2", 1, "asumsi");
      r.min.push(["Terbitan OJS", false, "Data terbitan tidak terbaca"]);
    }
    set("B5", 1, "data", "Dikelola dengan OJS (jurnal.unmer.ac.id).");
    /* C dari laman */
    var P = O && O.pages ? O.pages : null;
    if (P) {
      set("C1", P.peer ? 1 : 0, "data", P.peer ? "Laman kebijakan telaah ditemukan; nilai 2 bila seluruh 8 butir proses dijelaskan." : "Kebijakan proses telaah tidak terdeteksi di laman.");
      set("C2", P.guide && P.templ ? 1 : P.guide ? 0.5 : 0, "data", (P.guide ? "Petunjuk penulisan ada" : "Petunjuk penulisan tidak terdeteksi") + (P.templ ? ", templat ada." : ", templat tidak terdeteksi."));
      set("C3", P.ai && P.aiRev ? 1 : P.ai ? 0.5 : 0, "data", P.ai ? (P.aiRev ? "Kebijakan AI termasuk larangan bagi reviewer terdeteksi." : "Ada penyebutan AI, larangan bagi reviewer tidak terdeteksi.") : "Kebijakan AI tidak terdeteksi (unsur baru 2026).");
      var CL = [["c_issn", "ISSN"], ["c_scope", "Ruang lingkup"], ["c_types", "Jenis naskah"], ["c_sched", "Jadwal terbit"], ["c_access", "Akses terbuka"], ["c_contact", "Kontak & alamat"], ["c_copy", "Hak cipta"], ["c_lic", "Lisensi"], ["c_own", "Penerbit"], ["c_author", "Kriteria kepengarangan"], ["c_misc", "Pelanggaran riset"], ["c_post", "Diskusi pascaterbit"], ["c_retr", "Koreksi & retraksi"], ["c_arch", "Pengarsipan"], ["c_coi", "Konflik kepentingan"], ["c_plag", "Plagiasi"]];
      var got = CL.filter(function (c) { return P[c[0]]; }), miss = CL.filter(function (c) { return !P[c[0]]; });
      var pc = got.length / 16;
      set("C4", pc >= 1 ? 3 : pc >= 0.75 ? 2 : pc >= 0.5 ? 1 : 0, "data", got.length + "/16 klausul COPE terdeteksi" + (miss.length ? "; belum terlihat: " + miss.map(function (c) { return c[1]; }).join(", ") + "." : "."));
      r.min.push(["Etika publikasi (COPE)", !!P.ethics, P.ethics ? "Laman etika terdeteksi" : "Laman etika tidak terdeteksi"]);
      r.min.push(["Biaya penulis/APC", !!P.apc, P.apc ? "Informasi biaya terdeteksi" : "Informasi biaya tidak terdeteksi"]);
      r.flags = P;
    } else { set("C1", 1, "asumsi"); set("C2", 0.5, "asumsi"); set("C3", 0, "asumsi"); set("C4", 1, "asumsi"); }
    r.min.push(["e-ISSN", /\//.test(s.issn || "") || /^\d{4}-?\d{3}[\dX]$/i.test(String(s.issn || "").trim()), s.issn ? "ISSN " + s.issn : "ISSN tidak tercatat"]);
    r.min.push(["Daftar mitra bestari", !!(jr && jr.reviewers && jr.reviewers.length), jr && jr.reviewers ? jr.reviewers.length + " mitra bestari eksternal tercantum" : "Tidak tercantum"]);
    /* E */
    if (cr) {
      var c3 = cr.c3 || 0;
      set("E1", c3 > 75 ? 6 : c3 >= 31 ? 4 : c3 >= 11 ? 3 : c3 >= 5 ? 2 : 1, "data", c3 + " sitasi Crossref untuk " + (cr.n3 || 0) + " artikel ber-DOI terbitan 3 tahun terakhir (basis data DOI). Sitasi Scopus/WoS tidak tersedia; Dimensions bisa memberi angka lebih tinggi.");
      r.cr = cr;
    } else set("E1", 1, "asumsi", "Data sitasi DOI tidak tersedia.");
    set("E2", s.sinta > 0 ? 3 : 1, "asumsi", s.sinta > 0 ? "Diasumsikan tercantum di pengindeks nasional bersistem seleksi (SINTA/Garuda). Tidak ada jurnal UNMER di Scopus." : "Diasumsikan hanya di pengindeks tanpa seleksi.");
    /* F, G lain: asumsi tengah */
    var ASM = { F1: 1, F2: 2, F4: 5, F5: 6, F6: 3, F7: 2, F8: 2, F9: 1.5, G1: 2, G3: 1, G4: 2, G5: 2, G6: 3, G7: 2 };
    Object.keys(ASM).forEach(function (id) { set(id, ASM[id], "asumsi", "Perlu penilaian isi artikel; dipakai nilai tengah."); });
    if (r.doiCov != null) { r.sc.G1 = r.doiCov >= 0.999 && r.galCov >= 0.999 ? 2 : 1; r.src.G1 = "asumsi"; r.note.G1 = "DOI & galley " + Math.round(Math.min(r.doiCov, r.galCov) * 100) + "% terpenuhi; 4 deklarasi baru (AI, kontribusi, dana, konflik) dan riwayat naskah belum diperiksa per PDF."; }
    r.ok = r.min.every(function (m) { return m[1]; });
    return r;
  }
  function total(r, sc) {
    sc = sc || r.sc; var t = 0, lo = 0, hi = 0;
    SUBS.forEach(function (s) {
      var v = +sc[s.id] || 0; t += v;
      if (r.src[s.id] === "asumsi") { var vs = s.lv.map(function (l) { return l[0]; }); lo += Math.min.apply(null, vs.filter(function (x) { return x > 0; }).concat([v])); hi += Math.max.apply(null, vs); } else { lo += v; hi += v; }
    });
    return { t: t, lo: lo, hi: hi };
  }
  var peringkat = function (n) { return n >= 90 ? "Peringkat 1" : n >= 80 ? "Peringkat 2" : n >= 70 ? "Peringkat 3" : n >= 60 ? "Peringkat 4" : "Tidak terakreditasi"; };
  var pkKelas = function (n) { return n >= 70 ? "ok" : n >= 60 ? "mid" : "bad"; };
  var R = J.filter(function (s) { return s.sinta !== -1 || (A.ojs || {})[s.kode]; }).map(nilaiJurnal);
  var EDIT = {}; R.forEach(function (r) { EDIT[r.kode] = JSON.parse(JSON.stringify(r.sc)); });

  /* ---------- 3. Gaya ---------- */
  var css = document.createElement("style");
  css.textContent =
    "#p-akr .akr-sub{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0 18px}#p-akr .akr-sub button{font:inherit;font-size:12px;padding:6px 12px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--ink);cursor:pointer}#p-akr .akr-sub button.on{background:var(--ink);color:var(--paper);border-color:var(--ink)}" +
    "#p-akr .akr-sec{display:none}#p-akr .akr-sec.on{display:block}#p-akr .card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin:12px 0}" +
    "#p-akr h3{margin:18px 0 8px;font-size:17px}#p-akr h4{margin:14px 0 6px;font-size:14px}#p-akr p,#p-akr li{font-size:14px;line-height:1.6}" +
    "#p-akr .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px}#p-akr .kpi{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:12px}#p-akr .kpi b{display:block;font-size:22px}#p-akr .kpi span{font-size:12px;color:var(--muted)}" +
    "#p-akr table{border-collapse:collapse;width:100%;font-size:13px}#p-akr th,#p-akr td{padding:6px 8px;border-bottom:1px solid var(--line-soft);text-align:left;vertical-align:top}#p-akr th{font-size:11px;color:var(--muted);font-weight:600}#p-akr td.n{text-align:right;white-space:nowrap}" +
    "#p-akr .wrapx{overflow-x:auto;border:1px solid var(--line);border-radius:10px;background:var(--surface)}" +
    "#p-akr details.u{border:1px solid var(--line);border-radius:10px;background:var(--surface);margin:8px 0}#p-akr details.u>summary{cursor:pointer;padding:12px 14px;font-weight:600;list-style:none}#p-akr details.u>summary::after{content:' +';color:var(--muted)}#p-akr details.u[open]>summary::after{content:' −'}#p-akr details.u .in{padding:0 14px 12px}" +
    "#p-akr .sub{border-top:1px dashed var(--line);padding:10px 0}#p-akr .sub:target,#p-akr .sub.flash{background:var(--surface-2);outline:2px solid var(--patina);border-radius:8px;padding:10px}" +
    "#p-akr .lv{display:grid;grid-template-columns:44px 1fr;gap:4px 10px;font-size:13px;margin:6px 0}#p-akr .lv b{color:var(--patina)}" +
    "#p-akr .ex{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:8px 0}#p-akr .ex div{border-radius:8px;padding:8px 10px;font-size:13px;border:1px solid var(--line)}#p-akr .ex .g{border-left:4px solid var(--patina)}#p-akr .ex .x{border-left:4px solid var(--rust)}" +
    "#p-akr .i{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;border:1px solid currentColor;font-size:10px;font-weight:700;color:var(--patina);cursor:pointer;margin-left:4px;font-style:normal;vertical-align:1px}" +
    "#p-akr .pill{display:inline-block;padding:1px 8px;border-radius:999px;font-size:11px;border:1px solid currentColor}#p-akr .pill.ok{color:var(--patina)}#p-akr .pill.mid{color:var(--amber)}#p-akr .pill.bad{color:var(--rust)}" +
    "#p-akr .asm{color:var(--muted);font-style:italic}#p-akr select{font:inherit;font-size:12px;padding:2px 4px;border:1px solid var(--line);border-radius:6px;background:var(--surface);color:var(--ink)}" +
    "#p-akr svg text{fill:var(--ink);font-size:11px}#p-akr svg .mu{fill:var(--muted)}#p-akr .note{font-size:12px;color:var(--muted)}" +
    "@media (max-width:700px){#p-akr .ex{grid-template-columns:1fr}}";
  document.head.appendChild(css);

  /* ---------- 4. Tab & panel ---------- */
  var tabs = document.getElementById("tabs"); if (!tabs) return;
  var btn = document.createElement("button");
  btn.setAttribute("role", "tab"); btn.dataset.t = "akr"; btn.setAttribute("aria-selected", "false"); btn.textContent = "Akreditasi 2026";
  tabs.insertBefore(btn, tabs.querySelector('button[data-t="ojs"]') || tabs.querySelector('button[data-t="update"]') || null);
  var sec = document.createElement("section"); sec.className = "panel"; sec.id = "p-akr"; sec.setAttribute("role", "tabpanel");
  var ref = document.getElementById("p-ojs") || document.getElementById("p-update");
  ref.parentNode.insertBefore(sec, ref);

  var SUBNAV = [["sim", "Kesiapan tiap jurnal"], ["sit", "Sitasi & Scopus"], ["status", "Masa berlaku"], ["dasar", "Aturan pokok"], ["min", "Syarat minimum"], ["unsur", "Unsur penilaian A–G"], ["dis", "Disinsentif & larangan"], ["laksana", "Pengajuan & masa berlaku"], ["kalk", "Simulator"]];
  var info = function (id) { return "<i class='i' data-ref='" + id + "' title='Lihat penjelasan " + id + " di panduan'>i</i>"; };

  function hUnsur() {
    return ORDER.map(function (k) {
      var u = G[k];
      return "<details class='u' id='akr-" + k + "'><summary>" + k + ". " + esc(u.t) + " — bobot " + u.w + "</summary><div class='in'>" +
        u.sub.map(function (s) {
          return "<div class='sub' id='akr-" + s.id + "'><h4>" + s.id.replace(/(\w)(\d)/, "$1.$2") + " " + esc(s.t) + " <span class='note'>(maks. " + fmt(s.max) + ")</span></h4>" +
            "<p>" + esc(s.why) + "</p><div class='lv'>" + s.lv.map(function (l) { return "<b>" + fmt(l[0]) + "</b><span>" + esc(l[1]) + "</span>"; }).join("") + "</div>" +
            "<div class='ex'><div class='g'><b>Contoh memenuhi.</b> " + esc(s.ok) + "</div><div class='x'><b>Contoh kurang.</b> " + esc(s.no) + "</div></div>" +
            "<p><b>Langkah:</b> " + s.act.map(esc).join(" · ") + "</p></div>";
        }).join("") + "</div></details>";
    }).join("");
  }
  function barChart(rows, opt) {
    var W = 860, rh = 22, pad = 170, H = rows.length * rh + 40, mx = opt.max || Math.max.apply(null, rows.map(function (r) { return r.hi || r.v; }).concat([1]));
    var x = function (v) { return pad + (W - pad - 40) * v / mx; };
    var s = "<svg viewBox='0 0 " + W + " " + H + "' width='100%' role='img' aria-label='" + esc(opt.label) + "'>";
    (opt.lines || []).forEach(function (l) { s += "<line x1='" + x(l[0]) + "' x2='" + x(l[0]) + "' y1='10' y2='" + (H - 24) + "' stroke='var(--line)' stroke-dasharray='3 3'/><text class='mu' x='" + x(l[0]) + "' y='" + (H - 10) + "' text-anchor='middle'>" + esc(l[1]) + "</text>"; });
    rows.forEach(function (r, i) {
      var y = 14 + i * rh;
      s += "<text x='" + (pad - 8) + "' y='" + (y + 12) + "' text-anchor='end'>" + esc(r.l) + "</text>";
      if (r.hi != null) s += "<line x1='" + x(r.lo) + "' x2='" + x(r.hi) + "' y1='" + (y + 8) + "' y2='" + (y + 8) + "' stroke='var(--muted)' stroke-width='2'/>";
      s += "<rect x='" + pad + "' y='" + (y + 2) + "' width='" + Math.max(1, x(r.v) - pad) + "' height='12' rx='3' fill='" + (r.c || "var(--patina)") + "' opacity='" + (r.hi != null ? 0.85 : 1) + "'/>";
      s += "<text x='" + (x(r.hi != null ? r.hi : r.v) + 6) + "' y='" + (y + 12) + "'>" + esc(r.t || fmt(r.v)) + "</text>";
    });
    return s + "</svg>";
  }
  var namaPendek = function (r) { var s = String(r.nama || r.kode); return s.length > 26 ? s.slice(0, 25) + "…" : s; };

  function hSim() {
    if (!R.length) return "<p>Data jurnal belum tersedia.</p>";
    var rows = R.map(function (r) { var t = total(r, EDIT[r.kode]); return { r: r, t: t }; }).sort(function (a, b) { return b.t.t - a.t.t; });
    var siap = rows.filter(function (x) { return x.r.ok && x.t.t >= 60; }).length;
    var chart = barChart(rows.map(function (x) { return { l: namaPendek(x.r), v: x.t.t, lo: x.t.lo, hi: x.t.hi, c: x.t.t >= 70 ? "var(--patina)" : x.t.t >= 60 ? "var(--amber)" : "var(--rust)", t: fmt(x.t.t) }; }), { max: 100, label: "Perkiraan nilai akreditasi per jurnal", lines: [[60, "60 · P4"], [70, "70 · P3"], [80, "80 · P2"], [90, "90 · P1"]] });
    var tb = rows.map(function (x) {
      var r = x.r, t = x.t, cls = pkKelas(t.t);
      var gagal = r.min.filter(function (m) { return !m[1]; });
      return "<tr class='jr' data-k='" + esc(r.kode) + "' style='cursor:pointer'><td><b>" + esc(r.nama) + "</b><br><span class='note'>Sekarang: " + (r.sinta > 0 ? "SINTA " + r.sinta : "—") + "</span></td>" +
        "<td class='n'><b>" + fmt(t.t) + "</b><br><span class='note'>" + fmt(t.lo) + "–" + fmt(t.hi) + "</span></td><td><span class='pill " + cls + "'>" + peringkat(t.t) + "</span></td>" +
        ORDER.map(function (k) { var v = G[k].sub.reduce(function (a, s) { return a + (+EDIT[r.kode][s.id] || 0); }, 0); return "<td class='n'>" + fmt(v) + "/" + G[k].w + "</td>"; }).join("") +
        "<td>" + (gagal.length ? "<span class='pill bad'>" + gagal.length + " syarat</span>" : "<span class='pill ok'>lengkap</span>") + "</td></tr>";
    }).join("");
    return "<p>Perkiraan nilai akreditasi setiap jurnal UNMER menurut instrumen 2026, dihitung dari data kuantitatif yang tersedia: metadata terbitan 3 tahun terakhir di OJS, daftar mitra bestari dan dewan editor, laman kebijakan jurnal, dan sitasi berbasis DOI. Unsur yang menyangkut isi artikel (sebagian besar unsur F dan G) belum bisa diukur otomatis, sehingga diberi nilai tengah dan ditandai <span class='asm'>asumsi</span>; rentang di bawah angka menunjukkan kemungkinan terendah–tertinggi. Ini alat persiapan, bukan hasil resmi.</p>" +
      "<div class='grid'><div class='kpi'><b>" + R.length + "</b><span>jurnal disimulasikan</span></div><div class='kpi'><b>" + siap + "</b><span>lolos syarat minimum & nilai ≥60</span></div><div class='kpi'><b>" + rows.filter(function (x) { return x.t.t >= 70; }).length + "</b><span>perkiraan Peringkat 3 atau lebih</span></div><div class='kpi'><b>" + rows.filter(function (x) { return x.t.t < 60; }).length + "</b><span>perkiraan di bawah 60</span></div></div>" +
      "<div class='card'>" + chart + "<p class='note'>Batang = perkiraan nilai; garis abu-abu = rentang bila unsur asumsi bernilai terendah sampai tertinggi.</p></div>" +
      "<div class='wrapx'><table><thead><tr><th>Jurnal</th><th>Nilai</th><th>Perkiraan</th>" + ORDER.map(function (k) { return "<th>" + k + info("" + k) + "</th>"; }).join("") + "<th>Syarat minimum" + info("min") + "</th></tr></thead><tbody id='akrSimBody'>" + tb + "</tbody></table></div><p class='note'>Klik baris untuk rincian per subunsur, temuan, dan langkah perbaikan. Ikon <i class='i' style='pointer-events:none'>i</i> membuka penjelasan di panduan.</p>";
  }
  function detail(k) {
    var r = R.filter(function (x) { return x.kode === k; })[0], sc = EDIT[k], t = total(r, sc);
    var lemah = SUBS.filter(function (s) { return r.src[s.id] === "data" && (+sc[s.id] || 0) < s.max; }).map(function (s) { return { s: s, gap: s.max - (+sc[s.id] || 0) }; }).sort(function (a, b) { return b.gap - a.gap; }).slice(0, 5);
    var h = "<div class='card'><h3>" + esc(r.nama) + "</h3><p><b>" + fmt(t.t) + "</b> (rentang " + fmt(t.lo) + "–" + fmt(t.hi) + ") → <span class='pill " + pkKelas(t.t) + "'>" + peringkat(t.t) + "</span>. Ubah nilai pada kolom kanan untuk mencoba skenario perbaikan; total diperbarui langsung.</p>";
    h += "<h4>Syarat minimum" + info("min") + "</h4><ul>" + r.min.map(function (m) { return "<li>" + (m[1] ? "✔︎" : "✘") + " <b>" + esc(m[0]) + "</b> — " + esc(m[2]) + "</li>"; }).join("") + "</ul>";
    if (lemah.length) h += "<h4>Peluang kenaikan terbesar (dari data)</h4><ol>" + lemah.map(function (x) { return "<li><b>" + x.s.id + " " + esc(x.s.t) + "</b>" + info(x.s.id) + " — kurang " + fmt(x.gap) + " poin. " + esc(r.note[x.s.id] || "") + " <i>" + esc(x.s.act[0]) + "</i></li>"; }).join("") + "</ol>";
    if (r.issues && r.issues.length) h += "<h4>Keberagaman penulis per nomor" + info("B4") + "</h4><div class='wrapx'><table><thead><tr><th>Nomor</th><th>Artikel</th><th>Institusi</th><th>Negara</th></tr></thead><tbody>" + r.issues.map(function (x) { return "<tr><td>Vol. " + esc(x.v) + " No. " + esc(x.n) + " (" + esc(x.y) + ")</td><td class='n'>" + x.art + "</td><td class='n'>" + x.inst + "</td><td class='n'>" + x.neg + "</td></tr>"; }).join("") + "</tbody></table></div>";
    h += "<h4>Rincian subunsur</h4><div class='wrapx'><table><thead><tr><th>Subunsur</th><th>Sumber</th><th>Temuan</th><th>Nilai</th></tr></thead><tbody>" +
      SUBS.map(function (s) {
        var opts = s.lv.map(function (l) { return "<option value='" + l[0] + "'" + (+sc[s.id] === l[0] ? " selected" : "") + ">" + fmt(l[0]) + "</option>"; }).join("");
        return "<tr><td>" + s.id + " " + esc(s.t) + info(s.id) + "</td><td>" + (r.src[s.id] === "data" ? "data" : "<span class='asm'>asumsi</span>") + "</td><td class='note'>" + esc(r.note[s.id] || "") + "</td><td><select data-k='" + esc(k) + "' data-s='" + s.id + "'>" + opts + "</select> / " + fmt(s.max) + "</td></tr>";
      }).join("") + "</tbody></table></div><p><button type='button' data-reset='" + esc(k) + "'>Kembalikan nilai awal</button></p></div>";
    return h;
  }
  function hSitasi() {
    var rows = R.filter(function (r) { return r.cr; }).map(function (r) { return { l: namaPendek(r), v: r.cr.c3, t: r.cr.c3 + " sitasi · " + r.cr.n3 + " artikel", r: r }; }).sort(function (a, b) { return b.v - a.v; });
    var tot3 = rows.reduce(function (t, x) { return t + x.v; }, 0), art3 = rows.reduce(function (t, x) { return t + x.r.cr.n3; }, 0);
    var totAll = R.reduce(function (t, r) { return t + (r.cr ? r.cr.cAll : 0); }, 0), artAll = R.reduce(function (t, r) { return t + (r.cr ? r.cr.nAll : 0); }, 0);
    var yr = {}; R.forEach(function (r) { if (r.cr && r.cr.yr) Object.keys(r.cr.yr).forEach(function (y) { if (+y >= 2015 && +y <= 2026) { yr[y] = yr[y] || [0, 0]; yr[y][0] += r.cr.yr[y][0]; yr[y][1] += r.cr.yr[y][1]; } }); });
    var ys = Object.keys(yr).sort();
    var lvl = function (c) { return c > 75 ? 6 : c >= 31 ? 4 : c >= 11 ? 3 : c >= 5 ? 2 : 1; };
    var dist = [6, 4, 3, 2, 1].map(function (v) { return [v, rows.filter(function (x) { return lvl(x.v) === v; }).length]; });
    var cs = (A.citedness || []);
    return "<p>Juknis 2026 (subunsur E.1" + info("E1") + ") menghitung sitasi 3 tahun terakhir dari basis data pengindeks bereputasi internasional dan/atau basis data DOI. Karena tidak ada jurnal UNMER yang terindeks Scopus, angka yang bisa diverifikasi saat ini adalah sitasi berbasis DOI dari Crossref untuk artikel terbitan " + esc(A.citFrom || "31 Oktober 2023") + " sampai " + esc(A.atLabel || A.at) + ".</p>" +
      "<div class='grid'><div class='kpi'><b>" + tot3 + "</b><span>sitasi DOI, artikel 3 tahun terakhir</span></div><div class='kpi'><b>" + art3 + "</b><span>artikel ber-DOI 3 tahun terakhir</span></div><div class='kpi'><b>" + totAll + "</b><span>sitasi DOI seluruh arsip</span></div><div class='kpi'><b>" + artAll + "</b><span>artikel ber-DOI seluruh arsip</span></div><div class='kpi'><b>0</b><span>jurnal terindeks Scopus (cek SCImago " + esc(A.atLabel || A.at) + ")</span></div></div>" +
      "<div class='card'><h4>Sitasi DOI per jurnal (artikel 3 tahun terakhir)</h4>" + barChart(rows, { label: "Sitasi DOI per jurnal", lines: [[5, "5"], [11, "11"], [31, "31"], [76, "76"]] }) + "<p class='note'>Garis putus-putus = ambang nilai E.1 berbasis DOI: 5 (nilai 2), 11 (3), 31 (4), >75 (6).</p></div>" +
      "<div class='card'><h4>Sebaran nilai E.1 berbasis DOI</h4>" + barChart(dist.map(function (d) { return { l: "Nilai " + d[0], v: d[1], t: d[1] + " jurnal" }; }), { label: "Sebaran nilai E1" }) + "</div>" +
      (ys.length ? "<div class='card'><h4>Rekap seluruh jurnal per tahun terbit artikel</h4>" + barChart(ys.map(function (y) { return { l: y + " (" + yr[y][0] + " artikel)", v: yr[y][1], t: yr[y][1] + " sitasi" }; }), { label: "Sitasi DOI per tahun terbit" }) + "<p class='note'>Sitasi yang diterima artikel menurut tahun terbit artikelnya, seluruh jurnal UNMER.</p></div>" : "") +
      "<div class='card'><h4>Citedness in Scopus</h4><p>Empat jurnal memasang menu “Scopus Citedness” berisi lembar kerja yang diisi sendiri oleh pengelola: " + cs.map(function (c) { return "<a href='" + esc(c.url) + "' target='_blank' rel='noopener'>" + esc(c.nama) + "</a>"; }).join(", ") + ". Angka itu menghitung kutipan dari artikel berindeks Scopus, bukan indeksasi jurnal, dan belum dapat diverifikasi dari sini. Untuk dipakai pada E.1, angka sitasi Scopus perlu diunduh dari akun Scopus institusi (pencarian referensi berdasarkan judul sumber) lalu dimasukkan ke aplikasi ini.</p></div>" +
      "<p class='note'>Crossref hanya menghitung kutipan dari penerbit yang menyetor daftar pustaka; jurnal yang belum menyetor reference list juga tidak “memberi” sitasi ke jurnal lain. Angka Google Scholar umumnya jauh lebih besar tetapi tidak dipakai instrumen ini.</p>";
  }
  function hStatus() {
    var H = A.hist || {}, rows = J.map(function (s) {
      var segs = H[s.kode] || null, last = segs ? segs[segs.length - 1] : null, end = last ? +last.b : null, now = 2026;
      var st = !last ? ["bad", "Belum tercatat di SINTA"] : end < now ? ["bad", "Berakhir " + end + " — ajukan paling lambat 2 tahun sejak berakhir sebagai akreditasi ulang, setelah itu dihitung akreditasi baru"] : end === now ? ["mid", "Berakhir 2026 — batas akreditasi ulang 6 bulan sebelum tanggal akhir di SK kemungkinan sudah lewat; segera cek SK"] : ["ok", "Berlaku sampai " + end + " — ajukan ulang paling lambat 6 bulan sebelum tanggal akhir di SK, setelah menerbitkan minimal 3 nomor baru"];
      var catat = last && +last.r >= 5 ? " Peringkat " + last.r + " tetap berlaku sampai habis (Permendiktisaintek 9/2026 Pasal 16); pada pengajuan berikutnya hanya ada Peringkat 1–4, jadi nilai minimal 60." : "";
      return "<tr><td><b>" + esc(s.nama) + "</b></td><td>" + (segs ? segs.map(function (g) { return "S" + g.r + " " + g.a + (g.a !== g.b ? "–" + g.b : ""); }).join(" → ") : "—") + "</td><td><span class='pill " + st[0] + "'>" + esc(st[1]) + "</span>" + esc(catat) + "</td></tr>";
    }).join("");
    return "<p>Riwayat peringkat dibaca dari profil SINTA setiap jurnal pada " + esc(A.atLabel || A.at) + " (tahun-tahun yang tercantum di grafik riwayat SINTA). Tanggal mulai dan akhir yang pasti ada pada SK Direktur Jenderal masing-masing.</p><div class='wrapx'><table><thead><tr><th>Jurnal</th><th>Riwayat SINTA</th><th>Status & langkah" + info("laksana") + "</th></tr></thead><tbody>" + rows + "</tbody></table></div>";
  }
  function hDasar() {
    return "<div class='card'><h3>Apa yang berubah pada 2026</h3><ul>" +
      "<li><b>Dasar hukum baru.</b> Permendiktisaintek Nomor 9 Tahun 2026 tentang Akreditasi Jurnal Ilmiah (ditetapkan 29 Juni 2026, diundangkan 7 Juli 2026) menggantikan Permenristekdikti 9/2018. Petunjuk teknisnya: Keputusan Dirjen Sains dan Teknologi Nomor 374/DST/D.D1/HM.01.01/2026 (ditetapkan 6 Agustus 2026, disampaikan dengan surat 922/DST/D.D1/HM.01.01/2026 tanggal 10 Agustus 2026), yang mencabut Kepdirjen 134/E/KPT/2021.</li>" +
      "<li><b>Peringkat tinggal 1–4.</b> Keluaran: Terakreditasi Peringkat 1 (90–100), 2 (80–<90), 3 (70–<80), 4 (60–<70), atau Tidak Terakreditasi (<60). Peringkat 5 dan 6 tidak lagi diberikan.</li>" +
      "<li><b>Peringkat lama tetap berlaku</b> sampai masa berlakunya habis (Permendiktisaintek 9/2026 Pasal 16).</li>" +
      "<li><b>Masa berlaku 5 tahun</b>; jurnal wajib mencantumkan peringkat, nomor dan tanggal SK, serta tanggal akhir masa berlaku di laman.</li>" +
      "<li><b>Bobot:</b> tata kelola 46 (A 2, B 22, C 7, D 3, E 12) dan mutu artikel 54 (F 34, G 20).</li>" +
      "<li><b>Unsur baru yang menonjol:</b> kebijakan AI (C.3), larangan AI bagi mitra bestari, empat deklarasi di setiap artikel (AI, kontribusi penulis, pendanaan, konflik kepentingan), prapublikasi Article in Press/Issue in Progress (D.1), ambang h-indeks editor, kebijakan ketersediaan data, dan disinsentif Ethical Clearance.</li></ul></div>" +
      "<div class='card'><h3>Alur penilaian</h3><ol><li><b>Pengajuan</b> lewat ARJUNA: isi borang, masukkan seluruh nomor yang diajukan, pastikan teks penuh dapat diakses, sediakan akun editor, tekan “Siap Akreditasi”.</li><li><b>Pemeriksaan Awal</b> — 15 butir kriteria minimum" + info("min") + ".</li><li><b>Pemeriksaan Kelayakan</b> — setiap artikel ditelaah mitra bestari; validitas dan integritas penerbit.</li><li><b>Penilaian</b> tata kelola dan mutu artikel berjalan paralel" + info("A") + ", lalu <b>disinsentif</b> bila ada pelanggaran" + info("dis") + ".</li><li><b>Penetapan</b> — rapat pleno asesor, verifikasi Tim Akreditasi, SK Direktur Jenderal.</li></ol></div>" +
      "<p class='note'>Sumber: salinan Kepdirjen 374/DST/D.D1/HM.01.01/2026 beserta surat pengantarnya; Permendiktisaintek 9/2026. Panduan ini meringkas; bila ada perbedaan, dokumen resmi yang berlaku.</p>";
  }
  function hMin() {
    return "<div class='card' id='akr-min'><h3>Pemeriksaan Awal (kriteria minimum)</h3><p>Jurnal yang tidak lolos tahap ini tidak dinilai. Asesor memeriksa 15 butir: validitas laman; nama dan penerbit sesuai ISSN; jenis dan waktu usulan; frekuensi; keberkalaan 3 tahun; pencantuman peringkat dan masa berlaku; laman etika; laman biaya; DOI aktif; teks penuh; keberagaman afiliasi editor; keberagaman afiliasi mitra bestari; validitas akun; dan peran editor pada akun.</p><ul>" +
      MIN.map(function (m) { return "<li><b>" + esc(m[0]) + ".</b> " + esc(m[1]) + "</li>"; }).join("") + "</ul>" +
      "<div class='ex'><div class='g'><b>Contoh lolos.</b> Terbit sejak 2019, dua kali setahun sesuai e-ISSN, setiap nomor 8 artikel, semua ber-DOI aktif dan ber-PDF, laman etika COPE dan laman “Author Fees: Rp0” tersedia.</div><div class='x'><b>Contoh gagal.</b> Satu nomor 2024 hanya memuat 4 artikel, atau 3 artikel belum ber-DOI → tidak lolos Pemeriksaan Awal. Bila gagal karena frekuensi/keberkalaan, pengajuan berikutnya harus menunggu terbitan 3 tahun yang memenuhi.</div></div></div>" +
      "<div class='card'><h3>Lembaga penerbit</h3><p>Penerbit harus berbadan hukum, terverifikasi, berdomisili di Indonesia, dan memiliki laman penerbit. Perguruan tinggi boleh mendelegasikan pengelolaan paling rendah ke tingkat program studi. Pola pelanggaran di lebih dari satu jurnal pada penerbit yang sama dapat menyeret seluruh jurnal penerbit itu.</p></div>";
  }
  function hDis() {
    return "<div class='card' id='akr-dis'><h3>Disinsentif (Tabel 11)</h3><table><thead><tr><th>Temuan</th><th>Nilai</th></tr></thead><tbody>" +
      "<tr><td>Lebih dari 3 artikel pada nomor yang diajukan melanggar integritas akademik dan tidak dikoreksi/diretraksi penerbit</td><td class='n'>−20</td></tr><tr><td>2–3 artikel</td><td class='n'>−15</td></tr><tr><td>1 artikel</td><td class='n'>−10</td></tr><tr><td>Riset yang melibatkan manusia/hewan tanpa nomor dan tahun Ethical Clearance atau pernyataan kepatuhan etik yang disetujui mitra bestari/editor</td><td class='n'>−3</td></tr></tbody></table>" +
      "<p>Pelanggaran integritas: fabrikasi, falsifikasi, plagiat (termasuk menulis ulang tanpa bahasa sendiri dan memakai karya sendiri tanpa menyebut sumber), kepengarangan tidak sah, konflik kepentingan, pengajuan jamak. Persentase kemiripan tidak otomatis berarti plagiat. Artikel yang diretraksi tidak dihapus, tetapi ditandai di laman, PDF, dan metadata.</p>" +
      "<div class='ex'><div class='g'><b>Contoh tepat.</b> Artikel terbukti duplikat; jurnal menerbitkan pemberitahuan retraksi yang menyebut alasan dan pihak penetap, menautkannya ke artikel, dan memperbarui metadata DOI.</div><div class='x'><b>Contoh salah.</b> Artikel bermasalah dihapus diam-diam dari arsip → dapat dikenai disinsentif.</div></div></div>" +
      "<div class='card'><h3>Ketentuan khusus</h3><ol>" + KHUSUS.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ol>" +
      "<h4>Yang diperbolehkan</h4><p>Iklan pada halaman berpenomoran khusus; artikel ulasan/undangan (bisa menurunkan F.4 bila tanpa kontribusi orisinal); tinjauan buku, obituari, editorial aktual, dan berita organisasi profesi (tidak dinilai dan tidak dihitung sebagai artikel); editor boleh menulis di jurnalnya maksimal 1 artikel per tahun dengan proses reguler dan bukan ia sendiri yang menangani.</p></div>";
  }
  function hLaksana() {
    return "<div class='card' id='akr-laksana'><h3>Jenis pengajuan</h3><table><thead><tr><th>Situasi</th><th>Kapan boleh mengajukan</th><th>Nomor yang diajukan</th></tr></thead><tbody>" +
      [["Akreditasi baru", "Sudah terbit berkala minimal 3 tahun", "Seluruh nomor 3 tahun terakhir"], ["Akreditasi ulang sebelum berakhir", "Setelah menerbitkan minimal 3 nomor baru sejak nomor terakhir yang dinilai, paling lambat 6 bulan sebelum masa berlaku berakhir", "3 nomor terakhir"], ["Akreditasi ulang setelah berakhir", "Paling lambat 2 tahun sejak berakhir; lewat dari itu menjadi akreditasi baru", "3 nomor terakhir"], ["Tidak lolos Pemeriksaan Awal", "Periode berikutnya (kecuali gagal karena frekuensi/keberkalaan)", "Seluruh nomor 3 tahun terakhir"], ["Tidak lolos Pemeriksaan Kelayakan", "Paling cepat 2 tahun sejak penetapan", "Seluruh nomor 3 tahun terakhir"], ["Nilai <60 tanpa disinsentif", "Setelah 3 nomor baru", "3 nomor terakhir"], ["Nilai <60 setelah disinsentif", "Paling cepat 3 tahun", "Seluruh nomor 3 tahun terakhir"], ["Diturunkan peringkatnya", "Paling cepat 3 tahun", "Seluruh nomor 3 tahun terakhir"], ["Dibekukan", "Paling cepat 4 tahun", "Seluruh nomor 3 tahun terakhir"], ["Dicabut", "Paling cepat 5 tahun", "Seluruh nomor 3 tahun terakhir"]].map(function (x) { return "<tr><td><b>" + x[0] + "</b></td><td>" + x[1] + "</td><td>" + x[2] + "</td></tr>"; }).join("") + "</tbody></table></div>" +
      "<div class='card'><h3>Masa berlaku</h3><ul><li>5 tahun; tanggal mulai dan akhir ditetapkan di SK.</li><li>Akreditasi baru: berlaku sejak tanggal terbit nomor paling awal dalam rentang 3 tahun yang diajukan.</li><li>Akreditasi ulang yang diajukan tepat waktu tetapi belum ditetapkan saat masa lama habis: diberi perpanjangan sementara dengan peringkat terakhir.</li><li>Pengajuan ulang yang terlambat: tidak ada perpanjangan; nomor yang terbit selama status tidak terakreditasi tetap tidak terakreditasi.</li><li>Perubahan nama tanpa e-ISSN baru, perubahan URL, afiliasi, atau frekuensi tidak mengakhiri akreditasi; perubahan yang menghasilkan e-ISSN baru atau mengubah bidang secara mendasar dianggap jurnal baru. Setiap perubahan wajib dilaporkan.</li><li>Keberatan atas hasil dapat diajukan satu kali, hanya atas kekeliruan data/fakta atau proses; tidak bisa dipakai untuk menyerahkan perbaikan baru.</li></ul></div>";
  }
  function hKalk() {
    return "<p>Isi nilai setiap subunsur untuk jurnal mana pun (misalnya saat evaluasi diri sebelum mengajukan). Ikon <i class='i' style='pointer-events:none'>i</i> membuka kriteria lengkapnya.</p><div class='card'><p><label>Mulai dari data jurnal: <select id='akrKalkJ'><option value=''>— kosong —</option>" + R.map(function (r) { return "<option value='" + esc(r.kode) + "'>" + esc(r.nama) + "</option>"; }).join("") + "</select></label></p><div id='akrKalkBody'></div></div>";
  }
  function kalkBody(sc) {
    var t = 0; SUBS.forEach(function (s) { t += +sc[s.id] || 0; });
    var dis = +(sc.H || 0);
    return "<div class='wrapx'><table><thead><tr><th>Subunsur</th><th>Nilai</th></tr></thead><tbody>" + SUBS.map(function (s) { return "<tr><td>" + s.id + " " + esc(s.t) + info(s.id) + "</td><td><select data-kalk='" + s.id + "'>" + s.lv.map(function (l) { return "<option value='" + l[0] + "'" + (+sc[s.id] === l[0] ? " selected" : "") + ">" + fmt(l[0]) + "</option>"; }).join("") + "</select> / " + fmt(s.max) + "</td></tr>"; }).join("") +
      "<tr><td>Disinsentif" + info("dis") + "</td><td><select data-kalk='H'>" + [[0, "tidak ada"], [-3, "−3 (Ethical Clearance)"], [-10, "−10"], [-13, "−13"], [-15, "−15"], [-18, "−18"], [-20, "−20"], [-23, "−23"]].map(function (o) { return "<option value='" + o[0] + "'" + (dis === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select></td></tr></tbody></table></div>" +
      "<p style='font-size:18px'>Total <b>" + fmt(t + dis) + "</b> → <span class='pill " + pkKelas(t + dis) + "'>" + peringkat(t + dis) + "</span></p>";
  }

  sec.innerHTML = "<div class='sechead'><span class='secnum'>A</span><h2>Akreditasi 2026</h2></div>" +
    "<p class='pintro'>Panduan akreditasi jurnal ilmiah menurut aturan 2026, dibuat untuk pengelola jurnal UNMER, lengkap dengan contoh, simulasi kesiapan tiap jurnal, sitasi, dan masa berlaku peringkat. Data diperiksa " + esc(A.atLabel || A.at) + ".</p>" +
    "<div class='akr-sub'>" + SUBNAV.map(function (x, i) { return "<button type='button' data-sub='" + x[0] + "'" + (i === 0 ? " class='on'" : "") + ">" + esc(x[1]) + "</button>"; }).join("") + "</div>" +
    "<div class='akr-sec on' id='akrs-sim'>" + hSim() + "<div id='akrDet'></div></div>" +
    "<div class='akr-sec' id='akrs-sit'>" + hSitasi() + "</div>" +
    "<div class='akr-sec' id='akrs-status'>" + hStatus() + "</div>" +
    "<div class='akr-sec' id='akrs-dasar'>" + hDasar() + "</div>" +
    "<div class='akr-sec' id='akrs-min'>" + hMin() + "</div>" +
    "<div class='akr-sec' id='akrs-unsur'><p>Klik setiap unsur untuk membuka subunsur, nilai, penjelasan, dan contoh. Bobot total 100.</p>" + hUnsur() + "</div>" +
    "<div class='akr-sec' id='akrs-dis'>" + hDis() + "</div>" +
    "<div class='akr-sec' id='akrs-laksana'>" + hLaksana() + "</div>" +
    "<div class='akr-sec' id='akrs-kalk'>" + hKalk() + "</div>";

  var KALK = {}; SUBS.forEach(function (s) { KALK[s.id] = s.lv[s.lv.length - 1][0]; }); KALK.H = 0;
  var showSub = function (id) { sec.querySelectorAll(".akr-sub button").forEach(function (b) { b.classList.toggle("on", b.dataset.sub === id); }); sec.querySelectorAll(".akr-sec").forEach(function (s) { s.classList.toggle("on", s.id === "akrs-" + id); }); };
  var goRef = function (id) {
    var sub = /^(min)$/.test(id) ? "min" : /^(dis)$/.test(id) ? "dis" : /^(laksana)$/.test(id) ? "laksana" : "unsur";
    showSub(sub);
    var el = document.getElementById("akr-" + id) || document.getElementById("akr-" + id.charAt(0));
    if (sub === "unsur") { var d = document.getElementById("akr-" + id.charAt(0)); if (d) d.open = true; }
    if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); el.classList.add("flash"); setTimeout(function () { el.classList.remove("flash"); }, 2200); }
  };
  var refreshRow = function (k) {
    var r = R.filter(function (x) { return x.kode === k; })[0], t = total(r, EDIT[k]);
    var tr = sec.querySelector("tr.jr[data-k='" + k + "']"); if (!tr) return;
    tr.cells[1].innerHTML = "<b>" + fmt(t.t) + "</b><br><span class='note'>" + fmt(t.lo) + "–" + fmt(t.hi) + "</span>";
    tr.cells[2].innerHTML = "<span class='pill " + pkKelas(t.t) + "'>" + peringkat(t.t) + "</span>";
    ORDER.forEach(function (u, i) { tr.cells[3 + i].textContent = fmt(G[u].sub.reduce(function (a, s) { return a + (+EDIT[k][s.id] || 0); }, 0)) + "/" + G[u].w; });
  };
  sec.addEventListener("click", function (e) {
    var i = e.target.closest(".i[data-ref]"); if (i) { e.preventDefault(); e.stopPropagation(); goRef(i.dataset.ref); return; }
    var b = e.target.closest("[data-sub]"); if (b) { showSub(b.dataset.sub); return; }
    var rs = e.target.closest("[data-reset]"); if (rs) { var k0 = rs.dataset.reset, r0 = R.filter(function (x) { return x.kode === k0; })[0]; EDIT[k0] = JSON.parse(JSON.stringify(r0.sc)); document.getElementById("akrDet").innerHTML = detail(k0); refreshRow(k0); return; }
    if (e.target.closest("select")) return;
    var tr = e.target.closest("#akrSimBody tr.jr"); if (tr) { var box = document.getElementById("akrDet"), k = tr.dataset.k; box.innerHTML = box.dataset.k === k ? "" : detail(k); box.dataset.k = box.dataset.k === k ? "" : k; if (box.innerHTML) box.scrollIntoView({ behavior: "smooth", block: "start" }); }
  });
  sec.addEventListener("change", function (e) {
    var s = e.target;
    if (s.dataset.s) { EDIT[s.dataset.k][s.dataset.s] = +s.value; refreshRow(s.dataset.k); var box = document.getElementById("akrDet"), k = s.dataset.k, sy = window.scrollY; box.innerHTML = detail(k); window.scrollTo(0, sy); return; }
    if (s.id === "akrKalkJ") { var r = R.filter(function (x) { return x.kode === s.value; })[0]; KALK = r ? JSON.parse(JSON.stringify(EDIT[r.kode])) : (function () { var o = {}; SUBS.forEach(function (q) { o[q.id] = q.lv[q.lv.length - 1][0]; }); return o; })(); KALK.H = 0; document.getElementById("akrKalkBody").innerHTML = kalkBody(KALK); return; }
    if (s.dataset.kalk) { KALK[s.dataset.kalk] = +s.value; document.getElementById("akrKalkBody").innerHTML = kalkBody(KALK); }
  });
  document.getElementById("akrKalkBody").innerHTML = kalkBody(KALK);
  window.__AKR = { R: R, total: total, G: G };
})();
