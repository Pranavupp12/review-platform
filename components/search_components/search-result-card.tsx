"use client";

import Link from "next/link";
import { Star, MapPin, ArrowRight, Building2 } from "lucide-react";
import { trackSearchClick } from "@/lib/track-click"; 

interface SearchResultCardProps {
  company: {
    id: string;
    name: string;
    slug: string;
    rating: number;
    reviewCount: number;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    briefIntroduction?: string | null;
    logoImage?: string | null;
  };
  searchQuery: string;   // Required for analytics
  userLocation?: string; // Explicit filter (e.g. "Chicago")
  userRegion?: string;   // ✅ New Prop: Physical location (e.g. "Delhi")
}

export function SearchResultCard({ company, searchQuery, userLocation, userRegion }: SearchResultCardProps) {
  
  // The Tracking Logic
  const handleTracking = () => {
    // ✅ Pass all 4 arguments: ID, Query, Filter Location, Physical Region
    trackSearchClick(
      company.id, 
      searchQuery, 
      userLocation || "global", 
      userRegion || "unknown"
    );
  };

  return (
    <Link 
      href={`/company/${company.slug}`}
      onClick={handleTracking}
      className="group block h-full"
    >
      <div className="h-full flex flex-col justify-between border border-gray-200 rounded-xl p-5 bg-white hover:shadow-lg transition-all duration-200 hover:border-blue-200">
        
        {/* TOP SECTION: Header & Rating */}
        <div>
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              {/* Fallback Logo Placeholder */}
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-100">
                {company.logoImage ? (
                  <img src={company.logoImage} alt={company.name} className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-5 w-5 text-gray-400" />
                )}
              </div>
              
              <div>
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors line-clamp-1">
                  {company.name}
                </h3>
                {/* Location Badge */}
                {(company.city || company.country) && (
                  <div className="flex items-center text-xs text-gray-500 mt-0.5">
                    <MapPin className="h-3 w-3 mr-1" />
                    {company.city}{company.city && company.country ? ", " : ""}{company.country}
                  </div>
                )}
              </div>
            </div>

            {/* Rating Badge */}
            <div className="flex flex-col items-end shrink-0">
               <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm font-bold ${
                 company.rating >= 4.0 ? "bg-green-100 text-green-700" :
                 company.rating >= 3.0 ? "bg-yellow-100 text-yellow-700" :
                 "bg-gray-100 text-gray-700"
               }`}>
                 <Star className="h-3.5 w-3.5 fill-current" />
                 {company.rating > 0 ? company.rating.toFixed(1) : "New"}
               </div>
               <span className="text-xs text-gray-400 mt-1">{company.reviewCount} reviews</span>
            </div>
          </div>

          {/* Description snippet */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {company.briefIntroduction || "No description available for this company."}
          </p>
        </div>

        {/* BOTTOM SECTION: CTA */}
        <div className="pt-4 mt-auto border-t border-gray-50 flex justify-between items-center">
           <span className="text-xs font-medium text-gray-400 group-hover:text-blue-500 transition-colors">
             View Company Profile
           </span>
           <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
             <ArrowRight className="h-4 w-4" />
           </div>
        </div>

      </div>
    </Link>
  );
}