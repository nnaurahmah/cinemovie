"use client";

import { useEffect } from "react";
import { Navbar } from "@/components/ui/navbar";
import { StateMessage } from "@/components/ui/state-message";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Pesan error singkat, tanpa detail internal (Guardrails 4.4)
    console.error("Application error:", error.message);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar />

      <main className="flex-1 max-w-[800px] w-full mx-auto p-4 sm:p-6 flex items-center justify-center">
        <StateMessage
          type="error"
          title="Terjadi Gangguan Sistem"
          description="Mohon maaf, sistem mengalami gangguan saat memproses permintaan Anda."
          actionText="Coba Lagi"
          onAction={reset}
        />
      </main>
    </div>
  );
}
