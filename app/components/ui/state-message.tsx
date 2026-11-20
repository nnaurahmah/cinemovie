import React from "react";
import Link from "next/link";
import { AlertCircle, Film, RefreshCw, FileQuestion, Loader2 } from "lucide-react";
import { Button } from "./button";

export interface StateMessageProps {
  type: "loading" | "empty" | "error" | "not-found";
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  actionHref?: string;
}

export function StateMessage({
  type,
  title,
  description,
  actionText,
  onAction,
  actionHref,
}: StateMessageProps) {
  const defaults = {
    loading: {
      icon: (
        <Loader2
          className="animate-spin text-[var(--color-primary)] mb-4"
          size={40}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      ),
      title: "Memuat Data...",
      description: "Mohon tunggu sebentar selagi kami menyiapkan informasi untuk Anda.",
    },
    empty: {
      icon: (
        <Film
          className="text-[var(--color-text-muted)] mb-4"
          size={40}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      ),
      title: "Data Tidak Ditemukan",
      description: "Belum ada data yang tersedia saat ini.",
      actionText: "Kembali ke Katalog",
      actionHref: "/",
    },
    error: {
      icon: (
        <AlertCircle
          className="text-[var(--color-error)] mb-4"
          size={40}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      ),
      title: "Terjadi Gangguan",
      description: "Permintaan Anda belum dapat diproses. Silakan coba kembali.",
      actionText: "Coba Lagi",
    },
    "not-found": {
      icon: (
        <FileQuestion
          className="text-[var(--color-text-muted)] mb-4"
          size={40}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      ),
      title: "Halaman Tidak Ditemukan",
      description: "Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.",
      actionText: "Kembali ke Katalog",
      actionHref: "/",
    },
  };

  const current = defaults[type];
  const finalTitle = title || current.title;
  const finalDesc = description || current.description;
  const finalActionText = actionText || ("actionText" in current ? current.actionText : undefined);
  const finalActionHref = actionHref || ("actionHref" in current ? current.actionHref : undefined);

  return (
    <div className="w-full max-w-[640px] mx-auto p-8 rounded-[var(--radius-xl)] bg-[var(--color-surface)] border border-[var(--color-border)] text-center flex flex-col items-center justify-center my-8">
      {current.icon}
      <h2 className="text-[20px] font-semibold text-[var(--color-text)] mb-2">
        {finalTitle}
      </h2>
      <p className="text-[14px] text-[var(--color-text-muted)] max-w-[440px] mb-6">
        {finalDesc}
      </p>

      {finalActionHref && finalActionText ? (
        <Link href={finalActionHref} className="no-underline">
          <Button variant="primary">{finalActionText}</Button>
        </Link>
      ) : onAction && finalActionText ? (
        <Button variant="primary" onClick={onAction}>
          {type === "error" && (
            <RefreshCw size={16} strokeWidth={1.75} className="mr-1" aria-hidden="true" />
          )}
          {finalActionText}
        </Button>
      ) : null}
    </div>
  );
}
