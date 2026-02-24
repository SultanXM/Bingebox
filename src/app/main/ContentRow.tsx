"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Movie, TVShow } from "../lib/types";
import ContentCard from "./ContentCard";

interface ContentRowProps {
  title: string;
  items: (Movie | TVShow)[];
  contentType?: "movie" | "tv";
  genreId?: number;
}

export default function ContentRow({
  title,
  items,
  contentType,
  genreId,
}: ContentRowProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const offsetRef = useRef(0);

  useEffect(() => {
    setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const getMaxOffset = useCallback(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return 0;
    return Math.max(0, inner.scrollWidth - outer.clientWidth);
  }, []);

  const checkScroll = useCallback(() => {
    if (isTouchDevice) {
      const el = outerRef.current;
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    } else {
      const maxOffset = getMaxOffset();
      setCanScrollLeft(offsetRef.current > 0);
      setCanScrollRight(offsetRef.current < maxOffset - 1);
    }
  }, [isTouchDevice, getMaxOffset]);

  const setOffset = useCallback(
    (newOffset: number) => {
      const inner = innerRef.current;
      if (!inner) return;
      const maxOffset = getMaxOffset();
      const clamped = Math.max(0, Math.min(maxOffset, newOffset));
      offsetRef.current = clamped;
      inner.style.transform = `translateX(-${clamped}px)`;
      checkScroll();
    },
    [getMaxOffset, checkScroll],
  );

  useEffect(() => {
    checkScroll();
    const el = outerRef.current;
    if (!el) return;

    if (isTouchDevice) {
      el.addEventListener("scroll", checkScroll, { passive: true });
    }
    window.addEventListener("resize", checkScroll);

    let animId: number | null = null;
    const handleWheel = (e: WheelEvent) => {
      if (isTouchDevice) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && e.deltaX !== 0) {
        if (animId) cancelAnimationFrame(animId);
        animId = requestAnimationFrame(() => {
          setOffset(offsetRef.current + e.deltaX);
          animId = null;
        });
      }
    };
    el.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      if (isTouchDevice) {
        el.removeEventListener("scroll", checkScroll);
      }
      el.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", checkScroll);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [checkScroll, items, isTouchDevice, setOffset]);

  const scroll = (direction: "left" | "right") => {
    const el = outerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;

    if (isTouchDevice) {
      el.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    } else {
      const target = offsetRef.current + (direction === "left" ? -amount : amount);
      const inner = innerRef.current;
      if (!inner) return;
      inner.style.transition = "transform 400ms cubic-bezier(0.4, 0, 0.2, 1)";
      setOffset(target);
      const onEnd = () => {
        inner.style.transition = "";
        inner.removeEventListener("transitionend", onEnd);
      };
      inner.addEventListener("transitionend", onEnd);
    }
  };

  if (items.length === 0) return null;

  return (
    <div 
      className="mb-6 sm:mb-8 group/row"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Row Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 mb-3">
        <h2 className="text-white text-base sm:text-lg md:text-xl font-semibold">
          {title}
        </h2>
        {genreId && (
          <button className="text-xs sm:text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1 group/btn">
            See All
            <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
          </button>
        )}
      </div>

      {/* Row Content */}
      <div className="relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className={`absolute left-0 top-0 bottom-0 z-20 w-10 sm:w-12 bg-gradient-to-r from-black/80 to-transparent text-white items-center justify-center transition-all duration-300 hidden md:flex ${
              isHovering ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </div>
          </button>
        )}

        {/* Scroll Container */}
        <div
          ref={outerRef}
          className="scroll-row scrollbar-hide overflow-x-auto sm:overflow-x-hidden"
        >
          <div
            ref={innerRef}
            className="flex gap-2 sm:gap-3 px-4 sm:px-6 w-max will-change-transform"
          >
            {items.map((item, index) => (
              <ContentCard
                key={item.id}
                item={item}
                contentType={contentType}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className={`absolute right-0 top-0 bottom-0 z-20 w-10 sm:w-12 bg-gradient-to-l from-black/80 to-transparent text-white items-center justify-center transition-all duration-300 hidden md:flex ${
              isHovering ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center transition-colors">
              <ChevronRight className="h-5 w-5" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
