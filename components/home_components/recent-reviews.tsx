'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ReviewCard } from '@/components/shared/review-card';
// ✅ Import the Translator Component
import { TranslatableText } from "@/components/shared/translatable-text";

interface RecentReviewsProps {
  reviews: any[];
}

export function RecentReviews({ reviews }: RecentReviewsProps) {
  const chunkedReviews = [];
  for (let i = 0; i < reviews.length; i += 2) {
    chunkedReviews.push(reviews.slice(i, i + 2));
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto max-w-7xl px-4">
        <Carousel opts={{ align: 'start', loop: false }} className="w-full">
          
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
               {/* ✅ Translatable Section Title */}
               <TranslatableText text="Recent reviews" />
            </h2>
            <div className="block lg:hidden flex items-center gap-2">
              <CarouselPrevious className="static translate-y-0 h-10 w-10 border-border hover:bg-[#0ABED6] hover:text-accent-foreground" />
              <CarouselNext className="static translate-y-0 h-10 w-10 border-border hover:bg-[#0ABED6] hover:text-accent-foreground" />
            </div>
          </div>

          <CarouselContent className="-ml-4">
            {chunkedReviews.map((pair, index) => (
              <CarouselItem key={index} className="pl-4 basis-1/1 sm:basis-1/2 lg:basis-1/4">
                <div className="flex flex-col gap-6 h-full">
                  {pair.map((review: any) => (
                    <div key={review.id} className="h-full">
                      <ReviewCard 
                        {...review} 
                        className="h-full" 
                      />
                    </div>
                  ))}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

        </Carousel>
      </div>
    </section>
  );
}