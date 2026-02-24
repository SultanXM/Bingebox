"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearch } from "@/app/comps/search/SearchProvider";
import { Search, Menu, X } from "lucide-react";
import { NavLink } from "@/app/lib/types";

const Logo = () => (
  <Link href="/" className="flex items-center justify-center">
    <span className="text-xl md:text-2xl font-black tracking-tight text-white">
      Binge<span className="text-netflix-red">Box</span>
    </span>
  </Link>
);

const NavLinks = ({ navLinks }: { navLinks: NavLink[] }) => {
  return (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-netflix-light-gray hover:text-white transition-colors text-sm font-medium"
        >
          {link.label}
        </Link>
      ))}
    </>
  );
};

const MobileNav = ({
  navLinks,
  isOpen,
  onClose,
}: {
  navLinks: NavLink[];
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-netflix-black/95 backdrop-blur-lg z-40">
      <div className="flex justify-end p-4">
        <button onClick={onClose}>
          <X className="h-6 w-6 text-white" />
        </button>
      </div>
      <div className="flex flex-col items-center justify-center gap-6 h-[calc(100%-4rem)]">
        {/* Mobile Logo */}
        <div className="mb-8">
          <span className="text-3xl font-black tracking-tight text-white">
            Binge<span className="text-netflix-red">Box</span>
          </span>
        </div>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-2xl font-bold text-white"
            onClick={onClose}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export const Header = ({ navLinks }: { navLinks?: NavLink[] }) => {
  const { openSearch } = useSearch();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLHeadElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      setIsScrolled(currentScrollPos > 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const defaultNavLinks: NavLink[] = [
    { href: "https://binge.dev", label: "Home" },
    { href: "/main", label: "Movies/TV" },
  ];

  const links = navLinks || defaultNavLinks;

  return (
    <>
      <header
        ref={headerRef}
        className={`flex items-center justify-between p-4 transition-all duration-300 rounded-full mx-auto backdrop-blur-xl bg-netflix-black/50 border border-white/10 fixed left-0 right-0 z-50 bottom-4 md:bottom-auto md:top-4 ${
          isScrolled ? "max-w-2xl" : "max-w-4xl"
        }`}
      >
        <div className="relative z-10 flex items-center gap-6">
          <Logo />
          <div className="w-px h-6 bg-white/20" />
          <div className="hidden md:flex items-center gap-6">
            <NavLinks navLinks={links} />
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <button
            onClick={openSearch}
            title="Search"
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group hover:bg-white/10"
          >
            <Search className="h-5 w-5 text-netflix-light-gray group-hover:text-white" />
          </button>
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all duration-200 group"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-netflix-light-gray group-hover:text-white" />
              ) : (
                <Menu className="h-5 w-5 text-netflix-light-gray group-hover:text-white" />
              )}
            </button>
          </div>
        </div>
      </header>
      <MobileNav
        navLinks={links}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
};
