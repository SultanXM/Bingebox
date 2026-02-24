"use client";

import { useState } from "react";
import { Play } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
}

export default function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/10">
      <div className="relative aspect-video">
        {isLoading && (
          <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center z-10">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#E50914] flex items-center justify-center animate-pulse">
                <Play className="h-8 w-8 text-white fill-white ml-1" />
              </div>
              <p className="text-gray-400 text-sm">Loading player...</p>
            </div>
          </div>
        )}
        <iframe
          src={videoUrl}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          onLoad={() => setIsLoading(false)}
          title={`${title} - Video Player`}
          loading="eager"
        />
      </div>
    </div>
  );
}
