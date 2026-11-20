import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/ui/navbar";
import { StateMessage } from "@/components/ui/state-message";
import { ConfirmClient } from "./confirm-client";

export const dynamic = "force-dynamic";

interface ConfirmPageProps {
  params: Promise<{ showtime_id: string }>;
  searchParams: Promise<{ booking_id?: string }>;
}

export default async function BookingConfirmPage({
  params,
  searchParams,
}: ConfirmPageProps) {
  const { showtime_id } = await params;
  const { booking_id } = await searchParams;

  const showtimeId = parseInt(showtime_id, 10);
  if (isNaN(showtimeId) || !booking_id) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/booking/${showtimeId}/confirm?booking_id=${booking_id}`);
  }

  const isAdmin = user.app_metadata?.role === "admin";

  // Ambil data pesanan milik pengguna
  const { data: booking, error: bError } = await supabase
    .from("bookings")
    .select(`
      id,
      status,
      hold_expires_at,
      booking_code,
      confirmed_at,
      showtime_id,
      showtimes (
        id,
        starts_at,
        ends_at,
        price,
        movies (title, poster_url),
        studios (name)
      ),
      booking_seats (
        seat_id,
        seats (row_label, seat_number)
      )
    `)
    .eq("id", booking_id)
    .eq("user_id", user.id)
    .single();

  if (bError || !booking) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
        <Navbar isAdmin={isAdmin} userEmail={user.email} />
        <main className="flex-1 max-w-[800px] w-full mx-auto p-4 sm:p-6 flex items-center justify-center">
          <StateMessage
            type="not-found"
            title="Pesanan Tidak Ditemukan"
            description="Data pesanan tidak ditemukan atau bukan milik akun Anda."
            actionText="Pilih Kursi Kembali"
            actionHref={`/booking/${showtimeId}`}
          />
        </main>
      </div>
    );
  }

  const st = Array.isArray(booking.showtimes) ? booking.showtimes[0] : booking.showtimes;
  const mv = st && Array.isArray((st as any).movies) ? (st as any).movies[0] : (st as any)?.movies;
  const std = st && Array.isArray((st as any).studios) ? (st as any).studios[0] : (st as any)?.studios;

  const formattedSeats = (booking.booking_seats || []).map((bs: any) => {
    const s = Array.isArray(bs.seats) ? bs.seats[0] : bs.seats;
    return {
      seat_id: bs.seat_id,
      row_label: s?.row_label || "",
      seat_number: s?.seat_number || 0,
    };
  });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar isAdmin={isAdmin} userEmail={user.email} />

      <main className="flex-1 max-w-[1280px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <ConfirmClient
          booking={{
            id: booking.id,
            status: booking.status as "held" | "confirmed" | "expired",
            hold_expires_at: booking.hold_expires_at,
            booking_code: booking.booking_code,
            confirmed_at: booking.confirmed_at,
            showtime_id: showtimeId,
            movie_title: mv?.title || "Film Bioskop",
            poster_url: mv?.poster_url || "",
            studio_name: std?.name || "Studio Bioskop",
            starts_at: st?.starts_at || "",
            ends_at: st?.ends_at || "",
            price: st?.price || 50000,
            seats: formattedSeats,
          }}
        />
      </main>
    </div>
  );
}
