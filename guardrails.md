# Cinemovie v1 — Guardrail

Versi 1.0 · 20 November 2026

Dokumen ini berisi batasan cakupan, aturan yang tidak boleh dilanggar, dan panduan keamanan untuk Cinemovie v1. Isinya berasal dari `cinemovie-mvp-v1-brief.md` dan `design_system_cinemovie.md`. Praktik keamanan standar di bagian 4 adalah cara menjaga aturan yang sudah ada, bukan fitur baru.

## 1. Prinsip

1. **Brief adalah acuan.** Jika sesuatu tidak ada di brief, jangan dibangun. Tanyakan dulu.
2. **Aturan dijaga di database.** Antarmuka hanya membantu, bukan penjaga terakhir.
3. **Server adalah penentu waktu.** Timer di layar hanya tampilan.
4. **Tolak dengan jelas.** Setiap penolakan punya pesan yang bisa dipahami pengguna, tanpa membocorkan detail internal.

## 2. Di luar cakupan (jangan dibangun di v1)

- Pembayaran online
- Scanner QR dan validasi tiket di loket (QR hanya ditampilkan, pemindaian dikerjakan di v2)
- Notifikasi email atau WhatsApp
- Pembatalan, refund, dan edit pesanan oleh penonton
- Harga tiket berbeda (reguler/VIP, weekend, promo/voucher)
- Log aktivitas admin
- Pengelolaan studio dan denah kursi lewat aplikasi
- Pembatalan pesanan atau pengosongan kursi oleh admin
- Melihat daftar pesanan per jadwal oleh admin
- Verifikasi email dan reset password
- Fitur hapus jadwal
- Akun atau peran lain selain penonton dan admin (loket bukan akun)

Jika ada permintaan di luar daftar ini, jangan dikerjakan. Ingatkan bahwa itu di luar cakupan v1 dan tanyakan apakah masuk daftar "tidak dibuat di v1".

## 3. Aturan yang tidak boleh dilanggar

| Kode | Aturan | Jangan |
|---|---|---|
| R1 | Satu kursi di satu jadwal untuk satu pesanan aktif. Pilihan beberapa kursi bersifat semua-atau-tidak-sama-sekali | Menyimpan sebagian kursi, atau mengandalkan pengecekan di klien |
| R2 | Maks 4 kursi per transaksi, tanpa batas total per akun | Menambah batas total per akun |
| R3 | Tahan 5 menit untuk jadwal yang sedang dipilih. Waktu dicek di server | Memakai timer klien atau job pembersih sebagai penentu |
| R4 | Jadwal berpesanan (ditahan atau dikonfirmasi) tidak boleh diubah. Tidak ada hapus jadwal | Membuat endpoint atau tombol hapus jadwal |
| R5 | Semua tiket berharga sama | Menambah input harga di CMS atau harga per kursi |
| R6 | Studio (5) dan denah (8×10) ditetapkan developer | Membuat layar kelola studio atau denah |
| R7 | Status pesanan hanya `held`, `confirmed`, `expired` | Menambah status baru (misalnya "dipakai") |
| R8 | Hanya admin yang mengelola film dan jadwal, dicek di setiap halaman dan aksi | Mengandalkan menu yang disembunyikan |
| R9 | Tutup 5 menit sebelum tayang. Satu zona waktu (WIB) | Menerima konfirmasi setelah batas tutup |
| R10 | Tidak bentrok, jeda 15 menit antar show di studio yang sama. Jam tayang di masa depan. Durasi film terkunci jika sudah punya jadwal | Melonggarkan jeda atau mengizinkan ubah durasi |
| R11 | Akun admin pertama dari developer | Membuat pendaftaran admin lewat aplikasi |
| R12 | Satu film boleh banyak jadwal sehari selama tidak bentrok | Membatasi jumlah jadwal per film per hari |
| R13 | Loket memeriksa manual. Kode booking acak dan tidak bisa ditebak. Layar tiket menampilkan jadwal dan kursi di samping QR | Membuat kode berurutan atau berpola |
| R14 | Satu penahanan aktif per akun. Memilih lagi melepas penahanan lama | Mengizinkan dua penahanan aktif sekaligus |

## 4. Keamanan

### 4.1 Autentikasi dan peran

- Login memakai email dan password lewat Supabase Auth. Jangan membuat tabel `users` atau sistem sesi sendiri.
- Peran admin hanya dari `app_metadata.role = 'admin'`. Jangan pernah membaca peran dari `user_metadata`, tabel yang bisa diubah pengguna, atau parameter dari klien.
- Cek peran di **setiap halaman dan aksi CMS** serta di policy database. Menyembunyikan menu tidak dihitung sebagai pengamanan (R8).
- Tidak ada pendaftaran admin lewat aplikasi (R11).

### 4.2 Akses data (RLS)

- RLS aktif di semua tabel. Tabel baru tanpa policy dianggap belum selesai.
- Penonton hanya membaca `bookings` dan `booking_seats` miliknya sendiri.
- Penonton tidak menulis langsung ke `bookings` atau `booking_seats`. Hanya lewat fungsi.
- Admin tidak punya akses ke `bookings` dan `booking_seats` (daftar pesanan oleh admin di luar cakupan).
- Tidak ada policy `delete` pada `showtimes`.
- `seat_availability` tidak boleh mengembalikan identitas pemesan.

### 4.3 Fungsi database (RPC)

- Ambil identitas dari `auth.uid()`. Jangan menerima `user_id` dari klien.
- Gunakan `security definer` dengan `search_path` yang ditetapkan eksplisit dan nama tabel berawalan skema.
- Cabut `execute` dari `public` dan `anon`. Berikan hanya ke `authenticated`.
- `expire_stale_holds()` tidak boleh dapat dipanggil dari klien.
- Validasi di dalam fungsi: jumlah kursi 1 sampai 4, kursi milik studio jadwal, batas tutup, dan kepemilikan pesanan.
- Trigger yang membaca tabel yang tidak boleh dibaca perannya (misalnya trigger jadwal membaca `bookings` saat admin mengubah jadwal) harus `security definer`. Jika tidak, RLS membuat pengecekan R4 selalu lolos.

### 4.4 Rahasia dan kunci

- Kunci `service_role` dan rahasia lain **tidak boleh** ada di kode klien, repositori, log, atau pesan error.
- Klien hanya memakai kunci publik (anon) bersama RLS.
- Simpan konfigurasi rahasia di variabel lingkungan, bukan di kode.

### 4.5 Validasi input dan tampilan

- Validasi di server (database dan fungsi), bukan hanya di formulir. Validasi di klien hanya untuk kenyamanan.
- Pakai query berparameter. Jangan menyusun SQL dari input pengguna.
- `poster_url` hanya boleh `http` atau `https`, dan hanya dipakai sebagai sumber gambar.
- Tampilkan judul dan sinopsis sebagai teks biasa (di-escape). Jangan merender HTML dari input.
- Batasi durasi film ke angka positif. Jam tayang hanya di masa depan.

### 4.6 Kode booking dan QR

- Kode booking dibuat acak di server saat konfirmasi. Tidak boleh berurutan atau bisa ditebak dari data lain.
- QR hanya ditampilkan setelah pesanan `confirmed`.
- Risiko QR yang di-screenshot dan dipakai ulang **diterima** untuk pilot (R13). Jangan menambah mekanisme pencegahan baru. Scanner dan status "sudah dipakai" adalah bagian v2.

### 4.7 Pesan error dan log

- Pesan ke pengguna singkat dan jelas (misalnya "Kursi sudah diambil, pilih kursi lain"), tanpa nama tabel, query, atau jejak sistem.
- Jangan mencatat password, token, kunci, atau isi sesi di log.
- Jangan menampilkan data milik pengguna lain di pesan error atau layar status.

### 4.8 Data pribadi

- Data pengguna yang disimpan hanya yang dibutuhkan oleh Supabase Auth (email dan kredensial) serta riwayat pesanan sendiri.
- Jangan menambah kolom data pribadi baru tanpa persetujuan.

## 5. Guardrail antarmuka

Dari `design_system_cinemovie.md`:

- Hanya warna dari token `:root`. Tidak ada gradien mencolok, efek kaca, atau bayangan tebal.
- Tidak ada emoji sebagai ikon, status kursi, atau penanda tombol. Pakai ikon garis.
- Tidak ada teks di bawah 14px.
- Kontras minimal WCAG AA: 4.5:1 untuk teks normal, 3:1 untuk teks besar dan indikator UI.
- Area sentuh minimal 44px × 44px.
- SeatMap tidak boleh membedakan status hanya dengan warna.
- Cincin fokus keyboard selalu terlihat.
- Tidak ada layar kosong tanpa penjelasan dan jalur kembali.

## 6. Kapan berhenti dan bertanya

Berhenti dan tanyakan sebelum melanjutkan jika:

1. Permintaan ada di daftar bagian 2 atau tidak ada di brief.
2. Brief dan design system saling bertentangan. Lihat `plan.md` bagian 7.
3. Ada pilihan yang menyentuh R1 sampai R14.
4. Dibutuhkan nilai yang belum ditetapkan (misalnya harga tiket tetap).
5. Ada kebutuhan menyimpan data pribadi tambahan atau membuka akses yang lebih luas dari tabel RLS di `database.md`.

Cara bertanya: satu pertanyaan per giliran, dengan 2 sampai 3 pilihan jawaban jika memungkinkan.

## 7. Checklist keamanan sebelum dianggap selesai

- [ ] RLS aktif di semua tabel, dan T11 di `plan.md` lulus.
- [ ] Penonton tidak bisa membuka atau memakai CMS (T10).
- [ ] Tidak ada kunci `service_role` atau rahasia di kode klien atau repositori.
- [ ] Semua fungsi RPC: `auth.uid()`, `search_path` eksplisit, `execute` dicabut dari `public` dan `anon`.
- [ ] Penulisan langsung ke `bookings` dan `booking_seats` dari klien ditolak.
- [ ] Waktu tahan dan batas tutup divalidasi di server (T3, T4, T6).
- [ ] Uji berebut kursi lulus (T1).
- [ ] Kode booking acak dan tidak berpola.
- [ ] `poster_url` hanya `http` atau `https`, teks admin di-escape.
- [ ] Pesan error tidak membocorkan detail internal.
