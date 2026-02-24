"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { History, Clock, X, Search } from "lucide-react";
import { getWatchHistory, clearHistory, type WatchHistoryItem } from "@/app/lib/userStorage";

export default function HistoryPage() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setHistory(getWatchHistory());
    setIsLoaded(true);
  }, []);

  const handleClearAll = () => {
    if (confirm("Clear all watch history?")) {
      clearHistory();
      setHistory([]);
    }
  };

  const handleRemove = (id: number, season?: number, episode?: number) => {
    const updated = history.filter((h) => {
      if (h.media_type === 'tv' && season !== undefined) {
        return !(h.id === id && h.season === season && h.episode === episode);
      }
      return h.id !== id;
    });
    setHistory(updated);
    localStorage.setItem("bingbox_history", JSON.stringify(updated));
  };

  const filteredHistory = history.filter(h => 
    h.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getImageUrl = (path: string | null, size: string = "w342") => {
    return path
      ? `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL}/${size}${path}`
      : "/placeholder-movie.jpg";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#141414] pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 w-48 bg-white/10 rounded animate-pulse mb-8" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <History className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">History</h1>
              <p className="text-sm text-white/50">{filteredHistory.length} {filteredHistory.length === 1 ? 'item' : 'items'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:bg-white/15"
              />
            </div>
            
            {filteredHistory.length > 0 && !searchQuery && (
              <button
                onClick={handleClearAll}
                className="text-sm text-red-400 hover:text-red-300 transition-colors px-3 py-2 rounded-full hover:bg-red-500/10 whitespace-nowrap"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Clock className="h-12 w-12 text-white/20" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? "No matches found" : "No watch history"}
            </h2>
            <p className="text-gray-400 mb-8 max-w-sm">
              {searchQuery 
                ? "Try a different search term" 
                : "Movies and shows you watch will appear here."}
            </p>
            {!searchQuery && (
              <Link
                href="/main"
                className="bg-[#E50914] hover:bg-[#f40612] text-white px-8 py-2.5 rounded-full font-medium transition-all hover:scale-105"
              >
                Start Watching
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredHistory.map((item, index) => (
              <div
                key={`${item.id}-${item.season}-${item.episode}-${index}`}
                className="group flex items-center gap-4 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
              >
                <Link
                  href={`/${item.media_type}/${item.id}${item.season ? `?season=${item.season}&episode=${item.episode}` : ''}`}
                  className="flex items-center gap-4 flex-1 min-w-0"
                >
                  <div className="w-16 h-24 sm:w-20 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-800 ring-1 ring-white/5">
                    <img
                      src={getImageUrl(item.poster_path, "w154")}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{item.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                      <span className="capitalize bg-white/10 px-2 py-0.5 rounded text-xs">{item.media_type}</span>
                      {item.season && (
                        <span className="text-white/60 text-sm">S{item.season}:E{item.episode}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDate(item.watchedAt)}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => handleRemove(item.id, item.season, item.episode)}
                  className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all"
                  title="Remove from history"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
