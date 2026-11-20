import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Ticket, Calendar, Building2, Clock, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/ui/navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StateMessage } from "@/components/ui/state-message";
import { QRCodeSVG } from "@/components/booking/qr-code";

export const dynamic = "force-dynamic";

function formatWIBTime(dateString: string) {
  try {
    const d = new Date(dateString);
    return (
      new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(d) + " WIB"
    );
  } catch {
    return dateString;
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function BookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/bookings");
  }

  const isAdmin = user.app_metadata?.role === "admin";

  // Ambil riwayat pesanan milik sendiri (F5, R7, R13, RLS)
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      id,
      status,
      hold_expires_at,
      booking_code,
      confirmed_at,
      created_at,
      showtime_id,
      showtimes (
        id,
        starts_at,
        ends_at,
        price,
        movies (id, title, duration_minutes, poster_url),
        studios (id, name)
      ),
      booking_seats (
        seat_id,
        seats (row_label, seat_number)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
        <Navbar isAdmin={isAdmin} userEmail={user.email} />
        <main className="flex-1 max-w-[800px] w-full mx-auto p-4 sm:p-6 flex items-center justify-center">
          <StateMessage
            type="error"
            title="Gagal Memuat Riwayat Pesanan"
            description="Terjadi kendala saat membaca daftar pesanan Anda. Silakan coba kembali."
            actionText="Coba Lagi"
            actionHref="/bookings"
          />
        </main>
      </div>
    );
  }

  const bookingList = bookings || [];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar isAdmin={isAdmin} userEmail={user.email} />

      <main className="flex-1 max-w-[1280px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
        {/* Header Halaman (Layar 6) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
          <div>
            <h1 className="text-[24px] sm:text-[32px] font-bold text-[var(--color-text)]">
              Riwayat Pesanan Saya
            </h1>
            <p className="text-[14px] text-[var(--color-text-muted)] mt-1">
              Daftar tiket dan status transaksi pemesanan bioskop Cinemovie Anda.
            </p>
          </div>
          <Link href="/">
            <Button variant="secondary" className="gap-2">
              <ArrowLeft size={16} strokeWidth={1.75} />
              <span>Katalog Film</span>
            </Button>
          </Link>
        </div>

        {/* State Kosong (Empty State) */}
        {bookingList.length === 0 ? (
          <div className="py-12">
            <StateMessage
              type="empty"
              title="Belum Ada Pesanan"
              description="Anda belum memiliki riwayat pemesanan tiket. Silakan jelajahi katalog film kami untuk memesan kursi bioskop."
              actionText="Jelajahi Film"
              actionHref="/"
            />
          </div>
        ) : (
          /* Grid 2 Kolom di Desktop (1280px) & 1 Kolom di Mobile (390px) */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {bookingList.map((b: any) => {
              const st = Array.isArray(b.showtimes) ? b.showtimes[0] : b.showtimes;
              const mv = st && Array.isArray(st.movies) ? st.movies[0] : st?.movies;
              const std = st && Array.isArray(st.studios) ? st.studios[0] : st?.studios;

              const seatList = (b.booking_seats || []).map((bs: any) => {
                const s = Array.isArray(bs.seats) ? bs.seats[0] : bs.seats;
                return `${s?.row_label || ""}${s?.seat_number || ""}`;
              }).sort();

              // Hitung status efektif saat dibaca (database.md Bagian 7 & Aturan R3)
              const now = new Date();
              const holdExpiresAt = new Date(b.hold_expires_at);
              let effectiveStatus: "confirmed" | "held" | "expired" = b.status;

              if (b.status === "held" && holdExpiresAt <= now) {
                effectiveStatus = "expired";
              }

              const ticketPrice = st?.price || 50000;
              const totalPrice = seatList.length * ticketPrice;

              return (
                <Card
                  key={b.id}
                  className={`flex flex-col gap-4 border transition-all ${
                    effectiveStatus === "confirmed"
                      ? "border-[var(--color-border)] hover:border-[var(--color-success)]/40"
                      : effectiveStatus === "held"
                      ? "border-[var(--color-warning)]/40 bg-[var(--color-warning)]/5"
                      : "border-[var(--color-border)] opacity-80"
                  }`}
                >
                  {/* Header Kartu: Tanggal Transaksi & Badge Status (R7) */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--color-border-subtle)]">
                    <span className="text-[12px] text-[var(--color-text-muted)] font-mono">
                      {formatWIBTime(b.created_at)}
                    </span>
                    <Badge
                      variant={
                        effectiveStatus === "confirmed"
                          ? "success"
                          : effectiveStatus === "held"
                          ? "warning"
                          : "error"
                      }
                      className="font-bold text-[13px]"
                    >
                      {effectiveStatus === "confirmed"
                        ? "Dikonfirmasi"
                        : effectiveStatus === "held"
                        ? "Ditahan"
                        : "Kedaluwarsa"}
                    </Badge>
                  </div>

                  {/* Body Kartu: Poster, Info Film & Jadwal */}
                  <div className="flex items-start gap-4">
                    <div className="w-[64px] h-[96px] rounded-[var(--radius-sm)] bg-[var(--color-surface-elevated)] overflow-hidden shrink-0 border border-[var(--color-border)]">
                      {mv?.poster_url ? (
                        <img
                          src={mv.poster_url}
                          alt={mv.title || "Poster Film"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                          <Ticket size={24} strokeWidth={1.5} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                      <h2 className="text-[17px] font-bold text-[var(--color-text)] truncate">
                        {mv?.title || "Judul Film"}
                      </h2>
                      <div className="text-[13px] text-[var(--color-text-muted)] flex items-center gap-1.5">
                        <Building2 size={14} className="text-[var(--color-primary)] shrink-0" />
                        <span className="truncate">{std?.name || "Studio Bioskop"}</span>
                      </div>
                      <div className="text-[13px] text-[var(--color-text-muted)] flex items-center gap-1.5">
                        <Calendar size={14} className="text-[var(--color-primary)] shrink-0" />
                        <span className="truncate">
                          {st?.starts_at ? formatWIBTime(st.starts_at) : "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rincian Kursi & Total Harga (Angka Tabular) */}
                  <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-[14px]">
                    <div>
                      <span className="text-[var(--color-text-muted)] block text-[12px]">
                        Kursi ({seatList.length})
                      </span>
                      <span className="font-semibold text-[var(--color-text)]">
                        {seatList.join(", ") || "-"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[var(--color-text-muted)] block text-[12px]">
                        Total Pembayaran
                      </span>
                      <span className="text-[16px] font-bold text-[var(--color-text)] tabular-nums">
                        {formatCurrency(totalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Blok Khusus Status: Tiket QR Dikonfirmasi, Tombol Ditahan, atau Pesan Kedaluwarsa */}
                  {effectiveStatus === "confirmed" && b.booking_code ? (
                    <div className="mt-2 pt-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] rounded-[var(--radius-md)] p-4 flex flex-col sm:flex-row items-center gap-4">
                      {/* Komponen Zero-Dependency QR Code (R13) */}
                      <QRCodeSVG value={b.booking_code} size={110} />

                      <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
                        <span className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                          KODE BOOKING (R13)
                        </span>
                        <span className="text-[20px] font-bold tracking-widest text-[var(--color-primary)] font-mono">
                          {b.booking_code}
                        </span>
                        <p className="text-[12px] text-[var(--color-text-muted)] mt-1 leading-relaxed">
                          Tunjukkan QR code atau kode ini kepada petugas loket untuk penukaran tiket fisik.
                        </p>
                      </div>
                    </div>
                  ) : effectiveStatus === "held" ? (
                    <div className="mt-2 pt-3 border-t border-[var(--color-border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3">
                      <p className="text-[12px] text-[var(--color-warning)] flex items-center gap-1.5">
                        <AlertCircle size={15} className="shrink-0" />
                        <span>Kursi ditahan 5 menit. Segera konfirmasi pesanan Anda.</span>
                      </p>
                      <Link
                        href={`/booking/${b.showtime_id}/confirm?booking_id=${b.id}`}
                        className="w-full sm:w-auto"
                      >
                        <Button variant="primary" className="w-full">
                          Lanjut Konfirmasi
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-2 pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-2 text-[12px] text-[var(--color-text-muted)]">
                      <span>Waktu penahanan telah kedaluwarsa. Kursi telah dilepas.</span>
                      {mv?.id ? (
                        <Link href={`/movies/${mv.id}`}>
                          <Button variant="ghost" className="gap-1.5 text-[12px]">
                            <RotateCcw size={14} />
                            <span>Pesan Lagi</span>
                          </Button>
                        </Link>
                      ) : null}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
