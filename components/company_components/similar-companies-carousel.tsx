"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BlockRating } from "@/components/shared/block-rating";
import { ArrowRight, ArrowLeft, Info } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

interface SimilarCompany {
  id: string;
  name: string;
  slug: string;
  logoImage?: string | null;
  websiteUrl?: string | null; 
  rating: number;
  reviewCount: number;
  address?: string | null;
}

interface SimilarCompaniesCarouselProps {
  categoryName: string;
  companies: SimilarCompany[];
}

export function SimilarCompaniesCarousel({ categoryName, companies }: SimilarCompaniesCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!companies || companies.length === 0) return null;

  const getDomain = (url?: string | null) => {
    if (!url) return "";
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300; 
      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full py-6 bg-white border-t border-b border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">
           {/* ✅ Translatable Header */}
           <TranslatableText text="Similar companies in" /> <TranslatableText text={categoryName} />
          </h2>
        </div>

        {/* Navigation Arrows */}
        <div className="hidden md:flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-full border-gray-200 hover:bg-[#0ABED6]"
            onClick={() => scroll('left')}
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-full border-gray-200 hover:bg-[#0ABED6]"
            onClick={() => scroll('right')}
          >
            <ArrowRight className="h-6 w-6 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Carousel Container */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto pb-6 gap-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth"
      >
        {companies.map((company) => (
          <Link 
            key={company.id} 
            href={`/company/${company.slug}`}
            className="flex-none w-[280px] bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 group flex flex-col justify-between h-[200px]"
          >
            {/* Top Section: Logo & Name */}
            <div>
              <div className="mb-4">
                 <Avatar className="h-14 w-14 rounded-lg"> 
                  <AvatarImage src={company.logoImage || ''} className="object-cover" />
                  <AvatarFallback className="rounded-lg text-xl font-bold text-gray-500 bg-gray-100">
                    {company.name.substring(0, 1)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:underline mb-1">
                  {/* Company names are usually not translated, but you can wrap if desired */}
                  {company.name}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {getDomain(company.websiteUrl)}
                </p>
              </div>
            </div>

            {/* Bottom Section: Rating */}
            <div className="flex items-center gap-2 mt-4">
              <div className="flex-shrink-0">
                <BlockRating value={company.rating} size="sm" /> 
              </div>
              <span className="text-sm font-medium text-gray-600">
                 {company.rating.toFixed(1)} 
                 <span className="text-gray-400 font-normal ml-1">
                   ({company.reviewCount})
                 </span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}