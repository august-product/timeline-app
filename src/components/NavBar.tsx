"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export const NavBar = () => {
  const pathname = usePathname();
  const isDashboard = pathname === "/";
  const isAdmin = pathname?.startsWith("/admin");

  const linkClasses = (active: boolean) =>
    clsx(
      "relative px-1 py-0.5 text-sm font-semibold text-white/90 transition duration-200 ease-out hover:text-white focus-visible:text-white after:absolute after:right-0 after:bottom-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-white after:transition-transform after:duration-200 after:ease-out hover:after:scale-x-100 focus-visible:after:scale-x-100",
      active && "text-white after:scale-x-100",
    );

  return (
    <nav className="border-b border-[#4b6656] bg-[#5c7a69] text-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-white">
          <Image src="/august-logo.svg" alt="August logo" width={120} height={36} priority />
          <span className="text-base font-semibold tracking-wide">August Timeline</span>
        </Link>
        <div className="flex gap-5">
          <Link href="/" className={linkClasses(isDashboard)} aria-current={isDashboard ? "page" : undefined}>
            Dashboard
          </Link>
          <Link href="/admin" className={linkClasses(isAdmin)} aria-current={isAdmin ? "page" : undefined}>
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
};
