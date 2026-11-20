# Cinemovie v1 — Alur Sistem

Versi 1.0 · 20 November 2026

Dokumen ini memuat diagram alur dan peta layar. Isinya berasal dari `cinemovie-mvp-v1-brief.md` dan `design_system_cinemovie.md`. Tidak ada alur baru.

## 1. Gambaran umum

```mermaid
flowchart TD
    P([Penonton]) --> W["Aplikasi web Cinemovie"]
    A([Admin]) --> C["CMS admin"]
    C --> W
    W --> AU["Supabase Auth (login)"]
    W --> DB[("Database")]
    W --> F["Fungsi pesan kursi (tahan, konfirmasi)"]
    F --> DB
    DB --> R["Aturan data (kursi unik, jadwal tidak bentrok)"]
    L([Loket]) -. "baca kode manual" .-> P
```

Loket bukan akun di aplikasi. Petugas loket hanya membaca kode booking yang ditunjukkan penonton (R13).

## 2. Alur penonton

```mermaid
flowchart TD
    A([Mulai]) --> B{Sudah punya akun?}
    B -- Belum --> C[Daftar dengan email dan password]
    C --> D[Login]
    B -- Sudah --> D
    D --> E{Login berhasil?}
    E -- Tidak --> D
    E -- Ya --> F[Lihat daftar film dan harga]
    F --> G[Pilih film dan jadwal]
    G --> H{Pemesanan masih dibuka?}
    H -- Tidak --> F
    H -- Ya --> I["Lihat denah kursi (8x10)"]
    I --> J["Pilih kursi (maks 4)"]
    J --> K{Semua kursi masih kosong?}
    K -- Tidak --> I
    K -- Ya --> L["Kursi ditahan (5 menit)"]
    L --> M{Konfirmasi sebelum waktu habis?}
    M -- Tidak --> N[Pesanan kedaluwarsa]
    N --> O[Kursi kembali kosong]
    O --> F
    M -- Ya --> P[Pesanan dikonfirmasi]
    P --> Q[Kode booking QR tampil]
    Q --> R[Lihat riwayat pesanan]
    R --> S[Tunjukkan kode di loket]
    S --> T[Loket baca kode manual]
    T --> U([Selesai])
```

## 3. Alur admin

```mermaid
flowchart TD
    A([Mulai]) --> B[Login CMS dengan email dan password]
    B --> C{Login berhasil?}
    C -- Tidak --> B
    C -- Ya --> D{Pilih menu}
    D -- Film --> E{Tambah atau ubah?}
    E -- Tambah --> F["Isi data film (judul, durasi, sinopsis, poster)"]
    E -- Ubah --> F2{"Durasi diubah dan film sudah punya jadwal?"}
    F2 -- Ya --> F3[Perubahan durasi ditolak]
    F3 --> D
    F2 -- Tidak --> F
    F --> G[Simpan film]
    G --> D
    D -- Jadwal --> H{Tambah atau ubah?}
    H -- Tambah --> I["Pilih film, studio, dan jam tayang"]
    H -- Ubah --> J{Jadwal sudah punya pesanan?}
    J -- Ya --> K[Perubahan ditolak]
    K --> D
    J -- Tidak --> I
    I --> L{"Jam di masa depan dan tidak bentrok (jeda 15 menit)?"}
    L -- Tidak --> M[Jadwal ditolak]
    M --> I
    L -- Ya --> N[Simpan jadwal]
    N --> O[Jadwal tampil di sisi penonton]
    O --> D
    D -- Keluar --> P([Selesai])
```

## 4. Alur tahan kursi (inti sistem)

```mermaid
flowchart TD
    A([Penonton pilih kursi]) --> B{Sudah login?}
    B -- Tidak --> X[Ditolak]
    B -- Ya --> C{"Jumlah kursi 1 sampai 4?"}
    C -- Tidak --> X
    C -- Ya --> D{"Belum lewat batas tutup (5 menit sebelum tayang)?"}
    D -- Tidak --> X
    D -- Ya --> E{Semua kursi milik studio jadwal ini?}
    E -- Tidak --> X
    E -- Ya --> F[Lepas penahanan aktif milik akun ini]
    F --> G[Lepas penahanan basi di jadwal ini]
    G --> H[Buat pesanan berstatus ditahan]
    H --> I["Isi kursi pesanan (semua atau tidak sama sekali)"]
    I --> J{Ada kursi yang bentrok?}
    J -- Ya --> K[Batalkan seluruh transaksi]
    K --> L[Tampilkan denah terbaru]
    J -- Tidak --> M["Kursi ditahan (waktu tahan maks 5 menit, tidak melewati batas tutup)"]
    M --> N([Lanjut konfirmasi])
    X --> Z([Selesai])
    L --> Z
```

## 5. Status pesanan

```mermaid
flowchart TD
    A([Pilih kursi]) --> B[Ditahan]
    B -- "konfirmasi sebelum waktu habis" --> C[Dikonfirmasi]
    B -- "waktu habis atau tahan ulang" --> D[Kedaluwarsa]
    C --> E([Kode booking QR aktif])
    D --> F([Kursi kembali kosong])
```

Status yang tampil ke pengguna dihitung dari waktu server. Pesanan `held` dengan `hold_expires_at` yang sudah lewat tampil sebagai **Kedaluwarsa**, walau barisnya belum diubah oleh pembersih.

## 6. Peta layar

Sembilan layar mengikuti `design_system_cinemovie.md` bagian 5.

```mermaid
flowchart TD
    L5["5 Login dan Daftar"] --> L1["1 Katalog Film"]
    L1 --> L2["2 Detail Film dan Jadwal"]
    L2 --> L3["3 Pilih Kursi"]
    L3 --> L4["4 Konfirmasi Booking"]
    L4 --> L6["6 Riwayat Booking Saya"]
    L1 --> L6
    L5 --> L7["7 Admin: Ringkasan (cakupan perlu konfirmasi)"]
    L7 --> L8["8 Admin: Form Film dan Jadwal"]
    L9["9 State Khusus: loading, kosong, error, 404"] -. "dipakai semua layar" .-> L1
```

Layar 5 mengarah ke layar 1 sesuai alur brief (login dulu). Catatan konfirmasi untuk layar 7 dan 8 ada di `plan.md` bagian 7.

## 7. Pemetaan layar ke fitur, aturan, dan data

| Layar | Fitur | Aturan | Data atau fungsi |
|---|---|---|---|
| 1 Katalog Film | F2 | R5 | Baca `movies`, `showtimes` |
| 2 Detail Film dan Jadwal | F2 | R9, R12 | Baca `showtimes` |
| 3 Pilih Kursi | F3, F4 | R1, R2, R3, R9, R14 | `seat_availability`, `hold_seats` |
| 4 Konfirmasi Booking | F4 | R3, R9, R13 | `confirm_booking` |
| 5 Login dan Daftar | F1 | R11 | Supabase Auth |
| 6 Riwayat Booking Saya | F5 | R7, R13 | Baca `bookings`, `booking_seats` milik sendiri |
| 7 Admin: Ringkasan | F6 | R8 | Pintu masuk ke layar 8 |
| 8 Admin: Form Film dan Jadwal | F6 | R4, R8, R9, R10, R12 | Tulis `movies`, `showtimes` (admin) |
| 9 State Khusus | Semua | n/a | Tidak ada |

## 8. Pemetaan komponen design system ke layar

| Komponen | Dipakai di layar |
|---|---|
| Navbar | Semua layar (varian penonton dan admin) |
| MovieCard | 1 |
| SeatMap | 3 |
| Card | 2 (kartu jadwal), 4, 6, 7 |
| Table | 7 (lihat catatan konfirmasi), jadwal admin di 8 |
| Input dan Button | 5, 8, dan semua form |
| Badge | 1, 2, 6 |
| Toast | Semua layar (notifikasi aksi) |
| StateMessage | 9 dan semua layar saat loading, kosong, atau error |
