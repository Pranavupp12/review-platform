import { SearchBar } from '@/components/shared/search-bar'; 
import Link from 'next/link';
import { getAllCategories } from '@/lib/data';
import { getCategoryIcon } from '@/lib/category-icons';
import { prisma } from "@/lib/prisma"; 
import { ChevronRight } from 'lucide-react';
import { TranslatableText } from "@/components/shared/translatable-text";

export const metadata = {
  title: 'All Categories - Help',
  description: 'Browse companies by category.',
};

const CARD_COLORS = ['#0892A5', '#0ABED6'];

export default async function CategoriesPage() {
  const categories = await getAllCategories();

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

  const uniqueLocations = Array.from(new Set(
    locationsData
      .map(l => {
        const parts = [l.city, l.state].filter(Boolean); 
        return parts.length > 0 ? parts.join(", ") : null;
      })
      .filter((l): l is string => !!l)
  )).sort();

  return (
    <div className="min-h-screen pb-20 bg-white">
      
      {/* 1. Header Section */}
      <div className="relative bg-gray-50 text-black py-20 md:py-28 px-4 overflow-hidden">
        
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-accent/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-48 h-24 bg-accent/40 rounded-full blur-3xl pointer-events-none" style={{ transform: 'rotate(-20deg)' }} />
      <div className="absolute hidden sm:block top-6 right-40 w-60 h-32 bg-accent/40 rounded-full blur-3xl pointer-events-none" style={{ transform: 'rotate(10deg)' }} />

        {/* Content */}
        <div className="relative z-10 container mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-gray-900">
            <TranslatableText text="Explore Companies" />
          </h1>
          <p className="text-gray-500 text-lg md:text-xl mx-auto mb-10 max-w-2xl">
            <TranslatableText text="Browse our comprehensive directory to find the best companies in every industry." />
          </p>
          <div>
            <SearchBar 
                className='max-w-2xl lg:max-w-3xl shadow-lg border-gray-200' 
                locations={uniqueLocations} 
            />
          </div>
        </div>
      </div>

      {/* 2. Categories Grid */}
      {/* ✅ Changed from -mt-10 to mt-12 to push cards down */}
      <div className="relative container mx-auto max-w-7xl px-4 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {categories.map((category, index) => {
            const Icon = getCategoryIcon(category.name);
            const accentColor = CARD_COLORS[index % CARD_COLORS.length];

            return (
              <div 
                key={category.id} 
                className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-50 flex items-center gap-4">
                  <div 
                    className="h-14 w-14 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                  >
                    <Icon className="h-7 w-7" strokeWidth={2} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#0892A5] transition-colors">
                    <TranslatableText text={category.name} />
                  </h2>
                </div>
                
                {/* Subcategories List */}
                <div className="flex-1 p-4 bg-white">
                  {category.subCategories.length > 0 ? (
                    <ul className="grid grid-cols-1 gap-1">
                      {category.subCategories.map((sub) => (
                        <li key={sub.id}>
                          <Link 
                            href={`/categories/${category.slug}/${sub.slug}`} 
                            className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-[#0892A5] hover:bg-gray-50 transition-all group/item"
                          >
                            <span>
                                <TranslatableText text={sub.name} />
                            </span>
                            <ChevronRight className="h-4 w-4 text-gray-300 group-hover/item:text-[#0892A5] group-hover/item:translate-x-1 transition-all" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-8 text-center flex flex-col items-center justify-center h-full text-gray-400">
                      <p className="text-sm italic">
                        <TranslatableText text="No subcategories yet." />
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Link */}
                {category.subCategories.length > 0 && (
                    <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                        <Link href={`/categories/${category.slug}`} className="text-xs font-bold text-gray-400 hover:text-[#0892A5] uppercase tracking-wider flex items-center gap-1">
                            <TranslatableText text="View All" /> <ChevronRight className="h-3 w-3" />
                        </Link>
                    </div>
                )}
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}