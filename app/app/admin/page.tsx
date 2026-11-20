import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Clapperboard,
  Calendar,
  Building2,
  Armchair,
  ArrowRight,
  Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/ui/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    redirect("/login?redirectTo=/admin");
  }

  // Ambil metrik ringkasan
  const { count: moviesCount } = await supabase
    .from("movies")
    .select("*", { count: "exact", head: true });

  const { count: showtimesCount } = await supabase
    .from("showtimes")
    .select("*", { count: "exact", head: true });

  const { count: studiosCount } = await supabase
    .from("studios")
    .select("*", { count: "exact", head: true });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar isAdmin={true} userEmail={user.email} />

      <main className="flex-1 max-w-[1280px] w-full mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-[var(--color-text)]">
              Panel Pengelolaan Bioskop
            </h1>
            <p className="text-[14px] text-[var(--color-text-muted)] mt-1">
              Ringkasan data bioskop, film aktif, dan jadwal penayangan (Layar 7).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/movies">
              <Button variant="secondary" className="gap-2">
                <Clapperboard size={16} strokeWidth={1.75} />
                <span>+ Film</span>
              </Button>
            </Link>
            <Link href="/admin/showtimes">
              <Button variant="primary" className="gap-2">
                <Calendar size={16} strokeWidth={1.75} />
                <span>+ Jadwal</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Kartu Metrik Ringkasan (Layar 7 Design System) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="!p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] text-[var(--color-text-muted)] font-medium">Total Film</span>
              <Clapperboard size={18} className="text-[var(--color-primary)]" strokeWidth={1.75} />
            </div>
            <p className="text-[28px] font-bold text-[var(--color-text)] tabular-nums">
              {moviesCount || 0}
            </p>
            <span className="text-[12px] text-[var(--color-text-muted)]">Film terdaftar</span>
          </Card>

          <Card className="!p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] text-[var(--color-text-muted)] font-medium">Total Jadwal</span>
              <Calendar size={18} className="text-[#38bdf8]" strokeWidth={1.75} />
            </div>
            <p className="text-[28px] font-bold text-[var(--color-text)] tabular-nums">
              {showtimesCount || 0}
            </p>
            <span className="text-[12px] text-[var(--color-text-muted)]">Jadwal tayang aktif</span>
          </Card>

          <Card className="!p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] text-[var(--color-text-muted)] font-medium">Studio Tetap</span>
              <Building2 size={18} className="text-[#4ade80]" strokeWidth={1.75} />
            </div>
            <p className="text-[28px] font-bold text-[var(--color-text)] tabular-nums">
              {studiosCount || 5}
            </p>
            <span className="text-[12px] text-[var(--color-text-muted)]">Studio 1–5 (R6)</span>
          </Card>

          <Card className="!p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] text-[var(--color-text-muted)] font-medium">Kapasitas Kursi</span>
              <Armchair size={18} className="text-[#fbbf24]" strokeWidth={1.75} />
            </div>
            <p className="text-[28px] font-bold text-[var(--color-text)] tabular-nums">
              400
            </p>
            <span className="text-[12px] text-[var(--color-text-muted)]">80 kursi/studio (R6)</span>
          </Card>
        </div>

        {/* Pintu Masuk Pengelolaan (Card Aksi Utama) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/movies" className="no-underline block group">
            <Card className="h-full hover:border-[var(--color-primary)] transition-colors">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-surface-elevated)] text-[var(--color-primary)]">
                  <Clapperboard size={24} strokeWidth={1.75} aria-hidden="true" />
                </div>
                <ArrowRight
                  size={18}
                  strokeWidth={1.75}
                  className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors"
                  aria-hidden="true"
                />
              </div>
              <h2 className="text-[18px] font-semibold text-[var(--color-text)] mt-4 mb-1">
                Kelola Data Film
              </h2>
              <p className="text-[14px] text-[var(--color-text-muted)]">
                Tambah film baru, perbarui judul, durasi menit, sinopsis cerita, dan tautan URL poster.
              </p>
            </Card>
          </Link>

          <Link href="/admin/showtimes" className="no-underline block group">
            <Card className="h-full hover:border-[var(--color-primary)] transition-colors">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-surface-elevated)] text-[var(--color-primary)]">
                  <Calendar size={24} strokeWidth={1.75} aria-hidden="true" />
                </div>
                <ArrowRight
                  size={18}
                  strokeWidth={1.75}
                  className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors"
                  aria-hidden="true"
                />
              </div>
              <h2 className="text-[18px] font-semibold text-[var(--color-text)] mt-4 mb-1">
                Kelola Jadwal Tayang
              </h2>
              <p className="text-[14px] text-[var(--color-text-muted)]">
                Atur jadwal tayang Studio 1–5 dengan proteksi anti-bentrok jeda 15 menit otomatis.
              </p>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
