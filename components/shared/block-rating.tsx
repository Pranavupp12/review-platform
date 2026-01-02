import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlockRatingProps {
  value: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BlockRating({ value, size = "md", className }: BlockRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  // --- CUSTOM ROUNDING LOGIC ---
  const getSnappedValue = (val: number) => {
    // 1. Fix floating point precision (e.g. 3.9 becoming 3.89999...)
    // This rounds the number to 1 decimal place cleanly.
    const cleanVal = Math.round(val * 10) / 10; 
    
    const integer = Math.floor(cleanVal);
    // Use proper math to get the decimal part to avoid messy floats like 0.89999
    const decimal = Math.round((cleanVal - integer) * 10) / 10;

    if (decimal >= 0.9) return integer + 1; // 3.9 -> 4.0
    if (decimal >= 0.4) return integer + 0.5; // 3.4 to 3.8 -> 3.5
    return integer; // 3.0 to 3.3 -> 3.0
  };

  const snappedValue = getSnappedValue(value);

  const getRatingColor = (r: number) => {
    // CHANGE 4.0 TO 3.5
    if (r >= 3.5) return "#0892A5"; // Teal (Now includes 3.5 and above)
    
    if (r >= 2.5) return "#EAB308"; // Yellow (2.5 to 3.0)
    return "#EF4444"; // Red (Below 2.5)
  };

  const activeColor = getRatingColor(snappedValue);

  const paddingClass = {
    sm: "p-1 rounded-[2px]",
    md: "p-2 rounded-sm",
    lg: "p-3 rounded-md",
  };

  const iconClass = {
    sm: "h-3 w-3",
    md: "h-5 w-5",
    lg: "h-8 w-8",
  };

  return (
    <div className={cn("flex gap-1", className)}>
      {stars.map((star) => {
        const isFull = snappedValue >= star;
        const isHalf = !isFull && snappedValue >= star - 0.5;

        return (
          <div
            key={star}
            className={cn(
              paddingClass[size],
              "flex items-center justify-center bg-gray-200"
            )}
            style={{
              background: isFull 
                ? activeColor 
                : isHalf 
                  ? `linear-gradient(90deg, ${activeColor} 50%, #e5e7eb 50%)` 
                  : undefined
            }}
          >
            <Star 
              className={cn(
                "text-white fill-white relative z-10", 
                iconClass[size]
              )} 
            />
          </div>
        );
      })}
    </div>
  );
}