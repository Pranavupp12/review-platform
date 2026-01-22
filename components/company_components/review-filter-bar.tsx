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
// ✅ Import Translation Component & Context for placeholders
import { TranslatableText } from "@/components/shared/translatable-text";
import { useTranslation } from "@/components/shared/translation-context";
import { translateContent } from "@/lib/translation-action";

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
  const { targetLang } = useTranslation();
  const [searchPlaceholder, setSearchPlaceholder] = useState("Search reviews...");

  // Translate placeholder
  useEffect(() => {
    if (targetLang === 'en') {
        setSearchPlaceholder("Search reviews...");
        return;
    }
    translateContent("Search reviews...", targetLang).then(res => {
        if(res.translation) setSearchPlaceholder(res.translation);
    });
  }, [targetLang]);

  const cleanedKeywords = useMemo(() => {
    const topicSet = new Set<string>();
    topKeywords.forEach(k => {
      const topic = k.split(':')[0].trim();
      if (topic) topicSet.add(topic);
    });
    return Array.from(topicSet);
  }, [topKeywords]);

  useEffect(() => {
    setSearchText(searchParams.get("search") || "");
  }, [searchParams]);

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
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                <TranslatableText text="Reviews" />
            </h2>
            
            <div className="flex gap-3 w-full sm:w-auto items-center">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder={searchPlaceholder} 
                      className="pl-9 h-10 bg-white border-gray-200 rounded-4xl focus-visible:ring-[#0ABED6]" 
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>

                <Select value={activeSort} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[160px] h-10 rounded-full border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium">
                    {/* Placeholder for select is usually static since value is controlled, but we can wrap it */}
                    <SelectValue placeholder={<TranslatableText text="Sort by" />} />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="recent">
                        <TranslatableText text="Most Recent" />
                    </SelectItem>
                    <SelectItem value="rating_high">
                        <TranslatableText text="Highest Rated" />
                    </SelectItem>
                    <SelectItem value="rating_low">
                        <TranslatableText text="Lowest Rated" />
                    </SelectItem>
                  </SelectContent>
                </Select>
            </div>
        </div>

        {/* Popular Mentions */}
        {cleanedKeywords.length > 0 && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-3">
               <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                 <TranslatableText text="Popular Mentions" />
               </p>
               
               {(activeTag || searchText) && (
                  <button 
                    onClick={handleClearFilters}
                    className="text-xs text-[#0ABED6] hover:underline flex items-center gap-1 font-medium"
                  >
                    <X className="h-3 w-3" /> <TranslatableText text="Clear filters" />
                  </button>
               )}
            </div>

            <div className="flex flex-wrap gap-2">
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
                      {/* Keywords are dynamic and extracted from reviews, usually kept raw */}
                      <TranslatableText text={keyword} />
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