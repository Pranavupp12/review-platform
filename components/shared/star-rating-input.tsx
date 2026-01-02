"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingInputProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
}

export function StarRatingInput({ rating, onRatingChange, disabled = false }: StarRatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating > 0 ? hoverRating : rating;

  // 1. UPDATED ADJECTIVE LOGIC
  const getRatingAdjective = (r: number) => {
    if (r === 0) return "";
    
    // 5 Stars (Exact)
    if (r === 5.0) return "Excellent";
    
    // 4.0 - 4.5
    if (r >= 4.0) return "Great";
    
    // 3.0 - 3.5
    if (r >= 3.0) return "Okay";
    
    // 2.0 - 2.5
    if (r >= 2.0) return "Could've been better";
    
    // 1.0 - 1.5
    return "Not good";
  };

  // 2. COLOR LOGIC (Matching your previous request)
  // 3.5 - 5.0: Teal
  // 2.0 - 3.0: Yellow
  // 1.0 - 1.5: Red
  const getRatingColor = (r: number) => {
    if (r >= 3.5) return "#0892A5"; // Teal
    if (r >= 2.0) return "#EAB308"; // Yellow
    return "#EF4444"; // Red
  };

  const activeColor = getRatingColor(displayRating);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; 
    const width = rect.width;
    const isHalf = x < width / 2;
    const newRating = isHalf ? index - 0.5 : index;
    setHoverRating(newRating);
  };

  return (
    <div 
      className="flex flex-col items-center gap-3" 
      onMouseLeave={() => setHoverRating(0)}
    >
      {/* Stars Row */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((index) => {
          const isFull = displayRating >= index;
          const isHalf = !isFull && displayRating >= index - 0.5;

          return (
            <div
              key={index}
              className={cn(
                "relative p-2 rounded-sm cursor-pointer transition-transform duration-150 flex items-center justify-center overflow-hidden",
                !disabled && "hover:scale-105",
                disabled && "cursor-default opacity-50",
                "bg-gray-200"
              )}
              style={{
                background: isFull 
                  ? activeColor 
                  : isHalf 
                    ? `linear-gradient(90deg, ${activeColor} 50%, #e5e7eb 50%)` 
                    : undefined
              }}
              onMouseMove={(e) => handleMouseMove(e, index)}
              onClick={() => !disabled && hoverRating > 0 && onRatingChange(hoverRating)}
            >
              <Star className="h-8 w-8 text-white fill-white relative z-10" />
            </div>
          );
        })}
      </div>
      
      {/* Adjective displayed BELOW stars */}
      <span 
        className="text-2xl font-bold transition-colors duration-200 h-8 text-center"
        style={{ color: displayRating > 0 ? activeColor : "#000032" }}
      >
        {getRatingAdjective(displayRating)}
      </span>
    </div>
  );
}