import { SearchBar } from '@/components/shared/search-bar'; 
import Link from 'next/link';
import { getAllCategories } from '@/lib/data';
import { getCategoryIcon } from '@/lib/category-icons';
import { prisma } from "@/lib/prisma"; 

export const metadata = {
  title: 'All Categories - Help',
  description: 'Browse companies by category.',
};

// Your specific color palette
const CARD_COLORS = ['#0892A5', '#0ABED6'];

export default async function CategoriesPage() {
  // 1. Fetch Categories (Existing)
  const categories = await getAllCategories();

  // ✅ 2. FETCH LOCATIONS (New Logic)
  // This ensures the SearchBar has the dropdown data
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
    <div className="min-h-screen pb-20">
      
      {/* 1. Header Section */}
      <div className="relative bg-gray-50 text-black py-20 md:py-28 px-4 overflow-hidden">
        <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-40 h-40 bg-accent/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-40 h-40 bg-accent/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-50 translate-x-1/3 translate-y-1/3 w-40 h-40 bg-accent/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-60 w-30 h-30 bg-accent/50 rounded-full blur-2xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 container mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-6 tracking-tight">
            Explore Companies 
          </h1>
          <p className="text-muted-foreground text-lg mx-auto mb-10">
            Browse our comprehensive directory to find the best companies in every industry.
          </p>
          <div>
            {/* ✅ 3. PASS LOCATIONS PROP */}
            <SearchBar 
                className='max-w-2xl lg:max-w-3xl' 
                locations={uniqueLocations} 
            />
          </div>
        </div>
      </div>

      {/* 2. Categories Grid */}
      <div className="relative container mx-auto max-w-7xl px-4 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {categories.map((category, index) => {
            const Icon = getCategoryIcon(category.name);
            const headerColor = CARD_COLORS[index % CARD_COLORS.length];

            return (
              <div 
                key={category.id} 
                className="flex flex-col rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 bg-white border border-gray-100"
              >
                <div 
                  className="p-5 flex flex-col items-center justify-center text-center gap-4"
                  style={{ backgroundColor: headerColor }}
                >
                  <Icon className="h-10 w-10 text-white" strokeWidth={1.5} />
                  <h2 className="text-xl font-bold text-white tracking-wide">
                    {category.name}
                  </h2>
                </div>
                
                <div className="flex-1 bg-white p-2">
                  {category.subCategories.length > 0 ? (
                    <ul className="flex flex-col">
                      {category.subCategories.map((sub) => (
                        <li key={sub.id}>
                          <Link 
                            href={`/categories/${category.slug}/${sub.slug}`} 
                            className="block px-4 py-3 text-sm font-medium text-gray-600 hover:text-[#0892A5] hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-sm text-muted-foreground italic">
                        No subcategories yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}