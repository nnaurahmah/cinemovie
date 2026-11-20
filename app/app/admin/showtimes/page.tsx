import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Film, Building2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/ui/navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  ShowtimeFormClient,
  ShowtimeRowActions,
  ShowtimeItem,
  MovieOption,
  StudioOption,
} from "./showtime-form-client";

export const dynamic = "force-dynamic";

// Format WIB Date String: e.g. "20 Nov 2026, 14:00 WIB"
function formatWIBTime(dateString: string) {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d) + " WIB";
  } catch {
    return dateString;
  }
}

function formatWIBHourOnly(dateString: string) {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d) + " WIB";
  } catch {
    return dateString;
  }
}

export default async function AdminShowtimesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    redirect("/login?redirectTo=/admin/showtimes");
  }

  // Ambil data film
  const { data: moviesData } = await supabase
    .from("movies")
    .select("id, title, duration_minutes")
    .order("title");

  // Ambil data studio
  const { data: studiosData } = await supabase
    .from("studios")
    .select("id, name")
    .order("id");

  // Ambil data jadwal tayang
  const { data: showtimesData } = await supabase
    .from("showtimes")
    .select(`
      id,
      movie_id,
      studio_id,
      starts_at,
      ends_at,
      blocked_until,
      price,
      movies (title, duration_minutes),
      studios (name)
    `)
    .order("starts_at", { ascending: true });

  const movies: MovieOption[] = (moviesData || []).map((m) => ({
    id: m.id,
    title: m.title,
    duration_minutes: m.duration_minutes,
  }));

  const studios: StudioOption[] = (studiosData || []).map((s) => ({
    id: s.id,
    name: s.name,
  }));

  const showtimes: ShowtimeItem[] = (showtimesData || []).map((st) => ({
    id: st.id,
    movie_id: st.movie_id,
    studio_id: st.studio_id,
    starts_at: st.starts_at,
    ends_at: st.ends_at,
    blocked_until: st.blocked_until,
    price: st.price,
    movies: Array.isArray(st.movies) ? st.movies[0] : st.movies,
    studios: Array.isArray(st.studios) ? st.studios[0] : st.studios,
  }));

  const now = new Date();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar isAdmin={true} userEmail={user.email} />

      <main className="flex-1 max-w-[1280px] w-full mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/admin"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-[var(--radius-md)] border border-[var(--color-border)] hover:bg-[var(--color-surface)]"
            aria-label="Kembali ke Panel Admin"
          >
            <ArrowLeft size={18} strokeWidth={1.75} />
          </Link>
          <div>
            <h1 className="text-[24px] font-bold text-[var(--color-text)]">
              Kelola Jadwal Tayang
            </h1>
            <p className="text-[14px] text-[var(--color-text-muted)]">
              Atur jadwal tayang Studio 1–5 dengan proteksi anti-bentrok jeda 15 menit (Aturan R10).
            </p>
          </div>
        </div>

        {movies.length === 0 ? (
          <Card className="text-center py-12">
            <Film size={40} className="text-[var(--color-text-muted)] mx-auto mb-3" strokeWidth={1.5} />
            <h2 className="text-[18px] font-semibold text-[var(--color-text)] mb-2">
              Belum Ada Film yang Tersedia
            </h2>
            <p className="text-[14px] text-[var(--color-text-muted)] max-w-[460px] mx-auto mb-6">
              Sebelum menambahkan jadwal tayang, silakan tambahkan data film terlebih dahulu di menu Kelola Film.
            </p>
            <Link href="/admin/movies">
              <span className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 bg-[var(--color-primary)] text-[var(--color-text)] rounded-[var(--radius-md)] text-[14px] font-medium hover:brightness-110">
                Tambah Film Sekarang
              </span>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Kolom Kiri: Formulir Tambah Jadwal */}
            <div className="lg:col-span-5">
              <ShowtimeFormClient movies={movies} studios={studios} />
            </div>

            {/* Kolom Kanan: Tabel Jadwal Aktif */}
            <div className="lg:col-span-7">
              <Card>
                <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border-subtle)] mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-[var(--color-primary)]" size={20} strokeWidth={1.75} />
                    <h2 className="text-[18px] font-semibold text-[var(--color-text)]">
                      Daftar Jadwal Tayang ({showtimes.length})
                    </h2>
                  </div>
                </div>

                {showtimes.length === 0 ? (
                  <div className="text-center py-12 text-[var(--color-text-muted)] text-[14px]">
                    Belum ada jadwal tayang. Silakan buat jadwal baru menggunakan formulir di samping.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Studio & Film</TableHead>
                        <TableHead>Jam Tayang (WIB)</TableHead>
                        <TableHead>Pembersihan (15 mnt)</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {showtimes.map((st) => {
                        const isPast = new Date(st.starts_at) <= now;
                        return (
                          <TableRow key={st.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-semibold text-[var(--color-text)] flex items-center gap-1.5">
                                  <Building2 size={14} className="text-[var(--color-primary)]" />
                                  {st.studios?.name || `Studio ${st.studio_id}`}
                                </span>
                                <span className="text-[13px] text-[var(--color-text-muted)]">
                                  {st.movies?.title} ({st.movies?.duration_minutes} mnt)
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium text-[var(--color-text)]">
                                  {formatWIBTime(st.starts_at)}
                                </span>
                                <span className="text-[12px] text-[var(--color-text-muted)]">
                                  s/d {formatWIBHourOnly(st.ends_at)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-[12px] text-[var(--color-text-muted)]">
                                Studio siap: {formatWIBHourOnly(st.blocked_until)}
                              </span>
                              {isPast && (
                                <Badge variant="neutral" className="mt-1 block w-fit text-[11px] py-0 px-1.5">
                                  Lewat
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <ShowtimeRowActions
                                showtime={st}
                                movies={movies}
                                studios={studios}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
