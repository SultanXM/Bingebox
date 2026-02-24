"use client";
import { useState, useEffect, useCallback } from "react";
import { Genre, Movie, TVShow } from "../lib/types";
import { getGenreList, getPopular, getTrending, getTopRated } from "../lib/tmdb";
import { sortGenresByRecency } from "../lib/genreTracking";
import NetflixBrowser from "./NetflixBrowser";
import { SkeletonBrowser } from "@/app/comps/ui/SkeletonCard";

export type ContentMode = "movie" | "tv" | "all";

// Kids/Family genre IDs to exclude
const KIDS_GENRES = [10751, 10762];

// Superhero/Blockbuster keywords to prioritize
const SUPERHERO_KEYWORDS = [
  "avenger", "batman", "wonder woman", "superman", "marvel", "spider-man", "spiderman",
  "iron man", "captain", "thor", "hulk", "justice league", "x-men", "wolverine",
  "deadpool", "suicide squad", "guardian", "galaxy", "flash", "aquaman", "cyborg",
  "black panther", "captain marvel", "doctor strange", "ant-man", "wasp", "shazam",
  "eternals", "venom", "morbius", "punisher", "daredevil", "joker", "harley quinn",
  "robin", "green lantern", "supergirl", "batgirl", "catwoman", "dark knight"
];

// Romance keywords for sexy/attractive content
const ROMANCE_KEYWORDS = [
  "love", "romance", "romantic", "kiss", "affair", "seduction", "passion",
  "desire", "intimate", "wedding", "marriage", "date", "crush", "boyfriend",
  "girlfriend", "couple", "heart", "valentine"
];

// Shuffle array randomly (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Check if item has kids genres
function isKidsContent(item: Movie | TVShow): boolean {
  return item.genre_ids?.some((id) => KIDS_GENRES.includes(id)) ?? false;
}

// Check for kids keywords in title (exclude these)
function hasKidsKeywords(item: Movie | TVShow): boolean {
  const title = "title" in item ? item.title.toLowerCase() : item.name.toLowerCase();
  const kidsWords = [
    "zootopia", "sing", "frozen", "moana", "coco", "toy story", "finding",
    "incredibles", "shrek", "madagascar", "kung fu panda", "minions",
    "despicable me", "mulan", "pocahontas", "bambi", "dumbo",
    "snow white", "cinderella", "sleeping beauty", "little mermaid",
    "beauty and the beast", "aladdin", "lion king", "tarzan", "hercules",
    "jungle book", "peter pan", "pinocchio", "fantasia", "lady and the tramp",
    "101 dalmatians", "sword in the stone", "aristocats", "robin hood",
    "winnie the pooh", "fox and the hound", "black cauldron",
    "oliver and company", "rescuers", "hunchback of notre dame",
    "dinosaur", "lilo", "stitch", "treasure planet", "brother bear",
    "home on the range", "chicken little", "meet the robinsons", "bolt",
    "princess and the frog", "wreck-it", "ralph", "big hero", "luca",
    "soul", "onward", "bug", "life", "monsters", "finding nemo",
    "finding dory", "ratatouille", "walle", "up", "brave", "inside out",
    "good dinosaur", "cars", "planes", "tangled", "encanto",
    "strange world", "wish", "elemental", "turning red",
    "how to train your dragon", "turbo", "mr peabody", "penguins",
    "boss baby", "trolls", "spirit", "croods", "bad guys",
    "puss in boots", "ruby gillman", "spongebob", "peanuts", "smurfs",
    "paddington", "peter rabbit", "sonic", "paw patrol", "barbie",
    "my little pony", "power rangers", "teen titans", "scooby"
  ];
  return kidsWords.some((word) => title.includes(word));
}

// Check if item is superhero content
function isSuperheroContent(item: Movie | TVShow): boolean {
  const title = "title" in item ? item.title.toLowerCase() : item.name.toLowerCase();
  return SUPERHERO_KEYWORDS.some((word) => title.includes(word));
}

// Check if item is romance content
function isRomanceContent(item: Movie | TVShow): boolean {
  const romanceGenres = [10749]; // Romance
  const hasRomanceGenre = item.genre_ids?.some((id) => romanceGenres.includes(id));
  
  if (hasRomanceGenre) return true;
  
  const title = "title" in item ? item.title.toLowerCase() : item.name.toLowerCase();
  return ROMANCE_KEYWORDS.some((word) => title.includes(word));
}

// Filter items for banner - must have valid backdrop and poster (for sexy/attractive look)
function getBannerCandidates(items: (Movie | TVShow)[]): (Movie | TVShow)[] {
  return items.filter((item) => 
    item.backdrop_path && 
    item.backdrop_path.length > 5 &&
    item.poster_path && // Must have poster for attractive visuals
    item.poster_path.length > 5 &&
    item.vote_average >= 6.0 &&
    item.vote_count >= 100 &&
    !isKidsContent(item) &&
    !hasKidsKeywords(item)
  );
}

// Fetch movies by genre with year filter
async function fetchByGenre(genreId: number, page: number = 1): Promise<Movie[]> {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 15;
  
  const withoutGenres = "10751,10762,16"; // Exclude kids and animation
  
  const res = await fetch(
    `${baseUrl}/discover/movie?with_genres=${genreId}&without_genres=${withoutGenres}&sort_by=popularity.desc&vote_average.gte=6.0&vote_count.gte=100&primary_release_date.gte=${minYear}-01-01&include_adult=false&page=${page}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        accept: "application/json",
      },
    }
  );
  
  if (!res.ok) throw new Error("Failed to fetch");
  const data = await res.json();
  return data.results || [];
}

// Fetch superhero movies specifically (Action + Adventure + Sci-Fi)
async function fetchSuperheroMovies(page: number = 1): Promise<Movie[]> {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
  
  // Action + Adventure + Science Fiction for superhero content
  const res = await fetch(
    `${baseUrl}/discover/movie?with_genres=28,12,878&without_genres=10751,10762,16&sort_by=popularity.desc&vote_average.gte=6.5&vote_count.gte=500&include_adult=false&page=${page}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        accept: "application/json",
      },
    }
  );
  
  if (!res.ok) throw new Error("Failed to fetch");
  const data = await res.json();
  return data.results || [];
}

// Generate random page number (1-10) for variety
function getRandomPage(): number {
  return Math.floor(Math.random() * 10) + 1;
}

// Select diverse items from multiple sources for dynamic banner
async function selectDynamicBannerItems(): Promise<(Movie | TVShow)[]> {
  const randomPage = getRandomPage();
  const randomPage2 = getRandomPage();
  
  // Fetch from multiple sources - ROMANCE + SUPERHERO focus
  const [
    romanceMovies,
    romancePage2,
    superheroMovies,
    actionMovies,
    adventureMovies,
    popularMovies,
    trendingMovies,
    topRatedMovies,
  ] = await Promise.all([
    fetchByGenre(10749, randomPage),     // Romance
    fetchByGenre(10749, randomPage2),    // Romance - different page
    fetchSuperheroMovies(randomPage),     // Superhero (Action + Adventure + Sci-Fi)
    fetchByGenre(28, randomPage),         // Action
    fetchByGenre(12, randomPage),         // Adventure
    getPopular("movie"),
    getTrending("movie"),
    getTopRated("movie"),
  ]);

  // Filter all for banner quality
  const romance = getBannerCandidates(romanceMovies);
  const romance2 = getBannerCandidates(romancePage2);
  const superhero = getBannerCandidates(superheroMovies);
  const action = getBannerCandidates(actionMovies);
  const adventure = getBannerCandidates(adventureMovies);
  const popular = getBannerCandidates(popularMovies);
  const trending = getBannerCandidates(trendingMovies);
  const topRated = getBannerCandidates(topRatedMovies);

  // Create a pool with NO duplicates
  const selected: (Movie | TVShow)[] = [];
  const seenIds = new Set<number>();

  const addUniqueItems = (items: (Movie | TVShow)[], count: number) => {
    const shuffled = shuffleArray(items);
    for (const item of shuffled) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        selected.push(item);
        if (selected.length >= count) break;
      }
    }
  };

  // Mix: 40% Superhero/Action, 40% Romance, 20% Other blockbusters
  addUniqueItems(superhero, 2);          // 2 Superhero movies
  addUniqueItems(action, 1);             // 1 Action
  addUniqueItems(adventure, 1);          // 1 Adventure
  
  addUniqueItems(romance, 2);            // 2 Romance
  addUniqueItems(romance2, 1);           // 1 more Romance
  
  addUniqueItems(trending, 1);           // 1 Trending
  
  // Fill remaining slots with diverse content if needed
  const remainingSlots = 8 - selected.length;
  if (remainingSlots > 0) {
    // Prioritize superhero/romance, then popular
    const diversePool = shuffleArray([...superhero, ...romance, ...popular, ...topRated]);
    addUniqueItems(diversePool, remainingSlots);
  }

  // Final shuffle
  return shuffleArray(selected).slice(0, 8);
}

export default function MainPage() {
  const [contentMode, setContentMode] = useState<ContentMode>("all");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [heroItems, setHeroItems] = useState<(Movie | TVShow)[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async (mode: ContentMode) => {
    setIsLoading(true);
    try {
      const [movieGenres, tvGenres] = await Promise.all([
        getGenreList("movie"),
        getGenreList("tv"),
      ]);

      const genreMap = new Map<number, Genre>();
      movieGenres.forEach((g) => genreMap.set(g.id, g));
      tvGenres.forEach((g) => {
        if (!genreMap.has(g.id)) genreMap.set(g.id, g);
      });
      const mergedGenres = sortGenresByRecency(
        Array.from(genreMap.values()),
        "movie",
      );
      setGenres(mergedGenres);

      // Get dynamic banner items
      const bannerItems = await selectDynamicBannerItems();
      
      setHeroItems(bannerItems);
      
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(contentMode);
  }, [contentMode, loadData]);

  if (isLoading || heroItems.length === 0) {
    return <SkeletonBrowser />;
  }

  return (
    <NetflixBrowser
      contentMode={contentMode}
      heroItems={heroItems}
      genres={genres}
      onSwitchContentMode={setContentMode}
    />
  );
}
