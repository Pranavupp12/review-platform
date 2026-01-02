
"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Filter, MapPin, Navigation, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const PRESET_CITIES = [
  "New York", "San Francisco", "Austin",
  "London", "Manchester", "Leeds",
  "Mumbai", "Delhi", "Bangalore"
];

interface FilterSheetProps {
  relatedSubCategories: { id: string; name: string; slug: string }[];
  currentCategoryId: string; // This is the Category Slug
}

export function FilterSheet({ relatedSubCategories, currentCategoryId }: FilterSheetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname(); // To know if we are already on a subcategory page
  const [open, setOpen] = React.useState(false);
  const [isLocating, setIsLocating] = React.useState(false);

  // 1. State for Filters
  const [rating, setRating] = React.useState(searchParams.get("rating") || "all");
  const [claimed, setClaimed] = React.useState(searchParams.get("claimed") === "true");
  const [selectedCity, setSelectedCity] = React.useState(searchParams.get("loc") || "");
  
  // 2. NEW: State for Subcategory Selection
  // We initialize it to null. If the user is already on a subcategory page, 
  // we could technically pre-select it, but 'relatedSubCategories' usually excludes current.
  const [selectedSubSlug, setSelectedSubSlug] = React.useState<string | null>(null);

  // Reset state when sheet opens to match URL (optional but good UX)
  React.useEffect(() => {
    if (open) {
      setRating(searchParams.get("rating") || "all");
      setClaimed(searchParams.get("claimed") === "true");
      setSelectedCity(searchParams.get("loc") || "");
      setSelectedSubSlug(null); // Reset sub selection
    }
  }, [open, searchParams]);

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const data = await res.json();
        const detectedCity = data.city || data.locality || data.principalSubdivision;
        
        if (detectedCity) {
          setSelectedCity(detectedCity);
        } else {
          alert("Could not determine exact city.");
        }
      } catch (error) {
        console.error("Geocoding error:", error);
      } finally {
        setIsLocating(false);
      }
    }, (error) => {
      setIsLocating(false);
      alert("Location access denied.");
    });
  };

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // A. Apply Query Params (Rating, City, Claimed)
    if (rating && rating !== "all") params.set("rating", rating);
    else params.delete("rating");

    if (claimed) params.set("claimed", "true");
    else params.delete("claimed");

    if (selectedCity) params.set("loc", selectedCity);
    else params.delete("loc");
    
    params.delete("zip");
    params.delete("country");

    // B. Construct Base Path (Navigation Logic)
    let basePath = pathname; // Default to staying on current page

    if (selectedSubSlug) {
       // If a subcategory is selected, navigate to that specific page
       // URL: /categories/[categorySlug]/[subCategorySlug]
       basePath = `/categories/${currentCategoryId}/${selectedSubSlug}`;
    }

    // C. Execute Navigation
    router.push(`${basePath}?${params.toString()}`);
    setOpen(false);
  };

  const handleReset = () => {
    setRating("all");
    setClaimed(false);
    setSelectedCity("");
    setSelectedSubSlug(null);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="text-black bg-gray-50 border-black border hover:bg-gray-200">
          <Filter className="h-4 w-4 mr-2" /> All filters
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full p-0" side="right">
        
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-2xl font-bold">All filters</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Rating Filter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-900">Rating</h3>
            <div className="flex border rounded-md overflow-hidden divide-x">
              {["all", "3", "4", "4.5"].map((val) => (
                <button
                  key={val}
                  onClick={() => setRating(val)}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium transition-colors flex justify-center items-center gap-1",
                    rating === val ? "bg-[#0892A5]/10 text-[#0892A5]" : "hover:bg-gray-50 text-gray-700"
                  )}
                >
                   {val !== "all" && "★"} {val === "all" ? "All" : `${val}+`}
                </button>
              ))}
            </div>
          </div>

          {/* City Filter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-900">City</h3>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a city" />
              </SelectTrigger>
              <SelectContent>
                <div 
                    className="p-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100 text-sm text-[#0ABED6] font-medium border-b border-gray-100"
                    onClick={(e) => {
                        e.preventDefault();
                        handleCurrentLocation();
                    }}
                >
                    {isLocating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Navigation className="h-4 w-4" /> 
                    )}
                    {isLocating ? "Locating..." : "Use current location"}
                </div>
                {PRESET_CITIES.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-900">Company status</h3>
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="claimed" 
                checked={claimed}
                onCheckedChange={(checked) => setClaimed(checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="claimed" className="text-sm font-medium leading-none">
                  Claimed
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show only verified companies.
                </p>
              </div>
            </div>
          </div>

          {/* Subcategories Filter */}
          {relatedSubCategories.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-gray-900">Subcategories</h3>
              <div className="flex flex-wrap gap-2">
                {relatedSubCategories.map((sub) => {
                  // If the item is selected, it should look active
                  const isSelected = selectedSubSlug === (sub.slug || sub.name.toLowerCase().replace(/ /g, '-'));
                  
                  return (
                    <Button
                      key={sub.id}
                      variant="outline"
                      className={cn(
                        "rounded-full text-xs h-8 px-4 transition-all",
                        isSelected 
                           ? "bg-[#0892A5] text-white border-[#0892A5] hover:bg-[#0892A5]/90 hover:text-white"
                           : "hover:border-[#0892A5] hover:text-[#0892A5]"
                      )}
                      // Toggle selection on click
                      onClick={() => {
                          const slug = sub.slug || sub.name.toLowerCase().replace(/ /g, '-');
                          // If clicking the same one, deselect it. Otherwise select it.
                          setSelectedSubSlug(prev => prev === slug ? null : slug);
                      }}
                    >
                      {sub.name}
                      {isSelected && <X className="ml-1 h-3 w-3" />}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <SheetFooter className="p-6 border-t bg-gray-50 flex-row gap-4 sm:justify-between items-center">
           <Button variant="ghost" onClick={handleReset} className="text-gray-500 hover:text-gray-900">
             Reset
           </Button>
           <Button onClick={handleApply} className="bg-[#000032] hover:bg-[#000032]/90 text-white px-8 rounded-full">
             Show Results
           </Button>
        </SheetFooter>

      </SheetContent>
    </Sheet>
  );
}