import { prisma } from "@/lib/prisma";
import { HeroReviewCard } from './hero-review-card';
import { SearchBar } from '@/components/shared/search-bar'; 

interface HeroSearchProps {
  reviews: any[]; 
}

export async function HeroSearch({ reviews }: HeroSearchProps) {
  
  // ✅ 1. FETCH DATABASE LOCATIONS
  // We get unique combinations of City and State
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

  // ✅ 2. FORMAT INTO STRINGS
  // Result example: ["Austin, Texas", "Delhi", "Mumbai, Maharashtra", "New York, NY"]
  const availableLocations = Array.from(new Set(
    locationsData
      .map(l => {
        // Filter out empty values and join with comma
        const parts = [l.city, l.state].filter(Boolean); 
        return parts.length > 0 ? parts.join(", ") : null;
      })
      .filter((l): l is string => !!l) // Remove nulls
  )).sort();


  // 3. Prepare Reviews (Fallback to avoid crash)
  const safeReviews = reviews.length >= 3 ? reviews : reviews.concat(Array(3 - reviews.length).fill(null));

  return (
    <>
      <section className="relative bg-gray-50 py-20 sm:py-10 overflow-hidden">
        
        {/* Abstract shapes */}
        <div className="absolute bottom-20 hidden sm:block right-50 w-48 h-24 bg-accent rounded-full blur-3xl opacity-40 pointer-events-none" style={{ transform: 'rotate(-50deg)' }} />
        <div className="absolute bottom-10 left-10 w-48 h-24 bg-accent rounded-full blur-3xl opacity-30 pointer-events-none" style={{ transform: 'rotate(-20deg)' }} />
        <div className="absolute top-20 right-0 w-40 sm:w-60 h-32 bg-accent rounded-full blur-3xl opacity-40 pointer-events-none" style={{ transform: 'rotate(30deg)' }} />

        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* --- Left Column (Text & Search) --- */}
            <div className="text-center lg:text-left">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4 leading-tight">
                Choose your next company with confidence.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10">
                Your platform for finding and sharing genuine customer experiences.
              </p>

              <div className="relative">
                {/* ✅ 3. PASS LOCATIONS TO SEARCHBAR */}
                <SearchBar 
                   className='max-w-2xl lg:max-w-4xl' 
                   locations={availableLocations} // <--- Passing DB data
                />
              </div>
            </div>

            {/* --- Right Column: Dynamic Review Cards --- */}
            <div className="relative h-[600px] hidden lg:block w-full">
              {safeReviews[0] && (
                <div className="absolute top-0 left-10 z-20 transform -rotate-6 hover:z-50 transition-all hover:rotate-0 duration-500">
                  <HeroReviewCard {...safeReviews[0]} />
                </div>
              )}
              {safeReviews[1] && (
                <div className="absolute top-32 right-0 z-30 transform rotate-3 hover:z-50 transition-all hover:rotate-0 duration-500">
                  <HeroReviewCard {...safeReviews[1]} />
                </div>
              )}
              {safeReviews[2] && (
                <div className="absolute bottom-10 left-20 z-10 transform -rotate-3 hover:z-50 transition-all hover:rotate-0 duration-500">
                  <HeroReviewCard {...safeReviews[2]} />
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      <section className="mx-0 bg-accent py-4 sm:py-8 px-4 text-center">
        <p className="text-white">
          Bought something recently?{' '}
          <a href="/write-review" className="text-primary hover:underline">
            Write a review &rarr;
          </a>
        </p>
      </section>
    </>
  );
}