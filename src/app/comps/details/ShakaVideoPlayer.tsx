"use client";

import { useEffect, useRef, useState } from "react";
import shaka from "shaka-player/dist/shaka-player.ui";
import "shaka-player/dist/controls.css";

interface ShakaVideoPlayerProps {
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

export default function ShakaVideoPlayer({
  movieId,
  episode,
}: ShakaVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<shaka.Player | null>(null);
  const uiRef = useRef<shaka.ui.Overlay | null>(null);
  const cleanupFunctions = useRef<{ native?: () => void; shaka?: () => void }>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useNativeControls, setUseNativeControls] = useState(false);

  // Add an abort controller ref to cancel in-flight operations
  const abortControllerRef = useRef<AbortController | null>(null);
  // Track if component is mounted
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Reset mounted state
    isMountedRef.current = true;
    const effectId = Math.random().toString(36).substring(7);
    console.log(`[${effectId}] Effect STARTED - movieId: ${movieId}`);

    // Create new abort controller for this effect run
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Capture refs early to avoid stale closure issues
    const video = videoRef.current;
    const container = containerRef.current;
    const cleanup = cleanupFunctions.current;

    if (video) {
      video.controls = false;
    }

    // Create a unique storage key for this video
    const getStorageKey = () => {
      return episode
        ? `video_position_${movieId}_${episode}`
        : `video_position_${movieId}`;
    };

    // Save current playback position to localStorage
    const savePosition = (currentTime: number) => {
      try {
        localStorage.setItem(getStorageKey(), currentTime.toString());
      } catch (err) {
        console.warn("Failed to save playback position:", err);
      }
    };

    // Load saved playback position from localStorage
    const loadPosition = (): number | null => {
      try {
        const saved = localStorage.getItem(getStorageKey());
        return saved ? parseFloat(saved) : null;
      } catch (err) {
        console.warn("Failed to load playback position:", err);
        return null;
      }
    };

    // Install polyfills for browsers that need them
    shaka.polyfill.installAll();

    const fetchAndPlay = async () => {
      console.log(`[${effectId}] fetchAndPlay called`);
      // Check if aborted before starting
      if (signal.aborted) return;

      setIsLoading(true);
      setError(null);

      try {
        if (!video || !container) return;

        const episodeParam = episode
          ? `&ep=${encodeURIComponent(episode)}`
          : "";
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/movies/link/signed-url?id=${encodeURIComponent(movieId)}${episodeParam}`;

        const response = await fetch(apiUrl, {
          signal,
        });

        // Check if aborted after fetch
        if (signal.aborted) return;

        if (!response.ok) {
          throw new Error(`Failed to fetch stream: ${response.status}`);
        }

        const data: SignedMovieLinkResponse = await response.json();

        const videoUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}${data.signed_url}`;

        // browsers that play hls natively should prefer that
        const canPlayHLS = video.canPlayType("application/vnd.apple.mpegurl");

        if (canPlayHLS) {
          // Check if aborted before setting up native playback
          if (signal.aborted) return;

          console.log("Using native HLS playback");
          setUseNativeControls(true);
          video.src = videoUrl;

          // Add captions for native playback
          const absoluteCaptions = data.captions.map((caption) => ({
            language: caption.language.toLowerCase(),
            url: `${process.env.NEXT_PUBLIC_API_BASE_URL}${caption.url}`,
          }));

          for (const caption of absoluteCaptions) {
            const track = document.createElement("track");
            track.kind = "subtitles";
            track.label = caption.language;
            track.srclang = caption.language;
            track.src = caption.url;

            const isEnglish = caption.language.includes("english");
            if (isEnglish) {
              track.default = true;
            }

            video.appendChild(track);
          }

          // Restore saved position for native playback
          const savedPosition = loadPosition();
          if (savedPosition && savedPosition > 0) {
            video.addEventListener(
              "loadedmetadata",
              () => {
                if (!signal.aborted) {
                  video.currentTime = savedPosition;
                  console.log(`Restored playback position: ${savedPosition}s`);
                }
              },
              { once: true },
            );
          }

          // Save position periodically for native playback
          const saveInterval = setInterval(() => {
            if (video.currentTime > 0 && !video.paused) {
              savePosition(video.currentTime);
            }
          }, 5000);

          // Save on pause and before unload
          const handlePause = () => savePosition(video.currentTime);
          const handleBeforeUnload = () => savePosition(video.currentTime);

          video.addEventListener("pause", handlePause);
          window.addEventListener("beforeunload", handleBeforeUnload);

          // Store cleanup reference
          cleanup.native = () => {
            clearInterval(saveInterval);
            video.removeEventListener("pause", handlePause);
            window.removeEventListener("beforeunload", handleBeforeUnload);
          };

          if (!signal.aborted) {
            setIsLoading(false);
          }
          return;
        }

        // Check if aborted before Shaka setup
        if (signal.aborted) return;

        // Use Shaka Player for browsers without native HLS support
        if (!shaka.Player.isBrowserSupported()) {
          if (!signal.aborted) {
            setError("Browser not supported. Please use a modern browser.");
            setIsLoading(false);
          }
          return;
        }

        // Ensure native controls are disabled
        video.controls = false;

        // IMPORTANT: Check if there's already a player/UI and clean it up first
        if (uiRef.current) {
          try {
            uiRef.current.destroy();
          } catch (err) {
            console.warn("Error destroying existing UI:", err);
          }
          uiRef.current = null;
          playerRef.current = null;
        }

        // Check abort again after potential cleanup
        if (signal.aborted) return;

        // Create the player instance first (as per official Shaka docs)
        const localPlayer = new shaka.Player();
        playerRef.current = localPlayer;

        // Create the UI overlay with the player instance
        console.log(
          `[${effectId}] About to create Shaka UI. Existing uiRef:`,
          uiRef.current,
        );
        console.log(
          `[${effectId}] Container children before:`,
          container?.children.length,
        );
        const ui = new shaka.ui.Overlay(localPlayer, container, video);
        uiRef.current = ui;
        console.log(
          `[${effectId}] Shaka UI created. Container children after:`,
          container?.children.length,
        );

        // Check abort after creating UI
        if (signal.aborted) {
          ui.destroy();
          uiRef.current = null;
          playerRef.current = null;
          return;
        }

        // Attach the player to the video element
        await localPlayer.attach(video);

        // Check abort after attach
        if (signal.aborted) {
          ui.destroy();
          uiRef.current = null;
          playerRef.current = null;
          return;
        }

        // Get the controls (cast-enabled proxy objects)
        const controls = ui.getControls();
        if (!controls) {
          throw new Error("Failed to get UI controls");
        }
        const player = controls.getPlayer();
        if (!player) {
          throw new Error("Failed to get player from controls");
        }

        const config = {
          controlPanelElements: [
            "play_pause",
            "time_and_duration",
            "spacer",
            "mute",
            "volume",
            "fullscreen",
            "overflow_menu",
          ],
          overflowMenuButtons: ["captions", "quality", "playback_rate"],
        };
        ui.configure(config);

        player.configure({
          streaming: {
            retryParameters: {
              timeout: 30000,
              maxAttempts: 1,
              baseDelay: 500,
              backoffFactor: 1.5,
              fuzzFactor: 0.5,
            },
            bufferingGoal: 30,
            rebufferingGoal: 2,
            failureCallback: (error: shaka.util.Error) => {
              console.warn("Segment load failure (will retry):", error);
            },
          },
          drm: {
            retryParameters: {
              timeout: 30000,
              maxAttempts: 2,
              baseDelay: 1000,
              backoffFactor: 2,
              fuzzFactor: 0.5,
            },
          },
        });

        player.addEventListener("error", (event) => {
          const errorEvent = event as unknown as { detail: shaka.util.Error };
          const shakaError = errorEvent.detail;

          const isRecoverable =
            shakaError.severity === shaka.util.Error.Severity.RECOVERABLE ||
            shakaError.category === shaka.util.Error.Category.NETWORK;

          if (isRecoverable) {
            console.warn(
              "Recoverable Shaka Player Error (will retry):",
              shakaError,
            );
            return;
          }

          console.error("Fatal Shaka Player Error:", shakaError);
          if (!signal.aborted) {
            setError(
              `Playback Error (${shakaError.code}): ${shakaError.message || "Unknown error"}`,
            );
          }
        });

        console.log("Loading video URL with Shaka Player:", videoUrl);
        await player.load(videoUrl);

        // Check abort after load
        if (signal.aborted) {
          ui.destroy();
          uiRef.current = null;
          playerRef.current = null;
          return;
        }

        // Add captions as text tracks
        const absoluteCaptions = data.captions.map((caption) => ({
          language: caption.language.toLowerCase(),
          url: `${process.env.NEXT_PUBLIC_API_BASE_URL}${caption.url}`,
        }));

        for (const caption of absoluteCaptions) {
          if (signal.aborted) break;
          try {
            await player.addTextTrackAsync(
              caption.url,
              caption.language,
              "subtitle",
              "text/vtt",
            );
            console.log(`Added caption track: ${caption.language}`);
          } catch (err) {
            console.error(
              `Failed to add caption for ${caption.language}:`,
              err,
            );
          }
        }

        // Check abort after captions
        if (signal.aborted) {
          ui.destroy();
          uiRef.current = null;
          playerRef.current = null;
          return;
        }

        // Enable English subtitles by default if available
        const tracks = player.getTextTracks();
        const englishTrack = tracks.find((track) =>
          track.language.includes("en"),
        );
        if (englishTrack) {
          player.selectTextTrack(englishTrack);
          player.setTextTrackVisibility(true);
        }

        // Restore saved position for Shaka Player
        const savedPosition = loadPosition();
        if (savedPosition && savedPosition > 0) {
          video.currentTime = savedPosition;
          console.log(`Restored playback position: ${savedPosition}s`);
        }

        // Save position periodically for Shaka Player
        const saveInterval = setInterval(() => {
          if (video && video.currentTime > 0 && !video.paused) {
            savePosition(video.currentTime);
          }
        }, 5000);

        // Save on pause and before unload
        const handlePause = () => {
          if (video) {
            savePosition(video.currentTime);
          }
        };
        const handleBeforeUnload = () => {
          if (video) {
            savePosition(video.currentTime);
          }
        };

        video.addEventListener("pause", handlePause);
        window.addEventListener("beforeunload", handleBeforeUnload);

        // Store cleanup functions
        cleanup.shaka = () => {
          clearInterval(saveInterval);
          if (video) {
            video.removeEventListener("pause", handlePause);
          }
          window.removeEventListener("beforeunload", handleBeforeUnload);
        };

        console.log("Video loaded successfully");

        if (!signal.aborted) {
          setIsLoading(false);
        }
      } catch (err) {
        // Don't set error state if aborted
        if (signal.aborted) return;

        console.error("Error setting up video player:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load video stream",
        );
        setIsLoading(false);
      }
    };

    fetchAndPlay();

    return () => {
      // Mark as unmounted
      isMountedRef.current = false;
      console.log(`[${effectId}] Effect CLEANUP - movieId: ${movieId}`);
      console.log(`[${effectId}] uiRef at cleanup:`, uiRef.current);

      // Abort any in-flight operations
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clean up timestamp tracking
      if (cleanup.native) {
        cleanup.native();
        cleanup.native = undefined;
      }
      if (cleanup.shaka) {
        cleanup.shaka();
        cleanup.shaka = undefined;
      }

      // Clean up UI overlay - this will also destroy the player it manages
      const ui = uiRef.current;
      if (ui) {
        try {
          ui.destroy();
        } catch (err) {
          console.warn("Error destroying UI overlay:", err);
        }
        uiRef.current = null;
        playerRef.current = null;
      }

      // Clean up native video element if used
      if (video) {
        video.src = "";
        const tracks = video.querySelectorAll("track");
        tracks.forEach((track) => track.remove());
      }
      if (container) {
        const shakaElements = container.querySelectorAll(
          ".shaka-video-container, .shaka-controls-container, .shaka-spinner-container, .shaka-overflow-menu, .shaka-settings-menu",
        );
        console.log("Found Shaka elements to remove:", shakaElements.length);
        shakaElements.forEach((el) => el.remove());
      }
    };
  }, [movieId, episode]);

  // ... rest of the component remains the same
  if (error) {
    return (
      <div className="relative w-full aspect-video bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center border border-red-500/20 p-4">
        <div className="text-center space-y-4 w-full max-w-2xl">
          <div className="text-4xl md:text-6xl">⚠️</div>
          <h3 className="text-red-500 text-base md:text-lg font-semibold">
            Failed to Load Video
          </h3>
          <div className="bg-black/50 rounded-lg p-4 max-h-[200px] overflow-y-auto">
            <p className="text-gray-300 text-xs md:text-sm font-mono break-words whitespace-pre-wrap text-left">
              {error}
            </p>
          </div>
          <p className="text-gray-400 text-xs md:text-sm">
            Try switching to a different video source or refreshing the page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl">
      {isLoading && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-50">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full bg-white/10 animate-pulse" />
              </div>
            </div>
            <p className="text-gray-300 font-medium">Loading stream...</p>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className={`w-full aspect-video bg-black relative ${isLoading ? "opacity-0" : "opacity-100"}`}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          controls={useNativeControls}
          style={{ display: "block" }}
          preload="metadata"
        />
      </div>
    </div>
  );
}
