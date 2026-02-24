import { Genre } from "./types";

const STORAGE_KEY = "genre_tracking";
const MAX_ENTRIES = 100;

interface GenreClick {
  genreId: number;
  timestamp: number;
}

interface GenreTrackingData {
  movie: GenreClick[];
  tv: GenreClick[];
}

function getTrackingData(): GenreTrackingData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { movie: [], tv: [] };
}

function saveTrackingData(data: GenreTrackingData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function recordGenreClick(
  type: "movie" | "tv",
  genreIds: number[],
) {
  const data = getTrackingData();
  const now = Date.now();
  const newClicks = genreIds.map((genreId) => ({ genreId, timestamp: now }));
  data[type] = [...data[type], ...newClicks].slice(-MAX_ENTRIES);
  saveTrackingData(data);
}

export function getRecentGenreIds(type: "movie" | "tv"): number[] {
  const data = getTrackingData();
  const clicks = [...data[type]].sort((a, b) => b.timestamp - a.timestamp);
  const seen = new Set<number>();
  const result: number[] = [];
  for (const click of clicks) {
    if (!seen.has(click.genreId)) {
      seen.add(click.genreId);
      result.push(click.genreId);
    }
  }
  return result;
}

export function sortGenresByRecency(
  genres: Genre[],
  type: "movie" | "tv",
): Genre[] {
  const recentIds = getRecentGenreIds(type);
  const recentSet = new Map<number, number>();
  recentIds.forEach((id, index) => recentSet.set(id, index));

  const recent: Genre[] = [];
  const rest: Genre[] = [];

  for (const genre of genres) {
    if (recentSet.has(genre.id)) {
      recent.push(genre);
    } else {
      rest.push(genre);
    }
  }

  recent.sort(
    (a, b) => (recentSet.get(a.id) ?? 0) - (recentSet.get(b.id) ?? 0),
  );
  rest.sort((a, b) => a.name.localeCompare(b.name));

  return [...recent, ...rest];
}
