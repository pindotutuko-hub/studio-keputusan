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
    r.min.push(["e-ISSN", /\d{4}-?\d{3}[\dX]/i.test(String(s.issn || "")), s.issn ? "ISSN " + s.issn : "ISSN tidak tercatat di Direktori"]);
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
    "#p-akr .akr-subg{margin:14px 0 18px;border:1px solid var(--line);border-radius:12px;background:var(--surface);padding:6px 12px}#p-akr .akr-subg .akr-sub{margin:6px 0;align-items:center}#p-akr .sgl{font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);min-width:118px}" +
    "#p-akr svg.flow text{font-size:12px}#p-akr svg.flow .t{font-weight:700}#p-akr .flowwrap{overflow-x:auto;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px}" +
    "#p-akr .dot{display:inline-block;width:12px;height:12px;border-radius:50%;margin:0 1px;border:1px solid var(--line);vertical-align:-2px}#p-akr .dot.done{background:var(--patina);border-color:var(--patina)}#p-akr .dot.doing{background:var(--amber);border-color:var(--amber)}#p-akr .dot.todo{background:transparent;border-color:var(--rust)}" +
    "#p-akr .bar{height:8px;background:var(--line-soft);border-radius:8px;overflow:hidden;min-width:90px}#p-akr .bar i{display:block;height:100%;background:var(--patina)}" +
    "#p-akr .phase{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px;margin:12px 0}#p-akr .phase .card{margin:0;position:relative;padding-top:30px}#p-akr .phase .no{position:absolute;top:10px;left:18px;font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.1em;color:var(--patina)}" +
    "@media (max-width:700px){#p-akr .ex{grid-template-columns:1fr}}";
  document.head.appendChild(css);

  /* ---------- 4. Tab & panel ---------- */
  var tabs = document.getElementById("tabs"); if (!tabs) return;
  var btn = tabs.querySelector('button[data-t="akr"]') || document.createElement("button");
  btn.setAttribute("role", "tab"); btn.dataset.t = "akr"; btn.setAttribute("aria-selected", "false"); btn.textContent = "Akreditasi 2026";
  if (!btn.parentNode) tabs.insertBefore(btn, tabs.querySelector('button[data-t="ojs"]') || tabs.querySelector('button[data-t="update"]') || null);
  var sec = document.createElement("section"); sec.className = "panel"; sec.id = "p-akr"; sec.setAttribute("role", "tabpanel");
  var ref = document.getElementById("p-ojs") || document.getElementById("p-update");
  ref.parentNode.insertBefore(sec, ref);

  var SUBG = [["Jurnal UNMER", [["sim", "Kesiapan tiap jurnal"], ["prog", "Pantauan progres"], ["sit", "Sitasi & Scopus"], ["status", "Masa berlaku"]]], ["Panduan 2026", [["alur", "Alur akreditasi"], ["siap", "Alur kesiapan"], ["dasar", "Aturan pokok"], ["min", "Syarat minimum"], ["unsur", "Unsur A–G"], ["dis", "Disinsentif & larangan"], ["laksana", "Pengajuan ulang"], ["kalk", "Simulator otomatis & manual"]]]];
  var SUBNAV = [].concat.apply([], SUBG.map(function (g) { return g[1]; }));
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
  /* ---------- Simulator: mode Otomatis (dari data) & Manual (isi sendiri) ---------- */
  var DISO = [[0, "Tidak ada"], [-3, "−3 · tanpa Ethical Clearance"], [-10, "−10 · 1 artikel melanggar"], [-13, "−13 · 1 artikel + EC"], [-15, "−15 · 2–3 artikel"], [-18, "−18 · 2–3 artikel + EC"], [-20, "−20 · >3 artikel"], [-23, "−23 · >3 artikel + EC"]];
  var SIM = { mode: "auto", k: "", asm: "mid", dis: 0, man: null, base: "data" };
  var lvMin = function (s) { var v = s.lv.map(function (l) { return l[0]; }).filter(function (x) { return x > 0; }); return v.length ? Math.min.apply(null, v) : 0; };
  var lvMax = function (s) { return Math.max.apply(null, s.lv.map(function (l) { return l[0]; })); };
  var lvDesc = function (s, v) { var l = s.lv.filter(function (x) { return +x[0] === +v; })[0]; return l ? l[1] : ""; };
  var autoSc = function (r, asm) {
    var o = {}; SUBS.forEach(function (q) { var v = +r.sc[q.id] || 0; if (r.src[q.id] === "asumsi") v = asm === "lo" ? lvMin(q) : asm === "hi" ? lvMax(q) : v; o[q.id] = v; }); return o;
  };
  var blank = function (how) { var o = {}; SUBS.forEach(function (q) { o[q.id] = how === "max" ? lvMax(q) : how === "min" ? lvMin(q) : q.lv[Math.floor((q.lv.length - 1) / 2)][0]; }); return o; };
  var sumSc = function (sc) { var t = 0; SUBS.forEach(function (q) { t += +sc[q.id] || 0; }); return t; };
  function hKalk() {
    return "<p>Simulasikan penilaian akreditasi 2026 dengan dua cara. <b>Otomatis</b>: nilai dihitung dari data jurnal (metadata OJS, mitra bestari, dewan editor, laman kebijakan, sitasi DOI); unsur yang belum bisa diukur dari data memakai skenario asumsi pesimis, tengah, atau optimis. <b>Manual</b>: pilih sendiri tingkat setiap subunsur sesuai hasil evaluasi diri — keterangan tiap tingkat diambil dari instrumen 2026 — dan lihat selisihnya terhadap hasil otomatis. Ikon <i class='i' style='pointer-events:none'>i</i> membuka kriteria lengkap.</p><div class='bt' id='akrSim'></div>";
  }
  function simRender() {
    var box = document.getElementById("akrSim"); if (!box) return;
    if (!SIM.k && R.length) SIM.k = R.slice().sort(function (a, b) { return total(b).t - total(a).t; })[0].kode;
    var r = R.filter(function (x) { return x.kode === SIM.k; })[0] || null;
    var au = r ? autoSc(r, SIM.asm) : null;
    if (SIM.mode === "man" && !SIM.man) SIM.man = r ? JSON.parse(JSON.stringify(r.sc)) : blank("mid");
    var sc = SIM.mode === "auto" ? au : SIM.man, sub = sumSc(sc || {}), tot = sub + SIM.dis;
    var rg = r ? total(r) : null, ok = r ? r.min.filter(function (m) { return m[1]; }).length : 0;
    var seg = function (k, opts, cur) { return "<div class='seg' data-sg='" + k + "'>" + opts.map(function (o) { return "<button type='button' data-v='" + o[0] + "'" + (String(cur) === String(o[0]) ? " class='on'" : "") + ">" + esc(o[1]) + "</button>"; }).join("") + "</div>"; };
    var side = "<div class='fg'><span class='lbl'>Mode simulasi</span>" + seg("mode", [["auto", "Otomatis"], ["man", "Manual"]], SIM.mode) + "</div>" +
      "<div class='fg'><span class='lbl'>Jurnal</span><select id='akrSimJ' style='width:100%;font:inherit;font-size:13px;padding:6px;border:1.5px solid var(--bk);border-radius:0;background:#fff'>" +
      (SIM.mode === "man" ? "<option value=''" + (!SIM.k ? " selected" : "") + ">— lembar kosong (jurnal lain / calon jurnal) —</option>" : "") +
      R.map(function (x) { return "<option value='" + esc(x.kode) + "'" + (x.kode === SIM.k ? " selected" : "") + ">" + esc(x.nama) + "</option>"; }).join("") + "</select></div>" +
      (SIM.mode === "auto" ? "<div class='fg'><span class='lbl'>Skenario unsur asumsi</span>" + seg("asm", [["lo", "Pesimis"], ["mid", "Tengah"], ["hi", "Optimis"]], SIM.asm) + "<p class='note' style='margin:6px 0 0;font-size:11.5px'>Berlaku hanya untuk subunsur bertanda <i>asumsi</i>; subunsur dari data tetap.</p></div>"
        : "<div class='fg'><span class='lbl'>Isi awal lembar</span>" + seg("base", [["data", "Dari otomatis"], ["min", "Semua terendah"], ["mid", "Semua tengah"], ["max", "Semua tertinggi"]], SIM.base) + "<p class='note' style='margin:6px 0 0;font-size:11.5px'>Mengganti semua nilai di lembar manual.</p></div>") +
      "<div class='fg'><span class='lbl'>Disinsentif" + info("dis") + "</span><select id='akrSimDis' style='width:100%;font:inherit;font-size:13px;padding:6px;border:1.5px solid var(--bk);border-radius:0;background:#fff'>" + DISO.map(function (o) { return "<option value='" + o[0] + "'" + (SIM.dis === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select></div>" +
      (SIM.mode === "auto" && r ? "<button type='button' class='btn' id='akrSimToMan' style='width:100%'>Lanjut ubah manual →</button>" : "") +
      (SIM.mode === "man" ? "<button type='button' class='btn ghost' id='akrSimReset' style='width:100%'>Kembalikan ke nilai otomatis</button>" : "");
    var pk = peringkat(tot);
    var dAuto = SIM.mode === "man" && au ? tot - (sumSc(au) + 0) : null;
    var kp = "<div class='kpis'>" +
      "<div class='kpi'><span class='no'>" + (SIM.mode === "auto" ? "OTO" : "MAN") + "</span><span class='lbl'>Total nilai</span><b>" + fmt(tot) + "</b><small>dari 100" + (SIM.dis ? " · disinsentif " + SIM.dis : "") + "</small></div>" +
      "<div class='kpi'><span class='lbl'>Perkiraan</span><b style='font-size:30px'>" + esc(pk.replace("Tidak terakreditasi", "Tidak terakr.")) + "</b><small>" + (tot >= 90 ? "≥90" : tot >= 80 ? "80–<90" : tot >= 70 ? "70–<80" : tot >= 60 ? "60–<70" : "<60") + "</small></div>" +
      (SIM.mode === "auto" ? "<div class='kpi'><span class='lbl'>Rentang</span><b style='font-size:32px'>" + (rg ? fmt(rg.lo + SIM.dis) + "–" + fmt(rg.hi + SIM.dis) : "–") + "</b><small>pesimis–optimis</small></div>"
        : "<div class='kpi'><span class='lbl'>Selisih vs otomatis</span><b>" + (dAuto == null ? "–" : (dAuto > 0 ? "+" : "") + fmt(dAuto)) + "</b><small>" + (au ? "otomatis (tengah) " + fmt(sumSc(au)) : "lembar kosong") + "</small></div>") +
      "<div class='kpi'><span class='lbl'>Syarat minimum" + info("min") + "</span><b>" + (r ? ok + "/" + r.min.length : "–") + "</b><small>" + (r ? (ok === r.min.length ? "semua terpenuhi" : (r.min.length - ok) + " belum → tidak dinilai") : "periksa sendiri") + "</small></div></div>";
    var gx = function (v) { return Math.max(0, Math.min(100, v)); };
    var gauge = "<div class='blk'><div class='hd'><h3>Posisi terhadap ambang peringkat</h3></div><div class='in'><svg viewBox='0 0 700 74' width='100%' role='img' aria-label='Posisi nilai'>" +
      [[0, 60, "#EBD3D9", "Tidak terakreditasi"], [60, 70, "#D7A1AE", "P4"], [70, 80, "#B23A55", "P3"], [80, 90, "#8E2740", "P2"], [90, 100, "#5E1626", "P1"]].map(function (b) { var x = 10 + b[0] * 6.8, w = (b[1] - b[0]) * 6.8; return "<rect x='" + x + "' y='22' width='" + w + "' height='22' fill='" + b[2] + "' stroke='#141017' stroke-width='1'/><text x='" + (x + w / 2) + "' y='37' text-anchor='middle' style='fill:" + (b[0] >= 70 ? "#fff" : "#141017") + ";font-size:11px'>" + b[3] + "</text>"; }).join("") +
      [60, 70, 80, 90].map(function (v) { return "<text x='" + (10 + v * 6.8) + "' y='60' text-anchor='middle'>" + v + "</text>"; }).join("") +
      (SIM.mode === "auto" && rg ? "<rect x='" + (10 + gx(rg.lo + SIM.dis) * 6.8) + "' y='48' width='" + Math.max(2, (gx(rg.hi + SIM.dis) - gx(rg.lo + SIM.dis)) * 6.8) + "' height='4' fill='#141017' opacity='.35'/>" : "") +
      "<path d='M " + (10 + gx(tot) * 6.8) + " 20 l -7 -12 h 14 z' fill='#141017'/><text x='" + (10 + gx(tot) * 6.8) + "' y='7' text-anchor='middle' style='fill:#141017;font-weight:700;font-size:12px'>" + fmt(tot) + "</text></svg></div></div>";
    var un = "<div class='blk'><div class='hd'><h3>Nilai per unsur</h3><span class='lbl'>nilai / bobot</span></div><div class='in'>" + ORDER.map(function (k) {
      var v = G[k].sub.reduce(function (a, q) { return a + (+sc[q.id] || 0); }, 0), w = G[k].w, va = au ? G[k].sub.reduce(function (a, q) { return a + (+au[q.id] || 0); }, 0) : null;
      return "<div style='display:grid;grid-template-columns:200px minmax(0,1fr) 90px;gap:10px;align-items:center;margin:6px 0;font-size:13px'><span><b>" + k + "</b> " + esc(G[k].t) + info(k) + "</span><div class='sb' style='width:100%;position:relative'><i style='width:" + (100 * v / w) + "%;background:var(--q1)'></i>" + (SIM.mode === "man" && va != null ? "<span title='otomatis' style='position:absolute;top:-3px;bottom:-3px;width:2px;background:#141017;left:" + (100 * va / w) + "%'></span>" : "") + "</div><span style='text-align:right;font-family:JetBrains Mono,monospace'>" + fmt(v) + " / " + w + "</span></div>";
    }).join("") + (SIM.mode === "man" && au ? "<p class='note' style='margin:6px 0 0'>Garis hitam tipis = nilai otomatis (skenario tengah).</p>" : "") + "</div></div>";
    var rows = ORDER.map(function (k) {
      return "<details class='u' open><summary>" + k + ". " + esc(G[k].t) + " — " + fmt(G[k].sub.reduce(function (a, q) { return a + (+sc[q.id] || 0); }, 0)) + " / " + G[k].w + "</summary><div class='in'>" + G[k].sub.map(function (q) {
        var v = +sc[q.id] || 0, src = r ? r.src[q.id] : "", av = au ? +au[q.id] : null;
        var head = "<div style='display:flex;justify-content:space-between;gap:10px;align-items:baseline;flex-wrap:wrap'><span><b>" + q.id.replace(/(\w)(\d)/, "$1.$2") + "</b> " + esc(q.t) + info(q.id) + (src ? " <span class='" + (src === "data" ? "lbl" : "asm") + "' style='font-size:10px'>" + (src === "data" ? "data" : "asumsi") + "</span>" : "") + "</span><span style='font-family:JetBrains Mono,monospace;font-size:12px'>" + fmt(v) + " / " + fmt(q.max) + (SIM.mode === "man" && av != null && av !== v ? " <span style='color:" + (v > av ? "var(--q1)" : "#47404C") + "'>(" + (v > av ? "+" : "") + fmt(v - av) + ")</span>" : "") + "</span></div>";
        var body = SIM.mode === "man"
          ? "<div class='seg' style='margin:6px 0' data-man='" + q.id + "'>" + q.lv.map(function (l) { return "<button type='button' data-v='" + l[0] + "' title='" + esc(l[1]) + "'" + (+l[0] === v ? " class='on'" : "") + ">" + fmt(l[0]) + "</button>"; }).join("") + "</div>"
          : "";
        var desc = "<div class='note' style='margin-top:4px'>" + esc(lvDesc(q, v) || "") + (SIM.mode === "auto" && r && r.note[q.id] ? "<br><i>Temuan: " + esc(r.note[q.id]) + "</i>" : "") + "</div>";
        return "<div class='sub'>" + head + body + desc + "</div>";
      }).join("") + "</div></details>";
    }).join("");
    box.innerHTML = "<div class='dash'><aside class='side'><div class='sticky'>" + side + "</div></aside><div class='body'>" + kp + gauge + un +
      (r && SIM.mode === "auto" && r.min.some(function (m) { return !m[1]; }) ? "<div class='blk' style='border-color:var(--rust)'><div class='hd'><h3>Syarat minimum belum terpenuhi</h3></div><div class='in'><ul style='margin:0'>" + r.min.filter(function (m) { return !m[1]; }).map(function (m) { return "<li><b>" + esc(m[0]) + "</b> — " + esc(m[2]) + "</li>"; }).join("") + "</ul><p class='note'>Selama ada syarat minimum yang gagal, jurnal tidak masuk tahap penilaian berapa pun nilainya.</p></div></div>" : "") +
      "<div class='blk'><div class='hd'><h3>" + (SIM.mode === "auto" ? "Rincian nilai otomatis" : "Lembar penilaian manual") + "</h3><span class='lbl'>" + (SIM.mode === "man" ? "klik angka untuk memilih tingkat" : "dari data + asumsi") + "</span></div><div class='in'>" + rows + "</div></div></div></div>";
  }
  /* ---------- 5. Alur akreditasi, alur kesiapan, pantauan progres ---------- */
  function box(x, y, w, h, title, sub, kind) {
    var fill = kind === "ok" ? "var(--patina)" : kind === "bad" ? "var(--rust)" : kind === "soft" ? "var(--surface-2)" : "var(--surface)";
    var tc = kind === "ok" || kind === "bad" ? "#fff" : "var(--ink)";
    var s = "<rect x='" + x + "' y='" + y + "' width='" + w + "' height='" + h + "' rx='10' fill='" + fill + "' stroke='" + (kind === "soft" ? "var(--line)" : kind ? "none" : "var(--ink)") + "' stroke-width='1.2'/>";
    s += "<text class='t' x='" + (x + w / 2) + "' y='" + (y + (sub ? 20 : h / 2 + 4)) + "' text-anchor='middle' style='fill:" + tc + "'>" + esc(title) + "</text>";
    (sub || []).forEach(function (l, i) { s += "<text x='" + (x + w / 2) + "' y='" + (y + 38 + i * 15) + "' text-anchor='middle' style='fill:" + (kind === "ok" || kind === "bad" ? "#fff" : "var(--muted)") + ";font-size:11px'>" + esc(l) + "</text>"; });
    return s;
  }
  function arr(x1, y1, x2, y2, lbl, dash) {
    var s = "<line x1='" + x1 + "' y1='" + y1 + "' x2='" + x2 + "' y2='" + y2 + "' stroke='var(--muted)' stroke-width='1.4' marker-end='url(#ah)'" + (dash ? " stroke-dasharray='4 3'" : "") + "/>";
    if (lbl) s += "<text x='" + ((x1 + x2) / 2 + 6) + "' y='" + ((y1 + y2) / 2 - 4) + "' style='fill:var(--muted);font-size:11px'>" + esc(lbl) + "</text>";
    return s;
  }
  var DEFS = "<defs><marker id='ah' viewBox='0 0 10 10' refX='9' refY='5' markerWidth='7' markerHeight='7' orient='auto-start-reverse'><path d='M0,0 L10,5 L0,10 z' fill='var(--muted)'/></marker></defs>";
  function hAlur() {
    var W = 940, s = "<svg class='flow' viewBox='0 0 " + W + " 840' width='100%' role='img' aria-label='Diagram alur akreditasi jurnal 2026'>" + DEFS;
    var cx = 120, bw = 360;
    s += box(cx, 10, bw, 64, "1 · Pengajuan lewat ARJUNA", ["Borang, seluruh nomor yang diajukan, teks penuh,", "akun editor, lalu tombol “Siap Akreditasi”"]);
    s += arr(cx + bw / 2, 74, cx + bw / 2, 104);
    s += box(cx, 104, bw, 64, "2 · Pemeriksaan Awal", ["15 butir kriteria minimum: ISSN, frekuensi,", "≥5 artikel/nomor, DOI, etika, biaya, keberagaman"]);
    s += box(620, 110, 300, 52, "Tidak lolos", ["ajukan lagi periode berikutnya*"], "bad"); s += arr(cx + bw, 136, 620, 136, "", 1);
    s += arr(cx + bw / 2, 168, cx + bw / 2, 198);
    s += box(cx, 198, bw, 64, "3 · Pemeriksaan Kelayakan", ["setiap artikel ditelaah mitra bestari;", "validitas & integritas penerbit"]);
    s += box(620, 204, 300, 52, "Tidak lolos", ["ajukan lagi paling cepat 2 tahun"], "bad"); s += arr(cx + bw, 230, 620, 230, "", 1);
    s += arr(cx + bw / 2, 262, cx + 80, 300); s += arr(cx + bw / 2, 262, cx + bw - 80, 300);
    s += box(cx - 100, 300, 270, 64, "4a · Tata kelola — 46", ["A identitas · B tata kelola · C laman", "D keberkalaan · E penyebarluasan"], "soft");
    s += box(cx + 230, 300, 250, 64, "4b · Mutu artikel — 54", ["F substansi (34)", "G gaya & penyuntingan (20)"], "soft");
    s += "<text x='" + (cx + 200) + "' y='292' text-anchor='middle' style='fill:var(--muted);font-size:11px'>dinilai paralel</text>";
    s += arr(cx + 35, 364, cx + bw / 2, 400); s += arr(cx + 355, 364, cx + bw / 2, 400);
    s += box(cx, 400, bw, 56, "5 · Disinsentif (bila ada)", ["integritas akademik −10/−15/−20 · Ethical Clearance −3"]);
    s += arr(cx + bw / 2, 456, cx + bw / 2, 486);
    s += box(cx, 486, bw, 56, "6 · Rapat pleno asesor", ["verifikasi & harmonisasi oleh Tim Akreditasi"]);
    s += arr(cx + bw / 2, 542, cx + bw / 2, 572);
    s += box(cx, 572, bw, 50, "7 · Penetapan SK Direktur Jenderal");
    var outs = [["Peringkat 1", "90–100", "ok"], ["Peringkat 2", "80–<90", "ok"], ["Peringkat 3", "70–<80", "ok"], ["Peringkat 4", "60–<70", "ok"], ["Tidak terakreditasi", "<60", "bad"]];
    outs.forEach(function (o, i) { var x = 10 + i * 186; s += box(x, 670, 176, 52, o[0], [o[1]], o[2]); s += arr(cx + bw / 2, 622, x + 88, 670); });
    s += box(10, 750, 548, 70, "Berlaku 5 tahun", ["Cantumkan peringkat, nomor & tanggal SK, dan tanggal akhir di laman.", "Ajukan ulang setelah 3 nomor baru, paling lambat 6 bulan sebelum berakhir."], "soft");
    s += box(578, 750, 352, 70, "Nilai <60", ["tanpa disinsentif: ajukan lagi setelah 3 nomor baru", "dengan disinsentif: paling cepat 3 tahun"], "soft");
    s += arr(98, 722, 98, 750); s += arr(754, 722, 754, 750);
    s += "</svg>";
    return "<p>Urutan resmi menurut Kepdirjen 374/DST/D.D1/HM.01.01/2026. Klik ikon di bawah untuk membaca rinciannya.</p><div class='flowwrap'>" + s + "</div>" +
      "<p class='note'>* Bila gagal karena frekuensi/keberkalaan, harus menunggu terbitan 3 tahun yang memenuhi. Rincian: syarat minimum" + info("min") + " · unsur penilaian" + info("A") + " · disinsentif" + info("dis") + " · pengajuan ulang & masa berlaku" + info("laksana") + "</p>";
  }
  /* langkah kesiapan: id, fase, judul, rujukan, fungsi cek otomatis (null = manual) */
  var STEPS = [
    ["S1", 1, "Syarat minimum terpenuhi", "min", function (r) { return r.ok; }],
    ["S2", 1, "Evaluasi diri: perkiraan nilai ≥60", "kalk", function (r) { return total(r, EDIT[r.kode]).t >= 60; }],
    ["S3", 2, "Kebijakan AI lengkap (penulis, editor, reviewer)", "C3", function (r) { return +r.sc.C3 >= 1; }],
    ["S4", 2, "Kebijakan telaah & petunjuk penulisan lengkap", "C1", function (r) { return +r.sc.C1 >= 1 && +r.sc.C2 >= 1; }],
    ["S5", 2, "16 klausul COPE ada di laman", "C4", function (r) { return +r.sc.C4 >= 3; }],
    ["S6", 3, "Mitra bestari ≥6 institusi, ≥2 penelaah per naskah di OJS", "B1", function (r) { return +r.sc.B1 >= 2; }],
    ["S7", 3, "Dewan editor beragam & memenuhi h-indeks", "B3", function (r) { return +r.sc.B3 >= 3; }],
    ["S8", 3, "Penulis per nomor dari ≥4 institusi", "B4", function (r) { return +r.sc.B4 >= 2; }],
    ["S9", 4, "Terbit tepat jadwal + prapublikasi", "D1", function (r) { return +r.sc.D1 >= 1.5; }],
    ["S10", 4, "100% artikel ber-DOI & ber-PDF", "G1", function (r) { return r.doiCov >= 0.999 && r.galCov >= 0.999; }],
    ["S11", 4, "Metadata nama & afiliasi penulis rapi", "G2", function (r) { return +r.sc.G2 >= 1; }],
    ["S12", 4, "PDF memuat riwayat naskah + 4 deklarasi", "G1", null],
    ["S13", 5, "Setor daftar pustaka ke Crossref; sitasi DOI ≥11", "E1", function (r) { return +r.sc.E1 >= 3; }],
    ["S14", 5, "Terindeks di pengindeks bersistem seleksi (mis. DOAJ)", "E2", null],
    ["S15", 6, "Diajukan di ARJUNA", "laksana", null]
  ];
  var FASE = ["", "Diagnosa", "Benahi laman", "Benahi tata kelola", "Benahi terbitan", "Mutu & dampak", "Ajukan"];
  function hSiap() {
    var W = 940, s = "<svg class='flow' viewBox='0 0 " + W + " 130' width='100%' role='img' aria-label='Diagram alur kesiapan akreditasi'>" + DEFS;
    for (var f = 1; f <= 6; f++) { var x = 6 + (f - 1) * 156; s += box(x, 20, 140, 80, f + " · " + FASE[f], [STEPS.filter(function (z) { return z[1] === f; }).map(function (z) { return z[0]; }).join(" · ")], f === 6 ? "ok" : "soft"); if (f < 6) s += arr(x + 140, 60, x + 156, 60); }
    s += "</svg>";
    var cards = [1, 2, 3, 4, 5, 6].map(function (f) {
      return "<div class='card'><span class='no'>FASE " + f + "</span><h4 style='margin-top:0'>" + esc(FASE[f]) + "</h4><ul>" + STEPS.filter(function (z) { return z[1] === f; }).map(function (z) { return "<li><b>" + z[0] + "</b> " + esc(z[2]) + info(z[3]) + (z[4] ? "" : " <span class='asm'>(dicentang manual)</span>") + "</li>"; }).join("") + "</ul></div>";
    }).join("");
    return "<p>Urutan kerja yang disarankan bagi pengelola jurnal UNMER sebelum mengajukan, disusun dari unsur penilaian 2026. Langkah yang bisa dicek dari data diisi otomatis di <b>Pantauan progres</b>; sisanya dicentang Pengelola.</p><div class='flowwrap'>" + s + "</div><div class='phase'>" + cards + "</div>" +
      "<div class='card'><h4>Kapan mengajukan</h4><ul><li>Akreditasi ulang: setelah menerbitkan minimal 3 nomor baru sejak nomor terakhir yang dinilai, dan paling lambat 6 bulan sebelum masa berlaku berakhir" + info("laksana") + ".</li><li>Akreditasi baru: setelah terbit berkala minimal 3 tahun; seluruh nomor 3 tahun terakhir diajukan.</li><li>Peringkat 5 dan 6 tidak ada lagi; pengajuan berikutnya harus mencapai minimal 60.</li></ul></div>";
  }
  var PROG = (window.PT_AKRP && window.PT_AKRP.j) || {};
  var CANED = !!(window.PT_JR && window.PT_JR.update);
  function stepState(r, z) {
    var m = PROG[r.kode] && PROG[r.kode].steps && PROG[r.kode].steps[z[0]];
    if (m && m.s) return { s: m.s, src: "manual", note: m.note || "", d: m.d || "" };
    if (z[4]) return { s: z[4](r) ? "done" : "todo", src: "data" };
    return { s: "todo", src: "belum diisi" };
  }
  var endYear = function (k) { var h = (A.hist || {})[k]; return h && h.length ? +h[h.length - 1].b : null; };
  function hProg() {
    if (!R.length) return "<p>Data jurnal belum tersedia.</p>";
    var rows = R.map(function (r) {
      var st = STEPS.map(function (z) { return stepState(r, z); }), done = st.filter(function (x) { return x.s === "done"; }).length, pct = Math.round(done / STEPS.length * 100);
      var P = PROG[r.kode] || {}, ey = endYear(r.kode);
      return { r: r, st: st, done: done, pct: pct, P: P, ey: ey };
    }).sort(function (a, b) { return (a.ey || 9999) - (b.ey || 9999) || b.pct - a.pct; });
    var siap = rows.filter(function (x) { return x.st[0].s === "done" && x.st[1].s === "done"; }).length;
    var mendesak = rows.filter(function (x) { return x.ey && x.ey <= 2026; }).length;
    var avg = Math.round(rows.reduce(function (t, x) { return t + x.pct; }, 0) / rows.length);
    var chart = barChart(rows.slice().sort(function (a, b) { return b.pct - a.pct; }).map(function (x) { return { l: namaPendek(x.r), v: x.pct, t: x.pct + "% · " + x.done + "/" + STEPS.length, c: x.pct >= 70 ? "var(--patina)" : x.pct >= 40 ? "var(--amber)" : "var(--rust)" }; }), { max: 100, label: "Progres kesiapan akreditasi per jurnal" });
    var head = "<tr><th>Jurnal</th><th>Masa berlaku" + info("laksana") + "</th><th>Progres</th>" + STEPS.map(function (z) { return "<th title='" + esc(z[2]) + "'>" + z[0] + "</th>"; }).join("") + "<th>Rencana ajukan</th><th>Target</th></tr>";
    var body = rows.map(function (x) {
      var dl = !x.ey ? "<span class='pill bad'>belum tercatat</span>" : x.ey < 2026 ? "<span class='pill bad'>berakhir " + x.ey + "</span>" : x.ey === 2026 ? "<span class='pill mid'>berakhir 2026</span>" : "<span class='pill ok'>s.d. " + x.ey + "</span>";
      return "<tr class='pr' data-k='" + esc(x.r.kode) + "' style='cursor:pointer'><td><b>" + esc(x.r.nama) + "</b></td><td>" + dl + "</td><td><div class='bar'><i style='width:" + x.pct + "%'></i></div><span class='note'>" + x.pct + "%</span></td>" +
        x.st.map(function (q, i) { return "<td style='text-align:center'><span class='dot " + q.s + "' title='" + esc(STEPS[i][0] + " " + STEPS[i][2] + " — " + (q.s === "done" ? "selesai" : q.s === "doing" ? "sedang dikerjakan" : "belum") + " (" + q.src + ")") + "'></span></td>"; }).join("") +
        "<td>" + esc(x.P.plan || "–") + "</td><td>" + esc(x.P.target || "–") + "</td></tr>";
    }).join("");
    var info2 = window.PT_AKRP && window.PT_AKRP.at ? "Terakhir diperbarui " + esc(String(window.PT_AKRP.at).slice(0, 10)) + (window.PT_AKRP.by ? " oleh " + esc(window.PT_AKRP.by) : "") + "." : "Belum ada isian manual dari Pengelola.";
    return "<p>Progres setiap jurnal terhadap 15 langkah kesiapan" + " (lihat <a href='#' data-gosub='siap'>Alur kesiapan</a>). Titik hijau = selesai, kuning = sedang dikerjakan, merah = belum. Langkah yang bisa diukur diisi otomatis dari data " + esc(A.atLabel || A.at) + "; " + (CANED ? "sebagai Pengelola, klik baris jurnal untuk mengubah status, catatan, rencana pengajuan, dan target." : "status manual diisi oleh Pengelola.") + " " + info2 + "</p>" +
      "<div class='grid'><div class='kpi'><b>" + avg + "%</b><span>rata-rata progres</span></div><div class='kpi'><b>" + siap + "</b><span>jurnal siap diajukan (S1 & S2)</span></div><div class='kpi'><b>" + mendesak + "</b><span>masa berlaku berakhir ≤2026 atau sudah lewat</span></div><div class='kpi'><b>" + rows.filter(function (x) { return x.P.plan; }).length + "</b><span>jurnal punya rencana pengajuan</span></div></div>" +
      "<div class='card'>" + chart + "</div><div class='wrapx'><table><thead>" + head + "</thead><tbody id='akrProgBody'>" + body + "</tbody></table></div><div id='akrProgDet'></div>";
  }
  function progDetail(k) {
    var r = R.filter(function (x) { return x.kode === k; })[0], P = PROG[k] || {};
    var h = "<div class='card'><h3>" + esc(r.nama) + "</h3><div class='wrapx'><table><thead><tr><th>Langkah</th><th>Otomatis</th><th>Status</th><th>Catatan</th></tr></thead><tbody>" +
      STEPS.map(function (z) {
        var auto = z[4] ? (z[4](r) ? "✔︎ terpenuhi" : "✘ belum") : "—", m = (P.steps || {})[z[0]] || {}, cur = stepState(r, z);
        var sel = CANED ? "<select data-ps='" + z[0] + "'><option value=''>ikuti data</option>" + [["done", "selesai"], ["doing", "sedang dikerjakan"], ["todo", "belum"]].map(function (o) { return "<option value='" + o[0] + "'" + (m.s === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select>" : "<span class='dot " + cur.s + "'></span> " + (cur.s === "done" ? "selesai" : cur.s === "doing" ? "proses" : "belum");
        var note = CANED ? "<input data-pn='" + z[0] + "' value='" + esc(m.note || "") + "' maxlength='300' style='width:100%;font:inherit;font-size:12px;padding:3px 6px;border:1px solid var(--line);border-radius:6px;background:var(--surface);color:var(--ink)'>" : esc(m.note || "");
        return "<tr><td><b>" + z[0] + "</b> " + esc(z[2]) + info(z[3]) + "</td><td class='note'>" + auto + "</td><td>" + sel + "</td><td>" + note + "</td></tr>";
      }).join("") + "</tbody></table></div>";
    if (CANED) h += "<p style='display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:10px'><label>Rencana ajukan <input id='akrPlan' type='month' value='" + esc(P.plan || "") + "'></label><label>Target <select id='akrTarget'>" + ["", "Peringkat 1", "Peringkat 2", "Peringkat 3", "Peringkat 4"].map(function (o) { return "<option" + (P.target === o ? " selected" : "") + ">" + o + "</option>"; }).join("") + "</select></label><button type='button' id='akrProgSave' data-k='" + esc(k) + "'>Simpan progres</button><span id='akrProgMsg' class='note'></span></p>";
    return h + "</div>";
  }
  sec.innerHTML = "<div class='sechead'><span class='secnum'>A</span><h2>Akreditasi 2026</h2></div>" +
    "<p class='pintro'>Panduan akreditasi jurnal ilmiah menurut aturan 2026, dibuat untuk pengelola jurnal UNMER, lengkap dengan contoh, simulasi kesiapan tiap jurnal, sitasi, dan masa berlaku peringkat. Data diperiksa " + esc(A.atLabel || A.at) + ".</p>" +
    "<div class='akr-subg'>" + SUBG.map(function (g, gi) { return "<div class='akr-sub'><span class='sgl'>" + esc(g[0]) + "</span>" + g[1].map(function (x, i) { return "<button type='button' data-sub='" + x[0] + "'" + (gi === 0 && i === 0 ? " class='on'" : "") + ">" + esc(x[1]) + "</button>"; }).join("") + "</div>"; }).join("") + "</div>" +
    "<div class='akr-sec on' id='akrs-sim'>" + hSim() + "<div id='akrDet'></div></div>" +
    "<div class='akr-sec' id='akrs-sit'>" + hSitasi() + "</div>" +
    "<div class='akr-sec' id='akrs-status'>" + hStatus() + "</div>" +
    "<div class='akr-sec' id='akrs-dasar'>" + hDasar() + "</div>" +
    "<div class='akr-sec' id='akrs-min'>" + hMin() + "</div>" +
    "<div class='akr-sec' id='akrs-unsur'><p>Klik setiap unsur untuk membuka subunsur, nilai, penjelasan, dan contoh. Bobot total 100.</p>" + hUnsur() + "</div>" +
    "<div class='akr-sec' id='akrs-dis'>" + hDis() + "</div>" +
    "<div class='akr-sec' id='akrs-laksana'>" + hLaksana() + "</div>" +
    "<div class='akr-sec' id='akrs-kalk'>" + hKalk() + "</div>" +
    "<div class='akr-sec' id='akrs-alur'>" + hAlur() + "</div>" +
    "<div class='akr-sec' id='akrs-siap'>" + hSiap() + "</div>" +
    "<div class='akr-sec' id='akrs-prog'>" + hProg() + "</div>";

  var showSub = function (id) { sec.querySelectorAll(".akr-sub button").forEach(function (b) { b.classList.toggle("on", b.dataset.sub === id); }); sec.querySelectorAll(".akr-sec").forEach(function (s) { s.classList.toggle("on", s.id === "akrs-" + id); }); };
  var goRef = function (id) {
    if (id === "kalk") { showSub("kalk"); return; }
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
    var gs = e.target.closest("[data-gosub]"); if (gs) { e.preventDefault(); showSub(gs.dataset.gosub); return; }
    var sv = e.target.closest("#akrProgSave"); if (sv) { saveProg(sv.dataset.k); return; }
    if (e.target.closest("#akrProgDet")) return;
    var pr = e.target.closest("#akrProgBody tr.pr"); if (pr) { var pd = document.getElementById("akrProgDet"), pk = pr.dataset.k; pd.innerHTML = pd.dataset.k === pk ? "" : progDetail(pk); pd.dataset.k = pd.dataset.k === pk ? "" : pk; if (pd.innerHTML) pd.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    var rs = e.target.closest("[data-reset]"); if (rs) { var k0 = rs.dataset.reset, r0 = R.filter(function (x) { return x.kode === k0; })[0]; EDIT[k0] = JSON.parse(JSON.stringify(r0.sc)); document.getElementById("akrDet").innerHTML = detail(k0); refreshRow(k0); return; }
    if (e.target.closest("select")) return;
    var tr = e.target.closest("#akrSimBody tr.jr"); if (tr) { var box = document.getElementById("akrDet"), k = tr.dataset.k; box.innerHTML = box.dataset.k === k ? "" : detail(k); box.dataset.k = box.dataset.k === k ? "" : k; if (box.innerHTML) box.scrollIntoView({ behavior: "smooth", block: "start" }); }
  });
  sec.addEventListener("change", function (e) {
    var s = e.target;
    if (s.dataset.ps || s.dataset.pn) return;
    if (s.dataset.s) { EDIT[s.dataset.k][s.dataset.s] = +s.value; refreshRow(s.dataset.k); var box = document.getElementById("akrDet"), k = s.dataset.k, sy = window.scrollY; box.innerHTML = detail(k); window.scrollTo(0, sy); return; }
    if (s.id === "akrSimJ") { SIM.k = s.value; SIM.man = null; if (SIM.mode === "man" && !s.value) SIM.man = blank("mid"); simRender(); return; }
    if (s.id === "akrSimDis") { SIM.dis = +s.value; simRender(); return; }
  });
  simRender();
  sec.addEventListener("click", function (e) {
    var root = document.getElementById("akrSim"); if (!root || !root.contains(e.target)) return;
    var b = e.target.closest("[data-sg] button[data-v]");
    if (b) { var g = b.parentNode.dataset.sg, v = b.dataset.v;
      if (g === "mode") { SIM.mode = v; if (v === "man" && !SIM.man) { var r0 = R.filter(function (x) { return x.kode === SIM.k; })[0]; SIM.man = r0 ? autoSc(r0, "mid") : blank("mid"); } }
      else if (g === "asm") SIM.asm = v;
      else if (g === "base") { SIM.base = v; var r1 = R.filter(function (x) { return x.kode === SIM.k; })[0]; SIM.man = v === "data" ? (r1 ? autoSc(r1, "mid") : blank("mid")) : blank(v); }
      var y = window.scrollY; simRender(); window.scrollTo(0, y); return; }
    var m = e.target.closest("[data-man] button[data-v]");
    if (m) { SIM.man[m.parentNode.dataset.man] = +m.dataset.v; var y2 = window.scrollY; simRender(); window.scrollTo(0, y2); return; }
    if (e.target.closest("#akrSimToMan")) { var r2 = R.filter(function (x) { return x.kode === SIM.k; })[0]; SIM.man = autoSc(r2, SIM.asm); SIM.mode = "man"; SIM.base = "data"; simRender(); root.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    if (e.target.closest("#akrSimReset")) { var r3 = R.filter(function (x) { return x.kode === SIM.k; })[0]; SIM.man = r3 ? autoSc(r3, "mid") : blank("mid"); SIM.base = "data"; var y3 = window.scrollY; simRender(); window.scrollTo(0, y3); return; }
  });
  function saveProg(k) {
    var det = document.getElementById("akrProgDet"), steps = {};
    det.querySelectorAll("[data-ps]").forEach(function (el) { var id = el.dataset.ps, n = det.querySelector("[data-pn='" + id + "']"); if (el.value || (n && n.value)) steps[id] = { s: el.value, note: n ? n.value : "", d: new Date().toISOString().slice(0, 10) }; });
    var body = { j: k, steps: steps, plan: (document.getElementById("akrPlan") || {}).value || "", target: (document.getElementById("akrTarget") || {}).value || "" };
    var msg = document.getElementById("akrProgMsg"); msg.textContent = "Menyimpan…";
    fetch((window.PT_JR.api || "") + "akr-progress", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", "X-WP-Nonce": window.PT_JR.nonce || "" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok || j.error) throw new Error(j.error || ("HTTP " + r.status)); return j; }); })
      .then(function (j) { window.PT_AKRP = j.data; PROG = j.data.j || {}; document.getElementById("akrs-prog").innerHTML = hProg(); var pd = document.getElementById("akrProgDet"); pd.innerHTML = progDetail(k); pd.dataset.k = k; document.getElementById("akrProgMsg").textContent = "Tersimpan dan langsung terlihat oleh semua pengunjung."; })
      .catch(function (e) { msg.textContent = "Gagal: " + e.message; });
  }
  window.__AKR = { R: R, total: total, G: G };
})();
