"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface HoldSeatsResponse {
  success: boolean;
  message: string;
  bookingId?: string;
  holdExpiresAt?: string;
}

export interface ConfirmBookingResponse {
  success: boolean;
  message: string;
  bookingCode?: string;
  confirmedAt?: string;
}

// ---------------------------------------------------------------------
// 1. Aksi Tahan Kursi (F4, R1, R2, R3, R9, R14)
// ---------------------------------------------------------------------
export async function holdSeatsAction(
  showtimeId: number,
  seatIds: number[]
): Promise<HoldSeatsResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Sesi login telah berakhir. Silakan login kembali.",
      };
    }

    if (!seatIds || seatIds.length < 1 || seatIds.length > 4) {
      return {
        success: false,
        message: "Anda hanya dapat memilih minimal 1 dan maksimal 4 kursi (Aturan R2).",
      };
    }

    // Panggil RPC hold_seats di database
    const { data, error } = await supabase.rpc("hold_seats", {
      p_showtime_id: showtimeId,
      p_seat_ids: seatIds,
    });

    if (error) {
      // Tangani pesan penolakan yang ramah pengguna
      if (
        error.message.includes("diambil") ||
        error.message.includes("unique_violation") ||
        error.message.includes("booking_seats_taken_once")
      ) {
        return {
          success: false,
          message:
            "Satu atau lebih kursi yang Anda pilih baru saja diambil pengguna lain. Silakan pilih kursi lain.",
        };
      }

      if (error.message.includes("ditutup")) {
        return {
          success: false,
          message:
            "Pemesanan untuk jadwal ini telah ditutup (5 menit sebelum jam tayang).",
        };
      }

      return {
        success: false,
        message: error.message || "Gagal menahan kursi. Silakan coba lagi.",
      };
    }

    revalidatePath(`/booking/${showtimeId}`);
    return {
      success: true,
      message: "Kursi berhasil ditahan selama 5 menit.",
      bookingId: data?.booking_id,
      holdExpiresAt: data?.hold_expires_at,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan internal.";
    return { success: false, message: msg };
  }
}

// ---------------------------------------------------------------------
// 2. Aksi Konfirmasi Pemesanan (F4, R3, R9, R13)
// ---------------------------------------------------------------------
export async function confirmBookingAction(
  bookingId: string
): Promise<ConfirmBookingResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Sesi login telah berakhir. Silakan login kembali.",
      };
    }

    // Panggil RPC confirm_booking di database
    const { data, error } = await supabase.rpc("confirm_booking", {
      p_booking_id: bookingId,
    });

    if (error) {
      if (error.message.includes("habis") || error.message.includes("expired")) {
        return {
          success: false,
          message:
            "Waktu penahanan 5 menit telah habis. Kursi Anda telah dilepas kembali.",
        };
      }

      if (error.message.includes("ditutup")) {
        return {
          success: false,
          message: "Pemesanan telah ditutup (5 menit sebelum jam tayang).",
        };
      }

      return {
        success: false,
        message: error.message || "Konfirmasi pemesanan gagal. Silakan coba lagi.",
      };
    }

    revalidatePath("/bookings");
    revalidatePath("/");
    return {
      success: true,
      message: "Pesanan berhasil dikonfirmasi! Tiket Anda telah diterbitkan.",
      bookingCode: data?.booking_code,
      confirmedAt: data?.confirmed_at,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan internal.";
    return { success: false, message: msg };
  }
}
