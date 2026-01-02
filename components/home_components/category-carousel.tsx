// components/home_components/categories-carousel.tsx
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Link from 'next/link';
import { getAllCategories } from '@/lib/data'; 
import { getCategoryIcon } from '@/lib/category-icons';

export async function CategoriesCarousel() {

  const categories = await getAllCategories();

  return (
    <section className="py-12">
      <div className="container mx-auto max-w-7xl px-4">
        
        {/* The Carousel Component */}
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          {/* Header Section: Title + Navigation Arrows */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              What are you looking for?
            </h2>
            
            <div className="flex items-center gap-2">
              {/* Custom positioning for arrows to match screenshot */}
              <CarouselPrevious className="static translate-y-0 h-9 w-9 border-border hover:bg-[#0ABED6]/80 hover:text-accent-foreground" />
              <CarouselNext className="static translate-y-0 h-9 w-9 border-border hover:bg-[#0ABED6]/80 hover:text-accent-foreground" />
              
              {/* "See more" button */}
              <Link 
                href="/categories" 
                className="ml-2 text-sm font-medium text-primary hover:underline hidden md:block"
              >
                See more
              </Link>
            </div>
          </div>

          {/* Carousel Content */}
          <CarouselContent className="-ml-4">
            {categories.map((category) => {
              // 4. Get the icon dynamically based on the DB name
              const Icon = getCategoryIcon(category.name);

              return (
                <CarouselItem key={category.id} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
                  <Link
                    href={`/categories/${category.slug}`} // Dynamic Link
                    className="group flex flex-col items-center justify-center p-6 rounded-xl border border-transparent hover:bg-gray-50 hover:border-gray-100 transition-all duration-200 cursor-pointer h-full"
                  >
                    {/* Render the mapped icon */}
                    <Icon
                      className="w-8 h-8 mb-4 text-gray-600 group-hover:text-primary transition-colors"
                      strokeWidth={1.5}
                    />
                    <span className="text-sm font-medium text-center text-gray-700 group-hover:text-foreground">
                      {category.name}
                    </span>
                  </Link>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

      </div>
    </section>
  );
}