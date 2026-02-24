"use client";

import { Play } from 'lucide-react';
import { VideoSource } from '@/app/lib/types';

interface SourceSelectorProps {
  sources: VideoSource[];
  selectedSource: VideoSource;
  onSelectSource: (source: VideoSource) => void;
}

export default function SourceSelector({ sources, selectedSource, onSelectSource }: SourceSelectorProps) {
  return (
    <div className="flex justify-center">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full p-1.5 sm:p-2">
        <div className="flex items-center gap-1 sm:gap-2">
          {sources.map((source) => (
            <button
              key={source.id}
              onClick={() => onSelectSource(source)}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                selectedSource.id === source.id
                  ? "bg-white text-black shadow-lg"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Play className="h-3 w-3 fill-current" />
                <span>{source.name}</span>
                {source.quality && (
                  <span className="text-[10px] opacity-60 hidden sm:inline">
                    {source.quality}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
