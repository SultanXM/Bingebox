"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Star, Calendar } from "lucide-react";
import { formatRating, formatYear } from "../lib/utils";
import { recordGenreClick } from "../lib/genreTracking";
import { Movie, TVShow } from "../lib/types";

interface HeroBannerProps {
  items: (Movie | TVShow)[];
}

function isMovie(item: Movie | TVShow): item is Movie {
  return "title" in item;
}

const ROTATION_INTERVAL = 8000;
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

function dispatchBannerChange(index: number) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("bannerChange", { detail: { index } }));
  }
}

export default function HeroBanner({ items }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set());

  const validItems = items.filter((item, index) => {
    if (imageErrors.has(index)) return false;
    return item.backdrop_path && item.backdrop_path.length > 5;
  });

  const currentItem = validItems[currentIndex] || items[0];
  const title = currentItem ? (isMovie(currentItem) ? currentItem.title : currentItem.name) : "";
  
  const rating = currentItem?.vote_average ? formatRating(currentItem.vote_average) : null;
  const year = currentItem 
    ? formatYear(isMovie(currentItem) ? currentItem.release_date : currentItem.first_air_date)
    : null;

  const getBackdropUrl = (path: string | null, size: string = "original") => {
    if (!path) return "";
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  };

  const handleWatch = useCallback(() => {
    if (!currentItem) return;
    const contentType = isMovie(currentItem) ? "movie" : "tv";
    recordGenreClick(contentType, currentItem.genre_ids);
    window.location.href = `/${contentType}/${currentItem.id}`;
  }, [currentItem]);

  const handleImageLoad = (index: number) => {
    setImagesLoaded((prev) => new Set([...prev, index]));
  };

  const handleImageError = (itemId: number, index: number) => {
    setImageErrors((prev) => new Set([...prev, index]));
  };

  useEffect(() => {
    dispatchBannerChange(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    if (validItems.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % validItems.length);
        setIsTransitioning(false);
      }, 500);
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [validItems.length]);

  useEffect(() => {
    setCurrentIndex(0);
    dispatchBannerChange(0);
  }, [items]);

  if (validItems.length === 0) {
    return (
      <div className="relative h-[75vh] md:h-[85vh] w-full bg-gradient-to-b from-neutral-900 to-[#141414] flex items-center justify-center">
        <div className="text-white/30 text-lg">No featured content available</div>
      </div>
    );
  }

  return (
    <div className="relative h-[75vh] md:h-[85vh] w-full overflow-hidden">
      {/* Background Images */}
      {validItems.map((item, index) => {
        const isActive = index === currentIndex;
        const isNext = index === (currentIndex + 1) % validItems.length;
        const shouldRender = isActive || isNext || imagesLoaded.has(index);
        
        if (!shouldRender) return null;
        
        return (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getBackdropUrl(item.backdrop_path, "original")}
              alt={isMovie(item) ? item.title : item.name}
              className="w-full h-full object-cover object-top"
              onLoad={() => handleImageLoad(index)}
              onError={() => handleImageError(item.id, index)}
            />
          </div>
        );
      })}

      {/* Gradient - lighter at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 via-70% to-transparent z-20" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/60 via-transparent to-transparent z-20" />

      {/* Content - positioned to bring button closer to switcher */}
      <div className="absolute bottom-8 left-0 right-0 p-[4%] z-30">
        <div className="max-w-xl">
          <h1
            className={`text-2xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3 transition-all duration-500 ${
              isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
            }`}
          >
            {title}
          </h1>

          <div
            className={`flex items-center gap-3 mb-3 transition-all duration-500 delay-75 ${
              isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
            }`}
          >
            {rating && (
              <div className="flex items-center gap-1 text-white/90 text-sm">
                <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">{rating}</span>
              </div>
            )}
            {year && (
              <div className="flex items-center gap-1 text-white/60 text-sm">
                <span>{year}</span>
              </div>
            )}
          </div>

          <p
            className={`text-sm md:text-base text-white/70 line-clamp-3 max-w-lg mb-4 transition-all duration-500 delay-100 ${
              isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
            }`}
          >
            {currentItem.overview}
          </p>

          <div
            className={`transition-all duration-500 delay-150 ${
              isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
            }`}
          >
            <button
              onClick={handleWatch}
              className="flex items-center gap-2 bg-[#E50914] hover:bg-[#f40612] text-white px-5 py-2 rounded font-semibold text-sm transition-all duration-200 hover:scale-105"
            >
              <Play className="h-4 w-4 fill-white" />
              Stream Now
            </button>
          </div>
        </div>
      </div>

      {/* No dots - removed completely */}
    </div>
  );
}
