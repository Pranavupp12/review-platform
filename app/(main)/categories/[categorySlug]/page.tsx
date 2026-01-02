import { notFound } from 'next/navigation';
import { getCategoryCompanies } from '@/lib/data';
import { CompanyListCard } from '@/components/categories_components/company-list-card';
import { LayoutGrid, Info } from 'lucide-react'; // ✅ Added Info icon
import { FilterSheet } from '@/components/categories_components/filtersheet';
import { RatingPopover } from '@/components/categories_components/rating-popover';
import { CategorySort } from '@/components/categories_components/category-sort';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { RelatedCategoriesSidebar } from '@/components/categories_components/related-categories-sidebar';
import { PaginationControls } from '@/components/shared/pagination-controls';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // ✅ Added Tooltip components

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { categorySlug } = await params;
  const data = await getCategoryCompanies(categorySlug);
  if (!data) return { title: 'Category Not Found' };

  return {
    title: `Best ${data.name} Companies - Reviews & Ratings`,
    description: `Compare the best companies in ${data.name}. Read reviews and share your own experience.`,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { categorySlug } = await params;
  const resolvedSearchParams = await searchParams;
  const userQuery = resolvedSearchParams.q;
  const locationFilter = resolvedSearchParams.loc || resolvedSearchParams.zip;
  const region = (resolvedSearchParams.region as string) || "";
  const sortFilter = resolvedSearchParams.sort;
  const page = Number(resolvedSearchParams.page) || 1;

  const data = await getCategoryCompanies(categorySlug, {
    rating: resolvedSearchParams.rating,
    city: locationFilter,
    claimed: resolvedSearchParams.claimed,
    country: resolvedSearchParams.country,
    sort: sortFilter,
  }, page);

  if (!data) {
    notFound();
  }

  const { name: categoryName, subCategories, companies, featuredCompanies, pagination } = data;

  const breadcrumbItems = [
    { label: "Categories", href: "/categories" },
    { label: categoryName, href: `/categories/${data.slug}`, current: true },
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      
      {/* Header & Breadcrumbs */}
      <div className="bg-gray-50 border-b border-black/10 text-black py-8 md:py-10">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-6">
            <Breadcrumb items={breadcrumbItems} className="text-gray-600" />
          </div>
          <div className="flex items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl text-black font-bold tracking-tight mb-2">
                Best in <span className='text-[#0892A5]'>{categoryName}</span>
              </h1>
              <p className="text-gray-600 text-lg">
                Compare the top rated companies in {categoryName}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <FilterSheet
                relatedSubCategories={subCategories}
                currentCategoryId={categorySlug}
              />
              <RatingPopover />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto max-w-7xl px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Left Column: Company List */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          
          {/* ✅ FEATURED SECTION (Conditionally Rendered) */}
          {featuredCompanies && featuredCompanies.length > 0 && (
            <div className="mb-8 border border-gray-200 bg-white rounded-xl p-4 sm:p-6">
               {/* Heading with Tooltip */}
               <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                    Featured Companies
                  </h3>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#000032] text-white border shadow-md text-xs max-w-xs">
                        <p>These companies are sponsored placements. <br/>Results are relevant to your search category.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
               </div>
               
               {/* List of Featured Cards (Same Layout as Organic) */}
               <div className="space-y-4">
                 {featuredCompanies.map((company) => (
                   <CompanyListCard
                      key={company.id}
                      {...company}
                      badges={company.badges}
                      // Pass context so analytics know this was a sponsored click
                      trackingContext={{
                        query: userQuery || `Category: ${categoryName}`,
                        location: locationFilter || "Global (Sponsored)",
                        userRegion: region,
                      }}
                   />
                 ))}
               </div>
            </div>
          )}

          {/* Organic Section */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              All Companies ({companies.length})
            </h2>
            <CategorySort />
          </div>

          <div className="space-y-4">
            {companies.length > 0 ? (
              <>
                {companies.map((company) => (
                  <CompanyListCard
                    key={company.id}
                    {...company}
                    badges={company.badges}
                    trackingContext={{
                      query: userQuery || `Category: ${categoryName}`,
                      location: locationFilter || "Global",
                      userRegion: region
                    }}
                  />
                ))}
                {pagination && (
                  <PaginationControls
                    totalItems={pagination.totalItems}
                    pageSize={pagination.pageSize}
                    currentPage={pagination.currentPage}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-white border-none">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LayoutGrid className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No results found</h3>
                <p className="text-gray-500">Try adjusting your filters or search for a different category.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Subcategories Sidebar */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <RelatedCategoriesSidebar
            categoryName={categoryName}
            categorySlug={categorySlug}
            subCategories={subCategories}
          />
        </div>

      </div>
    </div>
  );
}