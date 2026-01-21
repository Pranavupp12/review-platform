import { prisma } from "@/lib/prisma";
import { HeroReviewCard } from './hero-review-card';
import { SearchBar } from '@/components/shared/search-bar'; 
// ✅ Import the Translator Component
import { TranslatableText } from "@/components/shared/translatable-text";

interface HeroSearchProps {
  reviews: any[]; 
}

export async function HeroSearch({ reviews }: HeroSearchProps) {
  
  // 1. FETCH DATABASE LOCATIONS
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

  // 2. FORMAT INTO STRINGS
  const availableLocations = Array.from(new Set(
    locationsData
      .map(l => {
        const parts = [l.city, l.state].filter(Boolean); 
        return parts.length > 0 ? parts.join(", ") : null;
      })
      .filter((l): l is string => !!l)
  )).sort();


  // 3. Prepare Reviews
  const safeReviews = reviews.length >= 3 ? reviews : reviews.concat(Array(3 - reviews.length).fill(null));

  return (
    <>
      <section className="relative bg-gray-50 py-20 sm:py-10 overflow-hidden">
        
        {/* Abstract shapes */}
      <div className="absolute top-40 left-50 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-accent/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-accent/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-48 h-24 bg-accent/40 rounded-full blur-3xl pointer-events-none" style={{ transform: 'rotate(-20deg)' }} />
      <div className="absolute hidden sm:block top-25 right-40 w-40 h-32 bg-accent/40 rounded-full blur-3xl pointer-events-none" style={{ transform: 'rotate(10deg)' }} />

        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* --- Left Column (Text & Search) --- */}
            <div className="text-center lg:text-left">
              {/* ✅ TRANSLATABLE HEADLINE */}
              <div className="mb-4">
                <TranslatableText 
                  text="Choose your next company with confidence." 
                  className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight block"
                />
              </div>

              {/* ✅ TRANSLATABLE SUBHEADLINE */}
              <div className="mb-10">
                <TranslatableText 
                  text="Your platform for finding and sharing genuine customer experiences." 
                  className="text-lg md:text-xl text-muted-foreground block"
                />
              </div>

              <div className="relative">
                <SearchBar 
                   className='max-w-2xl lg:max-w-4xl' 
                   locations={availableLocations} 
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

      {/* ✅ TRANSLATABLE BOTTOM BAR */}
      <section className="mx-0 bg-accent py-4 sm:py-8 px-4 text-center">
        <p className="text-white">
          <TranslatableText text="Bought something recently?" />{' '}
          <a href="/write-review" className="text-primary hover:underline">
             <TranslatableText text="Write a review" /> &rarr;
          </a>
        </p>
      </section>
    </>
  );
}