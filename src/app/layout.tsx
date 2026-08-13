import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "e-Sijil ADTEC Sandakan",
  description: "Sistem Cetak Sijil Digital Dinamik - ADTEC JTM Kampus Sandakan",
  icons: {
    icon: "/logo-adtec.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: 'var(--clay-bg)', color: 'var(--clay-ink)' }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
