# Cinemovie v1 — Rencana Implementasi

Versi 1.0 · 20 November 2026

Dokumen ini memandu urutan pengerjaan Cinemovie v1. Tidak ada fitur atau keputusan baru di sini. Semua isi berasal dari `cinemovie-mvp-v1-brief.md` dan `design_system_cinemovie.md`.

## 1. Sumber kebenaran

Jika dua dokumen berbeda, ikuti urutan ini:

1. **`cinemovie-mvp-v1-brief.md`**: cakupan, fitur (F1 sampai F6), aturan bisnis (R1 sampai R14), struktur data.
2. **`design_system_cinemovie.md`**: tampilan, komponen, layout 9 layar, aksesibilitas.
3. Dokumen turunan: `brd.md`, `flow.md`, `database.md`, `guardrails.md`, `copilot-instructions.md`.

Jika design system meminta sesuatu yang tidak ada di brief, jangan dibangun dulu. Catat di bagian 7.

## 2. Batasan

- Waktu pengembangan sekitar 4 jam, jadi cakupan sengaja kecil.
- Autentikasi memakai Supabase Auth. Tidak ada tabel `users` sendiri.
- Daftar "di luar cakupan" ada di `guardrails.md` bagian 2 dan berlaku mengikat.

## 3. Tahapan pengerjaan

Urutan ini mengikuti brief bagian 10. Kerjakan berurutan.

### Tahap 1 — Fondasi dan login

**Fitur:** F1 · **Layar:** 5 (Login dan Daftar)

- Aktifkan ekstensi `btree_gist`.
- Buat seluruh tabel, enum, index, dan trigger dari `database.md`.
- Isi data awal: 5 studio dan 400 kursi (8 baris × 10 kolom per studio).
- Siapkan akun admin lewat data awal dan beri `app_metadata.role = 'admin'` (R11).
- Aktifkan RLS dan policy dasar.
- Pasang token design system (`:root`) dan komponen dasar: Button, Input, Navbar, Toast.
- Login dan registrasi dengan email dan password, dengan pesan error inline.

**Selesai jika:** penonton bisa daftar dan login, admin bisa login, dan penonton tidak bisa membuka halaman CMS (R8).

### Tahap 2 — CMS film dan jadwal

**Fitur:** F6 · **Layar:** 7 dan 8 · **Aturan:** R4, R8, R9, R10, R12

- Form tambah dan ubah film: judul, durasi, sinopsis, poster (URL).
- Form tambah dan ubah jadwal: film, studio, jam tayang (WIB).
- Penolakan oleh database untuk jadwal bentrok (jeda 15 menit), jam lampau, jadwal berpesanan, dan perubahan durasi film berjadwal.
- Cek peran admin di setiap halaman dan aksi CMS, bukan hanya di menu.
- Versi paling sederhana dulu. Layar 7 mengikuti catatan di bagian 7.

**Selesai jika:** admin bisa menambah film dan jadwal, dan semua penolakan di atas muncul sebagai pesan yang jelas.

### Tahap 3 — Katalog dan jadwal untuk penonton

**Fitur:** F2 · **Layar:** 1 dan 2 · **Aturan:** R5, R9, R12

- Katalog film dengan poster rasio 2:3, durasi, dan harga.
- Detail film dengan daftar jadwal per studio (WIB).
- State "Pemesanan Ditutup" pada jadwal yang sudah lewat batas tutup (5 menit sebelum tayang).

**Selesai jika:** film dan jadwal yang dibuat admin langsung tampil di sisi penonton.

### Tahap 4 — Kursi, penahanan, dan konfirmasi

**Fitur:** F3 dan F4 · **Layar:** 3 dan 4 · **Aturan:** R1, R2, R3, R9, R14

Ini tahap paling berisiko. Sisakan waktu untuk pengujian.

- Fungsi `seat_availability`, `hold_seats`, dan `confirm_booking`.
- Komponen SeatMap 8×10 dengan status kosong, dipilih, terisi, dan pembeda non-warna.
- Ringkasan pilihan: maksimal 4 kursi, total harga, hitung mundur 5 menit (hanya tampilan, server tetap penentu).
- Layar konfirmasi dengan tombol Konfirmasi Pesanan dan Ubah Kursi.

**Selesai jika:** uji dua pengguna yang berebut kursi yang sama lulus (T1 di bagian 4).

### Tahap 5 — Kode booking QR dan riwayat

**Fitur:** F4 dan F5 · **Layar:** 6 · **Aturan:** R7, R13

- Kode booking acak dan QR tampil setelah pesanan dikonfirmasi, bersama jadwal dan kursi.
- Riwayat pesanan milik sendiri dengan badge status: Ditahan, Dikonfirmasi, Kedaluwarsa.

**Selesai jika:** alur penonton dari login sampai kode booking berjalan tanpa error.

### Lintas tahap — State khusus

**Layar:** 9. Bangun bertahap sejak Tahap 2: loading, kosong, error, dan halaman tidak ditemukan, masing-masing dengan tombol pemulihan.

## 4. Pengujian wajib

| Kode | Aturan | Skenario | Hasil yang diharapkan |
|---|---|---|---|
| T1 | R1 | Dua sesi memilih kursi yang sama di jadwal yang sama | Hanya satu berhasil. Yang kalah ditolak seluruhnya, tidak ada kursi setengah tertahan. |
| T2 | R2 | Pilih 5 kursi dalam satu transaksi | Ditolak. Setelah transaksi pertama dikonfirmasi, transaksi kedua 4 kursi di jadwal yang sama diterima. |
| T3 | R3 | Tahan kursi, tunggu lewat 5 menit | Konfirmasi ditolak dan kursi tampil kosong tanpa menunggu job pembersih. |
| T4 | R3 | Ubah jam di browser saat menahan kursi | Tidak berpengaruh, server yang menentukan. |
| T5 | R4 | Dengan akun admin, ubah jadwal yang punya pesanan ditahan atau dikonfirmasi | Ditolak (admin tidak bisa membaca `bookings`, jadi trigger harus `security definer`). Jadwal yang hanya punya pesanan kedaluwarsa boleh diubah. |
| T6 | R9 | Pilih kursi atau konfirmasi setelah batas tutup | Ditolak. Waktu tahan tidak melewati batas tutup. |
| T7 | R10 | Jadwal tumpang tindih, mulai 14 menit setelah show lain selesai, mulai tepat 15 menit setelah, dan jam lampau | Tumpang tindih dan 14 menit ditolak. 15 menit diterima. Jam lampau ditolak. |
| T8 | R10 | Ubah durasi film yang sudah punya jadwal | Ditolak. |
| T9 | R14 | Pilih kursi lagi saat masih punya penahanan | Penahanan lama dilepas, hanya satu penahanan aktif. |
| T10 | R8 | Penonton membuka CMS atau menulis film dan jadwal langsung | Ditolak di antarmuka dan di database. |
| T11 | RLS | Penonton A membaca pesanan penonton B, atau menulis langsung ke `bookings` | Tidak ada data, dan penulisan ditolak. |
| T12 | R13 | Konfirmasi pesanan | Kode acak, QR tampil bersama jadwal dan kursi. |
| T13 | Design system | Cek di `390px` dan `1280px` | Lulus Checklist QA Desain (design system bagian 7). |

## 5. Kriteria selesai v1

1. Penonton bisa daftar, login, memilih kursi, dan mendapat kode booking dari awal sampai akhir tanpa error.
2. Uji dua pengguna berebut kursi yang sama: hanya satu berhasil.
3. Admin bisa menambah film dan jadwal yang langsung muncul di sisi penonton.
4. Tampilan nyaman dipakai di HP.

## 6. Jika waktu mepet

Dari brief:

- `pg_cron` (pembersih penahanan basi) boleh ditunda. Aplikasi tetap benar karena waktu tahan dicek di fungsi.
- CMS dan pengecekan bentrok jadwal dibuat dalam versi paling sederhana dulu.

Jangan memangkas aturan R1 sampai R14 atau pengujian T1.

## 7. Hal yang perlu dikonfirmasi

Ditemukan saat mencocokkan brief dengan design system. Sampai dikonfirmasi, pakai perilaku sementara di kolom kanan.

| # | Temuan | Perilaku sementara |
|---|---|---|
| 1 | **Nilai harga tiket tetap** (R5) belum ditetapkan. | Jangan mengarang angka. Pakai placeholder dan minta nilainya sebelum Tahap 3. |
| 2 | **Layar 7 design system** memuat kartu metrik dan tabel daftar booking. Brief menyatakan "melihat daftar pesanan per jadwal oleh admin" di luar cakupan, dan admin tidak punya akses baca ke `bookings`. | Ikuti brief. Layar 7 hanya jadi pintu masuk ke pengelolaan film dan jadwal. |
| 3 | **Design system tidak punya layar khusus ubah** film atau jadwal, padahal F6 mewajibkan ubah. | Pakai ulang layar 8. |
| 4 | **Akses katalog tanpa login.** Alur brief dimulai dari login, sedangkan design system menyebut Katalog sebagai halaman utama. | Ikuti brief: login dulu. |

Sudah selaras dan tidak perlu keputusan lagi:

- Poster berupa URL (design system layar 8 meminta "URL poster").
- Jadwal ditampilkan dalam WIB (design system layar 2).
- Durasi film dikunci jika film sudah punya jadwal (asumsi yang sudah diterima).
- Kursi yang ditahan orang lain tampil seperti kursi terisi di SeatMap (design system bagian 4). Data tetap membedakan ditahan dan terisi.
