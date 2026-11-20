import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/ui/navbar";
import { MovieCard } from "@/components/ui/movie-card";
import { StateMessage } from "@/components/ui/state-message";
import { Ticket, Film } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Alur brief: penonton login dulu (plan.md bagian 7 butir 4)
  if (!user) {
    redirect("/login");
  }

  const isAdmin = user.app_metadata?.role === "admin";
  const nowISO = new Date().toISOString();

  // Ambil data film beserta jadwalnya
  const { data: movies, error } = await supabase
    .from("movies")
    .select(`
      id,
      title,
      duration_minutes,
      synopsis,
      poster_url,
      created_at,
      showtimes (id, starts_at)
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar isAdmin={isAdmin} userEmail={user.email} />

      <main className="flex-1 max-w-[1280px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Banner Info Harga Seragam (R5) & Header Katalog */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-8 border-b border-[var(--color-border)]">
          <div>
            <div className="flex items-center gap-2 text-[var(--color-primary)] font-semibold text-[14px] uppercase tracking-wider mb-1">
              <Film size={18} strokeWidth={1.75} />
              <span>Sinema Cinemovie</span>
            </div>
            <h1 className="text-[28px] sm:text-[32px] font-bold text-[var(--color-text)] tracking-tight">
              Katalog Film Sedang Tayang
            </h1>
            <p className="text-[14px] text-[var(--color-text-muted)] mt-1">
              Pilih film favorit Anda dan pesan kursi secara langsung tanpa antre di loket.
            </p>
          </div>

          {/* Badge Harga Tiket Seragam (Aturan R5) */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] px-4 py-2.5 flex items-center gap-3 self-start md:self-auto shrink-0">
            <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-primary)]/15 text-[var(--color-primary)] flex items-center justify-center">
              <Ticket size={20} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[12px] text-[var(--color-text-muted)] leading-tight">Harga Tiket Tetap (R5)</p>
              <p className="text-[16px] font-bold text-[var(--color-text)] tabular-nums">
                Rp 50.000 <span className="text-[12px] font-normal text-[var(--color-text-muted)]">/ kursi</span>
              </p>
            </div>
          </div>
        </div>

        {/* State Kosong bila belum ada film */}
        {(!movies || movies.length === 0) ? (
          <StateMessage
            type="empty"
            title="Belum Ada Film yang Ditayangkan"
            description={
              isAdmin
                ? "Belum ada film di katalog. Silakan tambahkan film baru lewat Panel Admin."
                : "Saat ini bioskop belum memiliki film aktif yang ditayangkan. Silakan kembali lagi nanti."
            }
            actionText={isAdmin ? "Kelola Film (Admin)" : undefined}
            actionHref={isAdmin ? "/admin/movies" : undefined}
          />
        ) : (
          /* Grid Poster Film Rasio 2:3: 1 kolom di 390px, 4 kolom di 1280px dengan gutter 24px (Layar 1) */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => {
              // Hitung jadwal masa depan yang masih buka (starts_at > now)
              const upcomingShowtimes = Array.isArray(movie.showtimes)
                ? movie.showtimes.filter((st) => new Date(st.starts_at) > new Date())
                : [];

              return (
                <MovieCard
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  duration_minutes={movie.duration_minutes}
                  poster_url={movie.poster_url}
                  price={50000}
                  active_showtimes_count={upcomingShowtimes.length}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
