"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { 
  Star, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  Minimize2,
  Monitor,
  Heart,
  Plus,
  Check,
  Link as LinkIcon
} from "lucide-react";
import SeasonEpisodeSelector from "../../comps/details/SeasonEpisodeSelector";
import { TVDetail, VideoSource } from "@/app/lib/types";
import VideoPlayer from "../../comps/details/VideoPlayer";
import SourceSelector from "../../comps/details/SourceSelector";
import { useMovieStatus } from "@/app/hooks/useUserStorage";
import { addToHistory } from "@/app/lib/userStorage";

const VidstackPlayer = dynamic(
  () => import("../../comps/details/VidstackPlayer"),
  { ssr: false },
);

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

interface TVDetailClientProps {
  tv: TVDetail;
  similarTV: SimilarTV[];
  recommendations: SimilarTV[];
  cast: CastMember[];
  images: Array<{ file_path: string }>;
}

const mockVideoSources: VideoSource[] = [
  {
    id: "0",
    name: "Official",
    quality: "1080p",
    type: "shaka",
    ref: "shaka",
  },
  {
    id: "1",
    name: "VidLink",
    quality: "1080p",
    type: "primary",
    ref: `${process.env.NEXT_PUBLIC_VIDLINK_BASE_URL}/tv`,
  },
  {
    id: "2",
    name: "TurboVid",
    quality: "1080p",
    type: "backup",
    ref: `${process.env.NEXT_PUBLIC_TURBOVID_BASE_URL}/tv`,
  },
];

export default function TVDetailClient({ 
  tv, 
  similarTV, 
  recommendations, 
  cast,
  images 
}: TVDetailClientProps) {
  const [selectedSource, setSelectedSource] = useState<VideoSource>(
    mockVideoSources[0],
  );
  const [cinemaMode, setCinemaMode] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [showCinemaControls, setShowCinemaControls] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSeason = searchParams.get("season");
  const initialEpisode = searchParams.get("episode");
  const [season, setSeason] = useState(
    initialSeason ? parseInt(initialSeason, 10) : 1,
  );
  const [episode, setEpisode] = useState(
    initialEpisode ? parseInt(initialEpisode, 10) : 1,
  );
  const [isSelectorCollapsed, setIsSelectorCollapsed] = useState(false);
  
  const { isLiked, isBookmarked, toggleLike, toggleBookmark, isLoaded } = useMovieStatus(tv.id);

  // Add to history when episode changes
  useEffect(() => {
    addToHistory({
      id: tv.id,
      title: tv.name,
      poster_path: tv.poster_path,
      media_type: 'tv',
      season,
      episode,
    });
  }, [tv.id, tv.name, tv.poster_path, season, episode]);

  // Cinema mode: hide default navbar
  useEffect(() => {
    if (cinemaMode) {
      document.body.classList.add('cinema-mode');
    } else {
      document.body.classList.remove('cinema-mode');
    }
    return () => {
      document.body.classList.remove('cinema-mode');
    };
  }, [cinemaMode]);

  // Cinema mode controls auto-hide
  useEffect(() => {
    if (!cinemaMode) return;
    
    const timer = setTimeout(() => {
      setShowCinemaControls(false);
    }, 3000);
    
    const handleMouseMove = () => {
      setShowCinemaControls(true);
      clearTimeout(timer);
      setTimeout(() => setShowCinemaControls(false), 3000);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timer);
    };
  }, [cinemaMode]);

  const getImageUrl = (path: string, size: string = "w1280") => {
    return path
      ? `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL}/${size}${path}`
      : "/placeholder-movie.jpg";
  };

  const formatYear = (dateString: string) => {
    return new Date(dateString).getFullYear();
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const getVideoUrl = () => {
    return `${selectedSource.ref}/${tv.id}/${season}/${episode}`;
  };

  const handleEpisodeSelect = (s: number, e: number) => {
    setSeason(s);
    setEpisode(e);
    router.replace(`/tv/${tv.id}?season=${s}&episode=${e}`);
  };

  const handleLike = () => {
    const liked = toggleLike({
      id: tv.id,
      title: tv.name,
      poster_path: tv.poster_path,
      media_type: 'tv',
    });
    setShowToast(liked ? "Added to Liked" : "Removed from Liked");
    setTimeout(() => setShowToast(null), 2000);
  };

  const handleBookmark = () => {
    const bookmarked = toggleBookmark({
      id: tv.id,
      title: tv.name,
      poster_path: tv.poster_path,
      media_type: 'tv',
    });
    setShowToast(bookmarked ? "Added to Watchlist" : "Removed from Watchlist");
    setTimeout(() => setShowToast(null), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowToast("Link copied!");
    setTimeout(() => setShowToast(null), 2000);
  };

  return (
    <div className={`${cinemaMode ? 'bg-black' : 'bg-[#141414]'} min-h-screen transition-colors duration-500`}>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-white/10 backdrop-blur-xl text-white px-4 py-2 rounded-full text-sm font-medium animate-fade-in">
          {showToast}
        </div>
      )}

      {/* Cinema Mode UI */}
      {cinemaMode && (
        <>
          {/* Top Bar - Auto hides */}
          <div 
            className={`fixed top-0 left-0 right-0 z-[60] bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 ${
              showCinemaControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="flex items-center justify-between max-w-[1920px] mx-auto">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/main')}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-white font-medium">{tv.name}</h1>
                  <p className="text-white/50 text-sm">S{season}:E{episode} • {formatYear(tv.first_air_date)}</p>
                </div>
              </div>
              <button
                onClick={() => setCinemaMode(false)}
                className="flex items-center gap-2 text-white/70 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-all text-sm"
              >
                <Minimize2 className="h-4 w-4" />
                <span>Exit Cinema</span>
              </button>
            </div>
          </div>

          {/* Bottom Bar */}
          <div 
            className={`fixed bottom-0 left-0 right-0 z-[60] bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
              showCinemaControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="max-w-[1920px] mx-auto flex items-center justify-center gap-4">
              <button
                onClick={() => setCinemaMode(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm transition-all"
              >
                Exit Cinema Mode
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Content - Hidden in Cinema Mode */}
      <div className={`${cinemaMode ? 'hidden' : 'block'}`}>
        {/* Backdrop Banner */}
        <div className="relative h-[50vh] sm:h-[60vh]">
          <img
            src={getImageUrl(tv.backdrop_path, "original")}
            alt={tv.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-[#141414]/30 to-transparent" />
          
          {/* Back Button Overlay */}
          <div className="absolute top-20 left-4 sm:left-8 z-10">
            <button
              onClick={() => router.back()}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 sm:-mt-40 relative z-10">
          <div className="grid lg:grid-cols-[300px_1fr] gap-6 lg:gap-10">
            {/* Poster */}
            <div className="hidden lg:block">
              <div className="rounded-xl overflow-hidden shadow-2xl aspect-[2/3] bg-neutral-800 ring-1 ring-white/10">
                <img
                  src={getImageUrl(tv.poster_path, "w500")}
                  alt={tv.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="space-y-5">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
                  {tv.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                  <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded">
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-white">{formatRating(tv.vote_average)}</span>
                  </div>
                  <span>{formatYear(tv.first_air_date)}</span>
                  <span className="text-white/30">•</span>
                  <span>{tv.number_of_seasons} Seasons</span>
                  <span className="text-white/30">•</span>
                  <span>{tv.number_of_episodes} Episodes</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {tv.genres.map((genre) => (
                  <Link
                    key={genre.id}
                    href={`/main?genre=${genre.id}`}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-sm text-white transition-colors"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>

              <p className="text-gray-300 text-base leading-relaxed max-w-3xl">
                {tv.overview}
              </p>

              {/* Action Buttons */}
              {isLoaded && (
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => setCinemaMode(true)}
                    className="flex items-center gap-2 bg-[#E50914] hover:bg-[#f40612] text-white px-6 py-2.5 rounded-full font-medium transition-all hover:scale-105"
                  >
                    <Monitor className="h-4 w-4" />
                    <span>Cinema Mode</span>
                  </button>
                  
                  <button 
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all ${
                      isLiked 
                        ? "bg-[#E50914] text-white" 
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? "fill-white" : ""}`} />
                    <span>{isLiked ? "Liked" : "Like"}</span>
                  </button>
                  
                  <button 
                    onClick={handleBookmark}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all ${
                      isBookmarked 
                        ? "bg-green-600 text-white" 
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    {isBookmarked ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    <span>{isBookmarked ? "Saved" : "Watchlist"}</span>
                  </button>
                  
                  <button 
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-full font-medium transition-all"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Video Player Section */}
          <div className="mt-8 space-y-4">
            {selectedSource.type === "shaka" ? (
              <VidstackPlayer
                key={`vidstack-${tv.id}-${season}-${episode}-${selectedSource.id}`}
                movieId={tv.id.toString()}
                episode={`${season}/${episode}`}
                title={tv.name}
              />
            ) : (
              <VideoPlayer
                key={`${selectedSource.id}-${tv.id}-${season}-${episode}`}
                videoUrl={getVideoUrl()}
                title={tv.name}
              />
            )}

            <SourceSelector
              sources={mockVideoSources}
              selectedSource={selectedSource}
              onSelectSource={setSelectedSource}
            />
          </div>

          {/* Episode Selector */}
          <div className="mt-6">
            <SeasonEpisodeSelector
              seasons={tv.seasons}
              tvId={tv.id}
              onEpisodeSelect={handleEpisodeSelect}
              onCollapseChange={setIsSelectorCollapsed}
              initialSeason={initialSeason ? parseInt(initialSeason, 10) : undefined}
              initialEpisode={initialEpisode ? parseInt(initialEpisode, 10) : undefined}
            />
          </div>

          {/* Cast Section */}
          {cast.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold text-white mb-4">Cast</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {cast.map((person) => (
                  <div key={person.id} className="flex-shrink-0 w-28 text-center">
                    <div className="w-28 h-28 rounded-full overflow-hidden bg-neutral-800 mb-2 ring-1 ring-white/10">
                      <img
                        src={person.profile_path 
                          ? getImageUrl(person.profile_path, "w185") 
                          : "/placeholder-avatar.jpg"
                        }
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-white text-sm font-medium truncate">{person.name}</p>
                    <p className="text-white/50 text-xs truncate">{person.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Images Gallery */}
          {images.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold text-white mb-4">Gallery</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="aspect-video rounded-lg overflow-hidden bg-neutral-800">
                    <img
                      src={getImageUrl(img.file_path, "w500")}
                      alt={`Scene ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* More Like This */}
          {similarTV.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold text-white mb-4">More Like This</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {similarTV.map((show) => (
                  <Link
                    key={show.id}
                    href={`/tv/${show.id}`}
                    className="group"
                  >
                    <div className="aspect-[2/3] rounded-lg overflow-hidden bg-neutral-800 relative">
                      <img
                        src={getImageUrl(show.poster_path || "", "w342")}
                        alt={show.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                        <p className="text-white text-sm font-medium line-clamp-1">{show.name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-white/70 text-xs">{show.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="mt-12 pb-12">
              <h2 className="text-xl font-semibold text-white mb-4">Recommended For You</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {recommendations.map((show) => (
                  <Link
                    key={show.id}
                    href={`/tv/${show.id}`}
                    className="group"
                  >
                    <div className="aspect-[2/3] rounded-lg overflow-hidden bg-neutral-800 relative">
                      <img
                        src={getImageUrl(show.poster_path || "", "w342")}
                        alt={show.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                        <p className="text-white text-sm font-medium line-clamp-1">{show.name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-white/70 text-xs">{show.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* TV Details Footer */}
          <div className="mt-8 pt-8 border-t border-white/10 pb-12">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div>
                <h3 className="text-white font-semibold mb-3">Details</h3>
                <div className="space-y-2 text-gray-400">
                  <p>Status: <span className="text-white">{tv.status}</span></p>
                  <p>Type: <span className="text-white">{tv.type}</span></p>
                  <p>Episodes: <span className="text-white">{tv.number_of_episodes}</span></p>
                  <p>Language: <span className="text-white">{tv.original_language.toUpperCase()}</span></p>
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3">Production</h3>
                <div className="space-y-2 text-gray-400">
                  {tv.production_companies?.slice(0, 3).map((company) => (
                    <p key={company.id} className="text-white">{company.name}</p>
                  ))}
                  {tv.networks?.slice(0, 2).map((network) => (
                    <p key={network.id} className="text-white/70">{network.name}</p>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3">Season Info</h3>
                <div className="space-y-2 text-gray-400">
                  <p>Total Seasons: <span className="text-white">{tv.number_of_seasons}</span></p>
                  <p>First Aired: <span className="text-white">{tv.first_air_date}</span></p>
                  {tv.last_air_date && (
                    <p>Last Aired: <span className="text-white">{tv.last_air_date}</span></p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cinema Mode Player */}
      {cinemaMode && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <div className="w-full max-w-[1920px] aspect-video">
            {selectedSource.type === "shaka" ? (
              <VidstackPlayer
                key={`cinema-vidstack-${tv.id}-${season}-${episode}`}
                movieId={tv.id.toString()}
                episode={`${season}/${episode}`}
                title={tv.name}
              />
            ) : (
              <VideoPlayer
                key={`cinema-${selectedSource.id}`}
                videoUrl={getVideoUrl()}
                title={tv.name}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
