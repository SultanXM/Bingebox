"use client";

import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-[#141414] border-t border-white/10 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center justify-center gap-3">
          {/* Logo */}
          <Link href="/" className="text-xl font-black tracking-tight text-white hover:opacity-90 transition-opacity">
            Binge<span className="text-[#E50914]">Box</span>
          </Link>
          
          {/* Copyright */}
          <p className="text-sm text-white/50">
            &copy; {new Date().getFullYear()} BingeBox
          </p>
        </div>
      </div>
    </footer>
  );
};
