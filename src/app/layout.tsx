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
          <nav className="border-b border-[#d5ccc2] bg-[#465d50] backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-sm font-semibold text-white sm:px-6 lg:px-8">
              <Link href="/" className="flex items-center gap-3 text-white">
                <Image
                  src="https://cdn.prod.website-files.com/62badf935cb2e22b7a0ad8c8/6650a4539ac49e84a323e8ee_584091fa0a4372eddb9bb60c3e5d880a_Header%20logo.svg"
                  alt="August logo"
                  width={90}
                  height={28}
                  priority
                />
                <span className="text-base font-semibold text-white">August Timeline Mytch v1.0</span>
              </Link>
              <div className="flex gap-4">
                <Link href="/" className="hover:text-white">
                  Dashboard
                </Link>
                <Link href="/admin" className="hover:text-white">
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
