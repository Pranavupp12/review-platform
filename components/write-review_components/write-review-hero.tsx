import { SearchBar } from '@/components/shared/search-bar'; 
import { prisma } from "@/lib/prisma";
// ✅ Import the Translator Component
import { TranslatableText } from "@/components/shared/translatable-text";

export async function WriteReviewHero() { 
  
  // 3. FETCH LOCATIONS (Standard Logic)
  const locationsData = await prisma.company.findMany({
    select: { city: true, state: true },
    distinct: ['city', 'state'], 
    where: {
      OR: [
        { city: { not: null } },
        { state: { not: null } }
      ]
    }
  });

  // Format: ["Bangalore", "West Delhi, Delhi"]
  const uniqueLocations = Array.from(new Set(
    locationsData
      .map(l => {
        const parts = [l.city, l.state].filter(Boolean); 
        return parts.length > 0 ? parts.join(", ") : null;
      })
      .filter((l): l is string => !!l)
  )).sort();

  return (
    <div className="relative bg-gray-100 py-20 md:py-28 px-4 overflow-hidden">
      
      {/* --- Abstract Shapes (Patches) --- */}
      <div className="absolute top-50 left-120 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-accent/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-accent/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-48 h-24 bg-accent/40 rounded-full blur-3xl pointer-events-none" style={{ transform: 'rotate(-20deg)' }} />
      <div className="absolute hidden sm:block top-25 right-40 w-40 h-32 bg-accent/40 rounded-full blur-3xl pointer-events-none" style={{ transform: 'rotate(10deg)' }} />

      {/* Content Container */}
      <div className="relative z-10 container mx-auto max-w-4xl text-center">
        <h1 className="text-2xl md:text-4xl font-bold text-black mb-6 tracking-tight">
          {/* ✅ Translatable Title */}
          <TranslatableText text="What do you want to review?" />
        </h1>
        <p className="text-md md:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto opacity-95 font-medium">
          {/* ✅ Translatable Description */}
          <TranslatableText text="Find the company you want to review and share your experience. Your feedback helps others make better choices." />
        </p>

        {/* Search Bar Container */}
        <div>
           {/* 4. Pass locations prop */}
           <SearchBar 
              className='max-w-2xl lg:max-w-3xl' 
              locations={uniqueLocations} 
           />
        </div>
      </div>
    </div>
  );
}