# Arsitektur Studio Keputusan

## Gambaran besar

```
app.html            ← SUMBER TUNGGAL antarmuka + logika (HTML, CSS, JS dalam satu berkas, tanpa framework)
build-page.js       ← membungkus app.html → src/index.html (doctype, CSP, font lokal) untuk desktop
src/index.html      ← HASIL BUILD, jangan diedit manual
src/fonts/          ← font woff2 terbundel (Atkinson Hyperlegible, Familjen Grotesk, JetBrains Mono)
main.js, preload.js ← proses utama Electron & jembatan aman (window.ismDesktop)
tests/smoke.test.js ← uji otomatis (jsdom) semua modul + angka acuan
.github/workflows/  ← CI: test → build Windows/macOS → GitHub Release (versi dari package.json)
```

`app.html` juga dipublikasikan apa adanya sebagai versi web. Karena itu berkas ini **tidak** memuat `<!doctype>`, `<html>`, `<head>`, `<body>`; lingkungan web menambahkannya, dan `build-page.js` menambahkannya untuk desktop.

## Struktur di dalam app.html

Urutan blok (cari komentar `/* ===` atau `/* ---`):

| Blok | Isi |
|---|---|
| `<style>` | Token warna (`:root` + 2 blok dark mode), tipografi, komponen. Semua warna lewat token CSS. |
| Markup | `header.top`, `nav.rail` (berisi `.grp[data-mod]` per modul), `<main>` (berisi `<section data-sec="…">` per langkah), `footer.credit` (rujukan + kredit Pindo Tutuko). |
| ISM | State `S` (`ism-studio-v1`), `compute()` (IRM→FRM Warshall, partisi level, kondensasi SCC, reduksi transitif), render SSIM/RM/LP/Model/MICMAC. |
| Navigasi | `MODS` (modul → daftar langkah), `CREDIT` (rujukan per modul), `go(step)`, `render()` (peta langkah → fungsi render). |
| AHP, SWOT, Delphi | Masing-masing: state + `persistX()`, fungsi hitung murni, `renderXIn()`/`renderXRes()`. |
| Batch A | PESTEL, Porter, CBA, CPM/PERT, Balanced Scorecard. |
| Batch B | SNA, Kualitatif, Space Syntax (convex + axial), Site Analysis, Behavioral Mapping, POE/IPA. |
| Batch C | `TARGETS`/`SOURCES`/`sendBar()` (kirim antarmodul), Sintesis (`METRICS`, `syCalc()`), Laporan (`RES`, `buildReport()`). |
| Batch E (v1.6) | Javanese House Depth (`JH`, `jhCalc`), OTTV/RTTV (`OT`, tabel `OTD` dari SNI 6389:2020, `otCalc`, `otSC`), Space Syntax segmen/VGA (`sxSegCalc`, `sxVgaCalc`, `sxDedupe`), menu Tentang (`renderAbout`). |
| Statistik (v1.6) | Mesin murni `st*` (distribusi, aljabar linear, uji statistik, `plsRun/plsBoot`, `semFit`), dataset bersama `DS` (`dsParse`, `dsEditor`), modul `SS` (Statistik), `PL` (PLS-SEM), `CS` (CB-SEM) dengan editor model `semEditor`. |
| Registry | `CATS` (rumpun ilmu), `METHODS` (kartu halaman awal), `renderHome()`, `fillModSel()`. |

### Pola setiap modul

```js
const XX_KEY="sk-namamodul-v1";                 // kunci localStorage (naikkan versi bila format berubah)
const xxBlank=()=>({ ..., sample:false });      // keadaan kosong
const xxSample=()=>({ ..., sample:true });      // data contoh (ditandai, tidak dipersist sebagai milik user)
let XX=mkStore(XX_KEY,xxBlank); const persistXX=()=>saveK(XX_KEY,XX);
function xxCalc(){ ... }                         // FUNGSI MURNI: semua angka dihitung di sini
function renderXxIn(){ ... }                     // form input → #xxIn
function renderXxRes(){ ... }                    // hasil → #xxRes (memanggil xxCalc)
TSVX.xx=()=>...;                                 // "Salin untuk Excel"
```

Langkah menambah metode baru:
1. Tulis blok modul seperti pola di atas.
2. Tambahkan `<section data-sec="xx-in">` dan `xx-res` di `<main>`, dan `.grp[data-mod="xx"]` di `nav.rail`.
3. Daftarkan di `MODS`, peta fungsi `render()`, `CREDIT` (rujukan terverifikasi), dan `METHODS` (`ready:true`, kategori `c:[...]`).
4. Tambahkan ke `exportObj()`/`importText()`/reset “Proyek baru”, `statusA/B` (teks status kartu), dan bila relevan `SOURCES`, `METRICS`, `RES`.
5. Tambahkan pemeriksaan angka di `tests/smoke.test.js`, jalankan `npm test`.

## Bahasa Inggris (v3.1)
Blok `<script>` terakhir `app.html` berisi `window.I18N_EN` (kamus: teks Indonesia → Inggris, angka diganti `{n}`) dan mesin i18n DOM (`window.skLang`: `get`, `set("en"|"id")`, `t`, `tsv`). Mesin menerjemahkan teks & atribut (`title`, `placeholder`, `aria-label`, `data-tip`) lewat MutationObserver, menyimpan teks asli agar bisa kembali ke ID, dan mengubah format angka. Elemen ber-kelas `no-i18n`, input dan textarea tidak disentuh. Setelah menambah teks antarmuka baru: `node tools/i18n-collect.js` → terjemahkan kunci baru ke `tools/i18n/en.json` → `node tools/i18n-embed.js` → `node tools/i18n-audit.js`.

## Konvensi

- **Bahasa UI**: Indonesia; istilah teknis Inggris diikuti padanan Indonesia dalam kurung, mis. *Reachability matrix (Matriks keterjangkauan)*.
- **Kebijakan rujukan**: tanpa halusinasi. Setiap rujukan di `CREDIT` harus terverifikasi; bila detail (mis. halaman) tidak pasti, hilangkan detailnya.
- **Angka**: format Indonesia (koma desimal) lewat `fmt()`/`pct()`/`rp()`. Rumus ditampilkan di catatan halaman hasil.
- **Tanpa dependensi runtime**: tidak ada CDN/library; semua diagram SVG digambar tangan. Hanya Google Fonts di versi web (opsional, ada fallback).
- **Tema**: warna hanya dari token CSS; dukung terang/gelap.
- **Interaksi**: dialog `alert/confirm/prompt` tidak dipakai; konfirmasi memakai `confirmArm()` (klik dua kali).
- **Penyimpanan**: `localStorage` per modul, dibungkus try/catch. Berkas proyek `.json` memuat semua modul.
- **Desktop**: fitur khusus desktop memakai `window.ismDesktop` (`save`, `open`, `pdf`) dan tombol `.desk-only`.

## Rujukan & versi
- Rujukan metode ada di objek `CREDIT` (tampil di kaki halaman metode dan laporan) dan `EXTRA_REFS` (rujukan algoritma). Menu **Sumber & Referensi** (`renderRefs`) menyusunnya otomatis per rumpun ilmu — menambah metode cukup mengisi `CREDIT`.
- `APP_VERSION` di `app.html` harus sama dengan `version` di `package.json` (diperiksa `npm test`).

## Uji & rilis

```bash
npm install
npm test               # wajib lulus sebelum commit
node build-page.js     # setelah mengubah app.html
npm start              # jalankan aplikasi desktop
```

Naikkan `version` di `package.json` → push ke `main` → GitHub Actions menjalankan test, membangun installer Windows (.exe) dan macOS (.dmg universal), lalu menerbitkan Release `v<versi>`. Perubahan yang hanya menyentuh `*.md` atau `docs/` tidak memicu build.

## Rujukan algoritma penting

- ISM: Ahmad & Qahmash (2021), SmartISM — FRM dengan transitivitas, partisi level, model tereduksi.
- AHP: vektor eigen utama (iterasi pangkat), CR = CI/RI dengan RI Saaty.
- Space Syntax: Integration HH = 1/RRA, RRA = RA/D_k (Hillier & Hanson 1984); Choice = Brandes (pasangan tak berurut); NACH = log(CH+1)/log(TD+3), NAIN = NC^1,2/TD (Hillier, Yang & Turner 2012), versi topologis.
- SNA: closeness dengan koreksi Wasserman–Faust; betweenness Brandes ternormalisasi.
- Sintesis: normalisasi min–maks per ukuran; Spearman = Pearson pada peringkat (ties dirata-rata).

- Segmen angular: bobot belok = sudut/90°; rute setara dipecah dengan jumlah segmen paling sedikit (epsilon 1e-6 per langkah) agar tautan lurus (0°) tidak membentuk siklus nol; radius metrik dari tengah segmen.
- VGA: grid dari titik isi, tetangga 4-arah tanpa menembus dinding; visibilitas = garis antarpusat tidak memotong/menyentuh dinding.
- PLS-SEM: skema path weighting (predecessor = koefisien regresi, successor = korelasi; sama dengan SEMinR/SmartPLS), kriteria henti 1e-7, HTMT korelasi mutlak, p bootstrap t(df = B−1).
- CB-SEM: ML Wishart (S/(N−1), χ² = (N−1)F), SE dari informasi Fisher harapan; semopy memakai N sehingga χ² dan SE berbeda faktor N/(N−1).

Angka acuan di `tests/smoke.test.js` sudah dicocokkan dengan NetworkX, Shapely, SciPy, statsmodels, pingouin, factor_analyzer, dan semopy.

## v2.7 — blok `/* ===== v2.7 BEGIN ===== */` di app.html

| Bagian | Isi |
|---|---|
| `V27` | Mesin murni: MCDM (SAW, WP, TOPSIS, VIKOR, PROMETHEE II, MOORA), bobot Entropy/CRITIC, BWM (`V27.lp` simpleks dua fase), `uncert`, data mining (`kmeans`, `silhouette`, `hclust`, `cutTree`, `pca`, `learners`, `evaluate`, `rankFeatures`). |
| `LGROUPS`, `MINFO`, `GLOSS` | Jalur belajar, info panduan per metode (pertanyaan, masukan, proses, keluaran, tingkat), glosarium (istilah, definisi, URL sumber). |
| `CH` | Grafik SVG bersama (hbars, bars, hist, box, scatter, lines, heat, qq) — warna lewat token `--c1..--c8`. |
| `regModule(k, steps, railBtns, meta)` | Mendaftarkan modul baru: MODS/STEPS, tombol rail, section, kartu METHODS. Render langkah didaftarkan di `V27_NEW[step]`. |
| `regStore({k,label,get,set,blank,has,extra})` | **Wajib untuk analisis baru** agar otomatis ikut Pusat ekspor–impor, menu ⇅, berkas proyek (`extra:true`), dan paket metode. |
| `WT` / `OW` | Widget kanvas & keadaan kanvas. Metode Studio menjadi widget `m:<k>`; pengiriman antarmetode di `xferFor()`. |
| `manSections()` / `window.__manualDoc()` | Isi panduan; PDF dibangun dengan `node tools/build-manual.js` (mengisi `MAN_PAGES`). |

Langkah menambah analisis baru (v2.7+): tulis modul seperti pola di atas → `regModule(...)` → `V27_NEW[...]` → `MINFO[k]` (panduan) → `CREDIT[k]` (rujukan terverifikasi) → `regStore({...})` → bila ada tabel hasil, `TSVX[key]` + `XLSHEETS.push([k, judul, key])` → uji di `tests/v27.test.js` → `node tools/build-manual.js` agar panduan/PDF ikut diperbarui.
