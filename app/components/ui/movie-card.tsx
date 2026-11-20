import React from "react";
import Link from "next/link";
import { Clock, Ticket, Calendar } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";

export interface MovieCardProps {
  id: number;
  title: string;
  duration_minutes: number;
  poster_url: string;
  price?: number;
  active_showtimes_count?: number;
}

export function MovieCard({
  id,
  title,
  duration_minutes,
  poster_url,
  price = 50000,
  active_showtimes_count = 0,
}: MovieCardProps) {
  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] overflow-hidden transition-all duration-150 hover:border-[var(--color-border-subtle)] hover:brightness-105 group">
      {/* Poster Image with exact 2:3 aspect ratio */}
      <div className="w-full aspect-[2/3] relative bg-[var(--color-surface-elevated)] overflow-hidden">
        {poster_url ? (
          <img
            src={poster_url}
            alt={`Poster film ${title}`}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] text-[14px]">
            Poster tidak tersedia
          </div>
        )}

        {/* Badge Harga Seragam di pojok atas poster */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-sm)] text-[13px] font-semibold bg-black/80 backdrop-blur-md text-[var(--color-text)] border border-white/10 tabular-nums">
            <Ticket size={14} className="text-[var(--color-primary)]" strokeWidth={1.75} />
            {formattedPrice}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col justify-between gap-4">
        <div>
          <h3 className="text-[18px] font-bold text-[var(--color-text)] line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">
            {title}
          </h3>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="neutral" className="gap-1 text-[13px]">
              <Clock size={13} className="text-[var(--color-text-muted)]" strokeWidth={1.75} />
              <span>{duration_minutes} mnt</span>
            </Badge>

            {active_showtimes_count > 0 ? (
              <Badge variant="info" className="gap-1 text-[13px]">
                <Calendar size={13} strokeWidth={1.75} />
                <span>{active_showtimes_count} Jadwal Tayang</span>
              </Badge>
            ) : (
              <Badge variant="neutral" className="text-[13px]">
                Belum Ada Jadwal
              </Badge>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Link href={`/movies/${id}`} className="no-underline w-full mt-auto block">
          <Button variant="primary" className="w-full">
            Lihat Jadwal
          </Button>
        </Link>
      </div>
    </div>
  );
}
