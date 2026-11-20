-- =====================================================================
-- Cinemovie v1 — Fungsi RPC Pemesanan Kursi (Tahap 4)
-- Sumber: database.md bagian 7
--
-- Menjalankan fungsi dengan security definer, verifikasi auth.uid(),
-- dan validasi aturan R1, R2, R3, R9, R14.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. seat_availability(showtime_id)
-- Mengembalikan status 80 kursi: kosong, terisi, atau ditahan
-- Tidak membocorkan identitas pemesan (Guardrails 4.2)
-- ---------------------------------------------------------------------
create or replace function public.seat_availability(p_showtime_id bigint)
returns table (
  seat_id int,
  row_label char(1),
  seat_number smallint,
  status text, -- 'kosong', 'terisi', 'ditahan'
  is_held_by_me boolean
)
language plpgsql security definer set search_path = '' as $$
declare
  v_studio_id smallint;
  v_user_id uuid;
begin
  v_user_id := auth.uid();

  -- Ambil studio_id dari showtime
  select studio_id into v_studio_id
  from public.showtimes
  where id = p_showtime_id;

  if v_studio_id is null then
    raise exception 'Jadwal tayang tidak ditemukan';
  end if;

  return query
  select
    s.id as seat_id,
    s.row_label,
    s.seat_number,
    case
      -- Kursi sudah dikonfirmasi (terisi)
      when exists (
        select 1 from public.booking_seats bs
        join public.bookings b on b.id = bs.booking_id
        where bs.showtime_id = p_showtime_id
          and bs.seat_id = s.id
          and bs.is_active = true
          and b.status = 'confirmed'
      ) then 'terisi'

      -- Kursi sedang ditahan dan belum kedaluwarsa
      when exists (
        select 1 from public.booking_seats bs
        join public.bookings b on b.id = bs.booking_id
        where bs.showtime_id = p_showtime_id
          and bs.seat_id = s.id
          and bs.is_active = true
          and b.status = 'held'
          and b.hold_expires_at > now()
      ) then 'ditahan'

      -- Kursi kosong
      else 'kosong'
    end as status,

    -- Apakah kursi sedang ditahan oleh user yang sedang login
    case
      when v_user_id is not null and exists (
        select 1 from public.booking_seats bs
        join public.bookings b on b.id = bs.booking_id
        where bs.showtime_id = p_showtime_id
          and bs.seat_id = s.id
          and bs.is_active = true
          and b.status = 'held'
          and b.hold_expires_at > now()
          and b.user_id = v_user_id
      ) then true
      else false
    end as is_held_by_me

  from public.seats s
  where s.studio_id = v_studio_id
  order by s.row_label asc, s.seat_number asc;
end $$;


-- ---------------------------------------------------------------------
-- 2. hold_seats(showtime_id, seat_ids[])
-- Menahan 1-4 kursi selama 5 menit untuk akun yang login
-- Semua-atau-tidak-sama-sekali (R1, R2, R3, R9, R14)
-- ---------------------------------------------------------------------
create or replace function public.hold_seats(
  p_showtime_id bigint,
  p_seat_ids int[]
)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid;
  v_studio_id smallint;
  v_starts_at timestamptz;
  v_hold_expires_at timestamptz;
  v_booking_id uuid;
  v_seat_count int;
  v_sid int;
begin
  -- 1) Tolak jika belum login
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Anda harus login terlebih dahulu untuk memilih kursi';
  end if;

  -- 2) Tolak jika jumlah kursi di luar 1 sampai 4 (R2)
  v_seat_count := cardinality(p_seat_ids);
  if v_seat_count is null or v_seat_count < 1 or v_seat_count > 4 then
    raise exception 'Jumlah kursi harus antara 1 sampai 4 kursi per transaksi';
  end if;

  -- 3) Ambil info jadwal dan tolak jika sudah lewat batas tutup (starts_at - 5 menit) (R9)
  select studio_id, starts_at into v_studio_id, v_starts_at
  from public.showtimes
  where id = p_showtime_id;

  if v_studio_id is null then
    raise exception 'Jadwal tayang tidak ditemukan';
  end if;

  if now() >= (v_starts_at - interval '5 minutes') then
    raise exception 'Pemesanan untuk jadwal ini telah ditutup (5 menit sebelum jam tayang)';
  end if;

  -- 4) Pastikan semua kursi milik studio jadwal ini
  foreach v_sid in array p_seat_ids loop
    if not exists (select 1 from public.seats where id = v_sid and studio_id = v_studio_id) then
      raise exception 'Kursi yang dipilih tidak valid untuk studio jadwal ini';
    end if;
  end loop;

  -- 5) Lepas penahanan aktif milik akun ini (R14: 1 penahanan aktif per akun)
  update public.booking_seats
  set is_active = false
  where is_active = true
    and booking_id in (
      select id from public.bookings
      where user_id = v_user_id and status = 'held'
    );

  update public.bookings
  set status = 'expired'
  where user_id = v_user_id and status = 'held';

  -- 6) Lepas penahanan basi di jadwal ini (R3)
  update public.booking_seats
  set is_active = false
  where is_active = true
    and showtime_id = p_showtime_id
    and booking_id in (
      select id from public.bookings
      where showtime_id = p_showtime_id
        and status = 'held'
        and hold_expires_at <= now()
    );

  update public.bookings
  set status = 'expired'
  where showtime_id = p_showtime_id
    and status = 'held'
    and hold_expires_at <= now();

  -- 7) Hitung waktu tahan: maksimal 5 menit, dan tidak melewati batas tutup (starts_at - 5 menit)
  v_hold_expires_at := least(now() + interval '5 minutes', v_starts_at - interval '5 minutes');

  -- 8) Buat pesanan held
  insert into public.bookings (user_id, showtime_id, status, hold_expires_at)
  values (v_user_id, p_showtime_id, 'held', v_hold_expires_at)
  returning id into v_booking_id;

  -- 9) Masukkan kursi. Jika ada kursi bentrok, unique index booking_seats_taken_once
  -- melempar error dan seluruh transaksi otomatis rollback (R1: semua-atau-tidak-sama-sekali).
  begin
    insert into public.booking_seats (booking_id, showtime_id, seat_id, is_active)
    select v_booking_id, p_showtime_id, unnest(p_seat_ids), true;
  exception
    when unique_violation then
      raise exception 'Satu atau lebih kursi yang Anda pilih baru saja diambil pengguna lain. Silakan pilih kursi lain.';
  end;

  return jsonb_build_object(
    'booking_id', v_booking_id,
    'hold_expires_at', v_hold_expires_at,
    'seat_count', v_seat_count
  );
end $$;


-- ---------------------------------------------------------------------
-- 3. confirm_booking(booking_id)
-- Konfirmasi pesanan held menjadi confirmed & buat kode booking acak QR
-- (R3, R7, R9, R13)
-- ---------------------------------------------------------------------
create or replace function public.confirm_booking(p_booking_id uuid)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid;
  v_showtime_id bigint;
  v_starts_at timestamptz;
  v_hold_expires_at timestamptz;
  v_status public.booking_status;
  v_booking_code text;
  v_confirmed_at timestamptz;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Anda harus login terlebih dahulu';
  end if;

  -- Ambil data pesanan
  select b.status, b.hold_expires_at, b.showtime_id, s.starts_at
  into v_status, v_hold_expires_at, v_showtime_id, v_starts_at
  from public.bookings b
  join public.showtimes s on s.id = b.showtime_id
  where b.id = p_booking_id and b.user_id = v_user_id;

  if v_status is null then
    raise exception 'Pesanan tidak ditemukan atau bukan milik akun Anda';
  end if;

  if v_status <> 'held' then
    raise exception 'Pesanan ini tidak dalam status penahanan';
  end if;

  -- Cek masa tahan server (R3)
  if v_hold_expires_at <= now() then
    -- Tandai expired
    update public.bookings set status = 'expired' where id = p_booking_id;
    update public.booking_seats set is_active = false where booking_id = p_booking_id;
    raise exception 'Waktu penahanan 5 menit telah habis. Kursi Anda telah dilepas kembali.';
  end if;

  -- Cek batas tutup pemesanan (R9)
  if now() >= (v_starts_at - interval '5 minutes') then
    update public.bookings set status = 'expired' where id = p_booking_id;
    update public.booking_seats set is_active = false where booking_id = p_booking_id;
    raise exception 'Pemesanan telah ditutup (5 menit sebelum jam tayang)';
  end if;

  -- R13: Buat kode booking acak tidak bisa ditebak (e.g. CNM-8 karakter acak)
  v_booking_code := 'CNM-' || upper(substr(md5(random()::text || clock_timestamp()::text || p_booking_id::text), 1, 8));
  v_confirmed_at := now();

  -- Update pesanan menjadi confirmed
  update public.bookings
  set status = 'confirmed',
      confirmed_at = v_confirmed_at,
      booking_code = v_booking_code
  where id = p_booking_id;

  return jsonb_build_object(
    'booking_id', p_booking_id,
    'booking_code', v_booking_code,
    'confirmed_at', v_confirmed_at
  );
end $$;


-- ---------------------------------------------------------------------
-- 4. Hak Akses Eksekusi (RLS Guard)
-- Cabut dari public dan anon, hanya berikan ke authenticated
-- ---------------------------------------------------------------------
revoke execute on function public.seat_availability(bigint) from public, anon;
grant  execute on function public.seat_availability(bigint) to authenticated;

revoke execute on function public.hold_seats(bigint, int[]) from public, anon;
grant  execute on function public.hold_seats(bigint, int[]) to authenticated;

revoke execute on function public.confirm_booking(uuid) from public, anon;
grant  execute on function public.confirm_booking(uuid) to authenticated;
