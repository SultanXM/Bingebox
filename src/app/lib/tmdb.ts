import { Movie, TVShow, Genre } from "./types";

interface TmdbResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

interface GenreListResponse {
  genres: Genre[];
}

// Kids/Animation genre IDs to exclude
const EXCLUDED_GENRES = "16,10762"; // Animation, Kids

async function tmdbFetch<T>(endpoint: string): Promise<T> {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_TMDB_API_KEY is not set");
  }
  const baseUrl = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
  const res = await fetch(`${baseUrl}${endpoint}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      accept: "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`TMDB request failed: ${res.status} ${endpoint}`);
  }
  return res.json();
}

export async function getGenreList(type: "movie" | "tv"): Promise<Genre[]> {
  const data = await tmdbFetch<GenreListResponse>(`/genre/${type}/list`);
  // Filter out kids/animation genres
  return data.genres.filter(
    (g) => g.id !== 16 && g.id !== 10762
  );
}

export async function getTrending(
  type: "movie" | "tv",
): Promise<(Movie | TVShow)[]> {
  const data = await tmdbFetch<TmdbResponse<Movie | TVShow>>(
    `/trending/${type}/week?without_genres=${EXCLUDED_GENRES}`,
  );
  return data.results;
}

interface TmdbDetailBase {
  genres?: { id: number; name: string }[];
  genre_ids?: number[];
}

export async function getMovieBasic(id: number): Promise<Movie | null> {
  try {
    const data = await tmdbFetch<Movie & TmdbDetailBase>(`/movie/${id}`);
    if (!data.genre_ids && data.genres) {
      data.genre_ids = data.genres.map((g) => g.id);
    }
    // Filter out kids content
    if (data.genre_ids?.some((id) => id === 16 || id === 10762)) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function getTVBasic(id: number): Promise<TVShow | null> {
  try {
    const data = await tmdbFetch<TVShow & TmdbDetailBase>(`/tv/${id}`);
    if (!data.genre_ids && data.genres) {
      data.genre_ids = data.genres.map((g) => g.id);
    }
    // Filter out kids content
    if (data.genre_ids?.some((id) => id === 16 || id === 10762)) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function discoverByGenre(
  type: "movie" | "tv",
  genreId: number,
  page: number = 1,
): Promise<TmdbResponse<Movie | TVShow>> {
  // API-level filtering: exclude animation and kids genres
  return tmdbFetch<TmdbResponse<Movie | TVShow>>(
    `/discover/${type}?with_genres=${genreId}&without_genres=${EXCLUDED_GENRES}&sort_by=popularity.desc&page=${page}&include_adult=false`,
  );
}

// Get top rated movies for banner (high quality content with good ratings)
export async function getTopRated(
  type: "movie" | "tv",
): Promise<(Movie | TVShow)[]> {
  const data = await tmdbFetch<TmdbResponse<Movie | TVShow>>(
    `/${type}/top_rated?without_genres=${EXCLUDED_GENRES}`,
  );
  return data.results;
}

// Get now playing/upcoming movies for banner (fresh content)
export async function getNowPlaying(
  type: "movie" | "tv",
): Promise<(Movie | TVShow)[]> {
  const endpoint = type === "movie" ? "/movie/now_playing" : "/tv/on_the_air";
  const data = await tmdbFetch<TmdbResponse<Movie | TVShow>>(
    `${endpoint}?without_genres=${EXCLUDED_GENRES}`,
  );
  return data.results;
}

// Get popular movies for banner (most viewed)
export async function getPopular(
  type: "movie" | "tv",
): Promise<(Movie | TVShow)[]> {
  const data = await tmdbFetch<TmdbResponse<Movie | TVShow>>(
    `/${type}/popular?without_genres=${EXCLUDED_GENRES}`,
  );
  return data.results;
}

// Get similar movies
export async function getSimilarMovies(
  movieId: number,
): Promise<Movie[]> {
  const data = await tmdbFetch<TmdbResponse<Movie>>(
    `/movie/${movieId}/similar?without_genres=${EXCLUDED_GENRES}`,
  );
  return data.results.slice(0, 12);
}

// Get similar TV shows
export async function getSimilarTV(
  tvId: number,
): Promise<TVShow[]> {
  const data = await tmdbFetch<TmdbResponse<TVShow>>(
    `/tv/${tvId}/similar?without_genres=${EXCLUDED_GENRES}`,
  );
  return data.results.slice(0, 12);
}

// Get movie recommendations
export async function getMovieRecommendations(
  movieId: number,
): Promise<Movie[]> {
  const data = await tmdbFetch<TmdbResponse<Movie>>(
    `/movie/${movieId}/recommendations?without_genres=${EXCLUDED_GENRES}`,
  );
  return data.results.slice(0, 12);
}

// Get TV recommendations
export async function getTVRecommendations(
  tvId: number,
): Promise<TVShow[]> {
  const data = await tmdbFetch<TmdbResponse<TVShow>>(
    `/tv/${tvId}/recommendations?without_genres=${EXCLUDED_GENRES}`,
  );
  return data.results.slice(0, 12);
}

// Get movie credits (cast)
export async function getMovieCredits(
  movieId: number,
): Promise<{ cast: Array<{ id: number; name: string; character: string; profile_path: string | null }> }> {
  const data = await tmdbFetch<{ cast: Array<{ id: number; name: string; character: string; profile_path: string | null }> }>(
    `/movie/${movieId}/credits`,
  );
  return { cast: data.cast.slice(0, 10) };
}

// Get TV credits (cast)
export async function getTVCredits(
  tvId: number,
): Promise<{ cast: Array<{ id: number; name: string; character: string; profile_path: string | null }> }> {
  const data = await tmdbFetch<{ cast: Array<{ id: number; name: string; character: string; profile_path: string | null }> }>(
    `/tv/${tvId}/credits`,
  );
  return { cast: data.cast.slice(0, 10) };
}

// Get movie images (backdrops/posters)
export async function getMovieImages(
  movieId: number,
): Promise<{ backdrops: Array<{ file_path: string }> }> {
  const data = await tmdbFetch<{ backdrops: Array<{ file_path: string }> }>(
    `/movie/${movieId}/images`,
  );
  return { backdrops: data.backdrops.slice(0, 8) };
}

// Get TV images
export async function getTVImages(
  tvId: number,
): Promise<{ backdrops: Array<{ file_path: string }> }> {
  const data = await tmdbFetch<{ backdrops: Array<{ file_path: string }> }>(
    `/tv/${tvId}/images`,
  );
  return { backdrops: data.backdrops.slice(0, 8) };
}
