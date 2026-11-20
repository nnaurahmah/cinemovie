# Instruksi untuk Code Assistant — Cinemovie v1

Versi 1.0 · 20 November 2026

File ini memandu code assistant (GitHub Copilot atau sejenisnya) saat bekerja di proyek Cinemovie. Letakkan sebagai `.github/copilot-instructions.md`, atau salin ke file instruksi alat yang dipakai.

## 1. Konteks proyek

Cinemovie adalah aplikasi web pemesanan kursi bioskop. MVP v1 dikerjakan dalam sekitar 4 jam, jadi cakupannya kecil dan **tidak boleh melebar**.

- Dua peran akun: **penonton** dan **admin bioskop**. Loket bukan akun.
- Penonton: login, lihat film dan jadwal, pilih kursi (maks 4 per transaksi), kursi ditahan 5 menit, konfirmasi, dapat kode booking QR, lihat riwayat.
- Admin: CMS untuk menambah dan mengubah film dan jadwal.
- 5 studio, denah sama 8 baris (A–H) × 10 kolom (1–10).
- Tidak ada pembayaran online. Semua tiket berharga sama.

## 2. Sumber kebenaran

Baca dokumen ini sebelum mengerjakan tugas. Urutan prioritas jika ada perbedaan:

1. `cinemovie-mvp-v1-brief.md`: cakupan, F1–F6, R1–R14, struktur data.
2. `design_system_cinemovie.md`: tampilan, komponen, 9 layar.
3. `database.md`: skema, trigger, fungsi, RLS.
4. `flow.md`: diagram alur dan peta layar.
5. `guardrails.md`: batasan dan keamanan.
6. `plan.md`: urutan pengerjaan, pengujian, hal yang perlu dikonfirmasi.
7. `brd.md`: kebutuhan bisnis.

Jangan mengarang kebutuhan. Jika sesuatu tidak ada di dokumen, tanyakan.

## 3. Teknologi yang sudah pasti

- **Supabase Auth** untuk login (email dan password). **Jangan membuat tabel `users` atau `profiles`.**
- **Postgres (Supabase)** dengan skema di `database.md`.
- Design system memakai token CSS di `:root`. Pemetaan ke Tailwind mengikuti versi yang terpasang di proyek.

Framework frontend dan bahasa pemrograman belum ditetapkan di dokumen. Ikuti yang sudah ada di repositori. Jika belum ada, tanyakan dulu, jangan memilih sendiri.

## 4. Aturan kerja

### Wajib

- Kerjakan sesuai tahap di `plan.md`, berurutan.
- Rujuk kode fitur (F1–F6) dan aturan (R1–R14) di komentar, nama tes, dan pesan commit bila relevan.
- Jaga aturan penting **di database** (constraint, trigger, fungsi), bukan hanya di antarmuka.
- Panggil fungsi `hold_seats`, `confirm_booking`, dan `seat_availability` untuk pemesanan. Penonton tidak menulis langsung ke `bookings` atau `booking_seats`.
- Hitung status pesanan dari waktu server. Pesanan `held` yang `hold_expires_at`-nya lewat tampil sebagai Kedaluwarsa.
- Cek peran admin di setiap halaman dan aksi CMS, bukan hanya menyembunyikan menu.
- Tulis teks antarmuka dalam bahasa Indonesia yang singkat dan jelas, dengan jam dalam WIB.
- Tambahkan tes untuk aturan yang disentuh. Pengujian wajib ada di `plan.md` bagian 4.
- Jika permintaan tidak jelas atau bertentangan dengan dokumen, ajukan **satu** pertanyaan dengan 2–3 pilihan jawaban.

### Dilarang

- Menambah fitur, layar, status, kolom, atau tabel yang tidak ada di brief.
- Membangun apa pun dari daftar "di luar cakupan" (`guardrails.md` bagian 2).
- Menambah input harga di CMS, endpoint atau tombol hapus jadwal, atau status pesanan baru.
- Menaruh kunci `service_role` atau rahasia lain di kode klien atau repositori.
- Mempercayai `user_id`, peran, atau waktu dari klien.
- Mengisi harga tiket tetap dengan angka karangan. Nilainya belum ditetapkan.
- Memutuskan sendiri konflik brief dan design system. Ikuti `plan.md` bagian 7 dan tanyakan.

## 5. Aturan bisnis yang harus selalu benar

| Kode | Ringkasan |
|---|---|
| R1 | Satu kursi per jadwal untuk satu pesanan aktif. Beberapa kursi: semua-atau-tidak-sama-sekali |
| R2 | Maks 4 kursi per transaksi. Satu akun boleh banyak transaksi di satu jadwal |
| R3 | Tahan 5 menit, hanya untuk jadwal yang dipilih, dicek di server |
| R4 | Jadwal berpesanan (ditahan atau dikonfirmasi) tidak boleh diubah. Tidak ada hapus jadwal |
| R5 | Semua tiket berharga sama |
| R6 | 5 studio dan denah 8×10 ditetapkan developer |
| R7 | Status hanya `held`, `confirmed`, `expired` |
| R8 | Hanya admin kelola film dan jadwal, dicek di setiap halaman dan aksi |
| R9 | Pemesanan tutup 5 menit sebelum tayang. Satu zona waktu (WIB) |
| R10 | Jadwal tidak bentrok, jeda 15 menit di studio yang sama, jam di masa depan, durasi film terkunci jika sudah berjadwal |
| R11 | Akun admin pertama dari developer |
| R12 | Satu film boleh banyak jadwal sehari selama tidak bentrok |
| R13 | Loket memeriksa manual. Kode booking acak. Layar tiket tampilkan jadwal dan kursi di samping QR |
| R14 | Satu penahanan aktif per akun. Memilih lagi melepas yang lama |

## 6. Konvensi database

- Nama tabel, kolom, dan fungsi mengikuti `database.md` persis.
- Semua waktu `timestamptz`.
- Fungsi RPC: `security definer`, `search_path` eksplisit, identitas dari `auth.uid()`, `execute` dicabut dari `public` dan `anon`.
- Trigger yang membaca tabel yang tidak bisa dibaca perannya (misalnya trigger jadwal membaca `bookings`) harus `security definer`.
- RLS aktif di semua tabel. Tabel baru tanpa policy dianggap belum selesai.
- Peran admin hanya dari `app_metadata.role`. Jangan pakai `user_metadata`.

## 7. Konvensi antarmuka

Ikuti `design_system_cinemovie.md`. Ringkasan yang paling sering terlewat:

- Hanya warna dari token `:root`. Tidak ada gradien mencolok, efek kaca, atau bayangan tebal.
- Tidak ada emoji sebagai ikon atau status. Pakai ikon garis (`stroke-width` 1.5px–1.75px).
- Teks minimal 14px. Area sentuh minimal 44px × 44px.
- Kontras minimal WCAG AA. Cincin fokus keyboard selalu terlihat.
- **SeatMap:** kursi adalah `<button type="button">` dengan `aria-label` (misalnya "Baris A Kursi 1, Tersedia"). Status dibedakan **tidak hanya dengan warna**: kosong (border solid dan kode kursi), dipilih (ikon centang dan border tebal), terisi atau ditahan orang lain (ikon silang dan border putus-putus, `disabled`).
- Hitung mundur 5 menit di layar hanya tampilan. Server tetap penentu.
- Setiap layar punya state loading, kosong, error, dan 404 dengan tombol pemulihan.
- Uji di lebar `390px` dan `1280px`.

## 8. Keamanan

Panduan lengkap ada di `guardrails.md`. Yang paling sering terlewat:

- Validasi di server, bukan hanya di formulir.
- `poster_url` hanya `http` atau `https`. Teks admin di-escape.
- Pesan error singkat, tanpa detail internal. Jangan mencatat rahasia di log.
- `seat_availability` tidak boleh membocorkan identitas pemesan.

## 9. Cara berkomunikasi

- Gunakan bahasa Indonesia dan jawab ringkas.
- Sebelum menulis kode, sebut kode fitur dan aturan yang disentuh (misalnya "F4, R1, R3").
- Jika diminta fitur di luar cakupan: ingatkan bahwa itu di luar v1, lalu tanyakan apakah masuk daftar "tidak dibuat di v1". Jangan langsung mengerjakannya.
- Jika menemukan celah atau pertentangan di dokumen, sebutkan dan usulkan perbaikan. Jangan diam-diam mengubah aturan.

### Contoh perilaku benar

> **Permintaan:** "Tambahkan tombol batalkan pesanan untuk penonton."
> **Respons:** Pembatalan pesanan oleh penonton ada di daftar "di luar cakupan v1". Mau dimasukkan ke daftar "tidak dibuat di v1", atau diubah menjadi perubahan cakupan?

> **Permintaan:** "Buat query daftar semua pesanan untuk halaman admin."
> **Respons:** Admin melihat daftar pesanan di luar cakupan, dan admin tidak punya akses baca ke `bookings` (`database.md` bagian 8). Layar 7 design system bertentangan dengan brief (`plan.md` bagian 7, butir 2). Mana yang dipakai?

## 10. Hal yang belum diputuskan

Jangan memutuskan sendiri. Lihat `plan.md` bagian 7:

1. Nilai harga tiket tetap (R5).
2. Cakupan layar 7 admin (metrik dan daftar booking vs brief).
3. Layar ubah film dan jadwal (design system hanya punya form tambah).
4. Katalog tanpa login (brief mulai dari login).
