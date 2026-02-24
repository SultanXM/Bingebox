"use client";

import { useEffect, useRef, useState } from "react";
import shaka from "shaka-player/dist/shaka-player.ui";
import "shaka-player/dist/controls.css";

interface DevVideoPlayerProps {
  title: string;
}

const DEV_VIDEO_URL = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

// Simulated delay for signed URL (in ms)
const SIGNED_URL_DELAY = 1500;

export default function DevVideoPlayer({}: DevVideoPlayerProps) {
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

  // Initialize Shaka player
  useEffect(() => {
    // Capture refs early to avoid stale closure issues
    const video = videoRef.current;
    const container = containerRef.current;
    const cleanup = cleanupFunctions.current;

    if (video) {
      video.controls = false;
    }

    // Create a unique storage key for this video (dev mode uses static video)
    const getStorageKey = () => {
      return `video_position_dev_mode`;
    };

    // Save current playback position to localStorage
    const savePosition = (currentTime: number) => {
      try {
        localStorage.setItem(getStorageKey(), currentTime.toString());
      } catch (err) {
        console.warn("[DEV MODE] Failed to save playback position:", err);
      }
    };

    // Load saved playback position from localStorage
    const loadPosition = (): number | null => {
      try {
        const saved = localStorage.getItem(getStorageKey());
        return saved ? parseFloat(saved) : null;
      } catch (err) {
        console.warn("[DEV MODE] Failed to load playback position:", err);
        return null;
      }
    };

    // Install polyfills for browsers that need them
    shaka.polyfill.installAll();

    const fetchAndPlay = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!video || !container) return;

        console.log("[DEV MODE] Simulating signed URL fetch...");

        // Simulate API delay for signed URL
        await new Promise((resolve) => setTimeout(resolve, SIGNED_URL_DELAY));

        console.log("[DEV MODE] Loading development video player");

        const videoUrl = DEV_VIDEO_URL;

        // Check if browser supports native HLS (Safari, iOS)
        const canPlayHLS = video.canPlayType("application/vnd.apple.mpegurl");

        if (canPlayHLS) {
          // Use native HLS playback for Safari/iOS
          console.log("[DEV MODE] Using native HLS playback");
          setUseNativeControls(true);
          video.src = videoUrl;

          // Restore saved position for native playback
          const savedPosition = loadPosition();
          if (savedPosition && savedPosition > 0) {
            video.addEventListener(
              "loadedmetadata",
              () => {
                video.currentTime = savedPosition;
                console.log(
                  `[DEV MODE] Restored playback position: ${savedPosition}s`,
                );
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
          if (!cleanup.native) {
            cleanup.native = () => {
              clearInterval(saveInterval);
              video.removeEventListener("pause", handlePause);
              window.removeEventListener("beforeunload", handleBeforeUnload);
            };
          }

          setIsLoading(false);
          return;
        }

        // Use Shaka Player for browsers without native HLS support
        if (!shaka.Player.isBrowserSupported()) {
          setError("Browser not supported. Please use a modern browser.");
          setIsLoading(false);
          return;
        }

        // Ensure native controls are disabled
        video.controls = false;

        // Create the player instance first (as per official Shaka docs)
        const localPlayer = new shaka.Player();
        playerRef.current = localPlayer;

        // Create the UI overlay with the player instance
        const ui = new shaka.ui.Overlay(localPlayer, container, video);
        uiRef.current = ui;

        // Attach the player to the video element
        await localPlayer.attach(video);

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

        // Configure player for HLS streaming (matching production config)
        player.configure({
          streaming: {
            retryParameters: {
              timeout: 30000,
              maxAttempts: 1, // sometimes i get 500's for decoding the response and i think if it's set low enough it will retry the playlist faster and will work fine
              baseDelay: 500,
              backoffFactor: 1.5,
              fuzzFactor: 0.5,
            },
            bufferingGoal: 30,
            rebufferingGoal: 2,
            failureCallback: (error: shaka.util.Error) => {
              // Log segment failures but don't treat as fatal
              console.warn(
                "[DEV MODE] Segment load failure (will retry):",
                error,
              );
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

          // Check if this is a recoverable error that Shaka will retry
          const isRecoverable =
            shakaError.severity === shaka.util.Error.Severity.RECOVERABLE ||
            shakaError.category === shaka.util.Error.Category.NETWORK;

          if (isRecoverable) {
            console.warn(
              "[DEV MODE] Recoverable Shaka Player Error (will retry):",
              shakaError,
            );
            return;
          }

          console.error("[DEV MODE] Fatal Shaka Player Error:", shakaError);
          setError(
            `Playback Error (${shakaError.code}): ${shakaError.message || "Unknown error"}`,
          );
        });

        console.log(
          "[DEV MODE] Loading video URL with Shaka Player:",
          videoUrl,
        );
        await player.load(videoUrl);

        // Restore saved position for Shaka Player
        const savedPosition = loadPosition();
        if (savedPosition && savedPosition > 0) {
          video.currentTime = savedPosition;
          console.log(
            `[DEV MODE] Restored playback position: ${savedPosition}s`,
          );
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
        if (!cleanup.shaka) {
          cleanup.shaka = () => {
            clearInterval(saveInterval);
            if (video) {
              video.removeEventListener("pause", handlePause);
            }
            window.removeEventListener("beforeunload", handleBeforeUnload);
          };
        }

        console.log("[DEV MODE] Video loaded successfully");
        setIsLoading(false);
      } catch (err) {
        console.error("[DEV MODE] Error setting up video player:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load development video",
        );
        setIsLoading(false);
      }
    };

    fetchAndPlay();

    return () => {
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
      // Destroying UI first prevents "Node.removeChild" errors
      const ui = uiRef.current;
      if (ui) {
        try {
          ui.destroy();
        } catch (err) {
          console.warn("[DEV MODE] Error destroying UI overlay:", err);
        }
        uiRef.current = null;
        playerRef.current = null; // Player is destroyed by UI overlay
      }

      // Clean up native video element if used
      if (video) {
        video.src = "";
        // Remove all track elements
        const tracks = video.querySelectorAll("track");
        tracks.forEach((track) => track.remove());
      }
    };
  }, []);

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
      {/* Development mode badge */}
      <div className="absolute top-4 left-4 z-50 bg-yellow-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-black">
        DEV MODE
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-black flex items-center justify-center z-50">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500 mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full bg-purple-500/20 animate-pulse" />
              </div>
            </div>
            <p className="text-gray-300 font-medium">Loading stream...</p>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className={`w-full aspect-video bg-black relative ${isLoading ? "opacity-0" : "opacity-100"}`}
        data-shaka-player-container
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
