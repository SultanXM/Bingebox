"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Genre, GenreRowData, Movie, TVShow } from "../lib/types";
import { discoverByGenre } from "../lib/tmdb";
import HeroBanner from "./HeroBanner";
import ContentRow from "./ContentRow";
import ContentTypeSwitcher, { extractDominantColor } from "../comps/ui/ContentTypeSwitcher";
import type { ContentMode } from "./page";

interface NetflixBrowserProps {
  contentMode: ContentMode;
  heroItems: (Movie | TVShow)[];
  genres: Genre[];
  onSwitchContentMode: (mode: ContentMode) => void;
}

const INITIAL_ROWS = 8;
const MIN_ITEMS_PER_ROW = 12; // Minimum items required per row
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

function isMovie(item: Movie | TVShow): item is Movie {
  return "title" in item;
}

export default function NetflixBrowser({
  contentMode,
  heroItems,
  genres,
  onSwitchContentMode,
}: NetflixBrowserProps) {
  const [genreRows, setGenreRows] = useState<Map<number, GenreRowData>>(
    new Map(),
  );
  const [loadedCount, setLoadedCount] = useState(0);
  const [dominantColor, setDominantColor] = useState<string>();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [seenIds, setSeenIds] = useState<Set<number>>(new Set());
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  // Initialize seen IDs from hero items
  useEffect(() => {
    const ids = new Set(heroItems.map(item => item.id));
    setSeenIds(ids);
  }, [heroItems]);

  // Extract color from current banner image
  useEffect(() => {
    const currentItem = heroItems[currentBannerIndex];
    if (currentItem?.backdrop_path) {
      const imageUrl = `${TMDB_IMAGE_BASE}/original${currentItem.backdrop_path}`;
      extractDominantColor(imageUrl).then(setDominantColor);
    }
  }, [heroItems, currentBannerIndex]);

  // Listen for banner index changes from HeroBanner
  useEffect(() => {
    const handleBannerChange = (e: CustomEvent<{ index: number }>) => {
      setCurrentBannerIndex(e.detail.index);
    };
    window.addEventListener("bannerChange" as any, handleBannerChange);
    return () => window.removeEventListener("bannerChange" as any, handleBannerChange);
  }, []);

  const loadGenreRow = useCallback(
    async (genre: Genre) => {
      try {
        if (contentMode === "all") {
          // Fetch 2 pages to ensure enough items
          const [movieData1, movieData2, tvData1, tvData2] = await Promise.all([
            discoverByGenre("movie", genre.id, 1),
            discoverByGenre("movie", genre.id, 2),
            discoverByGenre("tv", genre.id, 1),
            discoverByGenre("tv", genre.id, 2),
          ]);
          
          // Merge all results and filter out seen IDs
          const merged = [
            ...movieData1.results, 
            ...movieData2.results,
            ...tvData1.results, 
            ...tvData2.results
          ]
            .filter((item) => !seenIds.has(item.id))
            .sort((a, b) => b.popularity - a.popularity);
          
          // Add new IDs to seen
          merged.forEach(item => seenIds.add(item.id));
          
          // Require at least MIN_ITEMS_PER_ROW items
          if (merged.length < MIN_ITEMS_PER_ROW) return null;
          
          const row: GenreRowData = {
            genre,
            items: merged.slice(0, 24), // Limit to 24 items max
            page: 2,
            totalPages: Math.max(movieData1.total_pages, tvData1.total_pages),
          };
          return row;
        } else {
          // Fetch 2 pages to ensure enough items
          const [data1, data2] = await Promise.all([
            discoverByGenre(contentMode, genre.id, 1),
            discoverByGenre(contentMode, genre.id, 2),
          ]);
          
          // Merge results and filter out seen IDs
          const filtered = [...data1.results, ...data2.results]
            .filter((item) => !seenIds.has(item.id))
            .sort((a, b) => b.popularity - a.popularity);
          
          // Add new IDs to seen
          filtered.forEach(item => seenIds.add(item.id));
          
          // Require at least MIN_ITEMS_PER_ROW items
          if (filtered.length < MIN_ITEMS_PER_ROW) return null;
          
          const row: GenreRowData = {
            genre,
            items: filtered.slice(0, 24), // Limit to 24 items max
            page: 2,
            totalPages: data1.total_pages,
          };
          return row;
        }
      } catch {
        return null;
      }
    },
    [contentMode, seenIds],
  );

  const loadBatch = useCallback(
    async (startIndex: number, count: number) => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      const batch = genres.slice(startIndex, startIndex + count);
      const results = await Promise.all(batch.map(loadGenreRow));

      setGenreRows((prev) => {
        const next = new Map(prev);
        results.forEach((row) => {
          if (row) next.set(row.genre.id, row);
        });
        return next;
      });
      setLoadedCount(startIndex + count);
      loadingRef.current = false;
    },
    [genres, loadGenreRow],
  );

  useEffect(() => {
    setGenreRows(new Map());
    setLoadedCount(0);
    loadingRef.current = false;
    if (genres.length > 0) {
      loadBatch(0, INITIAL_ROWS);
    }
  }, [genres, contentMode, loadBatch]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          loadedCount < genres.length &&
          !loadingRef.current
        ) {
          loadBatch(loadedCount, 3);
        }
      },
      { rootMargin: "400px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadedCount, genres.length, loadBatch]);

  const rows = genres
    .slice(0, loadedCount)
    .map((g) => genreRows.get(g.id))
    .filter((r): r is GenreRowData => r != null && r.items.length >= MIN_ITEMS_PER_ROW);

  return (
    <div className="min-h-screen bg-[#141414]">
      <HeroBanner items={heroItems} />

      {/* Switcher - floating between banner and content */}
      <div className="relative z-30 -mt-8 flex justify-center px-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <ContentTypeSwitcher 
          selected={contentMode} 
          onSwitch={onSwitchContentMode}
          dominantColor={dominantColor}
        />
      </div>

      {/* Content rows with staggered animation */}
      <div className="relative z-20 pt-6">
        {rows.map((row, index) => (
          <div 
            key={row.genre.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${150 + index * 50}ms` }}
          >
            <ContentRow
              title={row.genre.name}
              items={row.items}
              contentType={contentMode === "all" ? undefined : contentMode}
            />
          </div>
        ))}

        {loadedCount < genres.length && (
          <div ref={sentinelRef} className="h-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/20 border-t-white" />
          </div>
        )}
      </div>
    </div>
  );
}
