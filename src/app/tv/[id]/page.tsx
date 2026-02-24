import TVDetailClient from "./TVDetailClient";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tv = await getTVDetails(id);
  return {
    title: tv ? tv.name : "TV show not found",
  };
}

interface TVDetails {
  adult: boolean;
  backdrop_path: string;
  created_by: Array<{
    id: number;
    credit_id: string;
    name: string;
    gender: number;
    profile_path: string | null;
  }>;
  episode_run_time: Array<number>;
  first_air_date: string;
  genres: Array<{ id: number; name: string }>;
  homepage: string;
  id: number;
  in_production: boolean;
  languages: Array<string>;
  last_air_date: string;
  last_episode_to_air: {
    air_date: string;
    episode_number: number;
    id: number;
    name: string;
    overview: string;
    production_code: string;
    season_number: number;
    still_path: string | null;
    vote_average: number;
    vote_count: number;
  };
  name: string;
  next_episode_to_air: null;
  networks: Array<{
    name: string;
    id: number;
    logo_path: string | null;
    origin_country: string;
  }>;
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: Array<string>;
  original_language: string;
  original_name: string;
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
  seasons: Array<{
    air_date: string;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: string;
    season_number: number;
  }>;
  spoken_languages: Array<{
    english_name: string;
    iso_639_1: string;
    name: string;
  }>;
  status: string;
  tagline: string | null;
  type: string;
  vote_average: number;
  vote_count: number;
}

interface SimilarTV {
  id: number;
  name: string;
  poster_path: string | null;
  vote_average: number;
  first_air_date: string;
  backdrop_path: string;
  overview: string;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_name: string;
  origin_country: string[];
  vote_count: number;
}

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

const API_KEY = process.env.TMDB_API_KEY;

async function getTVDetails(tvId: string): Promise<TVDetails | null> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error("TMDB_API_KEY environment variable is not set.");
    return null;
  }

  if (!/^\d+$/.test(tvId)) {
    console.warn(`Invalid TV ID format: ${tvId}. Expected numeric ID.`);
    return null;
  }

  const url = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/tv/${tvId}?language=en-US`;

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
        `Failed to fetch TV details for ID ${tvId}. Status: ${res.status}`,
      );
      return null;
    }
    return res.json();
  } catch (error) {
    console.error(
      `An error occurred while fetching TV details for ID ${tvId}:`,
      error,
    );
    return null;
  }
}

async function getSimilarTV(tvId: string): Promise<SimilarTV[]> {
  if (!API_KEY) return [];
  
  const url = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/tv/${tvId}/similar?language=en-US&page=1`;
  
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

async function getRecommendations(tvId: string): Promise<SimilarTV[]> {
  if (!API_KEY) return [];
  
  const url = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/tv/${tvId}/recommendations?language=en-US&page=1`;
  
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

async function getTVCredits(tvId: string): Promise<CastMember[]> {
  if (!API_KEY) return [];
  
  const url = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/tv/${tvId}/credits?language=en-US`;
  
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

async function getTVImages(tvId: string): Promise<Array<{ file_path: string }>> {
  if (!API_KEY) return [];
  
  const url = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/tv/${tvId}/images`;
  
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

export default async function TVDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const [tv, similarTV, recommendations, cast, images] = await Promise.all([
    getTVDetails(id),
    getSimilarTV(id),
    getRecommendations(id),
    getTVCredits(id),
    getTVImages(id),
  ]);

  if (!tv) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-20">
        <h1 className="text-2xl">TV show not found.</h1>
      </div>
    );
  }
  
  return (
    <TVDetailClient 
      tv={tv} 
      similarTV={similarTV}
      recommendations={recommendations}
      cast={cast}
      images={images}
    />
  );
}
