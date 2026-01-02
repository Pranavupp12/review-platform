"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReviewFilterBarProps {
  companySlug: string;
  topKeywords?: string[];
  activeTag?: string;
  activeSort?: string;
}

export function ReviewFilterBar({ 
  companySlug, 
  topKeywords = [], 
  activeTag, 
  activeSort = 'recent' 
}: ReviewFilterBarProps) {
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchText, setSearchText] = useState(searchParams.get("search") || "");

  // ✅ NEW: Clean and Deduplicate Keywords
  // This converts "Staff:Positive:Manager" -> "Staff" and removes duplicates
  const cleanedKeywords = useMemo(() => {
    const topicSet = new Set<string>();
    
    topKeywords.forEach(k => {
      // Split by colon and take the first part (Topic)
      // If no colon exists (old data), it just takes the whole string
      const topic = k.split(':')[0].trim();
      if (topic) topicSet.add(topic);
    });

    return Array.from(topicSet);
  }, [topKeywords]);

  // Sync state with URL
  useEffect(() => {
    setSearchText(searchParams.get("search") || "");
  }, [searchParams]);

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentSearchInUrl = searchParams.get("search") || "";
      
      if (searchText !== currentSearchInUrl) {
        const params = new URLSearchParams(searchParams.toString());
        if (searchText) {
          params.set("search", searchText);
        } else {
          params.delete("search");
        }
        router.push(`/company/${companySlug}?${params.toString()}`, { scroll: false });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText, router, companySlug, searchParams]);

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`/company/${companySlug}?${params.toString()}`, { scroll: false });
  };

  const createTagUrl = (keyword: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeTag === keyword) {
      params.delete("tag");
    } else {
      params.set("tag", keyword);
    }
    return `/company/${companySlug}?${params.toString()}`;
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("tag");
    setSearchText("");
    router.push(`/company/${companySlug}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="bg-white p-6 border-none space-y-4 sticky top-16 z-20">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Reviews</h2>
            
            <div className="flex gap-3 w-full sm:w-auto items-center">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search reviews..." 
                      className="pl-9 h-10 bg-white border-gray-200 rounded-4xl focus-visible:ring-[#0ABED6]" 
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>

                <Select value={activeSort} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[160px] h-10 rounded-full border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="rating_high">Highest Rated</SelectItem>
                    <SelectItem value="rating_low">Lowest Rated</SelectItem>
                  </SelectContent>
                </Select>
            </div>
        </div>

        {/* Popular Mentions */}
        {cleanedKeywords.length > 0 && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-3">
               <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                 Popular Mentions
               </p>
               
               {(activeTag || searchText) && (
                  <button 
                    onClick={handleClearFilters}
                    className="text-xs text-[#0ABED6] hover:underline flex items-center gap-1 font-medium"
                  >
                    <X className="h-3 w-3" /> Clear filters
                  </button>
               )}
            </div>

            <div className="flex flex-wrap gap-2">
              {/* ✅ UPDATED: Map over 'cleanedKeywords' instead of raw 'topKeywords' */}
              {cleanedKeywords.map((keyword) => {
                const isActive = activeTag === keyword;
                return (
                  <Link key={keyword} href={createTagUrl(keyword)} scroll={false}>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "cursor-pointer px-3 py-1.5 text-sm rounded-full transition-all capitalize",
                        isActive 
                          ? "bg-[#0ABED6] text-white border-[#0ABED6] shadow-sm" 
                          : "bg-white text-gray-600 border-gray-200 hover:border-[#0ABED6] hover:text-[#0ABED6] hover:bg-cyan-50"
                      )}
                    >
                      {keyword}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
    </div>
  );
}