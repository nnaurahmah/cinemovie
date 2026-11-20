import { Navbar } from "@/components/ui/navbar";
import { StateMessage } from "@/components/ui/state-message";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar />

      <main className="flex-1 max-w-[800px] w-full mx-auto p-4 sm:p-6 flex items-center justify-center">
        <StateMessage
          type="not-found"
          title="Halaman Tidak Ditemukan"
          description="Halaman yang Anda tuju tidak ditemukan atau alamat URL telah dipindahkan."
          actionText="Kembali ke Katalog Film"
          actionHref="/"
        />
      </main>
    </div>
  );
}
