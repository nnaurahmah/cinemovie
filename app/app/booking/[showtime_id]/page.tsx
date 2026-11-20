import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/ui/navbar";
import { StateMessage } from "@/components/ui/state-message";
import { BookingClient } from "./booking-client";
import { SeatData } from "@/components/booking/seat-map";

export const dynamic = "force-dynamic";

interface BookingPageProps {
  params: Promise<{ showtime_id: string }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { showtime_id } = await params;
  const showtimeId = parseInt(showtime_id, 10);

  if (isNaN(showtimeId)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Wajib login untuk memilih kursi (R14)
  if (!user) {
    redirect(`/login?redirectTo=/booking/${showtimeId}`);
  }

  const isAdmin = user.app_metadata?.role === "admin";

  // Ambil data jadwal tayang
  const { data: showtime, error: stError } = await supabase
    .from("showtimes")
    .select(`
      id,
      studio_id,
      starts_at,
      ends_at,
      price,
      movies (id, title, duration_minutes, poster_url),
      studios (id, name)
    `)
    .eq("id", showtimeId)
    .single();

  if (stError || !showtime) {
    notFound();
  }

  // Cek batas tutup pemesanan (5 menit sebelum tayang - Aturan R9)
  const startsAt = new Date(showtime.starts_at);
  const cutoffTime = new Date(startsAt.getTime() - 5 * 60 * 1000);
  const now = new Date();

  if (now >= cutoffTime) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
        <Navbar isAdmin={isAdmin} userEmail={user.email} />
        <main className="flex-1 max-w-[800px] w-full mx-auto p-4 sm:p-6 flex items-center justify-center">
          <StateMessage
            type="error"
            title="Pemesanan Ditutup"
            description="Pemesanan tiket untuk penayangan ini telah ditutup karena sudah melewati batas 5 menit sebelum film dimulai (Aturan R9)."
            actionText="Kembali ke Detail Film"
            actionHref={`/movies/${(showtime.movies as any)?.id || ""}`}
          />
        </main>
      </div>
    );
  }

  // Panggil fungsi RPC seat_availability
  let seats: SeatData[] = [];
  const { data: seatData, error: seatError } = await supabase.rpc(
    "seat_availability",
    { p_showtime_id: showtimeId }
  );

  if (seatError || !seatData) {
    // Fallback baca manual jika RPC belum dieksekusi di Supabase
    const { data: rawSeats } = await supabase
      .from("seats")
      .select("id, row_label, seat_number")
      .eq("studio_id", showtime.studio_id)
      .order("row_label", { ascending: true })
      .order("seat_number", { ascending: true });

    seats = (rawSeats || []).map((s) => ({
      seat_id: s.id,
      row_label: s.row_label,
      seat_number: s.seat_number,
      status: "kosong",
    }));
  } else {
    seats = (seatData as any[]).map((s) => ({
      seat_id: s.seat_id,
      row_label: s.row_label,
      seat_number: s.seat_number,
      status: s.status as "kosong" | "terisi" | "ditahan",
      is_held_by_me: s.is_held_by_me,
    }));
  }

  const movieTitle = (showtime.movies as any)?.title || "Film Bioskop";
  const studioName = (showtime.studios as any)?.name || `Studio ${showtime.studio_id}`;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar isAdmin={isAdmin} userEmail={user.email} />

      <main className="flex-1 max-w-[1280px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        <BookingClient
          showtime={{
            id: showtime.id,
            starts_at: showtime.starts_at,
            ends_at: showtime.ends_at,
            price: showtime.price || 50000,
            movie_title: movieTitle,
            studio_name: studioName,
          }}
          initialSeats={seats}
        />
      </main>
    </div>
  );
}
