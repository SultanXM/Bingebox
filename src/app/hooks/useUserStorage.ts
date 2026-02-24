"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  getLikedMovies,
  getBookmarkedMovies,
  getWatchHistory,
  isMovieLiked,
  isMovieBookmarked,
  toggleLikeMovie,
  toggleBookmarkMovie,
  addToHistory,
  removeFromHistory,
  clearHistory,
  type StoredMovie,
  type WatchHistoryItem,
} from '@/app/lib/userStorage';

// Hook for liked movies
export function useLikedMovies() {
  const [likedMovies, setLikedMovies] = useState<StoredMovie[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setLikedMovies(getLikedMovies());
    setIsLoaded(true);
  }, []);

  const toggleLike = useCallback((movie: {
    id: number;
    title: string;
    poster_path: string | null;
    media_type: 'movie' | 'tv';
  }) => {
    const isLiked = toggleLikeMovie(movie);
    setLikedMovies(getLikedMovies());
    return isLiked;
  }, []);

  const checkIsLiked = useCallback((id: number) => {
    return isMovieLiked(id);
  }, []);

  return { likedMovies, toggleLike, checkIsLiked, isLoaded };
}

// Hook for bookmarked movies
export function useBookmarkedMovies() {
  const [bookmarkedMovies, setBookmarkedMovies] = useState<StoredMovie[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setBookmarkedMovies(getBookmarkedMovies());
    setIsLoaded(true);
  }, []);

  const toggleBookmark = useCallback((movie: {
    id: number;
    title: string;
    poster_path: string | null;
    media_type: 'movie' | 'tv';
  }) => {
    const isBookmarked = toggleBookmarkMovie(movie);
    setBookmarkedMovies(getBookmarkedMovies());
    return isBookmarked;
  }, []);

  const checkIsBookmarked = useCallback((id: number) => {
    return isMovieBookmarked(id);
  }, []);

  return { bookmarkedMovies, toggleBookmark, checkIsBookmarked, isLoaded };
}

// Hook for watch history
export function useWatchHistory() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setHistory(getWatchHistory());
    setIsLoaded(true);
  }, []);

  const add = useCallback((item: {
    id: number;
    title: string;
    poster_path: string | null;
    media_type: 'movie' | 'tv';
    season?: number;
    episode?: number;
    progress?: number;
  }) => {
    addToHistory(item);
    setHistory(getWatchHistory());
  }, []);

  const remove = useCallback((id: number, season?: number, episode?: number) => {
    removeFromHistory(id, season, episode);
    setHistory(getWatchHistory());
  }, []);

  const clear = useCallback(() => {
    clearHistory();
    setHistory([]);
  }, []);

  return { history, add, remove, clear, isLoaded };
}

// Combined hook for single movie (like + bookmark status)
export function useMovieStatus(movieId: number) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLiked(isMovieLiked(movieId));
    setIsBookmarked(isMovieBookmarked(movieId));
    setIsLoaded(true);
  }, [movieId]);

  const toggleLike = useCallback((movie: {
    id: number;
    title: string;
    poster_path: string | null;
    media_type: 'movie' | 'tv';
  }) => {
    const liked = toggleLikeMovie(movie);
    setIsLiked(liked);
    return liked;
  }, []);

  const toggleBookmark = useCallback((movie: {
    id: number;
    title: string;
    poster_path: string | null;
    media_type: 'movie' | 'tv';
  }) => {
    const bookmarked = toggleBookmarkMovie(movie);
    setIsBookmarked(bookmarked);
    return bookmarked;
  }, []);

  return { isLiked, isBookmarked, toggleLike, toggleBookmark, isLoaded };
}
