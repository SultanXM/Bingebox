"use client";
import { useState, useRef, useEffect } from "react";
import { Star, Play, Calendar } from "lucide-react";
import { formatRating, formatYear } from "../lib/utils";
import { recordGenreClick } from "../lib/genreTracking";
import { Movie, TVShow } from "../lib/types";

interface ContentCardProps {
  item: Movie | TVShow;
  contentType?: "movie" | "tv";
  index?: number;
}

function isMovie(item: Movie | TVShow): item is Movie {
  return "title" in item;
}

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export default function ContentCard({ item, contentType: contentTypeProp, index = 0 }: ContentCardProps) {
  const contentType = contentTypeProp ?? (isMovie(item) ? "movie" : "tv");
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const title = isMovie(item) ? item.title : item.name;
  const date = isMovie(item) ? item.release_date : item.first_air_date;

  const handleClick = () => {
    if (item.genre_ids) recordGenreClick(contentType, item.genre_ids);
    window.location.href = `/${contentType}/${item.id}`;
  };

  const getPosterUrl = (path: string | null, size: string = "w342") => {
    if (!path) return null;
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  };

  // Staggered animation delay based on index
  const animationDelay = Math.min(index * 50, 300);

  if (imageError) {
    return null;
  }

  return (
    <div
      ref={cardRef}
      className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: `${animationDelay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Container */}
      <div 
        className="relative aspect-[2/3] rounded-lg overflow-hidden bg-neutral-800 cursor-pointer group"
        onClick={handleClick}
      >
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-neutral-800 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-shimmer" />
          </div>
        )}

        {/* Poster Image - Blur on hover */}
        {item.poster_path && (
          <img
            src={getPosterUrl(item.poster_path, "w342") ?? undefined}
            alt={title}
            className={`w-full h-full object-cover transition-all duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            } ${isHovered ? "scale-105 blur-sm" : "scale-100 blur-0"}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}

        {/* Rating Badge - Hidden on hover */}
        <div className={`absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded transition-opacity duration-300 ${isHovered ? "opacity-0" : "opacity-100"}`}>
          <Star className="h-3 w-3 text-yellow-400 fill-current" />
          <span className="text-white text-xs font-medium">{formatRating(item.vote_average)}</span>
        </div>

        {/* Hover Overlay - Banner Style */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Content positioned at bottom like banner */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
            {/* Rating and Year */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1 text-white/90">
                <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-semibold">{formatRating(item.vote_average)}</span>
              </div>
              {date && (
                <div className="flex items-center gap-1 text-white/60">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-xs">{formatYear(date)}</span>
                </div>
              )}
            </div>

            {/* Description - Smaller on mobile */}
            <p className="text-white/70 text-[10px] sm:text-xs line-clamp-3 mb-2 sm:mb-3 leading-relaxed">
              {item.overview || "No description available."}
            </p>

            {/* Watch Now Button - Same style as banner, one line on mobile */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className="flex items-center gap-1.5 sm:gap-2 bg-[#E50914] hover:bg-[#f40612] text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded font-semibold text-[10px] sm:text-xs whitespace-nowrap transition-all duration-200 hover:scale-105"
            >
              <Play className="h-3 w-3 sm:h-4 sm:w-4 fill-white" />
              Watch Now
            </button>
          </div>
        </div>
      </div>

      {/* Title Below Card */}
      <div className="mt-2 px-0.5">
        <h3 className="text-white/90 text-sm font-medium truncate group-hover:text-white transition-colors">
          {title}
        </h3>
        <p className="text-white/50 text-xs mt-0.5">
          {isMovie(item) ? "Movie" : "TV Series"}
        </p>
      </div>
    </div>
  );
}
