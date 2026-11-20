"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Pastikan hanya admin yang bisa mengeksekusi Server Actions ini (R8)
async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    throw new Error("Akses ditolak: Hanya admin yang diizinkan melakukan tindakan ini.");
  }

  return { supabase, user };
}

export type ActionResponse = {
  success: boolean;
  message: string;
};

// =====================================================================
// AKSI PENGELOLAAN FILM (F6)
// =====================================================================

export async function createMovieAction(formData: FormData): Promise<ActionResponse> {
  try {
    const { supabase } = await verifyAdmin();

    const title = (formData.get("title") as string)?.trim();
    const durationMinutes = parseInt(formData.get("duration_minutes") as string, 10);
    const synopsis = (formData.get("synopsis") as string)?.trim();
    const posterUrl = (formData.get("poster_url") as string)?.trim();

    if (!title || !synopsis || !posterUrl || isNaN(durationMinutes)) {
      return { success: false, message: "Semua kolom data film wajib diisi." };
    }

    if (durationMinutes <= 0) {
      return { success: false, message: "Durasi film harus lebih dari 0 menit." };
    }

    // Guardrail 4.5: URL poster wajib berawalan http:// atau https://
    if (!posterUrl.startsWith("http://") && !posterUrl.startsWith("https://")) {
      return {
        success: false,
        message: "URL poster tidak valid (wajib diawali http:// atau https://).",
      };
    }

    const { error } = await supabase.from("movies").insert({
      title,
      duration_minutes: durationMinutes,
      synopsis,
      poster_url: posterUrl,
    });

    if (error) {
      return { success: false, message: "Gagal menyimpan film: " + error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/movies");
    revalidatePath("/admin/showtimes");
    revalidatePath("/");
    return { success: true, message: "Film berhasil ditambahkan." };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan internal.";
    return { success: false, message: msg };
  }
}

export async function updateMovieAction(
  movieId: number,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const { supabase } = await verifyAdmin();

    const title = (formData.get("title") as string)?.trim();
    const durationMinutes = parseInt(formData.get("duration_minutes") as string, 10);
    const synopsis = (formData.get("synopsis") as string)?.trim();
    const posterUrl = (formData.get("poster_url") as string)?.trim();

    if (!title || !synopsis || !posterUrl || isNaN(durationMinutes)) {
      return { success: false, message: "Semua kolom data film wajib diisi." };
    }

    if (durationMinutes <= 0) {
      return { success: false, message: "Durasi film harus lebih dari 0 menit." };
    }

    if (!posterUrl.startsWith("http://") && !posterUrl.startsWith("https://")) {
      return {
        success: false,
        message: "URL poster tidak valid (wajib diawali http:// atau https://).",
      };
    }

    const { error } = await supabase
      .from("movies")
      .update({
        title,
        duration_minutes: durationMinutes,
        synopsis,
        poster_url: posterUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", movieId);

    if (error) {
      // Tangani trigger R10: durasi terkunci jika sudah punya jadwal
      if (error.message.includes("Durasi tidak bisa diubah karena film sudah punya jadwal")) {
        return {
          success: false,
          message: "Durasi tidak bisa diubah karena film ini sudah memiliki jadwal tayang.",
        };
      }
      return { success: false, message: "Gagal memperbarui film: " + error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/movies");
    revalidatePath("/admin/showtimes");
    revalidatePath("/");
    return { success: true, message: "Data film berhasil diperbarui." };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan internal.";
    return { success: false, message: msg };
  }
}

// =====================================================================
// AKSI PENGELOLAAN JADWAL TAYANG (F6, R4, R9, R10, R12)
// =====================================================================

export async function createShowtimeAction(formData: FormData): Promise<ActionResponse> {
  try {
    const { supabase } = await verifyAdmin();

    const movieId = parseInt(formData.get("movie_id") as string, 10);
    const studioId = parseInt(formData.get("studio_id") as string, 10);
    const startsAtRaw = formData.get("starts_at") as string; // Format: YYYY-MM-DDTHH:mm

    if (isNaN(movieId) || isNaN(studioId) || !startsAtRaw) {
      return { success: false, message: "Film, studio, dan jam tayang wajib dipilih." };
    }

    // Format waktu dalam zona waktu WIB (+07:00) sesuai R9
    const startsAtWIB = startsAtRaw.length === 16 ? `${startsAtRaw}:00+07:00` : startsAtRaw;
    const dateObj = new Date(startsAtWIB);

    if (isNaN(dateObj.getTime())) {
      return { success: false, message: "Format waktu tayang tidak valid." };
    }

    // Cek jam tayang di masa depan (R10)
    if (dateObj.getTime() <= Date.now()) {
      return { success: false, message: "Jam tayang harus berada di masa depan." };
    }

    // R5: Semua tiket berharga sama (Rp 50.000). Tidak ada input harga di form CMS.
    const FIXED_TICKET_PRICE = 50000;

    const { error } = await supabase.from("showtimes").insert({
      movie_id: movieId,
      studio_id: studioId,
      starts_at: startsAtWIB,
      price: FIXED_TICKET_PRICE,
      // ends_at dan blocked_until diisi otomatis oleh trigger showtimes_before_write
      ends_at: startsAtWIB,
      blocked_until: startsAtWIB,
    });

    if (error) {
      // Tangani exclusion constraint bentrok R10 (showtimes_no_overlap)
      if (error.message.includes("showtimes_no_overlap")) {
        return {
          success: false,
          message:
            "Jadwal bentrok dengan jadwal lain di studio ini (wajib berjarak jeda minimal 15 menit antar film).",
        };
      }
      if (error.message.includes("Jam tayang harus di masa depan")) {
        return { success: false, message: "Jam tayang harus berada di masa depan." };
      }
      return { success: false, message: "Gagal membuat jadwal: " + error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/showtimes");
    revalidatePath("/admin/movies");
    revalidatePath("/");
    return { success: true, message: "Jadwal tayang berhasil ditambahkan." };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan internal.";
    return { success: false, message: msg };
  }
}

export async function updateShowtimeAction(
  showtimeId: number,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const { supabase } = await verifyAdmin();

    const movieId = parseInt(formData.get("movie_id") as string, 10);
    const studioId = parseInt(formData.get("studio_id") as string, 10);
    const startsAtRaw = formData.get("starts_at") as string;

    if (isNaN(movieId) || isNaN(studioId) || !startsAtRaw) {
      return { success: false, message: "Film, studio, dan jam tayang wajib diisi." };
    }

    const startsAtWIB = startsAtRaw.length === 16 ? `${startsAtRaw}:00+07:00` : startsAtRaw;
    const dateObj = new Date(startsAtWIB);

    if (isNaN(dateObj.getTime())) {
      return { success: false, message: "Format waktu tayang tidak valid." };
    }

    if (dateObj.getTime() <= Date.now()) {
      return { success: false, message: "Jam tayang harus berada di masa depan." };
    }

    const { error } = await supabase
      .from("showtimes")
      .update({
        movie_id: movieId,
        studio_id: studioId,
        starts_at: startsAtWIB,
      })
      .eq("id", showtimeId);

    if (error) {
      // Tangani trigger R4: jadwal berpesanan tidak boleh diubah
      if (error.message.includes("Jadwal sudah punya pesanan dan tidak boleh diubah")) {
        return {
          success: false,
          message:
            "Jadwal ini sudah memiliki pesanan (ditahan atau dikonfirmasi) dan tidak dapat diubah.",
        };
      }
      // Tangani exclusion constraint bentrok R10
      if (error.message.includes("showtimes_no_overlap")) {
        return {
          success: false,
          message:
            "Jadwal bentrok dengan jadwal lain di studio ini (wajib jeda minimal 15 menit).",
        };
      }
      if (error.message.includes("Jam tayang harus di masa depan")) {
        return { success: false, message: "Jam tayang harus di masa depan." };
      }
      return { success: false, message: "Gagal memperbarui jadwal: " + error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/showtimes");
    revalidatePath("/admin/movies");
    revalidatePath("/");
    return { success: true, message: "Jadwal tayang berhasil diperbarui." };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan internal.";
    return { success: false, message: msg };
  }
}
