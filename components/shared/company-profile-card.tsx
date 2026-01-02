// components/shared/company-profile-card.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// These props now match your Prisma Schema directly
type CompanyProfileCardProps = {
  id: string;          // Matches Prisma 'id'
  name: string;        // Matches Prisma 'name'
  slug: string;
  logoImage?: string | null; // Matches Prisma 'logoImage'
  websiteUrl?: string | null; // Matches Prisma 'websiteUrl'
  
  // These are aggregated values (calculated from the 'reviews' relation)
  rating: number;      
  reviewCount: number; 
  
  className?: string;
};

const StarRatingDisplay = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className="flex items-center gap-0.5 text-yellow-500">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-4 w-4 fill-yellow-500" />
      ))}
      {hasHalfStar && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 opacity-50" />}
      {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      ))}
    </div>
  );
};

export function CompanyProfileCard({
  id,
  slug,
  name,
  websiteUrl,
  logoImage,
  rating,
  reviewCount,
  className,
}: CompanyProfileCardProps) {
  return (
    // We use the ID for the link, which is standard
    <Link href={`/company/${slug}`}> 
      <Card className={cn(
        "group h-full flex flex-col justify-between p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200",
        className
      )}>
        <CardContent className="flex flex-col items-start p-0">
          <Avatar className="h-12 w-12 mb-4 rounded-md border">
            {/* Handle potential null logoImage */}
            <AvatarImage src={logoImage || ''} alt={`${name} logo`} />
            <AvatarFallback className="rounded-md bg-gray-100 text-gray-700 font-bold text-lg">
              {name[0]}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {/* Display websiteUrl, or fallback if null */}
            {websiteUrl || 'No website'}
          </p>
        </CardContent>
        <div className="mt-4 flex items-center gap-2">
          <StarRatingDisplay rating={rating} />
          <span className="text-sm text-muted-foreground">
            {rating.toFixed(1)} ({reviewCount.toLocaleString()})
          </span>
        </div>
      </Card>
    </Link>
  );
}