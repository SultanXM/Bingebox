"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bookmark, Heart, X, Menu, History, LogOut } from "lucide-react";
import { useSearch } from "@/app/comps/search/SearchProvider";
import { useAuth } from "@/app/hooks/useAuth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/main?type=movie", label: "Movies" },
  { href: "/main?type=tv", label: "TV" },
];

export const Navbar = () => {
  const { openSearch } = useSearch();
  const { logout } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ${
          isScrolled
            ? "bg-black/40 backdrop-blur-2xl shadow-lg"
            : "bg-gradient-to-b from-black/60 via-black/30 to-transparent"
        }`}
      >
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo - Link to /main */}
            <Link href="/main" className="flex items-center">
              <span className="text-2xl lg:text-3xl font-black tracking-tighter text-white">
                Binge<span className="text-[#E50914]">Box</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm lg:text-base font-medium text-white/80 hover:text-white transition-colors rounded-md hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/history"
                className="px-3 py-2 text-sm lg:text-base font-medium text-white/80 hover:text-white transition-colors rounded-md hover:bg-white/10"
              >
                History
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 lg:gap-3">
              <button
                onClick={openSearch}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5 lg:h-6 lg:w-6" />
              </button>

              <div className="hidden sm:flex items-center gap-1">
                <Link
                  href="/bookmarked"
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                  aria-label="Bookmarked"
                >
                  <Bookmark className="h-5 w-5" />
                </Link>
                <Link
                  href="/liked"
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                  aria-label="Liked"
                >
                  <Heart className="h-5 w-5" />
                </Link>
                <Link
                  href="/history"
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                  aria-label="History"
                >
                  <History className="h-5 w-5" />
                </Link>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="hidden md:flex p-2 text-white/80 hover:text-[#E50914] hover:bg-white/10 rounded-md transition-colors"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      <div
        className={`fixed inset-0 z-[55] md:hidden transition-all duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <div
          className={`absolute top-16 left-0 right-0 bg-black/80 backdrop-blur-2xl border-b border-white/10 transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <nav className="flex flex-col py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-6 py-4 text-lg font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/10 my-2" />
            <Link
              href="/history"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-6 py-4 text-lg font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3"
            >
              <History className="h-5 w-5" />
              History
            </Link>
            <Link
              href="/liked"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-6 py-4 text-lg font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3"
            >
              <Heart className="h-5 w-5" />
              Liked
            </Link>
            <Link
              href="/bookmarked"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-6 py-4 text-lg font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3"
            >
              <Bookmark className="h-5 w-5" />
              Bookmarked
            </Link>
            <div className="border-t border-white/10 my-2" />
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="px-6 py-4 text-lg font-medium text-white/90 hover:text-[#E50914] hover:bg-white/10 transition-colors flex items-center gap-3 w-full text-left"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </nav>
        </div>
      </div>
    </>
  );
};
