# Cinemovie Design System

## 1. Prinsip
Cinemovie mengusung nuansa sinematik gelap (*theatrical dark mode*) yang menenangkan mata layaknya ruang auditorium sebelum film dimulai. Hierarki visual dibangun secara tegas melalui perbedaan nilai permukaan gelap dan warna aksen merah sinematik pada aksi utama serta kursi terpilih. Poster film rasio 2:3 dan status ketersediaan kursi menjadi pusat fokus tanpa elemen dekoratif yang mengganggu transaksi. Kepadatan layar divariasikan sesuai fungsi: lega pada katalog film, fokus pada pemilihan kursi, dan padat data pada panel admin. Seluruh layar menjaga kesinambungan alur pemesanan dengan tipografi, warna, dan umpan balik status yang seragam di mobile (`390px`) maupun desktop (`1280px`).

## 2. Token
Pemetaan token ke konfigurasi atau utilitas Tailwind dilakukan sesuai versi Tailwind yang terpasang di proyek.

```css
:root {
  /* Warna Utama & Permukaan */
  --color-primary: #F42A1A;
  --color-secondary: #222428;
  --color-accent: #E5E7EB;
  --color-text: #F9FAFB;
  --color-text-muted: #7C818A;
  --color-surface: #141619;
  --color-surface-elevated: #1E2126;
  --color-bg: #0B0C0E;
  --color-border: #2A2D34;
  --color-border-subtle: #1F2228;

  /* Warna Status */
  --color-success: #16A34A;
  --color-warning: #D97706;
  --color-error: #DC2626;
  --color-info: #2563EB;

  /* Tipografi */
  --font-display: 'Oswald', 'Barlow Condensed', system-ui, -apple-system, sans-serif;
  --font-sans: 'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  --text-h1: 2rem;      /* 32px */
  --text-h2: 1.5rem;    /* 24px */
  --text-h3: 1.125rem;  /* 18px */
  --text-body: 0.875rem;/* 14px */
  --text-body-lg: 1rem; /* 16px */

  /* Spacing (kelipatan 4px / 8px) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* Radius */
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 6px;
  --radius-xl: 8px;

  /* Bayangan / Elevasi */
  --shadow-none: none;
  --shadow-subtle: 0 1px 2px rgba(0, 0, 0, 0.4);
}
```

## 3. Komponen

- **Button**
  - Anatomi: Kontainer fleksibel dengan ikon opsional (`stroke-width: 1.5px`) dan label teks.
  - Varian: `primary` (latar `--color-primary`, teks `--color-text`), `secondary` (latar `--color-surface`, border `1px solid --color-border` atau `--color-primary`), `ghost` (transparan tanpa border, teks `--color-text-muted` ke `--color-text`).
  - State: `hover` (kecerahan naik `6%–10%`), `focus-visible` (ring `2px solid --color-text` offset `2px`), `disabled` (opasitas `0.45`, `cursor: not-allowed`), `loading` (teks proses + nonaktif).
  - WAJIB: Tinggi dan lebar minimal `44px × 44px`, transisi `120ms–180ms` menghormati `prefers-reduced-motion`.
  - DILARANG: Menggunakan ukuran font di bawah `14px` atau menghilangkan cincin fokus keyboard.

- **Input**
  - Anatomi: Label eksplisit di atas, kotak input, pesan validasi/error di bawah.
  - Varian: Text, email, password, number, datetime, select.
  - State: `default` (latar `--color-surface`, border `--color-border`), `focus-visible` (border `--color-text`), `error` (border `--color-error` + pesan spesifik), `disabled` (opasitas `0.5`).
  - WAJIB: Tinggi minimal `44px`, radius `--radius-md` (`4px`), disertai label jelas.
  - DILARANG: Mengandalkan placeholder tanpa label atau menampilkan error hanya lewat warna merah tanpa teks.

- **Card**
  - Anatomi: Permukaan kontainer dengan header, isi terstruktur, dan pemisah garis tipis `1px solid --color-border-subtle`.
  - Varian: Panel ringkasan, kartu jadwal, kartu riwayat pesanan, kartu metrik admin.
  - State: `default`, `hover` (hanya bila seluruh kartu interaktif).
  - WAJIB: Latar `--color-surface` (`#141619`), border `1px solid --color-border`, radius `--radius-lg` atau `--radius-xl`.
  - DILARANG: Menggunakan drop shadow berat untuk menggantikan batas permukaan.

- **MovieCard**
  - Anatomi: Poster rasio `2:3` di atas, judul film (`H3`), metadata durasi & badge harga seragam, serta tombol aksi di bawah.
  - Varian: Kartu katalog utama.
  - State: `default`, `hover` (peningkatan kecerahan border/permukaan halus).
  - WAJIB: Mempertahankan rasio poster `2:3` dan tombol primer `Lihat Jadwal` dengan area sentuh minimal `44px`.
  - DILARANG: Menumpuk teks panjang di atas gambar poster tanpa overlay gelap berstandar kontras.

- **Navbar**
  - Anatomi: Bar navigasi datar dengan identitas teks Cinemovie di kiri dan grup tautan/tombol aksi di kanan.
  - Varian: Navigasi penonton dan navigasi admin.
  - State: Tautan aktif ditandai warna `--color-text` atau indikator `--color-primary`.
  - WAJIB: Tetap datar, responsif di `390px` dan `1280px`, target klik minimal `44px × 44px`.
  - DILARANG: Membuat menu bertumpuk kompleks yang menyembunyikan akses utama.

- **Badge**
  - Anatomi: Kontainer ringkas sebaris berisi label status, studio, durasi, atau harga.
  - Varian: Netral (`--color-surface-elevated`), sukses (`--color-success`), peringatan (`--color-warning`), error (`--color-error`), info (`--color-info`).
  - State: Statis informatif.
  - WAJIB: Ukuran teks minimal `14px` agar memenuhi aturan keterbacaan dan kontras `4.5:1`.
  - DILARANG: Menggunakan teks di bawah `14px` atau emoji di dalam badge.

- **Table**
  - Anatomi: Header kolom, baris data dengan garis pemisah `1px solid --color-border-subtle`, dan pembungkus scroll horizontal untuk mobile.
  - Varian: Tabel daftar booking dan jadwal admin.
  - State: `default`, `hover` pada baris (`--color-surface-elevated`).
  - WAJIB: Menggunakan angka tabular (`font-variant-numeric: tabular-nums`) untuk jam, jumlah kursi, dan harga.
  - DILARANG: Memotong kolom penting di layar `390px` tanpa kemampuan scroll horizontal.

- **Toast**
  - Anatomi: Kotak notifikasi melayang di pojok layar berisi ikon garis tipis, pesan singkat, dan tombol tutup.
  - Varian: Sukses (`--color-success`), peringatan (`--color-warning`), error (`--color-error`), info (`--color-info`).
  - State: Muncul dengan transisi `200ms–300ms` (instan bila `prefers-reduced-motion: reduce`), hilang otomatis atau ditutup manual.
  - WAJIB: Menyertakan ikon status dan teks jelas yang dapat dibaca screen reader (`role="status"` / `aria-live`).
  - DILARANG: Mengandalkan warna latar saja tanpa ikon dan teks penjelasan.

- **SeatMap**
  - Anatomi: Indikator `LAYAR BIOSKOP`, legenda status, matriks kursi 8 baris (`A`–`H`) × 10 kolom (`1`–`10`), dan panel ringkasan pilihan.
  - Varian: Denah studio interaktif (seragam untuk Studio 1–5).
  - State: `kosong`, `dipilih`, `terisi`, `focus-visible`.
  - WAJIB: Mematuhi batas maksimal 4 kursi per transaksi, menampilkan timer tahan 5 menit, serta pembedaan visual non-warna.
  - DILARANG: Membedakan status kursi hanya berdasarkan warna.

- **StateMessage**
  - Anatomi: Kartu terpusat berisi skeleton atau ikon garis status, judul keadaan, deskripsi singkat, dan tombol pemulihan.
  - Varian: `loading`, `empty` (kosong), `error`, `not-found` (404).
  - State: Statis atau berdenyut halus saat `loading` (nonaktif pada `prefers-reduced-motion`).
  - WAJIB: Menyediakan tombol aksi pemulihan yang jelas (`Coba Lagi` atau `Kembali ke Katalog`).
  - DILARANG: Menampilkan layar kosong tanpa penjelasan maupun jalur kembali.

## 4. SeatMap
- **Rupa Kursi (Pembedaan Non-Warna Wajib)**:
  - **Tersedia (Kosong)**: Latar `--color-secondary` (`#222428`), border solid `1px solid #4B5563`, menampilkan kode kursi (`A1`–`H10`) dengan teks `--color-text`.
  - **Dipilih**: Latar `--color-primary` (`#F42A1A`), border tebal `2px solid --color-text` (`#F9FAFB`), menampilkan ikon centang `✓` di samping atau di atas kode kursi.
  - **Terisi / Ditahan Orang Lain**: Latar `--color-bg` (`#0B0C0E`), border putus-putus `1px dashed --color-text-muted`, menampilkan ikon silang `×` menggantikan nomor kursi dan `cursor: not-allowed`.
- **Ukuran Area Sentuh**: Setiap tombol kursi wajib berukuran minimal `44px × 44px` dengan jarak antar-kursi minimal `4px–8px`; pada layar mobile `390px`, matriks 8×10 dibungkus kontainer scroll horizontal agar ukuran sentuh `44px` tidak mengecil.
- **Label Aksesibilitas**: Setiap kursi adalah elemen `<button type="button">` dengan `aria-label="Baris [A-H] Kursi [1-10], [Tersedia|Dipilih|Terisi]"`, `aria-pressed="true|false"` untuk status pilihan, dan `disabled` / `aria-disabled="true"` pada kursi terisi.

## 5. Layout 9 Layar
1. **Katalog Film (halaman utama)**: Layout lega dengan navbar datar di atas, info harga tiket seragam, dan grid poster film `2:3` (1 kolom di `390px`, 4 kolom di `1280px` dengan gutter `24px`) berisi judul, durasi, harga, dan tombol `Lihat Jadwal`.
2. **Detail Film dan Jadwal**: Layout split 2 kolom di `1280px` (4 kolom kiri untuk poster `2:3`, durasi, sinopsis; 8 kolom kanan untuk daftar jadwal per Studio 1–5 dalam WIB) dan tumpukan vertikal di `390px`, dilengkapi tombol `Pilih Kursi` atau state `Pemesanan Ditutup` bila `<= 5 menit` sebelum tayang.
3. **Pilih Kursi**: Layout fokus dan sederhana dengan batang `LAYAR BIOSKOP`, legenda status, serta denah 8×10 di area utama (8 kolom di desktop) dan panel ringkasan berisi daftar kursi terpilih (maksimal 4), hitung mundur tahan 5 menit, total harga, serta tombol `Lanjut Konfirmasi` (4 kolom kanan di desktop, bawah di mobile).
4. **Konfirmasi Booking**: Kartu ringkasan terpusat 1 kolom (maksimal `768px` di desktop) menampilkan detail film, studio, jadwal WIB, kursi, sisa waktu tahan, total harga, tombol `Konfirmasi Pesanan` / `Ubah Kursi`, lalu blok kode booking acak dan QR setelah terkonfirmasi.
5. **Login dan Daftar**: Panel autentikasi tunggal terpusat (`440px` di desktop, penuh di mobile) dengan switcher tab `Masuk` dan `Daftar`, input email dan password minimal `44px`, tombol submit primer, serta pesan error inline.
6. **Riwayat Booking Saya**: Daftar kartu riwayat pesanan (1 kolom di `390px`, 2 kolom di `1280px`) yang menampilkan badge status (`Ditahan`, `Dikonfirmasi`, `Kedaluwarsa`), detail film, jadwal WIB, kursi, total harga, dan blok kode booking QR untuk tiket terkonfirmasi.
7. **Admin: Ringkasan dan Daftar Booking**: Layout padat data dengan baris 4 kartu metrik ringkasan di atas dan tabel daftar booking berangka tabular di bawah (scroll horizontal di `390px`), dilengkapi tombol navigasi ke pengelolaan film dan jadwal.
8. **Admin: Form Tambah Film**: Layout form 2 kolom di `1280px` (6 kolom kiri untuk input judul, durasi, sinopsis, URL poster; 6 kolom kanan untuk form tambah jadwal per studio & jam WIB beserta daftar jadwal aktif) dan 1 kolom di `390px`, lengkap dengan validasi durasi terkunci dan jeda 15 menit.
9. **State Khusus (loading, kosong, error, halaman tidak ditemukan)**: Kartu status terpusat (`640px` di desktop) dengan latar `--color-surface` yang menangani tampilan skeleton `loading`, pesan data `kosong`, pesan gangguan `error` beserta tombol `Coba Lagi`, dan pesan `404` dengan tombol `Kembali ke Katalog`.

## 6. Daftar DILARANG
- Warna di luar token CSS `:root` yang telah didefinisikan pada bagian 2.
- Gradien mencolok, efek kaca (*glassmorphism*), atau efek visual dekoratif yang tidak ada di DNA desain.
- Emoji sebagai ikon antarmuka, status kursi, atau penanda tombol (wajib ikon garis `stroke-width: 1.5px`–`1.75px`).
- Ukuran font di bawah `14px` (`0.875rem`) pada komponen UI, label, badge, maupun tabel.
- Rasio kontras teks dan komponen interaktif di bawah standar WCAG AA (`4.5:1` untuk teks normal dan `3:1` untuk teks besar/indikator UI).
- Bayangan (*drop shadow*) tebal atau berlapis yang mengaburkan pemisahan permukaan gelap.
- Elemen dekoratif tanpa fungsi yang mengganggu fokus transaksi pemesanan kursi.

## 7. Checklist QA Desain
1. Latar utama menggunakan `#0B0C0E` dan seluruh permukaan kartu/panel menggunakan `#141619` dengan border tipis `#2A2D34`.
2. Tidak ada teks di seluruh aplikasi (termasuk badge, caption, dan tabel) yang berukuran kurang dari `14px`.
3. Semua teks dan indikator status terbaca jelas dengan rasio kontras minimal `4.5:1` terhadap latar belakangnya.
4. Seluruh tombol, input, tautan navigasi, dan kotak kursi memiliki area sentuh minimal `44px × 44px` di layar `390px` maupun `1280px`.
5. Pada `SeatMap`, kursi `Tersedia`, `Dipilih`, dan `Terisi` tetap dapat dibedakan secara instan meski tampilan diubah menjadi hitam-putih (*grayscale*).
6. Denah kursi menampilkan lengkap baris `A`–`H` dan nomor `1`–`10` dengan batang `LAYAR BIOSKOP` di atasnya tanpa terpotong di mobile `390px`.
7. Pemilihan kursi berhenti pada batas maksimal 4 kursi dan ringkasan harga terhitung otomatis sesuai jumlah kursi terpilih.
8. Poster film di katalog dan detail film tampil utuh dalam rasio `2:3` tanpa distorsi atau pemotongan berlebihan.
9. Cincin fokus (`focus-visible`) terlihat tegas saat berpindah antar-elemen menggunakan tombol `Tab` pada keyboard.
10. Keempat kondisi `StateMessage` (loading, kosong, error, halaman tidak ditemukan) tampil selaras di atas latar gelap dan memiliki tombol aksi pemulihan yang berfungsi.