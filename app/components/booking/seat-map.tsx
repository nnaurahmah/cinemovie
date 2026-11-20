"use client";

import React from "react";
import { Check, X, Tv } from "lucide-react";

export interface SeatData {
  seat_id: number;
  row_label: string;
  seat_number: number;
  status: "kosong" | "terisi" | "ditahan";
  is_held_by_me?: boolean;
}

export interface SeatMapProps {
  seats: SeatData[];
  selectedSeatIds: number[];
  onToggleSeat: (seatId: number) => void;
  maxSeats?: number;
}

export function SeatMap({
  seats,
  selectedSeatIds,
  onToggleSeat,
  maxSeats = 4,
}: SeatMapProps) {
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const columns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Map seat lookup by row and number
  const seatMap = new Map<string, SeatData>();
  seats.forEach((s) => {
    seatMap.set(`${s.row_label}-${s.seat_number}`, s);
  });

  return (
    <div className="w-full flex flex-col items-center">
      {/* Layar Bioskop Indicator */}
      <div className="w-full max-w-[560px] mb-8 text-center flex flex-col items-center">
        <div className="w-full h-2.5 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent rounded-t-full opacity-80" />
        <div className="w-full border-t-2 border-[var(--color-primary)]/40 pt-2 flex items-center justify-center gap-2 text-[12px] font-bold tracking-[0.25em] text-[var(--color-text-muted)] uppercase">
          <Tv size={14} className="text-[var(--color-primary)]" strokeWidth={1.75} />
          <span>LAYAR BIOSKOP</span>
        </div>
      </div>

      {/* Legenda Status Kursi (Pembeda Non-Warna Wajib) */}
      <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap mb-6 text-[13px] text-[var(--color-text-muted)]">
        {/* Tersedia (Kosong) */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--color-secondary)] border border-[#4B5563] flex items-center justify-center text-[11px] font-medium text-[var(--color-text)]">
            A1
          </div>
          <span>Tersedia</span>
        </div>

        {/* Dipilih */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--color-primary)] border-2 border-[var(--color-text)] flex items-center justify-center text-[var(--color-text)] font-bold">
            <Check size={14} strokeWidth={2.5} />
          </div>
          <span>Dipilih</span>
        </div>

        {/* Terisi / Ditahan */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-dashed border-[var(--color-text-muted)] flex items-center justify-center text-[var(--color-text-muted)]">
            <X size={14} strokeWidth={2} />
          </div>
          <span>Terisi / Ditahan</span>
        </div>
      </div>

      {/* Kontainer Matriks 8x10 Kursi (Scroll Horizontal di Mobile 390px agar area sentuh 44px tetap terjaga) */}
      <div className="w-full overflow-x-auto pb-4 pt-2 flex justify-start sm:justify-center">
        <div className="min-w-[520px] flex flex-col gap-2 p-2">
          {rows.map((row) => (
            <div key={row} className="flex items-center justify-center gap-2">
              {/* Row Label Kiri */}
              <span className="w-6 text-[14px] font-bold text-[var(--color-text-muted)] text-center select-none">
                {row}
              </span>

              {/* Kursi 1 - 10 */}
              <div className="flex items-center gap-2">
                {columns.map((col) => {
                  const seatKey = `${row}-${col}`;
                  const seat = seatMap.get(seatKey);
                  const seatId = seat ? seat.seat_id : 0;
                  const isSelected = selectedSeatIds.includes(seatId);
                  const isOccupied =
                    seat &&
                    (seat.status === "terisi" ||
                      (seat.status === "ditahan" && !seat.is_held_by_me));

                  const seatLabel = `${row}${col}`;

                  // Accessibility label
                  const ariaStatus = isOccupied
                    ? "Terisi"
                    : isSelected
                    ? "Dipilih"
                    : "Tersedia";

                  return (
                    <button
                      key={seatKey}
                      type="button"
                      disabled={isOccupied || !seat}
                      aria-label={`Baris ${row} Kursi ${col}, ${ariaStatus}`}
                      aria-pressed={isSelected}
                      onClick={() => seat && onToggleSeat(seatId)}
                      className={`min-w-[44px] min-h-[44px] w-[44px] h-[44px] rounded-[var(--radius-sm)] flex items-center justify-center text-[13px] font-medium transition-all duration-150 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-[var(--color-text)] focus-visible:outline-offset-2 select-none ${
                        isOccupied
                          ? "bg-[var(--color-bg)] border border-dashed border-[var(--color-text-muted)] text-[var(--color-text-muted)] cursor-not-allowed opacity-60"
                          : isSelected
                          ? "bg-[var(--color-primary)] border-2 border-[var(--color-text)] text-[var(--color-text)] font-bold shadow-[var(--shadow-subtle)] scale-105"
                          : "bg-[var(--color-secondary)] border border-[#4B5563] text-[var(--color-text)] hover:border-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] cursor-pointer"
                      }`}
                    >
                      {isOccupied ? (
                        <X size={16} strokeWidth={2} aria-hidden="true" />
                      ) : isSelected ? (
                        <div className="flex flex-col items-center justify-center leading-none">
                          <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                          <span className="text-[10px] mt-0.5">{col}</span>
                        </div>
                      ) : (
                        <span>{seatLabel}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Row Label Kanan */}
              <span className="w-6 text-[14px] font-bold text-[var(--color-text-muted)] text-center select-none">
                {row}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
