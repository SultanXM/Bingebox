"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function NavbarWrapper() {
  // Always show navbar now - even on watch pages
  return <Navbar />;
}

export function FooterWrapper() {
  const pathname = usePathname();
  const isWatchPage = pathname?.startsWith("/movie/") || pathname?.startsWith("/tv/");

  // Hide footer on watch pages
  if (isWatchPage) return null;
  return <Footer />;
}
