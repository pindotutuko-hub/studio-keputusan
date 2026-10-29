## Unduh yang mana?

Cukup unduh **satu berkas** sesuai komputer Anda. Daftar berkas ada di bagian **Assets** di bawah. Jika daftarnya tertutup, klik tulisan *Assets* untuk membukanya.

| Komputer Anda | Berkas yang diunduh | Keterangan |
|---|---|---|
| **Windows** (laptop/PC biasa) | `Studio.Keputusan.2.Setup.<versi>.exe` | Pemasang biasa. Klik dua kali, ikuti langkahnya, lalu aplikasi muncul di menu Start. **Pilihan utama untuk Windows.** |
| Windows, tanpa hak instal (komputer kantor/lab) | `Studio.Keputusan.2-<versi>-win.zip` | Versi portabel. Ekstrak (klik kanan → *Extract All*), lalu jalankan `Studio Keputusan 2.exe` dari folder hasil ekstrak. |
| **Mac** (Intel maupun Apple M1/M2/M3/M4) | `Studio.Keputusan.2-<versi>-universal.dmg` | Buka berkasnya, lalu seret ikon aplikasi ke folder **Applications**. **Pilihan utama untuk Mac.** |
| Mac, cadangan | `…-universal-mac.zip` | Isinya sama dengan .dmg. Pakai hanya jika .dmg gagal dibuka. |

Berkas pendamping (tidak wajib diunduh):

- **`Panduan-Studio-Keputusan-…pdf`**: buku panduan penggunaan yang bisa dibaca atau dicetak.
- **`studio-keputusan-complete.skaddon.json`**: daftar paket analisis tambahan (add-on), misalnya hukum, psikologi, mikroklimat, dan rekayasa. Aplikasi sudah memuat semuanya. Berkas ini hanya diperlukan bila Anda ingin memulihkan pilihan add-on lewat menu **Add-on → Impor manifest**.
- **Source code (zip / tar.gz)**: kode program untuk pengembang. Pengguna biasa tidak memerlukannya.

## Pertama kali membuka

Aplikasi ini belum didaftarkan berbayar ke Microsoft/Apple, sehingga sistem menampilkan peringatan sekali di awal. Berkas aman karena dibangun otomatis dari kode di repositori ini.

- **Windows**: jika muncul layar biru *"Windows protected your PC"*, klik **More info** lalu **Run anyway**.
- **Mac**: klik kanan (atau Control+klik) ikon aplikasi di folder Applications, pilih **Open**, lalu **Open** sekali lagi. Jika masih ditolak, buka **System Settings → Privacy & Security**, gulir ke bawah, lalu klik **Open Anyway**.

Setelah itu aplikasi terbuka normal seperti aplikasi lain.

## Istilah di halaman ini

- **Latest**: versi terbaru yang disarankan.
- **Assets**: daftar berkas yang dapat diunduh.
- **sha256: …**: "sidik jari" berkas untuk memastikan unduhan tidak rusak. Pengguna biasa dapat mengabaikannya.
- **Compare**: membandingkan kode antarversi (untuk pengembang).

## Memperbarui versi

Unduh dan pasang versi baru di atas versi lama. Data proyek Anda tidak hilang, dan berkas proyek (.json) dari versi lama tetap dapat dibuka.
