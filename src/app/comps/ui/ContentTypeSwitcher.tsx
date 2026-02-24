"use client";

import { useEffect, useState } from "react";

type ContentType = "movie" | "tv" | "all";

const labels: Record<ContentType, string> = {
  all: "All",
  movie: "Movie",
  tv: "TV",
};

interface ContentTypeSwitcherProps {
  selected: ContentType;
  onSwitch: (type: ContentType) => void;
  dominantColor?: string;
}

// Extract vibrant color from upper area of image
async function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve("rgba(100, 100, 120, 0.4)");
        return;
      }
      
      // Sample from upper area where movie colors are
      canvas.width = 80;
      canvas.height = 50;
      ctx.drawImage(img, 
        img.width * 0.2, 0, 
        img.width * 0.6, img.height * 0.4, 
        0, 0, 80, 50
      );
      
      const imageData = ctx.getImageData(0, 0, 80, 50);
      const data = imageData.data;
      let r = 0, g = 0, b = 0;
      let count = 0;
      
      // Sample every 10th pixel, skip dark
      for (let i = 0; i < data.length; i += 40) {
        const pr = data[i];
        const pg = data[i + 1];
        const pb = data[i + 2];
        
        const brightness = (pr + pg + pb) / 3;
        if (brightness < 60) continue;
        
        r += pr;
        g += pg;
        b += pb;
        count++;
      }
      
      if (count === 0) {
        resolve("rgba(100, 100, 120, 0.4)");
        return;
      }
      
      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);
      
      resolve(`rgba(${r}, ${g}, ${b}, 0.4)`);
    };
    img.onerror = () => resolve("rgba(100, 100, 120, 0.4)");
    img.src = imageUrl;
  });
}

export default function ContentTypeSwitcher({
  selected,
  onSwitch,
  dominantColor,
}: ContentTypeSwitcherProps) {
  const [bgColor, setBgColor] = useState("rgba(100, 100, 120, 0.4)");
  const [targetColor, setTargetColor] = useState("rgba(100, 100, 120, 0.4)");
  
  useEffect(() => {
    if (dominantColor) {
      setTargetColor(dominantColor);
    }
  }, [dominantColor]);
  
  useEffect(() => {
    let animationId: number;
    
    const animate = () => {
      setBgColor((prev) => {
        const parseRgba = (str: string) => {
          const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
          return match ? {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3]),
            a: parseFloat(match[4] || "1")
          } : { r: 100, g: 100, b: 120, a: 0.4 };
        };
        
        const current = parseRgba(prev);
        const target = parseRgba(targetColor);
        
        const speed = 0.08;
        const newR = current.r + (target.r - current.r) * speed;
        const newG = current.g + (target.g - current.g) * speed;
        const newB = current.b + (target.b - current.b) * speed;
        const newA = current.a + (target.a - current.a) * speed;
        
        const diff = Math.abs(newR - target.r) + Math.abs(newG - target.g) + 
                     Math.abs(newB - target.b) + Math.abs(newA - target.a) * 255;
        
        if (diff < 1) return targetColor;
        
        return `rgba(${Math.floor(newR)}, ${Math.floor(newG)}, ${Math.floor(newB)}, ${newA})`;
      });
      
      animationId = requestAnimationFrame(animate);
      return animationId;
    };
    
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [targetColor]);

  return (
    <div 
      className="inline-flex items-center space-x-1 rounded-full backdrop-blur-md p-1 border border-white/20"
      style={{ 
        backgroundColor: bgColor,
        boxShadow: `0 2px 8px ${bgColor.replace(/[\d.]+\)$/, '0.25)')}`
      }}
    >
      {(["all", "movie", "tv"] as ContentType[]).map((type) => (
        <button
          key={type}
          onClick={() => onSwitch(type)}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
            selected === type
              ? "bg-white text-black shadow-md"
              : "text-white/90 hover:bg-white/15"
          }`}
        >
          {labels[type]}
        </button>
      ))}
    </div>
  );
}

export { extractDominantColor };
