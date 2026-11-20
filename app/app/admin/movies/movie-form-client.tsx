"use client";

import React, { useState, useTransition } from "react";
import { Plus, Edit2, X, Clapperboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import { createMovieAction, updateMovieAction } from "@/app/admin/actions";

export interface MovieItem {
  id: number;
  title: string;
  duration_minutes: number;
  synopsis: string;
  poster_url: string;
  showtime_count?: number;
}

export function MovieFormClient({
  movieToEdit = null,
  onClose,
}: {
  movieToEdit?: MovieItem | null;
  onClose?: () => void;
}) {
  const isEditing = !!movieToEdit;
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [title, setTitle] = useState(movieToEdit?.title || "");
  const [durationMinutes, setDurationMinutes] = useState(
    movieToEdit?.duration_minutes?.toString() || "120"
  );
  const [synopsis, setSynopsis] = useState(movieToEdit?.synopsis || "");
  const [posterUrl, setPosterUrl] = useState(movieToEdit?.poster_url || "");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      let res;
      if (isEditing && movieToEdit) {
        res = await updateMovieAction(movieToEdit.id, formData);
      } else {
        res = await createMovieAction(formData);
      }

      if (res.success) {
        setSuccessMsg(res.message);
        if (!isEditing) {
          setTitle("");
          setDurationMinutes("120");
          setSynopsis("");
          setPosterUrl("");
        }
        setTimeout(() => {
          if (onClose) onClose();
        }, 1200);
      } else {
        setErrorMsg(res.message);
      }
    });
  };

  const hasShowtimes = (movieToEdit?.showtime_count || 0) > 0;

  return (
    <Card className="w-full">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border-subtle)] mb-4">
        <div className="flex items-center gap-2">
          <Clapperboard className="text-[var(--color-primary)]" size={20} strokeWidth={1.75} />
          <h2 className="text-[18px] font-semibold text-[var(--color-text)]">
            {isEditing ? `Ubah Film: ${movieToEdit.title}` : "Tambah Film Baru"}
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Judul Film"
          name="title"
          required
          placeholder="Contoh: Interstellar"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Input
          label="Durasi (Menit)"
          name="duration_minutes"
          type="number"
          min="1"
          required
          placeholder="120"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          disabled={isEditing && hasShowtimes}
          helperText={
            isEditing && hasShowtimes
              ? "Durasi terkunci karena film ini sudah memiliki jadwal tayang (Aturan R10)."
              : "Masukkan durasi film dalam satuan menit (harus > 0)."
          }
        />

        <div className="w-full flex flex-col gap-1.5 text-left">
          <label
            htmlFor="synopsis-input"
            className="text-[14px] font-medium text-[var(--color-text)]"
          >
            Sinopsis
          </label>
          <textarea
            id="synopsis-input"
            name="synopsis"
            required
            rows={3}
            placeholder="Sinopsis singkat alur cerita film..."
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--color-surface)] text-[var(--color-text)] text-[14px] rounded-[var(--radius-md)] border border-[var(--color-border)] focus-visible:outline-2 focus-visible:outline-[var(--color-text)] focus-visible:outline-offset-2 transition-colors resize-y"
          />
        </div>

        <Input
          label="URL Poster Film"
          name="poster_url"
          type="url"
          required
          placeholder="https://images.unsplash.com/photo-..."
          value={posterUrl}
          onChange={(e) => setPosterUrl(e.target.value)}
          helperText="Wajib tautan gambar langsung yang diawali http:// atau https:// (Rasio poster 2:3)."
        />

        <div className="flex items-center gap-3 mt-2">
          <Button type="submit" variant="primary" isLoading={isPending}>
            {isEditing ? "Simpan Perubahan" : "Tambah Film"}
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

export function MovieListActions({ movie }: { movie: MovieItem }) {
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
            <MovieFormClient movieToEdit={movie} onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
