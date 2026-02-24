"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Star, X } from "lucide-react";
import { getImageUrl, formatYear, formatRating } from "@/lib/utils";
import { MultiSearchResult } from "@/lib/types";
import { Movie, TVShow } from "@/lib/types";
import { useSearch } from "@/app/comps/search/SearchProvider";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

interface SearchResultItem {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
  media_type: "movie" | "tv";
}

export default function MovieSearch() {
  const { closeSearch } = useSearch();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  // Save recent search
  const saveRecentSearch = (q: string) => {
    if (!q.trim()) return;
    const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // Autofocus
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleClose = useCallback(() => {
    closeSearch();
    setQuery("");
    setSearchResults([]);
  }, [closeSearch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  // Search API
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim()) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        if (!API_KEY) {
          console.error("NEXT_PUBLIC_TMDB_API_KEY is not set");
          setIsSearching(false);
          return;
        }
        try {
          const url = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/search/multi?query=${encodeURIComponent(query)}`;
          const response = await fetch(url, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              accept: "application/json",
            },
          });
          const data = await response.json();
          const results = data.results
            .filter(
              (item: MultiSearchResult): item is
                | (Movie & { media_type: "movie" })
                | (TVShow & { media_type: "tv" }) =>
                item.media_type === "movie" || item.media_type === "tv",
            )
            .map((item: (Movie & { media_type: "movie" }) | (TVShow & { media_type: "tv" })) => {
              if (item.media_type === "movie") {
                return {
                  id: item.id,
                  title: item.title,
                  release_date: item.release_date,
                  poster_path: item.poster_path,
                  vote_average: item.vote_average,
                  media_type: "movie",
                };
              } else {
                return {
                  id: item.id,
                  title: item.name,
                  release_date: item.first_air_date,
                  poster_path: item.poster_path,
                  vote_average: item.vote_average,
                  media_type: "tv",
                };
              }
            });
          setSearchResults(results.slice(0, 10));
          saveRecentSearch(query);
        } catch (error) {
          console.error("Search failed:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 400);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (searchResults.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % searchResults.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          handleResultClick(searchResults[selectedIndex]);
        }
      }
    }
  };

  const handleResultClick = (item: SearchResultItem) => {
    if (item.media_type === "movie") {
      window.location.href = `/movie/${item.id}`;
    } else {
      window.location.href = `/tv/${item.id}`;
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200">
      {/* Header - Glass */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 bg-black/20 backdrop-blur-xl border-b border-white/5">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Search</h2>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Close search"
        >
          <X className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Search Input */}
      <div className="px-4 sm:px-8 py-6 sm:py-10">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Titles, people, genres"
              className="w-full bg-transparent border-b-2 border-gray-600 focus:border-white text-white text-2xl sm:text-4xl lg:text-5xl font-light py-4 pl-10 sm:pl-14 pr-4 placeholder:text-gray-500 focus:outline-none transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="px-4 sm:px-8 pb-8 overflow-y-auto h-[calc(100vh-200px)]">
        <div className="max-w-4xl mx-auto">
          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="mb-8">
              <h3 className="text-gray-400 text-sm sm:text-base mb-4">Recent Searches</h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {isSearching && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
            </div>
          )}

          {/* Results Grid */}
          {!isSearching && searchResults.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {searchResults.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => handleResultClick(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`group cursor-pointer transition-transform duration-200 hover:scale-105 ${
                    selectedIndex === index ? "scale-105" : ""
                  }`}
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-neutral-800">
                    {item.poster_path ? (
                      <img
                        src={getImageUrl(item.poster_path, "w342")}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <span className="text-sm">No Image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="mt-2">
                    <h4 className="text-white text-sm sm:text-base font-medium truncate">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-400 text-xs sm:text-sm">
                        {formatYear(item.release_date)}
                      </span>
                      <span className="text-gray-600">•</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-gray-400 text-xs sm:text-sm">
                          {formatRating(item.vote_average)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isSearching && query && searchResults.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">
                No results found for &quot;{query}&quot;
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Try checking your spelling or use different keywords
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
