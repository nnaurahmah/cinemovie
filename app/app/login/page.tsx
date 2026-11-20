"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Film, LogIn, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage("Silakan lengkapi email dan kata sandi Anda.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Kata sandi minimal harus 6 karakter.");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      if (tab === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.toLowerCase().includes("invalid login credentials")) {
            setErrorMessage("Email atau kata sandi salah. Silakan periksa kembali.");
          } else {
            setErrorMessage("Gagal masuk. Silakan coba beberapa saat lagi.");
          }
          setIsLoading(false);
          return;
        }

        // Cek peran untuk pengalihan halaman (R8)
        const isAdmin = data.user?.app_metadata?.role === "admin";
        if (isAdmin) {
          router.push(redirectTo !== "/" ? redirectTo : "/admin");
        } else {
          router.push(redirectTo.startsWith("/admin") ? "/" : redirectTo);
        }
        router.refresh();
      } else {
        // Registrasi penonton baru
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.toLowerCase().includes("already registered")) {
            setErrorMessage("Email ini sudah terdaftar. Silakan pilih tab Masuk.");
          } else {
            setErrorMessage("Pendaftaran belum berhasil. Silakan coba kembali.");
          }
          setIsLoading(false);
          return;
        }

        if (data.session) {
          setSuccessMessage("Pendaftaran berhasil! Anda akan dialihkan...");
          setTimeout(() => {
            router.push("/");
            router.refresh();
          }, 1000);
        } else {
          setSuccessMessage("Pendaftaran berhasil. Silakan masuk dengan akun Anda.");
          setTab("login");
        }
      }
    } catch {
      setErrorMessage("Terjadi gangguan jaringan. Silakan periksa koneksi Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-[440px] p-6 sm:p-8">
      {/* Tab Switcher */}
      <div
        role="tablist"
        aria-label="Pilihan Autentikasi"
        className="flex border-b border-[var(--color-border)] mb-6"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "login"}
          aria-controls="auth-panel"
          onClick={() => {
            setTab("login");
            setErrorMessage(null);
          }}
          className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 text-[14px] font-medium border-b-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-text)] ${
            tab === "login"
              ? "border-[var(--color-primary)] text-[var(--color-text)]"
              : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          <LogIn size={18} strokeWidth={1.75} aria-hidden="true" />
          <span>Masuk</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "register"}
          aria-controls="auth-panel"
          onClick={() => {
            setTab("register");
            setErrorMessage(null);
          }}
          className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 text-[14px] font-medium border-b-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-text)] ${
            tab === "register"
              ? "border-[var(--color-primary)] text-[var(--color-text)]"
              : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          <UserPlus size={18} strokeWidth={1.75} aria-hidden="true" />
          <span>Daftar</span>
        </button>
      </div>

      {/* Status Alerts */}
      {successMessage && (
        <Toast
          type="success"
          message={successMessage}
          className="mb-4"
          onClose={() => setSuccessMessage(null)}
        />
      )}
      {errorMessage && (
        <Toast
          type="error"
          message={errorMessage}
          className="mb-4"
          onClose={() => setErrorMessage(null)}
        />
      )}

      {/* Form */}
      <form id="auth-panel" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Alamat Email"
          type="email"
          autoComplete="email"
          required
          placeholder="nama@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Kata Sandi"
          type="password"
          autoComplete={tab === "login" ? "current-password" : "new-password"}
          required
          placeholder="Minimal 6 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="w-full mt-2"
        >
          {tab === "login" ? "Masuk ke Akun" : "Daftar Akun Baru"}
        </Button>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--color-bg)]">
      {/* Brand Header */}
      <div className="flex items-center gap-2 mb-6">
        <Film
          className="text-[var(--color-primary)]"
          size={32}
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <h1 className="text-[28px] font-bold tracking-wider text-[var(--color-text)]">
          CINEMOVIE
        </h1>
      </div>

      <Suspense fallback={<div className="text-[14px] text-[var(--color-text-muted)]">Memuat formulir...</div>}>
        <LoginForm />
      </Suspense>

      <p className="mt-6 text-[14px] text-[var(--color-text-muted)] text-center">
        Cinemovie v1 · Sistem Pemesanan Bioskop
      </p>
    </main>
  );
}
