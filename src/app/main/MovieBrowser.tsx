"use client";
import { useState, useEffect } from "react";
import { Star, Calendar, Play } from "lucide-react";
import Image from "next/image";
import { getImageUrl, formatYear, formatRating } from "../lib/utils";

import { Movie } from "../lib/types";

interface MovieBrowserProps {
  initialMovies: Movie[];
  initialPage: number;
}

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

export default function MovieBrowser({
  initialMovies = [],
  initialPage = 1,
}: MovieBrowserProps) {
  const [hoveredMovie, setHoveredMovie] = useState<number | null>(null);
  const [allMovies, setAllMovies] = useState<Movie[]>(initialMovies);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAllMovies(initialMovies);
  }, [initialMovies]);

  const handleMovieClick = (movieId: number) => {
    window.location.href = `/movie/${movieId}`;
  };

  const loadMoreMovies = async () => {
    if (!API_KEY) {
      console.error(
        "NEXT_PUBLIC_TMDB_API_KEY is not set for loading more movies.",
      );
      return;
    }
    setIsLoading(true);
    try {
      const nextPage = currentPage + 1;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/discover/movie?&page=${nextPage}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            accept: "application/json",
          },
        },
      );
      const data = await response.json();
      const additionalMovies = data.results || [];

      setAllMovies((prev) => [...prev, ...additionalMovies]);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error("Failed to load more movies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Movie Grid */}
      <main className="px-6 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {allMovies.map((movie) => (
            <div
              key={movie.id}
              className="group relative cursor-pointer"
              onMouseEnter={() => setHoveredMovie(movie.id)}
              onMouseLeave={() => setHoveredMovie(null)}
              onClick={() => handleMovieClick(movie.id)}
            >
              {/* Movie poster container */}
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-gray-800 transition-all duration-300 group-hover:scale-[1.02] group-hover:ring-1 group-hover:ring-white/30">
                <Image
                  src={getImageUrl(movie.poster_path)}
                  alt={movie.title}
                  width={500}
                  height={750}
                  className="w-full h-full object-cover"
                />

                {/* Overlay on hover */}
                <div
                  className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ${
                    hoveredMovie === movie.id ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">
                          {formatRating(movie.vote_average)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="h-4 w-4 text-gray-300" />
                        <span className="text-sm">
                          {formatYear(movie.release_date)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs leading-relaxed line-clamp-3 text-gray-200">
                        {movie.overview}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMovieClick(movie.id);
                        }}
                        className="w-full bg-white text-black hover:bg-gray-200 rounded-lg py-2 px-3 text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Watch Now
                      </button>
                    </div>
                  </div>
                </div>

                {/* Gradient overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
              </div>

              {/* Movie title */}
              <div className="mt-3 px-1">
                <h3 className="text-gray-300 font-medium text-sm leading-tight line-clamp-2 group-hover:text-white transition-colors duration-200">
                  {movie.title}
                </h3>
                <p className="text-gray-400 text-xs mt-1">
                  {formatYear(movie.release_date)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Load more indicator */}
        <div className="mt-12 text-center">
          <button
            onClick={loadMoreMovies}
            disabled={isLoading}
            className="backdrop-blur-xl bg-black/30 border border-white/20 rounded-xl px-6 py-3 text-white hover:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading...
              </>
            ) : (
              "Load More Movies"
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
