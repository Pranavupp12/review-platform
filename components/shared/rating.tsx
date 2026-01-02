
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type RatingProps = {
  value: number;        
  max?: number;         
  size?: number;        
  className?: string;   
};

export function Rating({ 
  value, 
  max = 5, 
  size = 16, 
  className 
}: RatingProps) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  // --- CUSTOM THRESHOLD LOGIC ---
  // 1. Get the whole number part (e.g., 3)
  const integerPart = Math.floor(value);
  // 2. Get the decimal part (e.g., 0.9)
  const decimalPart = value - integerPart;

  let roundedValue = integerPart;

  // Rule: Only bump to next whole star if >= 0.95
  // Rule: Bump to half star if >= 0.25 (and < 0.95)
  if (decimalPart >= 0.95) {
    roundedValue = integerPart + 1;
  } else if (decimalPart >= 0.25) {
    roundedValue = integerPart + 0.5;
  }
  // Otherwise, it stays at integerPart (e.g., 3.1 -> 3.0 stars)

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {stars.map((starValue) => {
        const isFullStar = roundedValue >= starValue;
        const isHalfStar = roundedValue >= starValue - 0.5 && roundedValue < starValue;

        if (isFullStar) {
          return (
            <Star 
              key={starValue} 
              size={size} 
              className="fill-yellow-400 text-yellow-400 transition-colors" 
            />
          );
        }

        if (isHalfStar) {
          return (
            <div key={starValue} className="relative">
              <Star size={size} className="text-gray-200 fill-gray-200" />
              <div className="absolute top-0 left-0 overflow-hidden w-1/2">
                <Star size={size} className="fill-yellow-400 text-yellow-400" />
              </div>
            </div>
          );
        }

        return (
          <Star 
            key={starValue} 
            size={size} 
            className="fill-gray-200 text-gray-200" 
          />
        );
      })}
    </div>
  );
}