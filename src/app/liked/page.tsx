"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Trash2, Search } from "lucide-react";
import { getLikedMovies, type StoredMovie } from "@/app/lib/userStorage";

export default function LikedPage() {
  const [likedMovies, setLikedMovies] = useState<StoredMovie[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLikedMovies(getLikedMovies());
    setIsLoaded(true);
  }, []);

  const handleRemove = (id: number) => {
    const updated = likedMovies.filter((m) => m.id !== id);
    setLikedMovies(updated);
    localStorage.setItem("bingbox_liked", JSON.stringify(updated));
  };

  const filteredMovies = likedMovies.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getImageUrl = (path: string | null, size: string = "w342") => {
    return path
      ? `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL}/${size}${path}`
      : "/placeholder-movie.jpg";
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#141414] pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-48 bg-white/10 rounded animate-pulse mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E50914]/20 rounded-xl flex items-center justify-center">
              <Heart className="h-5 w-5 text-[#E50914] fill-[#E50914]" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Liked</h1>
              <p className="text-sm text-white/50">{filteredMovies.length} {filteredMovies.length === 1 ? 'title' : 'titles'}</p>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search liked..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:bg-white/15"
            />
          </div>
        </div>

        {filteredMovies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Heart className="h-12 w-12 text-white/20" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? "No matches found" : "No liked movies yet"}
            </h2>
            <p className="text-gray-400 mb-8 max-w-sm">
              {searchQuery 
                ? "Try a different search term" 
                : "Movies and shows you like will appear here for quick access."}
            </p>
            {!searchQuery && (
              <Link
                href="/main"
                className="bg-[#E50914] hover:bg-[#f40612] text-white px-8 py-2.5 rounded-full font-medium transition-all hover:scale-105"
              >
                Browse Movies
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredMovies.map((movie) => (
              <div key={movie.id} className="group relative">
                <Link
                  href={`/${movie.media_type}/${movie.id}`}
                  className="block aspect-[2/3] rounded-xl overflow-hidden bg-neutral-800 relative ring-1 ring-white/5"
                >
                  <img
                    src={getImageUrl(movie.poster_path, "w342")}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white text-sm font-medium line-clamp-2">{movie.title}</p>
                    <p className="text-white/50 text-xs capitalize mt-0.5">{movie.media_type}</p>
                  </div>
                </Link>
                <button
                  onClick={() => handleRemove(movie.id)}
                  className="absolute top-2 right-2 p-2 bg-black/70 hover:bg-[#E50914] text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                  title="Remove from liked"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
