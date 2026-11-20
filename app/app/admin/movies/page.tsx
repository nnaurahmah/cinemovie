import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Film, Clock } from "lucide-react";
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
import { MovieFormClient, MovieListActions, MovieItem } from "./movie-form-client";

export const dynamic = "force-dynamic";

export default async function AdminMoviesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    redirect("/login?redirectTo=/admin/movies");
  }

  // Ambil daftar film dan jumlah jadwal masing-masing
  const { data: movies } = await supabase
    .from("movies")
    .select(`
      id,
      title,
      duration_minutes,
      synopsis,
      poster_url,
      created_at,
      showtimes (id)
    `)
    .order("created_at", { ascending: false });

  const formattedMovies: MovieItem[] = (movies || []).map((m) => ({
    id: m.id,
    title: m.title,
    duration_minutes: m.duration_minutes,
    synopsis: m.synopsis,
    poster_url: m.poster_url,
    showtime_count: Array.isArray(m.showtimes) ? m.showtimes.length : 0,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar isAdmin={true} userEmail={user.email} />

      <main className="flex-1 max-w-[1280px] w-full mx-auto p-4 sm:p-6">
        {/* Back Link & Header */}
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
              Kelola Data Film
            </h1>
            <p className="text-[14px] text-[var(--color-text-muted)]">
              Tambah film baru atau perbarui metadata film bioskop (Fitur F6).
            </p>
          </div>
        </div>

        {/* Layout 2 Kolom pada Desktop (Layar 8) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Kolom Kiri: Formulir Tambah Film */}
          <div className="lg:col-span-5">
            <MovieFormClient />
          </div>

          {/* Kolom Kanan: Daftar Film Aktif */}
          <div className="lg:col-span-7">
            <Card>
              <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border-subtle)] mb-4">
                <div className="flex items-center gap-2">
                  <Film className="text-[var(--color-primary)]" size={20} strokeWidth={1.75} />
                  <h2 className="text-[18px] font-semibold text-[var(--color-text)]">
                    Daftar Film ({formattedMovies.length})
                  </h2>
                </div>
              </div>

              {formattedMovies.length === 0 ? (
                <div className="text-center py-12 text-[var(--color-text-muted)] text-[14px]">
                  Belum ada film yang ditambahkan. Silakan isi formulir di samping untuk menambahkan film pertama.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Poster & Judul</TableHead>
                      <TableHead>Durasi</TableHead>
                      <TableHead>Jadwal</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formattedMovies.map((movie) => (
                      <TableRow key={movie.id}>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <div className="w-[44px] h-[66px] relative bg-[var(--color-surface-elevated)] rounded-[var(--radius-sm)] overflow-hidden shrink-0 border border-[var(--color-border)]">
                              {movie.poster_url ? (
                                <img
                                  src={movie.poster_url}
                                  alt={movie.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : null}
                            </div>
                            <div className="max-w-[200px]">
                              <p className="font-semibold text-[var(--color-text)] truncate">
                                {movie.title}
                              </p>
                              <p className="text-[12px] text-[var(--color-text-muted)] line-clamp-2 mt-0.5">
                                {movie.synopsis}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-[var(--color-text)]">
                            <Clock size={14} className="text-[var(--color-text-muted)]" />
                            <span>{movie.duration_minutes} mnt</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={movie.showtime_count ? "info" : "neutral"}>
                            {movie.showtime_count} jadwal
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <MovieListActions movie={movie} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
