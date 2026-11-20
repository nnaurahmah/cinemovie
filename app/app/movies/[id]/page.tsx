import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Ticket, Building2, Calendar, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/ui/navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface MovieDetailPageProps {
  params: Promise<{ id: string }>;
}

// Format waktu tayang WIB: jam:menit
function formatWIBHour(dateString: string) {
  try {
    const d = new Date(dateString);
    return (
      new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(d) + " WIB"
    );
  } catch {
    return dateString;
  }
}

// Format tanggal WIB: hari, tanggal bulan tahun
function formatWIBDate(dateString: string) {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return dateString;
  }
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const { id } = await params;
  const movieId = parseInt(id, 10);

  if (isNaN(movieId)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/movies/${id}`);
  }

  const isAdmin = user.app_metadata?.role === "admin";

  // Ambil detail film beserta seluruh jadwal tayangnya
  const { data: movie, error: movieError } = await supabase
    .from("movies")
    .select(`
      id,
      title,
      duration_minutes,
      synopsis,
      poster_url,
      created_at
    `)
    .eq("id", movieId)
    .single();

  if (movieError || !movie) {
    notFound();
  }

  // Ambil jadwal tayang untuk film ini
  const { data: showtimesData } = await supabase
    .from("showtimes")
    .select(`
      id,
      studio_id,
      starts_at,
      ends_at,
      price,
      studios (id, name)
    `)
    .eq("movie_id", movieId)
    .order("starts_at", { ascending: true });

  const showtimes = showtimesData || [];
  const now = new Date();

  // Kelompokkan jadwal berdasarkan tanggal WIB
  const groupedShowtimes: Record<string, typeof showtimes> = {};
  showtimes.forEach((st) => {
    const dateKey = formatWIBDate(st.starts_at);
    if (!groupedShowtimes[dateKey]) {
      groupedShowtimes[dateKey] = [];
    }
    groupedShowtimes[dateKey].push(st);
  });

  const dates = Object.keys(groupedShowtimes);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar isAdmin={isAdmin} userEmail={user.email} />

      <main className="flex-1 max-w-[1280px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Navigasi Kembali ke Katalog */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[14px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors py-1 focus-visible:outline-2 focus-visible:outline-[var(--color-text)] rounded-[var(--radius-sm)]"
          >
            <ArrowLeft size={16} strokeWidth={1.75} />
            <span>Kembali ke Katalog Film</span>
          </Link>
        </div>

        {/* Layout Split 2 Kolom di Desktop (4 Kolom Kiri, 8 Kolom Kanan per Layar 2) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Kolom Kiri: Poster Rasio 2:3 & Metadata Film */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="w-full aspect-[2/3] max-w-[360px] mx-auto lg:max-w-none rounded-[var(--radius-xl)] overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-subtle)]">
              {movie.poster_url ? (
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] text-[14px]">
                  Poster tidak tersedia
                </div>
              )}
            </div>

            <div className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] flex flex-col gap-3">
              <h1 className="text-[24px] font-bold text-[var(--color-text)] leading-tight">
                {movie.title}
              </h1>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="neutral" className="gap-1.5">
                  <Clock size={14} className="text-[var(--color-text-muted)]" strokeWidth={1.75} />
                  <span>{movie.duration_minutes} Menit</span>
                </Badge>
                <Badge variant="neutral" className="gap-1.5 tabular-nums">
                  <Ticket size={14} className="text-[var(--color-primary)]" strokeWidth={1.75} />
                  <span>Rp 50.000</span>
                </Badge>
              </div>

              <div className="pt-2 border-t border-[var(--color-border-subtle)]">
                <h2 className="text-[14px] font-semibold text-[var(--color-text)] mb-1">
                  Sinopsis
                </h2>
                <p className="text-[14px] text-[var(--color-text-muted)] leading-relaxed">
                  {movie.synopsis}
                </p>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Daftar Jadwal per Studio (WIB) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div>
              <h2 className="text-[20px] font-bold text-[var(--color-text)]">
                Pilih Jadwal Tayang
              </h2>
              <p className="text-[14px] text-[var(--color-text-muted)] mt-0.5">
                Pemesanan ditutup 5 menit sebelum jam penayangan dimulai (Aturan R9).
              </p>
            </div>

            {dates.length === 0 ? (
              <Card className="text-center py-12">
                <Calendar size={40} className="text-[var(--color-text-muted)] mx-auto mb-3" strokeWidth={1.5} />
                <h3 className="text-[18px] font-semibold text-[var(--color-text)] mb-2">
                  Belum Ada Jadwal Tayang
                </h3>
                <p className="text-[14px] text-[var(--color-text-muted)] max-w-[420px] mx-auto">
                  Film ini belum memiliki jadwal penayangan aktif di studio. Silakan periksa kembali nanti.
                </p>
              </Card>
            ) : (
              <div className="flex flex-col gap-6">
                {dates.map((dateStr) => {
                  const dayShowtimes = groupedShowtimes[dateStr];

                  return (
                    <div key={dateStr} className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-[14px] font-semibold text-[var(--color-text)] pb-2 border-b border-[var(--color-border)]">
                        <Calendar size={16} className="text-[var(--color-primary)]" strokeWidth={1.75} />
                        <span>{dateStr}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {dayShowtimes.map((st) => {
                          const startsAtDate = new Date(st.starts_at);
                          // Batas tutup: 5 menit sebelum jam tayang (Aturan R9)
                          const cutoffDate = new Date(startsAtDate.getTime() - 5 * 60 * 1000);
                          const isBookingClosed = now >= cutoffDate;

                          const studioName =
                            st.studios && Array.isArray(st.studios)
                              ? (st.studios[0] as { name: string })?.name
                              : (st.studios as unknown as { name: string })?.name ||
                                `Studio ${st.studio_id}`;

                          return (
                            <Card
                              key={st.id}
                              className={`flex flex-col justify-between p-4 transition-all ${
                                isBookingClosed
                                  ? "opacity-60 border-[var(--color-border-subtle)]"
                                  : "hover:border-[var(--color-primary)]"
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[14px] font-semibold text-[var(--color-text)] flex items-center gap-1.5">
                                    <Building2 size={16} className="text-[var(--color-primary)]" strokeWidth={1.75} />
                                    {studioName}
                                  </span>

                                  {isBookingClosed ? (
                                    <Badge variant="warning" className="text-[12px] py-0.5">
                                      Pemesanan Ditutup
                                    </Badge>
                                  ) : (
                                    <Badge variant="success" className="text-[12px] py-0.5">
                                      Tersedia
                                    </Badge>
                                  )}
                                </div>

                                <div className="text-[18px] font-bold text-[var(--color-text)] tabular-nums mb-1">
                                  {formatWIBHour(st.starts_at)}
                                </div>
                                <p className="text-[12px] text-[var(--color-text-muted)] mb-4">
                                  Selesai tayang pukul {formatWIBHour(st.ends_at)}
                                </p>
                              </div>

                              {isBookingClosed ? (
                                <div className="w-full">
                                  <Button
                                    variant="secondary"
                                    disabled
                                    className="w-full !cursor-not-allowed opacity-50"
                                  >
                                    Pemesanan Ditutup
                                  </Button>
                                  <p className="text-[11px] text-[var(--color-text-muted)] text-center mt-1.5">
                                    Melewati batas 5 menit sebelum film dimulai
                                  </p>
                                </div>
                              ) : (
                                <Link href={`/booking/${st.id}`} className="no-underline w-full block">
                                  <Button variant="primary" className="w-full">
                                    Pilih Kursi
                                  </Button>
                                </Link>
                              )}
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
