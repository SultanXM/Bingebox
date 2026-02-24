"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import DarkVeil from "@/comps/ui/veil_background";
import { useRouter } from "next/navigation";

const MinimalInfoPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const router = useRouter();
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-netflix-black text-white overflow-hidden">
      {/* Mouse-following gradient background */}
      <div
        className="absolute inset-1 opacity-15 pointer-events-none"
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(229, 9, 20, 0.15), transparent 50%)`,
        }}
      />
      <div className="absolute inset-0 z-0">
        <DarkVeil
          noiseIntensity={0.05}
          scanlineIntensity={0.05}
          warpAmount={1.1}
          speed={1.3}
        />
      </div>

      {/* Floating glass elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-netflix-red/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-netflix-red/5 rounded-full blur-[160px] animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-white/4 rounded-full blur-[100px] animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center space-x-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-4 py-2 hover:bg-white/15 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 text-white/80" />
            <span className="text-white/80 font-light">Back</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-lg font-light tracking-wide text-white/90">
              Binge<span className="text-netflix-red">Box</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-screen px-8">
        <div className="max-w-2xl w-full">
          {/* Main Info Card */}
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
            <h1 className="text-4xl md:text-5xl font-extralight tracking-wide mb-8 text-white/95">
              About <span className="text-netflix-red">BingeBox</span>
            </h1>

            <div className="space-y-6 text-white/70 font-light leading-relaxed">
              <p className="text-lg">
                BingeBox is built to provide easy access to the tmdb
                api and provide visualzations of the data. Integrations with
                letterboxd and others are planned. NO streaming will be provided
                and instead will just be a showcase of the data available.
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="text-center">
                <div className="text-sm text-white/50 font-light tracking-widest uppercase mb-2">
                  Contact
                </div>
                <div className="text-white/70 font-light">contact@binge.dev</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Small floating glass dots */}
      <div className="absolute top-1/3 left-16 w-1 h-1 bg-white/20 rounded-full animate-pulse delay-300"></div>
      <div className="absolute bottom-1/3 right-20 w-1.5 h-1.5 bg-white/15 rounded-full animate-pulse delay-1500"></div>
    </div>
  );
};

export default MinimalInfoPage;
