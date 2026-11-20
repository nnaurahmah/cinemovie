"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Film, User, LogOut, Clapperboard, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "./badge";

export interface NavbarProps {
  isAdmin?: boolean;
  userEmail?: string | null;
}

export function Navbar({ isAdmin = false, userEmail = null }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="w-full bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-40">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-[64px] flex items-center justify-between">
        {/* Brand */}
        <Link
          href={isAdmin ? "/admin" : "/"}
          className="flex items-center gap-2 text-[var(--color-text)] font-bold text-[20px] tracking-wide focus-visible:outline-2 focus-visible:outline-[var(--color-text)] rounded-[var(--radius-sm)] py-2"
        >
          <Film
            className="text-[var(--color-primary)] shrink-0"
            size={24}
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <span>CINEMOVIE</span>
          {isAdmin ? (
            <span className="text-[12px] font-medium bg-[var(--color-primary)] text-[var(--color-text)] px-2 py-0.5 rounded-[var(--radius-sm)] ml-1">
              ADMIN
            </span>
          ) : (
            <span className="text-[12px] font-medium bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border)] px-2 py-0.5 rounded-[var(--radius-sm)] ml-1 hidden sm:inline">
              PENONTON
            </span>
          )}
        </Link>

        {/* Navigation links & Actions */}
        <nav className="flex items-center gap-2 sm:gap-4">
          {userEmail ? (
            <>
              {isAdmin ? (
                <>
                  <Link
                    href="/admin/movies"
                    className={`min-h-[44px] px-3 py-2 flex items-center gap-1.5 text-[14px] rounded-[var(--radius-md)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-text)] ${
                      pathname.startsWith("/admin/movies")
                        ? "text-[var(--color-text)] font-semibold border-b-2 border-[var(--color-primary)]"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    <Clapperboard size={18} strokeWidth={1.75} aria-hidden="true" />
                    <span className="hidden sm:inline">Kelola Film</span>
                  </Link>
                  <Link
                    href="/admin/showtimes"
                    className={`min-h-[44px] px-3 py-2 flex items-center gap-1.5 text-[14px] rounded-[var(--radius-md)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-text)] ${
                      pathname.startsWith("/admin/showtimes")
                        ? "text-[var(--color-text)] font-semibold border-b-2 border-[var(--color-primary)]"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    <Calendar size={18} strokeWidth={1.75} aria-hidden="true" />
                    <span className="hidden sm:inline">Kelola Jadwal</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/"
                    className={`min-h-[44px] px-3 py-2 flex items-center gap-1.5 text-[14px] rounded-[var(--radius-md)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-text)] ${
                      pathname === "/"
                        ? "text-[var(--color-text)] font-semibold border-b-2 border-[var(--color-primary)]"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    <span>Katalog Film</span>
                  </Link>
                  <Link
                    href="/bookings"
                    className={`min-h-[44px] px-3 py-2 flex items-center gap-1.5 text-[14px] rounded-[var(--radius-md)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-text)] ${
                      pathname.startsWith("/bookings")
                        ? "text-[var(--color-text)] font-semibold border-b-2 border-[var(--color-primary)]"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    <span>Pesanan Saya</span>
                  </Link>
                </>
              )}

              {/* User indicator & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-[var(--color-border)]">
                <span className="text-[14px] text-[var(--color-text)] hidden md:inline truncate max-w-[160px]">
                  {userEmail}
                </span>
                <Badge variant={isAdmin ? "error" : "neutral"} className="hidden sm:inline-flex">
                  {isAdmin ? "Admin" : "Penonton"}
                </Badge>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Keluar akun"
                  title="Keluar"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer rounded-[var(--radius-md)] focus-visible:outline-2 focus-visible:outline-[var(--color-text)]"
                >
                  <LogOut size={18} strokeWidth={1.75} aria-hidden="true" />
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="min-h-[44px] px-4 py-2 flex items-center gap-2 text-[14px] font-medium bg-[var(--color-primary)] text-[var(--color-text)] rounded-[var(--radius-md)] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-[var(--color-text)]"
            >
              <User size={18} strokeWidth={1.75} aria-hidden="true" />
              <span>Masuk</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
