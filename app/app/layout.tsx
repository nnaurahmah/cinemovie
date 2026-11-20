import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cinemovie — Pemesanan Kursi Bioskop",
  description: "Aplikasi web pemesanan kursi bioskop Cinemovie v1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
        {children}
      </body>
    </html>
  );
}
