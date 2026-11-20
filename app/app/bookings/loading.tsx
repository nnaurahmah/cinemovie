import { Navbar } from "@/components/ui/navbar";
import { Card } from "@/components/ui/card";

export default function BookingsLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar />

      <main className="flex-1 max-w-[1280px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
          <div className="flex flex-col gap-2">
            <div className="h-8 w-48 bg-[var(--color-surface-elevated)] rounded-[var(--radius-sm)] animate-pulse" />
            <div className="h-4 w-72 bg-[var(--color-surface-elevated)] rounded-[var(--radius-sm)] animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-[var(--color-surface-elevated)] rounded-[var(--radius-sm)] animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {[1, 2].map((i) => (
            <Card key={i} className="flex flex-col gap-4 border border-[var(--color-border)]">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
                <div className="h-4 w-32 bg-[var(--color-surface-elevated)] rounded-[var(--radius-sm)] animate-pulse" />
                <div className="h-6 w-24 bg-[var(--color-surface-elevated)] rounded-[var(--radius-sm)] animate-pulse" />
              </div>

              <div className="flex items-start gap-4">
                <div className="w-[64px] h-[96px] rounded-[var(--radius-sm)] bg-[var(--color-surface-elevated)] animate-pulse shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-5 w-40 bg-[var(--color-surface-elevated)] rounded-[var(--radius-sm)] animate-pulse" />
                  <div className="h-4 w-28 bg-[var(--color-surface-elevated)] rounded-[var(--radius-sm)] animate-pulse" />
                  <div className="h-4 w-36 bg-[var(--color-surface-elevated)] rounded-[var(--radius-sm)] animate-pulse" />
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                <div className="h-4 w-24 bg-[var(--color-surface-elevated)] rounded-[var(--radius-sm)] animate-pulse" />
                <div className="h-5 w-28 bg-[var(--color-surface-elevated)] rounded-[var(--radius-sm)] animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
