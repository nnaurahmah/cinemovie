-- =====================================================================
-- Cinemovie v1 — Skema database (Postgres / Supabase)
-- Sumber: database.md dan cinemovie-mvp-v1-brief.md
--
-- Jalankan SEKALI pada proyek Supabase yang masih kosong
-- (SQL Editor). Urutan: ekstensi -> tabel -> trigger -> seed -> RLS.
--
-- TIDAK termasuk: fungsi RPC hold_seats, confirm_booking,
-- seat_availability, expire_stale_holds (spesifikasinya ada di
-- database.md bagian 7). Tanpa fungsi itu, penonton belum bisa memesan.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Ekstensi dan tipe
-- ---------------------------------------------------------------------

create extension if not exists btree_gist;

create type booking_status as enum ('held', 'confirmed', 'expired');


-- ---------------------------------------------------------------------
-- 2. Tabel
-- (Tidak ada tabel users/profiles: pengguna memakai Supabase Auth.)
-- ---------------------------------------------------------------------

create table studios (
  id   smallint primary key generated always as identity,
  name text not null unique
);

create table seats (
  id          int primary key generated always as identity,
  studio_id   smallint not null references studios(id),
  row_label   char(1)  not null check (row_label between 'A' and 'H'),
  seat_number smallint not null check (seat_number between 1 and 10),
  unique (studio_id, row_label, seat_number)
);

create table movies (
  id               bigint primary key generated always as identity,
  title            text not null,
  duration_minutes smallint not null check (duration_minutes > 0),
  synopsis         text not null,
  poster_url       text not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table showtimes (
  id            bigint primary key generated always as identity,
  movie_id      bigint   not null references movies(id),
  studio_id     smallint not null references studios(id),
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,   -- diisi trigger: starts_at + durasi film
  blocked_until timestamptz not null,   -- diisi trigger: ends_at + 15 menit
  price         numeric(10,2) not null check (price >= 0),
  created_at    timestamptz not null default now(),
  -- R10: tidak boleh tumpang tindih, termasuk jeda 15 menit
  constraint showtimes_no_overlap exclude using gist (
    studio_id with =,
    tstzrange(starts_at, blocked_until) with &&
  )
);
create index showtimes_starts_at_idx on showtimes (starts_at);

-- Harga tiket tetap (R5): nilainya BELUM ditetapkan.
-- Setelah ditetapkan, hapus tanda komentar dan isi angkanya:
-- alter table showtimes alter column price set default <HARGA_TETAP>;

create table bookings (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id),
  showtime_id     bigint not null references showtimes(id),
  status          booking_status not null default 'held',
  hold_expires_at timestamptz not null,
  confirmed_at    timestamptz,
  booking_code    text unique,
  created_at      timestamptz not null default now(),
  -- kode dan waktu konfirmasi hanya ada untuk pesanan dikonfirmasi
  check ((status = 'confirmed') = (booking_code is not null and confirmed_at is not null))
);
-- R14: satu penahanan aktif per akun
create unique index bookings_one_hold_per_user
  on bookings (user_id) where status = 'held';
create index bookings_user_idx     on bookings (user_id, created_at desc);
create index bookings_showtime_idx on bookings (showtime_id);

create table booking_seats (
  booking_id  uuid not null references bookings(id) on delete cascade,
  showtime_id bigint not null references showtimes(id),
  seat_id     int  not null references seats(id),
  is_active   boolean not null default true,
  primary key (booking_id, seat_id)
);
-- R1: satu kursi di satu jadwal hanya untuk satu pesanan aktif
create unique index booking_seats_taken_once
  on booking_seats (showtime_id, seat_id) where is_active;


-- ---------------------------------------------------------------------
-- 3. Trigger
-- ---------------------------------------------------------------------

-- Jadwal: isi ends_at dan blocked_until, tolak jam lampau (R9, R10),
-- kunci jadwal berpesanan (R4).
-- security definer: admin tidak punya akses baca ke bookings (RLS), tetapi
-- trigger tetap harus bisa melihat pesanan agar R4 berlaku. Tanpa ini,
-- pengecekan selalu lolos.
create function showtimes_before_write() returns trigger
language plpgsql security definer set search_path = '' as $$
declare d smallint;
begin
  if tg_op = 'UPDATE' and exists (
    select 1 from public.bookings b
    where b.showtime_id = old.id
      and (b.status = 'confirmed'
           or (b.status = 'held' and b.hold_expires_at > now()))
  ) then
    raise exception 'Jadwal sudah punya pesanan dan tidak boleh diubah';
  end if;

  if (tg_op = 'INSERT' or new.starts_at is distinct from old.starts_at)
     and new.starts_at <= now() then
    raise exception 'Jam tayang harus di masa depan';
  end if;

  select duration_minutes into d from public.movies where id = new.movie_id;
  new.ends_at       := new.starts_at + make_interval(mins => d);
  new.blocked_until := new.ends_at + interval '15 minutes';
  return new;
end $$;

create trigger showtimes_before_write
before insert or update on showtimes
for each row execute function showtimes_before_write();

-- Film: durasi tidak boleh diubah jika sudah punya jadwal (R10)
create function movies_lock_duration() returns trigger language plpgsql as $$
begin
  if new.duration_minutes <> old.duration_minutes
     and exists (select 1 from showtimes where movie_id = old.id) then
    raise exception 'Durasi tidak bisa diubah karena film sudah punya jadwal';
  end if;
  new.updated_at := now();
  return new;
end $$;

create trigger movies_lock_duration
before update on movies
for each row execute function movies_lock_duration();


-- ---------------------------------------------------------------------
-- 4. Data awal (seed): 5 studio dan 400 kursi (R6)
-- ---------------------------------------------------------------------

insert into studios (name)
select 'Studio ' || g from generate_series(1, 5) g;

insert into seats (studio_id, row_label, seat_number)
select s.id, chr(64 + r), n
from studios s, generate_series(1, 8) r, generate_series(1, 10) n;
-- hasil: 5 x 80 = 400 kursi


-- ---------------------------------------------------------------------
-- 5. Keamanan baris (RLS)
-- Peran admin dibaca dari app_metadata.role (R8, R11). Jangan memakai
-- user_metadata: pengguna bisa mengubahnya sendiri.
-- ---------------------------------------------------------------------

alter table studios       enable row level security;
alter table seats         enable row level security;
alter table movies        enable row level security;
alter table showtimes     enable row level security;
alter table bookings      enable row level security;
alter table booking_seats enable row level security;

-- Data katalog: semua pengguna yang login boleh membaca
create policy studios_read on studios
  for select to authenticated using (true);

create policy seats_read on seats
  for select to authenticated using (true);

create policy movies_read on movies
  for select to authenticated using (true);

create policy showtimes_read on showtimes
  for select to authenticated using (true);

-- Film: admin menambah dan mengubah (tanpa policy delete)
create policy movies_admin_insert on movies
  for insert to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy movies_admin_update on movies
  for update to authenticated
  using      ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Jadwal: admin menambah dan mengubah (tanpa policy delete, R4)
create policy showtimes_admin_insert on showtimes
  for insert to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy showtimes_admin_update on showtimes
  for update to authenticated
  using      ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Pesanan: penonton hanya membaca miliknya sendiri. Admin tidak punya akses.
create policy bookings_read_own on bookings
  for select to authenticated
  using (user_id = auth.uid());

create policy booking_seats_read_own on booking_seats
  for select to authenticated
  using (booking_id in (select id from bookings where user_id = auth.uid()));

-- Penonton tidak menulis langsung ke pesanan: hanya lewat fungsi RPC
-- (security definer). Pencabutan hak di bawah menjadi lapis pengaman kedua.
revoke insert, update, delete on bookings      from anon, authenticated;
revoke insert, update, delete on booking_seats from anon, authenticated;


-- ---------------------------------------------------------------------
-- 6. Akun admin pertama (R11) — dilakukan developer, bukan lewat aplikasi
-- Buat akun lewat Supabase Auth, lalu jalankan (ganti emailnya):
--
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
--                         || '{"role": "admin"}'::jsonb
-- where email = 'admin@contoh.com';
-- ---------------------------------------------------------------------
