import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "August Timeline",
  description: "Operational timeline and collection admin for August launches",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen">
          <nav className="border-b border-[#d5ccc2] bg-[var(--august-card)]/90 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-sm font-semibold text-[var(--august-muted)] sm:px-6 lg:px-8">
              <Link href="/" className="flex items-center gap-3 text-[var(--august-ink)]">
                <Image src="/august-logo.svg" alt="August logo" width={90} height={28} priority />
                <span className="text-base font-semibold text-[var(--august-ink)]">August Timeline</span>
              </Link>
              <div className="flex gap-4">
                <Link href="/" className="hover:text-[var(--august-ink)]">
                  Dashboard
                </Link>
                <Link href="/admin" className="hover:text-[var(--august-ink)]">
                  Admin
                </Link>
              </div>
            </div>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
