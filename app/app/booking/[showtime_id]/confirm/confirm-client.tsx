"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  Ticket,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Toast } from "@/components/ui/toast";
import { QRCodeSVG } from "@/components/booking/qr-code";
import { confirmBookingAction } from "@/app/booking/actions";

export interface ConfirmClientProps {
  booking: {
    id: string;
    status: "held" | "confirmed" | "expired";
    hold_expires_at: string;
    booking_code: string | null;
    confirmed_at: string | null;
    showtime_id: number;
    movie_title: string;
    poster_url: string;
    studio_name: string;
    starts_at: string;
    ends_at: string;
    price: number;
    seats: {
      seat_id: number;
      row_label: string;
      seat_number: number;
    }[];
  };
}

function formatWIBTime(dateString: string) {
  try {
    const d = new Date(dateString);
    return (
      new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        weekday: "short",
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

export function ConfirmClient({ booking }: ConfirmClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedData, setConfirmedData] = useState<{
    code: string;
    confirmedAt: string;
  } | null>(
    booking.status === "confirmed" && booking.booking_code
      ? { code: booking.booking_code, confirmedAt: booking.confirmed_at || "" }
      : null
  );

  // Hitung mundur sisa waktu tahan 5 menit (hanya tampilan, server tetap penentu R3)
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    const diff = Math.floor(
      (new Date(booking.hold_expires_at).getTime() - Date.now()) / 1000
    );
    return Math.max(0, diff);
  });

  useEffect(() => {
    if (confirmedData || booking.status !== "held") return;

    const timer = setInterval(() => {
      const diff = Math.floor(
        (new Date(booking.hold_expires_at).getTime() - Date.now()) / 1000
      );
      if (diff <= 0) {
        setRemainingSeconds(0);
        clearInterval(timer);
      } else {
        setRemainingSeconds(diff);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [booking.hold_expires_at, booking.status, confirmedData]);

  const isExpired = remainingSeconds <= 0 && !confirmedData;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedCountdown = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  const handleConfirm = () => {
    setErrorMsg(null);

    startTransition(async () => {
      const res = await confirmBookingAction(booking.id);

      if (res.success && res.bookingCode) {
        setConfirmedData({
          code: res.bookingCode,
          confirmedAt: res.confirmedAt || new Date().toISOString(),
        });
      } else {
        setErrorMsg(res.message);
      }
    });
  };

  const totalPrice = booking.seats.length * (booking.price || 50000);
  const formattedTotalPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(totalPrice);

  const seatLabels = booking.seats
    .map((s) => `${s.row_label}${s.seat_number}`)
    .sort()
    .join(", ");

  // -------------------------------------------------------------------
  // TAMPILAN SETELAH DIKONFIRMASI (KODE BOOKING QR - LAYAR 4 & R13)
  // -------------------------------------------------------------------
  if (confirmedData) {
    return (
      <div className="w-full max-w-[640px] mx-auto flex flex-col items-center">
        <Card className="w-full !p-6 sm:!p-8 text-center flex flex-col items-center border-[var(--color-success)]/40 shadow-lg">
          <div className="w-12 h-12 rounded-full bg-[var(--color-success)]/15 text-[var(--color-success)] flex items-center justify-center mb-3">
            <CheckCircle2 size={28} strokeWidth={2} />
          </div>

          <h1 className="text-[22px] font-bold text-[var(--color-text)] mb-1">
            Pemesanan Tiket Berhasil!
          </h1>
          <p className="text-[14px] text-[var(--color-text-muted)] mb-6">
            Tunjukkan kode booking QR ini kepada petugas loket bioskop saat penukaran tiket.
          </p>

          {/* Blok Tiket QR di Samping Jadwal & Kursi (R13) */}
          <div className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 mb-6 flex flex-col sm:flex-row items-center justify-center gap-6 text-left">
            {/* QR Code */}
            <QRCodeSVG value={confirmedData.code} size={160} />

            {/* Info Rincian Tiket */}
            <div className="flex-1 flex flex-col gap-2.5">
              <div>
                <span className="text-[12px] text-[var(--color-text-muted)] uppercase tracking-wider block">
                  Kode Booking (R13)
                </span>
                <span className="text-[22px] font-bold tracking-widest text-[var(--color-primary)] font-mono">
                  {confirmedData.code}
                </span>
              </div>

              <div className="pt-2 border-t border-[var(--color-border-subtle)]">
                <p className="font-semibold text-[var(--color-text)] text-[15px]">
                  {booking.movie_title}
                </p>
                <p className="text-[13px] text-[var(--color-text-muted)]">
                  {booking.studio_name}
                </p>
                <p className="text-[13px] text-[var(--color-text-muted)]">
                  {formatWIBTime(booking.starts_at)}
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--color-border-subtle)]">
                <span className="text-[12px] text-[var(--color-text-muted)] block">Nomor Kursi</span>
                <span className="text-[15px] font-bold text-[var(--color-text)]">
                  {seatLabels}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full flex-col sm:flex-row">
            <Link href="/" className="w-full sm:flex-1 no-underline">
              <Button variant="secondary" className="w-full">
                Kembali ke Katalog
              </Button>
            </Link>
            <Link href="/bookings" className="w-full sm:flex-1 no-underline">
              <Button variant="primary" className="w-full">
                Lihat Riwayat Pesanan
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // TAMPILAN KONFIRMASI BOOKING (LAYAR 4 DENGAN TIMER TAHAN 5 MENIT)
  // -------------------------------------------------------------------
  return (
    <div className="w-full max-w-[640px] mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/booking/${booking.showtime_id}`}
          className="inline-flex items-center gap-1.5 text-[14px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] py-1"
        >
          <ArrowLeft size={16} strokeWidth={1.75} />
          <span>Kembali ke Pemilihan Kursi</span>
        </Link>
      </div>

      {errorMsg && (
        <Toast
          type="error"
          message={errorMsg}
          onClose={() => setErrorMsg(null)}
        />
      )}

      {/* Timer Hitung Mundur 5 Menit (Layar 4 & R3) */}
      <Card
        className={`!p-4 flex items-center justify-between border transition-colors ${
          isExpired
            ? "border-[var(--color-error)] bg-[var(--color-error)]/10"
            : remainingSeconds <= 60
            ? "border-[var(--color-warning)] bg-[var(--color-warning)]/10"
            : "border-[var(--color-primary)]/40 bg-[var(--color-surface)]"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isExpired
                ? "bg-[var(--color-error)]/20 text-[var(--color-error)]"
                : "bg-[var(--color-primary)]/20 text-[var(--color-primary)]"
            }`}
          >
            <Clock size={20} strokeWidth={1.75} />
          </div>
          <div>
            <span className="text-[12px] text-[var(--color-text-muted)] block">
              {isExpired ? "Waktu Penahanan Habis" : "Sisa Waktu Penahanan Kursi (R3)"}
            </span>
            <span
              className={`text-[20px] font-bold tabular-nums tracking-wide font-mono ${
                isExpired
                  ? "text-[var(--color-error)]"
                  : remainingSeconds <= 60
                  ? "text-[var(--color-warning)]"
                  : "text-[var(--color-text)]"
              }`}
            >
              {isExpired ? "00:00" : formattedCountdown}
            </span>
          </div>
        </div>

        <Badge variant={isExpired ? "error" : remainingSeconds <= 60 ? "warning" : "info"}>
          {isExpired ? "Kedaluwarsa" : "Ditahan 5 Menit"}
        </Badge>
      </Card>

      {/* Rincian Tiket yang Ditahan */}
      <Card className="flex flex-col gap-4">
        <h1 className="text-[20px] font-bold text-[var(--color-text)] pb-3 border-b border-[var(--color-border-subtle)]">
          Konfirmasi Pemesanan Kursi
        </h1>

        <div className="flex items-start gap-4">
          <div className="w-[64px] h-[96px] rounded-[var(--radius-sm)] bg-[var(--color-surface-elevated)] overflow-hidden shrink-0 border border-[var(--color-border)]">
            {booking.poster_url ? (
              <img
                src={booking.poster_url}
                alt={booking.movie_title}
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>

          <div className="flex-1 flex flex-col gap-1">
            <h2 className="text-[18px] font-bold text-[var(--color-text)]">
              {booking.movie_title}
            </h2>
            <p className="text-[14px] text-[var(--color-text-muted)] flex items-center gap-1.5">
              <Building2 size={15} className="text-[var(--color-primary)]" />
              <span>{booking.studio_name}</span>
            </p>
            <p className="text-[14px] text-[var(--color-text-muted)] flex items-center gap-1.5">
              <Calendar size={15} className="text-[var(--color-primary)]" />
              <span>{formatWIBTime(booking.starts_at)}</span>
            </p>
          </div>
        </div>

        {/* Daftar Kursi */}
        <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
          <span className="text-[14px] text-[var(--color-text-muted)]">Kursi Dipilih:</span>
          <span className="text-[16px] font-bold text-[var(--color-text)]">
            {seatLabels} ({booking.seats.length} kursi)
          </span>
        </div>

        {/* Total Harga */}
        <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
          <div>
            <span className="text-[12px] text-[var(--color-text-muted)] block">Total Pembayaran</span>
            <span className="text-[24px] font-bold text-[var(--color-text)] tabular-nums">
              {formattedTotalPrice}
            </span>
          </div>
          <Badge variant="neutral">Rp 50.000 / kursi</Badge>
        </div>

        {/* Aksi Tombol (Konfirmasi / Ubah Kursi) */}
        <div className="pt-4 border-t border-[var(--color-border-subtle)] flex flex-col sm:flex-row gap-3">
          {isExpired ? (
            <Link href={`/booking/${booking.showtime_id}`} className="w-full no-underline">
              <Button variant="primary" className="w-full gap-2">
                <RotateCcw size={16} />
                <span>Waktu Habis — Pilih Kursi Kembali</span>
              </Button>
            </Link>
          ) : (
            <>
              <Button
                type="button"
                variant="primary"
                isLoading={isPending}
                onClick={handleConfirm}
                className="flex-1"
              >
                Konfirmasi Pesanan
              </Button>
              <Link
                href={`/booking/${booking.showtime_id}`}
                className="w-full sm:w-auto no-underline"
              >
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isPending}
                  className="w-full"
                >
                  Ubah Kursi
                </Button>
              </Link>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
