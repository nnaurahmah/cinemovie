# Cinemovie v1 — Business Requirements Document (BRD)

Versi 1.0 · 20 November 2026

Dokumen ini menjelaskan kebutuhan bisnis Cinemovie v1, aplikasi web pemesanan kursi bioskop. Isinya merangkum hasil wawancara kebutuhan di `cinemovie-mvp-v1-brief.md`. Tidak ada kebutuhan baru di dokumen ini.

## 1. Ringkasan eksekutif

Cinemovie memungkinkan penonton memesan kursi bioskop lewat web tanpa antre di loket. Penonton memilih film, jadwal, dan kursi, lalu mendapat kode booking berbentuk QR. Admin bioskop mengelola film dan jadwal tayang lewat CMS.

Versi pertama adalah MVP dengan waktu pengembangan sekitar 4 jam, sehingga cakupannya sengaja kecil: tanpa pembayaran online, tanpa scanner di loket, dan tanpa pembatalan.

## 2. Latar belakang dan masalah

**Masalah utama:** penonton harus antre di loket hanya untuk membeli tiket dan memilih kursi.

**Kondisi saat ini (as-is):** penonton datang ke loket, antre, memilih kursi, dan membeli tiket di tempat.

**Kondisi yang dituju (to-be):** penonton memilih film, jadwal, dan kursi dari web, mendapat kode booking QR, lalu menunjukkannya di loket. Petugas loket memeriksa kode secara manual.

## 3. Tujuan bisnis

1. Menghilangkan antrean di loket yang hanya untuk membeli tiket dan memilih kursi.
2. Memberi penonton cara memilih kursi sendiri dan melihat kursi yang tersedia sebelum memesan.
3. Menjaga satu kursi hanya dimiliki satu pesanan (tidak ada pemesanan ganda).
4. Memberi admin cara mengelola film dan jadwal tayang tanpa bantuan developer.

Indikator keberhasilan v1 adalah kriteria penerimaan pada bagian 11.

## 4. Ruang lingkup

### 4.1 Dalam cakupan

- Registrasi dan login penonton serta login admin (email dan password).
- Katalog film dan jadwal tayang dengan harga tiket.
- Pemilihan kursi pada denah 8×10, penahanan kursi 5 menit, dan konfirmasi pesanan.
- Kode booking berbentuk QR dan riwayat pesanan penonton.
- CMS admin untuk menambah dan mengubah film dan jadwal tayang.
- 5 studio dengan denah kursi yang sama.

### 4.2 Di luar cakupan

- Pembayaran online
- Scanner QR dan validasi tiket di loket (dikerjakan di v2)
- Notifikasi email atau WhatsApp
- Pembatalan, refund, dan edit pesanan oleh penonton
- Harga tiket berbeda (reguler/VIP, weekend, promo/voucher)
- Log aktivitas admin
- Pengelolaan studio dan denah kursi lewat aplikasi
- Pembatalan pesanan atau pengosongan kursi oleh admin
- Melihat daftar pesanan per jadwal oleh admin
- Verifikasi email dan reset password
- Fitur hapus jadwal

## 5. Pemangku kepentingan dan peran

| Pihak | Peran dalam sistem | Kepentingan |
|---|---|---|
| **Penonton** | Pengguna aplikasi (akun) | Memesan kursi tanpa antre |
| **Admin bioskop** | Pengguna CMS (akun) | Mengelola film dan jadwal tayang |
| **Petugas loket** | Bukan akun di aplikasi | Membaca kode booking yang ditunjukkan penonton |
| **Developer** | Pembangun dan penyedia data awal | Menyelesaikan v1 dalam sekitar 4 jam, menyiapkan akun admin, studio, dan kursi |

## 6. Kebutuhan bisnis dan fungsional

Semua fitur berprioritas **wajib** untuk v1.

| Kode | Kebutuhan | Aturan terkait |
|---|---|---|
| **F1** | Registrasi dan login dengan email dan password (penonton dan admin) | R8, R11 |
| **F2** | Daftar film dan jadwal tayang untuk penonton, dengan 5 studio dan harga tiket ditampilkan | R5, R9, R12 |
| **F3** | Denah kursi 8×10 per jadwal, dengan status kursi: kosong, ditahan, terisi | R1, R6 |
| **F4** | Pemilihan kursi (maks 4 per transaksi), penahanan 5 menit, konfirmasi pesanan, lalu kode booking berbentuk QR | R1, R2, R3, R7, R9, R13, R14 |
| **F5** | Riwayat pesanan penonton | R7 |
| **F6** | CMS admin untuk menambah dan mengubah film (judul, durasi, sinopsis, poster) dan jadwal tayang | R4, R8, R10, R11, R12 |

## 7. Aturan bisnis

| Kode | Aturan |
|---|---|
| **R1** | Satu kursi pada satu jadwal hanya boleh dimiliki satu pesanan aktif (tidak boleh dobel). Memilih beberapa kursi bersifat semua-atau-tidak-sama-sekali: jika satu kursi sudah diambil orang lain, seluruh pilihan ditolak. |
| **R2** | Maksimal 4 kursi per transaksi. Satu akun boleh bertransaksi berkali-kali di satu jadwal, tanpa batas total per akun. |
| **R3** | Kursi yang dipilih ditahan 5 menit, hanya untuk jadwal yang sedang dipilih (satu transaksi). Waktu tahan dicek di server. Jika tidak dikonfirmasi, pesanan kedaluwarsa dan kursi kembali kosong begitu waktu lewat, walau browser sudah ditutup. |
| **R4** | Jadwal yang sudah punya pesanan tidak boleh diubah. Tidak ada fitur hapus jadwal. Hanya pesanan berstatus ditahan atau dikonfirmasi yang mengunci jadwal. Pesanan kedaluwarsa tidak mengunci. |
| **R5** | Semua tiket berharga sama. |
| **R6** | Jumlah studio (5) dan denah kursi (8×10, sama untuk semua studio) ditetapkan developer, bukan diatur admin. |
| **R7** | Status pesanan hanya tiga: ditahan, dikonfirmasi, kedaluwarsa. |
| **R8** | Hanya admin yang boleh mengelola film dan jadwal. Peran dicek di setiap halaman dan aksi CMS, bukan hanya lewat menu yang disembunyikan. |
| **R9** | Pemesanan ditutup 5 menit sebelum jam tayang. Konfirmasi ditolak setelah batas tutup, dan waktu tahan tidak melewati batas itu. Semua jam memakai satu zona waktu (WIB). |
| **R10** | Jadwal dalam satu studio tidak boleh bentrok. Durasi film menentukan waktu studio terpakai, dan show berikutnya baru boleh mulai minimal 15 menit setelah show sebelumnya selesai. Jam tayang harus di masa depan. Durasi film tidak bisa diubah jika film sudah punya jadwal. |
| **R11** | Akun admin pertama disiapkan developer lewat data awal. Tidak ada pendaftaran admin lewat aplikasi. |
| **R12** | Satu film boleh punya beberapa jadwal dalam sehari, selama tidak bentrok di studio yang sama (mengikuti R10). |
| **R13** | Di v1, loket memeriksa tiket secara manual dengan membaca kode booking. Tidak ada scanner. Risiko QR yang di-screenshot dan dipakai ulang diterima untuk pilot. Kode booking dibuat acak dan tidak bisa ditebak, dan layar tiket menampilkan jadwal serta kursi di samping QR. |
| **R14** | Satu akun hanya boleh punya satu penahanan kursi aktif pada satu waktu. Memilih kursi lagi melepas penahanan lama. |

## 8. Proses bisnis

### 8.1 Pemesanan oleh penonton

Daftar atau login → lihat film dan harga → pilih jadwal → lihat denah kursi → pilih kursi (maks 4) → kursi ditahan 5 menit → konfirmasi → kode booking QR tampil → riwayat pesanan → tunjukkan kode di loket → loket membaca kode secara manual.

Jika waktu tahan habis sebelum konfirmasi, pesanan kedaluwarsa dan kursi kembali kosong. Diagram lengkap ada di `flow.md`.

### 8.2 Pengelolaan oleh admin

Login CMS → pilih menu film atau jadwal → tambah atau ubah → simpan. Perubahan ditolak jika jadwal sudah punya pesanan, durasi film berubah padahal sudah punya jadwal, atau jadwal bentrok atau berada di masa lalu.

## 9. Kebutuhan non-fungsional

Hanya yang sudah tertulis di brief dan design system:

| Area | Kebutuhan |
|---|---|
| Keamanan | Peran admin dicek di setiap halaman dan aksi (R8). Penonton tidak menulis langsung ke data pesanan. Kode booking acak (R13). Rincian di `guardrails.md`. |
| Konsistensi data | Tidak ada kursi ganda (R1). Kedaluwarsa dihitung di server (R3). Jadwal tidak bentrok (R10). |
| Tampilan | Mengikuti `design_system_cinemovie.md`: tema gelap sinematik, nyaman dipakai di HP (`390px`) dan desktop (`1280px`). |
| Aksesibilitas | Kontras minimal WCAG AA, area sentuh minimal 44px, teks minimal 14px, SeatMap tidak membedakan status hanya dengan warna. |
| Zona waktu | Satu zona waktu untuk semua jam (WIB). |

## 10. Asumsi, batasan, dan dependensi

**Batasan**

- Waktu pengembangan sekitar 4 jam.
- Cakupan dibatasi oleh daftar di bagian 4.2.

**Asumsi**

- Durasi film dikunci jika film sudah punya jadwal.
- Poster film berupa URL.
- Risiko QR yang di-screenshot diterima untuk pilot.

**Dependensi**

- Supabase Auth untuk autentikasi. Tidak ada tabel pengguna sendiri.
- `design_system_cinemovie.md` untuk tampilan.
- Developer menyiapkan data awal: 5 studio, 400 kursi, dan akun admin pertama.

## 11. Kriteria penerimaan

v1 dianggap selesai jika:

1. Penonton bisa daftar, login, memilih kursi, dan mendapat kode booking dari awal sampai akhir tanpa error.
2. Uji dua pengguna yang berebut kursi yang sama: hanya satu yang berhasil.
3. Admin bisa menambah film dan jadwal yang langsung muncul di sisi penonton.
4. Tampilan nyaman dipakai di HP.

Skenario uji rinci ada di `plan.md` bagian 4.

## 12. Risiko

| Risiko | Penanganan di v1 |
|---|---|
| Penahanan kursi dan rebutan kursi (bagian paling rawan salah) | Aturan dijaga di database, dikerjakan lebih dulu setelah login dan data jadwal siap, dan diuji dua sesi |
| CMS dan pengecekan bentrok jadwal cukup berat untuk 4 jam | Dibuat dalam versi paling sederhana dulu |
| QR di-screenshot dan dipakai ulang | Risiko diterima untuk pilot. Kode acak, layar tiket menampilkan jadwal dan kursi. Scanner dan status "sudah dipakai" di v2 |
| Satu akun menahan kursi berulang | Dibatasi R14 (satu penahanan aktif) dan masa tahan 5 menit |

## 13. Hal yang perlu dikonfirmasi

Ditemukan saat mencocokkan brief dengan design system. Detail dan perilaku sementara ada di `plan.md` bagian 7.

1. Nilai harga tiket tetap (R5) belum ditetapkan.
2. Layar 7 design system (metrik dan daftar booking admin) bertentangan dengan brief.
3. Design system tidak punya layar khusus ubah film dan jadwal.
4. Katalog film apakah boleh dilihat tanpa login. Brief memulai dari login.

## 14. Glosarium

| Istilah | Arti |
|---|---|
| Penahanan (hold) | Kursi dikunci sementara selama 5 menit untuk satu transaksi |
| Batas tutup | 5 menit sebelum jam tayang, setelah itu pemesanan ditolak |
| Jeda | 15 menit antara selesai satu show dan mulai show berikutnya di studio yang sama |
| Kode booking | Kode acak yang dibuat saat pesanan dikonfirmasi dan ditampilkan sebagai QR |
| CMS | Halaman admin untuk mengelola film dan jadwal |
| MVP | Versi pertama dengan cakupan minimal |
