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
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

const PRESET_CITIES = [
  "New York", "San Francisco", "Austin",
  "London", "Manchester", "Leeds",
  "Mumbai", "Delhi", "Bangalore"
];

interface FilterSheetProps {
  relatedSubCategories: { id: string; name: string; slug: string }[];
  currentCategoryId: string; 
}

export function FilterSheet({ relatedSubCategories, currentCategoryId }: FilterSheetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname(); 
  const [open, setOpen] = React.useState(false);
  const [isLocating, setIsLocating] = React.useState(false);

  const [rating, setRating] = React.useState(searchParams.get("rating") || "all");
  const [claimed, setClaimed] = React.useState(searchParams.get("claimed") === "true");
  const [selectedCity, setSelectedCity] = React.useState(searchParams.get("loc") || "");
  const [selectedSubSlug, setSelectedSubSlug] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setRating(searchParams.get("rating") || "all");
      setClaimed(searchParams.get("claimed") === "true");
      setSelectedCity(searchParams.get("loc") || "");
      setSelectedSubSlug(null); 
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
    
    if (rating && rating !== "all") params.set("rating", rating);
    else params.delete("rating");

    if (claimed) params.set("claimed", "true");
    else params.delete("claimed");

    if (selectedCity) params.set("loc", selectedCity);
    else params.delete("loc");
    
    params.delete("zip");
    params.delete("country");

    let basePath = pathname; 

    if (selectedSubSlug) {
       basePath = `/categories/${currentCategoryId}/${selectedSubSlug}`;
    }

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
          <Filter className="h-4 w-4 mr-2" /> <TranslatableText text="All filters" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full p-0" side="right">
        
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-2xl font-bold">
            <TranslatableText text="All filters" />
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Rating Filter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-900">
                <TranslatableText text="Rating" />
            </h3>
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
                   {val !== "all" && "★"} {val === "all" ? <TranslatableText text="All" /> : `${val}+`}
                </button>
              ))}
            </div>
          </div>

          {/* City Filter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-900">
                <TranslatableText text="City" />
            </h3>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-full">
                {/* Note: SelectValue renders the selected value. 
                    We wrap the placeholder but the selected city itself (e.g. "Delhi") isn't typically translated. */}
                <SelectValue placeholder={<TranslatableText text="Select a city" />} />
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
                    {isLocating ? <TranslatableText text="Locating..." /> : <TranslatableText text="Use current location" />}
                </div>
                {PRESET_CITIES.map((city) => (
                  <SelectItem key={city} value={city}>
                    {/* Cities are proper nouns, but can be wrapped if desired */}
                    <TranslatableText text={city} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-900">
                <TranslatableText text="Company status" />
            </h3>
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="claimed" 
                checked={claimed}
                onCheckedChange={(checked) => setClaimed(checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="claimed" className="text-sm font-medium leading-none">
                  <TranslatableText text="Claimed" />
                </Label>
                <p className="text-sm text-muted-foreground">
                  <TranslatableText text="Show only verified companies." />
                </p>
              </div>
            </div>
          </div>

          {/* Subcategories Filter */}
          {relatedSubCategories.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-gray-900">
                <TranslatableText text="Subcategories" />
              </h3>
              <div className="flex flex-wrap gap-2">
                {relatedSubCategories.map((sub) => {
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
                      onClick={() => {
                          const slug = sub.slug || sub.name.toLowerCase().replace(/ /g, '-');
                          setSelectedSubSlug(prev => prev === slug ? null : slug);
                      }}
                    >
                      <TranslatableText text={sub.name} />
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
             <TranslatableText text="Reset" />
           </Button>
           <Button onClick={handleApply} className="bg-[#000032] hover:bg-[#000032]/90 text-white px-8 rounded-full">
             <TranslatableText text="Show Results" />
           </Button>
        </SheetFooter>

      </SheetContent>
    </Sheet>
  );
}