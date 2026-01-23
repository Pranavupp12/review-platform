"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  MapPin, 
  Check, 
  ChevronsUpDown, 
  Loader2,
  X,
  Navigation
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { identifySearchIntent } from "@/lib/search-action";
import { useAutoLocation } from "@/lib/hooks/use-auto-location"; 
// ✅ 1. Import Translation tools
import { TranslatableText } from "@/components/shared/translatable-text";
import { useTranslation } from "@/components/shared/translation-context";
import { translateContent } from "@/lib/translation-action";

interface SearchBarProps {
  className?: string;
  locations: string[]; 
}

export function SearchBar({ className, locations }: SearchBarProps) {
  const router = useRouter();
  
  // Search State
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = React.useTransition();

  const [hasInteracted, setHasInteracted] = useState(false);
  const detectedCity = useAutoLocation();

  // ✅ Custom Hook to translate placeholders (since we can't put components in props)
  const useTranslatedPlaceholder = (text: string) => {
    const { targetLang } = useTranslation();
    const [translated, setTranslated] = useState(text);

    useEffect(() => {
      if (targetLang === 'en') {
        setTranslated(text);
        return;
      }
      let isMounted = true;
      translateContent(text, targetLang).then((res) => {
        if (isMounted && res.translation) setTranslated(res.translation);
      });
      return () => { isMounted = false; };
    }, [targetLang, text]);

    return translated;
  };

  // ✅ Prepare Translated Placeholders
  const queryPlaceholder = useTranslatedPlaceholder("Search for companies, categories...");
  const locationSearchPlaceholder = useTranslatedPlaceholder("Search locations...");

  // 3. Auto-Select Logic
  useEffect(() => {
    if (detectedCity && !location && !hasInteracted) {
      const match = locations.find(dbLoc => 
        dbLoc.toLowerCase().includes(detectedCity.toLowerCase())
      );
      if (match) {
        setLocation(match);
      }
    }
  }, [detectedCity, location, locations, hasInteracted]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() && !location.trim()) return;

    startTransition(async () => {
      const cleanLocation = location.split(',')[0].trim();

      try {
        const redirectPath = await identifySearchIntent({ 
            query, 
            location: cleanLocation ,
            userRegion: detectedCity
        });

        if (redirectPath) {
          router.push(redirectPath);
        } else {
          const params = new URLSearchParams();
          if (query) params.set("query", query);
          if (cleanLocation) params.set("loc", cleanLocation); 
          router.push(`/search?${params.toString()}`);
        }
      } catch (error) {
        console.error("Search failed", error);
        const params = new URLSearchParams();
        if (query) params.set("query", query);
        if (cleanLocation) params.set("loc", cleanLocation);
        router.push(`/search?${params.toString()}`);
      }
    });
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className={cn(
        "flex flex-col md:flex-row items-center bg-white p-2 rounded-2xl md:rounded-full shadow-md border border-gray-100 mx-auto gap-2 md:gap-0",
        className
      )}
    >
      
      {/* Query Input */}
      <div className="relative w-full md:flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input 
          id="search-query"
          placeholder={queryPlaceholder} // ✅ Using Translated Placeholder
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border-0 shadow-none focus-visible:ring-0 pl-12 h-12 text-base bg-transparent rounded-full text-gray-900 placeholder:text-gray-500"
          disabled={isPending}
        />
      </div>

      <div className="hidden md:block w-[1px] h-8 bg-gray-200 mx-2" />

      {/* Location Dropdown */}
      <div className="relative w-full md:w-[240px]">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between border-0 shadow-none h-12 text-base font-normal px-4 hover:bg-gray-50 text-gray-700"
            >
              {location ? (
                <div className="flex items-center gap-2 truncate">
                   <MapPin className="h-4 w-4 text-[#0ABED6] shrink-0" />
                   {/* We don't translate the selected location value (e.g. "Delhi") as it's a proper noun/DB value */}
                   <span className="truncate">{location}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                   {!detectedCity ? <Navigation className="h-3 w-3 animate-pulse" /> : null}
                   {/* ✅ Translated Dropdown Label */}
                   <span><TranslatableText text="Select City/State" /></span>
                </div>
              )}
              
              {/* Clear Button */}
              {location ? (
                 <div 
                    onClick={(e) => {
                        e.stopPropagation();
                        setLocation("");
                        setHasInteracted(true); 
                    }}
                    className="ml-2 hover:bg-gray-200 rounded-full p-1 cursor-pointer"
                 >
                    <X className="h-3 w-3 text-gray-400" />
                 </div>
              ) : (
                 <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              )}
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-[240px] p-0" align="start">
            <Command>
              {/* ✅ Translated Command Input Placeholder */}
              <CommandInput placeholder={locationSearchPlaceholder} />
              <CommandList>
                <CommandEmpty>
                    {/* ✅ Translated Empty State */}
                    <TranslatableText text="No locations found." />
                </CommandEmpty>
                <CommandGroup>
                  {locations.map((loc) => (
                    <CommandItem
                      key={loc}
                      value={loc}
                      onSelect={() => {
                        setLocation(loc); 
                        setHasInteracted(true); 
                        setOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          location === loc ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {loc}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Search Button */}
      <Button 
        type="submit" 
        size="lg" 
        disabled={isPending}
        className="w-full md:w-auto rounded-xl md:rounded-full px-8 bg-[#0ABED6] hover:bg-[#0ABED6]/80 text-white h-12 font-semibold shadow-sm"
      >
        {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" /> 
        ) : (
            // ✅ Translated Button Text
            <TranslatableText text="Search" />
        )}
      </Button>

    </form>
  );
}