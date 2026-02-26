"use client";

import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  MediaPlayer,
  MediaProvider,
  Track,
  type MediaPlayerInstance,
} from "@vidstack/react";
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";

interface VidstackPlayerProps {
  movieId: string;
  episode?: string;
  title: string;
}

interface Caption {
  language: string;
  url: string;
}

interface SignedMovieLinkResponse {
  signed_url: string;
  expires_at: number;
  captions: Caption[];
}

export default function VidstackPlayer({ movieId, episode, title }: VidstackPlayerProps) {
  const playerRef = useRef<MediaPlayerInstance>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [captions, setCaptions] = useState<Caption[]>([]);

  const getStorageKey = useCallback(() => {
    return episode ? `video_pos_${movieId}_${episode}` : `video_pos_${movieId}`;
  }, [movieId, episode]);

  const savePosition = useCallback((currentTime: number) => {
    try { localStorage.setItem(getStorageKey(), currentTime.toString()); } catch {}
  }, [getStorageKey]);

  const loadPosition = useCallback((): number => {
    try { return parseFloat(localStorage.getItem(getStorageKey()) || "0"); } catch { return 0; }
  }, [getStorageKey]);

  useEffect(() => {
    const abortController = new AbortController();
    async function fetchStream() {
      setIsLoading(true);
      setError(null);
      try {
        const episodeParam = episode ? `&ep=${encodeURIComponent(episode)}` : "";
        const apiUrl = `https://bingebox-api.fly.dev/api/v1/movies/link/signed-url?id=${encodeURIComponent(movieId)}${episodeParam}`;
        const response = await fetch(apiUrl, { signal: abortController.signal });
        if (!response.ok) throw new Error(`Failed: ${response.status}`);
        const data: SignedMovieLinkResponse = await response.json();
        setVideoUrl(`https://bingebox-api.fly.dev${data.signed_url}`);
        setCaptions(data.captions.map(c => ({ language: c.language.toLowerCase(), url: `https://bingebox-api.fly.dev${c.url}` })));
        setIsLoading(false);
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError(err instanceof Error ? err.message : "Failed to load");
          setIsLoading(false);
        }
      }
    }
    fetchStream();
    return () => abortController.abort();
  }, [movieId, episode]);

  useEffect(() => {
    if (!playerRef.current || !videoUrl) return;
    const player = playerRef.current;
    const unsubscribe = player.subscribe(({ currentTime, paused }) => {
      if (currentTime > 0 && !paused) savePosition(currentTime);
    });
    return () => unsubscribe();
  }, [videoUrl, savePosition]);

  if (error) {
    return (
      <div className="relative w-full aspect-video bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden flex items-center justify-center border border-red-500/20">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-red-500 font-bold text-lg">Failed to Load Video</h3>
          <p className="text-gray-400 text-sm mt-2">Try switching source</p>
        </div>
      </div>
    );
  }

  if (isLoading || !videoUrl) {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-300 mt-4">Loading stream...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="player-container">
      <MediaPlayer
        className="media-player"
        title={title}
        src={videoUrl}
        crossOrigin
        playsInline
        currentTime={loadPosition()}
        ref={playerRef}
      >
        <MediaProvider>
          {captions.map((caption) => (
            <Track
              key={caption.url}
              src={caption.url}
              label={caption.language}
              language={caption.language}
              kind="subtitles"
              default={caption.language.includes("en")}
            />
          ))}
        </MediaProvider>
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>
      
      <style jsx>{`
        .player-container {
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 16px;
          overflow: hidden;
          background: #000;
          box-shadow: 0 20px 50px rgba(0,0,0,0.7);
          position: relative;
        }
      `}</style>
      
      <style jsx global>{`
        /* Make controls visible */
        .player-container .media-player {
          width: 100%;
          height: 100%;
        }
        
        /* Fix for Safari/WebKit - ensure controls are visible */
        .player-container .media-player [data-part="controls"] {
          z-index: 10 !important;
          pointer-events: auto !important;
        }
        
        /* Force controls layer to be interactive */
        .player-container .media-player .vds-controls {
          pointer-events: auto !important;
          z-index: 20 !important;
        }
        
        /* Ensure control buttons are clickable */
        .player-container .media-player [data-part="controls"] button,
        .player-container .media-player [data-part="controls"] [role="button"] {
          pointer-events: auto !important;
        }
        
        /* Custom red play button */
        .player-container [data-part="play-button"] {
          width: 80px !important;
          height: 80px !important;
          background: rgba(229, 9, 20, 0.95) !important;
          border: 3px solid rgba(255,255,255,0.3) !important;
          border-radius: 50% !important;
        }
        
        .player-container [data-part="play-button"]:hover {
          transform: scale(1.1) !important;
          background: #E50914 !important;
        }
        
        /* Red progress bar */
        .player-container [data-part="slider-track-fill"] {
          background: #E50914 !important;
        }
        
        /* Control buttons */
        .player-container [data-part="button"] {
          color: #fff !important;
        }
        
        .player-container [data-part="button"]:hover {
          color: #E50914 !important;
        }
        
        /* Volume */
        .player-container [data-part="volume-slider"] [data-part="slider-track-fill"] {
          background: #E50914 !important;
        }
        
        /* Menus */
        .player-container [data-part="menu"] {
          background: rgba(20,20,20,0.98) !important;
          border-radius: 12px !important;
        }
        
        .player-container [data-part="menu-item"][data-checked="true"] {
          background: rgba(229, 9, 20, 0.5) !important;
        }
      `}</style>
    </div>
  );
}
