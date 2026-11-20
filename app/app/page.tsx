import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/ui/navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Film, ShieldAlert, CheckCircle } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const isAdmin = user.app_metadata?.role === "admin";

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar isAdmin={isAdmin} userEmail={user.email} />

      <main className="flex-1 max-w-[1280px] w-full mx-auto p-4 sm:p-6 flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <Film size={48} className="text-[var(--color-primary)] mx-auto mb-4" strokeWidth={1.5} />
          <h1 className="text-[28px] font-bold text-[var(--color-text)] mb-2">
            Selamat Datang di Cinemovie
          </h1>
          <p className="text-[14px] text-[var(--color-text-muted)] max-w-[500px]">
            Fondasi dan autentikasi (Tahap 1) telah siap. Halaman katalog film dan jadwal tayang penonton akan hadir pada Tahap 3.
          </p>
        </div>

        {/* Info Box Peran Akun Saat Ini */}
        <Card className="w-full max-w-[560px] p-6 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
            <span className="text-[14px] text-[var(--color-text-muted)]">Peran Akun Anda:</span>
            <Badge variant={isAdmin ? "error" : "neutral"}>
              {isAdmin ? "Admin Bioskop" : "Penonton"}
            </Badge>
          </div>

          <div className="pt-4 flex items-start gap-3">
            {isAdmin ? (
              <>
                <CheckCircle size={20} className="text-[var(--color-success)] shrink-0 mt-0.5" strokeWidth={1.75} />
                <div className="text-[14px]">
                  <p className="font-semibold text-[var(--color-text)] mb-1">Akses Penuh CMS Admin Aktif</p>
                  <p className="text-[var(--color-text-muted)]">
                    Akun Anda memiliki hak akses untuk mengelola film dan jadwal di <a href="/admin" className="text-[var(--color-primary)] underline">Panel Admin (/admin)</a>.
                  </p>
                </div>
              </>
            ) : (
              <>
                <ShieldAlert size={20} className="text-[var(--color-warning)] shrink-0 mt-0.5" strokeWidth={1.75} />
                <div className="text-[14px]">
                  <p className="font-semibold text-[var(--color-text)] mb-1">Hak Akses: Penonton Biasa</p>
                  <p className="text-[var(--color-text-muted)]">
                    Akun Anda saat ini adalah akun <strong>Penonton</strong>. Jika Anda mencoba membuka URL <code>/admin</code>, sistem otomatis menolak dan mengalihkan Anda kembali ke halaman ini (Aturan R8).
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
