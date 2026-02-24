import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const TMDB_IMAGE_BASE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL;

export const getImageUrl = (path: string | null, size: string = "w500") => {
  return path
    ? `${TMDB_IMAGE_BASE_URL}/${size}${path}`
    : "/placeholder-movie.jpg";
};

export const formatYear = (dateString: string) => {
  return new Date(dateString).getFullYear();
};

export const formatRating = (rating: number) => {
  return rating.toFixed(1);
};

export function formatContentId(
  type: "movie" | "tv",
  id: number,
  season?: number,
  episode?: number,
): string {
  if (type === "movie") return `m${id}`;
  return `t${id}/${season ?? 1}/${episode ?? 1}`;
}

export function parseContentId(contentId: string): {
  type: "movie" | "tv";
  id: number;
  season?: number;
  episode?: number;
} {
  if (contentId.startsWith("m")) {
    return { type: "movie", id: parseInt(contentId.slice(1), 10) };
  }
  // t{id}/{season}/{episode}
  const parts = contentId.split("/");
  const id = parseInt(parts[0].slice(1), 10);
  const season = parts[1] ? parseInt(parts[1], 10) : undefined;
  const episode = parts[2] ? parseInt(parts[2], 10) : undefined;
  return { type: "tv", id, season, episode };
}