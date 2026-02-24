import MovieDetailClient from "./MovieDetailClient";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const movie = await getMovieDetails(id);
  return {
    title: movie ? movie.title : "Movie not found",
  };
}

interface MovieDetails {
  adult: boolean;
  backdrop_path: string;
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string;
    backdrop_path: string;
  } | null;
  budget: number;
  genres: Array<{ id: number; name: string }>;
  homepage: string;
  id: number;
  imdb_id: string;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: Array<{
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }>;
  production_countries: Array<{ iso_3166_1: string; name: string }>;
  release_date: string;
  revenue: number;
  runtime: number;
  spoken_languages: Array<{
    english_name: string;
    iso_639_1: string;
    name: string;
  }>;
  status: string;
  tagline: string | null;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

interface SimilarMovie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  backdrop_path: string;
  overview: string;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_title: string;
  video: boolean;
  vote_count: number;
}

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

const API_KEY = process.env.TMDB_API_KEY;

async function getMovieDetails(movieId: string): Promise<MovieDetails | null> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error("TMDB_API_KEY environment variable is not set.");
    return null;
  }

  if (!/^\d+$/.test(movieId)) {
    console.warn(`Invalid movie ID format: ${movieId}. Expected numeric ID.`);
    return null;
  }

  const url = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/movie/${movieId}?language=en-US`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        xDontStealMyApiKey:
          "this isnt my key and i found it the same way you did so feel free to take it",
        Authorization: `Bearer ${API_KEY}`,
        accept: "application/json",
      },
    });
    if (!res.ok) {
      console.error(
        `Failed to fetch movie details for ID ${movieId}. Status: ${res.status}`,
      );
      return null;
    }
    return res.json();
  } catch (error) {
    console.error(
      `An error occurred while fetching movie details for ID ${movieId}:`,
      error,
    );
    return null;
  }
}

async function getSimilarMovies(movieId: string): Promise<SimilarMovie[]> {
  if (!API_KEY) return [];
  
  const url = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/movie/${movieId}/similar?language=en-US&page=1`;
  
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        accept: "application/json",
      },
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) return [];
    const data = await res.json();
    return data.results?.slice(0, 12) || [];
  } catch {
    return [];
  }
}

async function getRecommendations(movieId: string): Promise<SimilarMovie[]> {
  if (!API_KEY) return [];
  
  const url = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/movie/${movieId}/recommendations?language=en-US&page=1`;
  
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        accept: "application/json",
      },
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) return [];
    const data = await res.json();
    return data.results?.slice(0, 12) || [];
  } catch {
    return [];
  }
}

async function getMovieCredits(movieId: string): Promise<CastMember[]> {
  if (!API_KEY) return [];
  
  const url = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/movie/${movieId}/credits?language=en-US`;
  
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        accept: "application/json",
      },
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) return [];
    const data = await res.json();
    return data.cast?.slice(0, 10) || [];
  } catch {
    return [];
  }
}

async function getMovieImages(movieId: string): Promise<Array<{ file_path: string }>> {
  if (!API_KEY) return [];
  
  const url = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/movie/${movieId}/images`;
  
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        accept: "application/json",
      },
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) return [];
    const data = await res.json();
    return data.backdrops?.slice(0, 8) || [];
  } catch {
    return [];
  }
}

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const [movie, similarMovies, recommendations, cast, images] = await Promise.all([
    getMovieDetails(id),
    getSimilarMovies(id),
    getRecommendations(id),
    getMovieCredits(id),
    getMovieImages(id),
  ]);

  if (!movie) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-20">
        <h1 className="text-2xl">Movie not found.</h1>
      </div>
    );
  }
  
  return (
    <MovieDetailClient 
      movie={movie} 
      similarMovies={similarMovies}
      recommendations={recommendations}
      cast={cast}
      images={images}
    />
  );
}
