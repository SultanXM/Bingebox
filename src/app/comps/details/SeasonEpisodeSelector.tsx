"use client";

import { useState, useEffect } from "react";
import { Play, ChevronDown } from "lucide-react";

interface Season {
  season_number: number;
  name: string;
  episode_count: number;
  overview: string;
  air_date: string;
}

interface SeasonEpisodeSelectorProps {
  seasons: Season[];
  tvId: number;
  onEpisodeSelect: (season: number, episode: number) => void;
  onCollapseChange?: (collapsed: boolean) => void;
  initialSeason?: number;
  initialEpisode?: number;
}

export default function SeasonEpisodeSelector({
  seasons,
  tvId,
  onEpisodeSelect,
  onCollapseChange,
  initialSeason,
  initialEpisode,
}: SeasonEpisodeSelectorProps) {
  const [activeSeason, setActiveSeason] = useState<number>(
    initialSeason || seasons[0]?.season_number || 1,
  );
  const [activeEpisode, setActiveEpisode] = useState<number>(
    initialEpisode || 1,
  );
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);

  // Filter out specials (season 0) and sort
  const regularSeasons = seasons
    .filter((s) => s.season_number > 0)
    .sort((a, b) => a.season_number - b.season_number);

  const currentSeason = regularSeasons.find(
    (s) => s.season_number === activeSeason,
  );

  // Generate episodes for the active season
  const episodes = currentSeason
    ? Array.from({ length: currentSeason.episode_count }, (_, i) => ({
        episode: i + 1,
        isActive: i + 1 === activeEpisode,
      }))
    : [];

  const handleSeasonChange = (seasonNum: number) => {
    setActiveSeason(seasonNum);
    setShowSeasonDropdown(false);
    setActiveEpisode(1);
    onEpisodeSelect(seasonNum, 1);
  };

  const handleEpisodeSelect = (episode: number) => {
    setActiveEpisode(episode);
    onEpisodeSelect(activeSeason, episode);
  };

  return (
    <div className="bg-white/5 rounded-lg overflow-hidden border border-white/10">
      {/* Season Selector Header */}
      <div className="px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-medium">Episodes</h3>
          <button
            onClick={() => setShowSeasonDropdown(!showSeasonDropdown)}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20"
          >
            {currentSeason?.name || `Season ${activeSeason}`}
            <ChevronDown className={`h-4 w-4 transition-transform ${showSeasonDropdown ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Season Dropdown */}
        {showSeasonDropdown && (
          <div className="absolute z-20 mt-2 bg-[#1f1f1f] border border-white/10 rounded-lg shadow-xl overflow-hidden min-w-[180px]">
            {regularSeasons.map((season) => (
              <button
                key={season.season_number}
                onClick={() => handleSeasonChange(season.season_number)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  activeSeason === season.season_number
                    ? "bg-white/20 text-white"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {season.name}
                <span className="text-xs text-gray-500 ml-2">
                  ({season.episode_count} eps)
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Episode Grid */}
      <div className="p-3">
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5">
          {episodes.map(({ episode, isActive }) => (
            <button
              key={episode}
              onClick={() => handleEpisodeSelect(episode)}
              className={`relative aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#E50914] text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
              }`}
            >
              {episode}
              {isActive && (
                <Play className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 fill-white" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Current Episode Info */}
      <div className="px-4 py-3 border-t border-white/10 bg-white/5">
        <p className="text-gray-400 text-sm">
          Now Playing: <span className="text-white font-medium">S{activeSeason}:E{activeEpisode}</span>
        </p>
      </div>
    </div>
  );
}
