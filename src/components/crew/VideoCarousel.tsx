"use client";

import { useState } from "react";
import { getEmbedUrl } from "@/lib/embed";

interface Clip {
  id: string;
  title: string;
  description: string | null;
  url: string;
  isFeatured: boolean;
}

interface VideoCarouselProps {
  clips: Clip[];
}

export default function VideoCarousel({ clips }: VideoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (clips.length === 0) return null;

  const current = clips[currentIndex];
  const embedUrl = getEmbedUrl(current.url);

  return (
    <div>
      {/* Header */}
      <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888] mb-3">
        SHOWREEL & CLIPS · {currentIndex + 1} OF {clips.length}
      </p>

      {/* Video player */}
      <div className="relative bg-[#111] rounded-lg overflow-hidden aspect-video">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={current.title}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <a
              href={current.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-16 h-16 rounded-full border-2 border-[#DBA508] flex items-center justify-center hover:bg-[#DBA508]/20 transition-colors"
            >
              <span className="text-[#DBA508] text-[24px] ml-1">▶</span>
            </a>
          </div>
        )}

        {/* Title overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5 pt-12 pointer-events-none">
          <p className="text-white text-[16px] font-bold">{current.title}</p>
          {current.description ? (
            <p className="text-white/70 text-[13px] mt-0.5">{current.description}</p>
          ) : null}
        </div>

        {/* Left arrow */}
        {clips.length > 1 ? (
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50 transition-colors disabled:opacity-30 disabled:cursor-default"
            aria-label="Previous clip"
          >
            ‹
          </button>
        ) : null}

        {/* Right arrow */}
        {clips.length > 1 ? (
          <button
            onClick={() => setCurrentIndex(Math.min(clips.length - 1, currentIndex + 1))}
            disabled={currentIndex === clips.length - 1}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50 transition-colors disabled:opacity-30 disabled:cursor-default"
            aria-label="Next clip"
          >
            ›
          </button>
        ) : null}
      </div>

      {/* Dot navigation */}
      {clips.length > 1 ? (
        <div className="flex items-center justify-center gap-2 mt-3">
          {clips.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === currentIndex ? "bg-[#111]" : "bg-[#DDD] hover:bg-[#AAA]"
              }`}
              aria-label={`Go to clip ${i + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
