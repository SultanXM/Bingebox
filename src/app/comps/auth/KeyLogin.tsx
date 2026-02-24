"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, KeyRound, AlertCircle } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";

const movieBackdrops = [
  "/AuUAB6bHEltolSvbBslfNSgsRIm.jpg",
  "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
  "/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
  "/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
  "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
  "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
];

export default function KeyLogin() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const getImageUrl = (path: string) => {
    return `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL}/original${path}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 400));

    const result = login(key);

    if (result.success) {
      router.push("/main");
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] relative overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0">
        {/* Background Image with blur */}
        <div className="absolute inset-0 opacity-40">
          <img
            src={getImageUrl(movieBackdrops[0])}
            alt=""
            className="w-full h-full object-cover blur-3xl scale-110"
          />
        </div>

        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/70 to-[#141414]/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/80 via-transparent to-[#141414]/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm px-6">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter">
            Binge<span className="text-[#E50914]">Box</span>
          </h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Key Input */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
              <KeyRound className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter access key"
              className="w-full bg-black/40 backdrop-blur-sm border border-white/10 rounded-md py-3.5 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#E50914]/50 focus:ring-1 focus:ring-[#E50914]/50 transition-all duration-200"
              autoFocus
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-[#E50914] text-sm animate-fade-in">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !key.trim()}
            className="w-full flex items-center justify-center gap-2 bg-[#E50914] hover:bg-[#f40612] disabled:bg-white/10 disabled:cursor-not-allowed text-white py-3 rounded-md font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Play className="h-4 w-4 fill-white" />
                Start Watching
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
