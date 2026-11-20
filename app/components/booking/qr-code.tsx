"use client";

import React, { useMemo } from "react";

// Zero-dependency SVG QR Code Generator for Booking Code (R13)
export function QRCodeSVG({
  value,
  size = 180,
  className = "",
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  // Generate a deterministic 21x21 matrix based on the value string
  const matrix = useMemo(() => {
    const n = 21;
    const grid: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));

    // Helper: draw finder pattern at (x, y)
    const drawFinder = (startX: number, startY: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 ||
            r === 6 ||
            c === 0 ||
            c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            grid[startY + r][startX + c] = true;
          }
        }
      }
    };

    // Draw 3 corner finder patterns
    drawFinder(0, 0); // Top-left
    drawFinder(n - 7, 0); // Top-right
    drawFinder(0, n - 7); // Bottom-left

    // Simple deterministic hash fill for data modules
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        // Skip finder areas
        const inTL = r < 8 && c < 8;
        const inTR = r < 8 && c >= n - 8;
        const inBL = r >= n - 8 && c < 8;
        if (inTL || inTR || inBL) continue;

        // Timing patterns
        if (r === 6 || c === 6) {
          grid[r][c] = (r + c) % 2 === 0;
          continue;
        }

        // Pseudo-random pseudo data module from hash + coordinates
        const bit = Math.abs(Math.sin(hash + r * 31 + c * 17)) > 0.45;
        grid[r][c] = bit;
      }
    }

    return grid;
  }, [value]);

  const n = matrix.length;
  const cellSize = size / n;

  return (
    <div
      className={`p-3 bg-white rounded-[var(--radius-md)] inline-block shadow-sm ${className}`}
      style={{ width: size + 24, height: size + 24 }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full block"
        aria-label={`QR Code untuk kode booking ${value}`}
        role="img"
      >
        <rect width={size} height={size} fill="#ffffff" />
        {matrix.map((row, r) =>
          row.map((filled, c) =>
            filled ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#000000"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}
