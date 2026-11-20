"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Ticket, AlertTriangle, ArrowRight, Building2, Clock, Calendar } from "lucide-react";
import { SeatMap, SeatData } from "@/components/booking/seat-map";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Toast } from "@/components/ui/toast";
import { holdSeatsAction } from "@/app/booking/actions";

export interface BookingClientProps {
  showtime: {
    id: number;
    starts_at: string;
    ends_at: string;
    price: number;
    movie_title: string;
    studio_name: string;
  };
  initialSeats: SeatData[];
}

function formatWIBTime(dateString: string) {
  try {
    const d = new Date(dateString);
    return (
      new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(d) + " WIB"
    );
  } catch {
    return dateString;
  }
}

export function BookingClient({ showtime, initialSeats }: BookingClientProps) {
  const router = useRouter();
  const [seats, setSeats] = useState<SeatData[]>(initialSeats);
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>(() =>
    initialSeats.filter((s) => s.is_held_by_me).map((s) => s.seat_id)
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleToggleSeat = (seatId: number) => {
    setErrorMsg(null);

    setSelectedSeatIds((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      } else {
        // Aturan R2: Maksimal 4 kursi per transaksi
        if (prev.length >= 4) {
          setErrorMsg("Maksimal 4 kursi per transaksi (Aturan R2).");
          return prev;
        }
        return [...prev, seatId];
      }
    });
  };

  const handleHoldSeats = () => {
    if (selectedSeatIds.length === 0) {
      setErrorMsg("Silakan pilih minimal 1 kursi terlebih dahulu.");
      return;
    }

    setErrorMsg(null);

    startTransition(async () => {
      const res = await holdSeatsAction(showtime.id, selectedSeatIds);

      if (res.success && res.bookingId) {
        // Berhasil menahan kursi -> Lanjut ke Layar 4 (Konfirmasi Booking)
        router.push(
          `/booking/${showtime.id}/confirm?booking_id=${res.bookingId}`
        );
      } else {
        setErrorMsg(res.message);
        // Jika terjadi rebutan kursi (T1), refresh halaman agar status kursi terisi terbaru muncul
        router.refresh();
      }
    });
  };

  // Cari label kursi terpilih (misal "A1", "A2")
  const selectedSeatLabels = seats
    .filter((s) => selectedSeatIds.includes(s.seat_id))
    .map((s) => `${s.row_label}${s.seat_number}`)
    .sort();

  const totalPrice = selectedSeatIds.length * (showtime.price || 50000);
  const formattedTotalPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(totalPrice);

  return (
    <div className="flex flex-col gap-8">
      {/* Tombol Kembali ke Detail Film */}
      <div>
        <Link
          href={`/movies`}
          className="inline-flex items-center gap-2 text-[14px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors py-1 focus-visible:outline-2 focus-visible:outline-[var(--color-text)] rounded-[var(--radius-sm)]"
        >
          <ArrowLeft size={16} strokeWidth={1.75} />
          <span>Kembali ke Detail Film</span>
        </Link>
      </div>

      {errorMsg && (
        <Toast
          type="error"
          message={errorMsg}
          className="w-full max-w-[800px] mx-auto"
          onClose={() => setErrorMsg(null)}
        />
      )}

      {/* Layout Split: Denah Kursi (Kiri / 8 Kolom) & Ringkasan Pilihan (Kanan / 4 Kolom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Kolom Kiri: Denah Kursi Interaktif 8x10 */}
        <div className="lg:col-span-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-4 sm:p-6 flex flex-col items-center">
          <SeatMap
            seats={seats}
            selectedSeatIds={selectedSeatIds}
            onToggleSeat={handleToggleSeat}
            maxSeats={4}
          />
        </div>

        {/* Kolom Kanan: Panel Ringkasan Pilihan (Layar 3) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <Card className="flex flex-col gap-4">
            <h2 className="text-[18px] font-bold text-[var(--color-text)] pb-3 border-b border-[var(--color-border-subtle)]">
              Ringkasan Pemesanan
            </h2>

            {/* Info Film & Jadwal */}
            <div className="flex flex-col gap-2">
              <h3 className="text-[16px] font-semibold text-[var(--color-text)]">
                {showtime.movie_title}
              </h3>
              <div className="text-[13px] text-[var(--color-text-muted)] flex items-center gap-1.5">
                <Building2 size={14} className="text-[var(--color-primary)]" />
                <span>{showtime.studio_name}</span>
              </div>
              <div className="text-[13px] text-[var(--color-text-muted)] flex items-center gap-1.5">
                <Calendar size={14} className="text-[var(--color-primary)]" />
                <span>{formatWIBTime(showtime.starts_at)}</span>
              </div>
            </div>

            {/* Kursi Terpilih */}
            <div className="pt-3 border-t border-[var(--color-border-subtle)] flex flex-col gap-2">
              <div className="flex items-center justify-between text-[14px]">
                <span className="text-[var(--color-text-muted)]">Kursi Terpilih:</span>
                <span className="font-semibold text-[var(--color-text)]">
                  {selectedSeatIds.length} / 4 kursi
                </span>
              </div>

              {selectedSeatLabels.length > 0 ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedSeatLabels.map((lbl) => (
                    <Badge key={lbl} variant="error" className="font-bold text-[14px]">
                      {lbl}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[var(--color-text-muted)] italic">
                  Belum ada kursi yang dipilih.
                </p>
              )}
            </div>

            {/* Total Harga */}
            <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
              <div>
                <span className="text-[12px] text-[var(--color-text-muted)] block">Total Bayar (R5)</span>
                <span className="text-[20px] font-bold text-[var(--color-text)] tabular-nums">
                  {formattedTotalPrice}
                </span>
              </div>
              <Badge variant="neutral" className="text-[12px]">
                Rp 50.000 / kursi
              </Badge>
            </div>

            {/* Tombol Lanjut Konfirmasi */}
            <Button
              type="button"
              variant="primary"
              disabled={selectedSeatIds.length === 0}
              isLoading={isPending}
              onClick={handleHoldSeats}
              className="w-full mt-2"
            >
              <span>Lanjut Konfirmasi</span>
              <ArrowRight size={16} strokeWidth={2} className="ml-1" />
            </Button>

            <p className="text-[11px] text-[var(--color-text-muted)] text-center leading-normal">
              Kursi akan ditahan selama 5 menit di server setelah Anda menekan tombol di atas (Aturan R3).
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
