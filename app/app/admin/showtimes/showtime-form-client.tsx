"use client";

import React, { useState, useTransition } from "react";
import { Calendar, Clock, Edit2, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import { createShowtimeAction, updateShowtimeAction } from "@/app/admin/actions";

export interface MovieOption {
  id: number;
  title: string;
  duration_minutes: number;
}

export interface StudioOption {
  id: number;
  name: string;
}

export interface ShowtimeItem {
  id: number;
  movie_id: number;
  studio_id: number;
  starts_at: string;
  ends_at: string;
  blocked_until: string;
  price: number;
  movies?: { title: string; duration_minutes: number } | null;
  studios?: { name: string } | null;
  has_bookings?: boolean;
}

// Format Date object to YYYY-MM-DDTHH:mm string in WIB (+07:00)
function toWIBDateTimeLocal(dateStr?: string) {
  const d = dateStr ? new Date(dateStr) : new Date(Date.now() + 60 * 60 * 1000); // Default 1 hour from now
  // Convert to WIB (+7)
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const wibTime = new Date(utc + 7 * 3600000);

  const year = wibTime.getFullYear();
  const month = String(wibTime.getMonth() + 1).padStart(2, "0");
  const day = String(wibTime.getDate()).padStart(2, "0");
  const hours = String(wibTime.getHours()).padStart(2, "0");
  const minutes = String(wibTime.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function ShowtimeFormClient({
  movies,
  studios,
  showtimeToEdit = null,
  onClose,
}: {
  movies: MovieOption[];
  studios: StudioOption[];
  showtimeToEdit?: ShowtimeItem | null;
  onClose?: () => void;
}) {
  const isEditing = !!showtimeToEdit;
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [movieId, setMovieId] = useState(
    showtimeToEdit?.movie_id?.toString() || (movies[0]?.id?.toString() ?? "")
  );
  const [studioId, setStudioId] = useState(
    showtimeToEdit?.studio_id?.toString() || (studios[0]?.id?.toString() ?? "")
  );
  const [startsAt, setStartsAt] = useState(toWIBDateTimeLocal(showtimeToEdit?.starts_at));

  const selectedMovie = movies.find((m) => m.id === parseInt(movieId, 10));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      let res;
      if (isEditing && showtimeToEdit) {
        res = await updateShowtimeAction(showtimeToEdit.id, formData);
      } else {
        res = await createShowtimeAction(formData);
      }

      if (res.success) {
        setSuccessMsg(res.message);
        if (!isEditing) {
          // Reset default to 2 hours from now
          setStartsAt(toWIBDateTimeLocal(new Date(Date.now() + 2 * 3600000).toISOString()));
        }
        setTimeout(() => {
          if (onClose) onClose();
        }, 1200);
      } else {
        setErrorMsg(res.message);
      }
    });
  };

  return (
    <Card className="w-full">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border-subtle)] mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="text-[var(--color-primary)]" size={20} strokeWidth={1.75} />
          <h2 className="text-[18px] font-semibold text-[var(--color-text)]">
            {isEditing ? "Ubah Jadwal Tayang" : "Tambah Jadwal Tayang"}
          </h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup formulir"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        )}
      </div>

      {errorMsg && (
        <Toast
          type="error"
          message={errorMsg}
          className="mb-4"
          onClose={() => setErrorMsg(null)}
        />
      )}
      {successMsg && (
        <Toast
          type="success"
          message={successMsg}
          className="mb-4"
          onClose={() => setSuccessMsg(null)}
        />
      )}

      {showtimeToEdit?.has_bookings && (
        <div className="mb-4 p-3 bg-[var(--color-warning)]/15 border border-[var(--color-warning)]/30 rounded-[var(--radius-md)] flex items-start gap-2 text-[14px] text-[#fbbf24]">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" strokeWidth={1.75} />
          <span>
            Jadwal ini memiliki pesanan aktif. Mengubah jadwal ini akan ditolak oleh database (Aturan R4).
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Pilihan Film */}
        <div className="w-full flex flex-col gap-1.5 text-left">
          <label
            htmlFor="movie-select"
            className="text-[14px] font-medium text-[var(--color-text)]"
          >
            Pilih Film
          </label>
          <select
            id="movie-select"
            name="movie_id"
            required
            value={movieId}
            onChange={(e) => setMovieId(e.target.value)}
            className="w-full min-h-[44px] px-3 py-2 bg-[var(--color-surface)] text-[var(--color-text)] text-[14px] rounded-[var(--radius-md)] border border-[var(--color-border)] focus-visible:outline-2 focus-visible:outline-[var(--color-text)] transition-colors cursor-pointer"
          >
            {movies.map((m) => (
              <option key={m.id} value={m.id} className="bg-[var(--color-surface)]">
                {m.title} ({m.duration_minutes} menit)
              </option>
            ))}
          </select>
          {selectedMovie && (
            <p className="text-[12px] text-[var(--color-text-muted)] flex items-center gap-1">
              <Clock size={12} />
              <span>Durasi tayang: {selectedMovie.duration_minutes} menit (+ jeda 15 menit pembersihan)</span>
            </p>
          )}
        </div>

        {/* Pilihan Studio */}
        <div className="w-full flex flex-col gap-1.5 text-left">
          <label
            htmlFor="studio-select"
            className="text-[14px] font-medium text-[var(--color-text)]"
          >
            Pilih Studio (1–5)
          </label>
          <select
            id="studio-select"
            name="studio_id"
            required
            value={studioId}
            onChange={(e) => setStudioId(e.target.value)}
            className="w-full min-h-[44px] px-3 py-2 bg-[var(--color-surface)] text-[var(--color-text)] text-[14px] rounded-[var(--radius-md)] border border-[var(--color-border)] focus-visible:outline-2 focus-visible:outline-[var(--color-text)] transition-colors cursor-pointer"
          >
            {studios.map((s) => (
              <option key={s.id} value={s.id} className="bg-[var(--color-surface)]">
                {s.name} (80 Kursi)
              </option>
            ))}
          </select>
        </div>

        {/* Waktu Mulai Tayang (WIB) */}
        <div className="w-full flex flex-col gap-1.5 text-left">
          <label
            htmlFor="starts-at-input"
            className="text-[14px] font-medium text-[var(--color-text)]"
          >
            Waktu Mulai Tayang (WIB)
          </label>
          <input
            id="starts-at-input"
            name="starts_at"
            type="datetime-local"
            required
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="w-full min-h-[44px] px-3 py-2 bg-[var(--color-surface)] text-[var(--color-text)] text-[14px] rounded-[var(--radius-md)] border border-[var(--color-border)] focus-visible:outline-2 focus-visible:outline-[var(--color-text)] transition-colors"
          />
          <p className="text-[12px] text-[var(--color-text-muted)]">
            Wajib waktu di masa depan. Sistem otomatis menghitung jam selesai + jeda 15 menit untuk mencegah jadwal bentrok (Aturan R10).
          </p>
        </div>

        {/* Info Harga Tiket Tetap (R5) */}
        <div className="p-3 bg-[var(--color-surface-elevated)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] text-[13px] text-[var(--color-text-muted)] flex items-center justify-between">
          <span>Harga Tiket Seragam (R5):</span>
          <span className="font-semibold text-[var(--color-text)]">Rp 50.000</span>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <Button type="submit" variant="primary" isLoading={isPending}>
            {isEditing ? "Simpan Perubahan Jadwal" : "Tambah Jadwal"}
          </Button>
          {onClose && (
            <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
              Batal
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}

export function ShowtimeRowActions({
  showtime,
  movies,
  studios,
}: {
  showtime: ShowtimeItem;
  movies: MovieOption[];
  studios: StudioOption[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setIsOpen(true)}
        className="!px-3 !py-1.5 !min-h-[36px] text-[13px]"
      >
        <Edit2 size={14} strokeWidth={1.75} className="mr-1" />
        <span>Ubah</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-[560px] max-h-[90vh] overflow-y-auto">
            <ShowtimeFormClient
              movies={movies}
              studios={studios}
              showtimeToEdit={showtime}
              onClose={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
