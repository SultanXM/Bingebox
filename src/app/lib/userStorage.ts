// User storage utilities using localStorage for likes, bookmarks, and history
// No login required - data persists per device

const STORAGE_KEYS = {
  LIKED: 'bingbox_liked',
  BOOKMARKED: 'bingbox_bookmarked',
  HISTORY: 'bingbox_history',
} as const;

export interface StoredMovie {
  id: number;
  title: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv';
  addedAt: string;
}

export interface WatchHistoryItem {
  id: number;
  title: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv';
  watchedAt: string;
  season?: number;
  episode?: number;
  progress?: number;
}

// Generic get function
function getItems<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Generic save function
function saveItems<T>(key: string, items: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// LIKED MOVIES
export function getLikedMovies(): StoredMovie[] {
  return getItems<StoredMovie>(STORAGE_KEYS.LIKED);
}

export function isMovieLiked(id: number): boolean {
  const liked = getLikedMovies();
  return liked.some((m) => m.id === id);
}

export function toggleLikeMovie(movie: {
  id: number;
  title: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv';
}): boolean {
  const liked = getLikedMovies();
  const index = liked.findIndex((m) => m.id === movie.id);
  
  if (index > -1) {
    // Remove from liked
    liked.splice(index, 1);
    saveItems(STORAGE_KEYS.LIKED, liked);
    return false;
  } else {
    // Add to liked
    liked.unshift({
      ...movie,
      addedAt: new Date().toISOString(),
    });
    saveItems(STORAGE_KEYS.LIKED, liked);
    return true;
  }
}

// BOOKMARKED MOVIES
export function getBookmarkedMovies(): StoredMovie[] {
  return getItems<StoredMovie>(STORAGE_KEYS.BOOKMARKED);
}

export function isMovieBookmarked(id: number): boolean {
  const bookmarked = getBookmarkedMovies();
  return bookmarked.some((m) => m.id === id);
}

export function toggleBookmarkMovie(movie: {
  id: number;
  title: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv';
}): boolean {
  const bookmarked = getBookmarkedMovies();
  const index = bookmarked.findIndex((m) => m.id === movie.id);
  
  if (index > -1) {
    // Remove from bookmarked
    bookmarked.splice(index, 1);
    saveItems(STORAGE_KEYS.BOOKMARKED, bookmarked);
    return false;
  } else {
    // Add to bookmarked
    bookmarked.unshift({
      ...movie,
      addedAt: new Date().toISOString(),
    });
    saveItems(STORAGE_KEYS.BOOKMARKED, bookmarked);
    return true;
  }
}

// WATCH HISTORY
export function getWatchHistory(): WatchHistoryItem[] {
  return getItems<WatchHistoryItem>(STORAGE_KEYS.HISTORY);
}

export function addToHistory(item: {
  id: number;
  title: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  progress?: number;
}): void {
  const history = getWatchHistory();
  
  // Remove if already exists (to move to top)
  const filtered = history.filter((h) => {
    if (h.media_type === 'tv' && item.media_type === 'tv') {
      return !(h.id === item.id && h.season === item.season && h.episode === item.episode);
    }
    return h.id !== item.id;
  });
  
  // Add to top
  const historyItem: WatchHistoryItem = {
    id: item.id,
    title: item.title,
    poster_path: item.poster_path,
    media_type: item.media_type,
    season: item.season,
    episode: item.episode,
    progress: item.progress,
    watchedAt: new Date().toISOString(),
  };
  filtered.unshift(historyItem);
  
  // Keep only last 100 items
  const trimmed = filtered.slice(0, 100);
  saveItems(STORAGE_KEYS.HISTORY, trimmed);
}

export function clearHistory(): void {
  saveItems(STORAGE_KEYS.HISTORY, []);
}

export function removeFromHistory(id: number, season?: number, episode?: number): void {
  const history = getWatchHistory();
  const filtered = history.filter((h) => {
    if (h.media_type === 'tv' && season !== undefined) {
      return !(h.id === id && h.season === season && h.episode === episode);
    }
    return h.id !== id;
  });
  saveItems(STORAGE_KEYS.HISTORY, filtered);
}
