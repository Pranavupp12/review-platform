import { notFound } from 'next/navigation';
import { getSubCategoryCompanies } from '@/lib/data';
import { CompanyListCard } from '@/components/categories_components/company-list-card';
import { LayoutGrid, Info } from 'lucide-react';
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
} from "@/components/ui/tooltip"; 
import PageImpressionTracker from '@/components/categories_components/page-impression-tracker';
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ categorySlug: string; subCategorySlug: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { subCategorySlug } = await params;

  const data = await getSubCategoryCompanies(subCategorySlug);
  if (!data) {
    return {
      title: 'Subcategory Not Found',
    };
  }
  return {
    title: `${data.name} Companies - ${data.category?.name}`,
    description: `Browse companies in the ${data.name} subcategory.`,
  };
}

export default async function SubCategoryCompaniesPage({ params, searchParams }: PageProps) {
  const { subCategorySlug, categorySlug } = await params;
  const resolvedSearchParams = await searchParams;
  const userQuery = resolvedSearchParams.q;

  const locationFilter = resolvedSearchParams.loc || resolvedSearchParams.zip || resolvedSearchParams.region;
  
  const region = (resolvedSearchParams.region as string) || "";
  const sortFilter = resolvedSearchParams.sort;
  const page = Number(resolvedSearchParams.page) || 1;

  const data = await getSubCategoryCompanies(subCategorySlug, {
    rating: resolvedSearchParams.rating,
    city: locationFilter,
    country: resolvedSearchParams.country,
    claimed: resolvedSearchParams.claimed,
    sort: sortFilter,
    q: userQuery,
  }, page);

  if (!data || !data.category) {
    notFound();
  }

  // Destructure featuredCompanies
  const { category, name: subCategoryName, companies, featuredCompanies, pagination } = data;
  const { name: categoryName, subCategories: siblingSubCategories } = category;

  const relatedSubCategories = siblingSubCategories.filter(
    (sub) => sub.id !== data.id
  );

  const allCompanyIds = [
    ...(featuredCompanies || []).map(c => c.id),
    ...(companies || []).map(c => c.id)
  ];

  // Note: Breadcrumb hrefs need to be raw strings, but we can translate labels if we custom render them.
  // Assuming the Breadcrumb component takes raw objects. We keep them as is.
  const breadcrumbItems = [
    { label: "Categories", href: "/categories" },
    { label: categoryName, href: `/categories/${categorySlug}` },
    { label: subCategoryName, href: "#", current: true },
  ];

  return (
    <div className="min-h-screen pb-20 bg-white">

      <PageImpressionTracker 
        companyIds={allCompanyIds}
        query={userQuery || subCategoryName} 
        location={locationFilter}
        userRegion={region}
      />

      {/* Header & Breadcrumbs */}
      <div className="bg-gray-50 border-b border-black/10 py-8 md:py-10">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-6">
            <Breadcrumb items={breadcrumbItems} className="text-gray-600" />
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-2">
                <TranslatableText text="Best in" /> <span className="text-[#0892A5]"><TranslatableText text={subCategoryName} /></span>
              </h1>
              <p className="text-gray-600 text-lg">
                <TranslatableText text="Compare the top rated companies in" /> <TranslatableText text={subCategoryName} />
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <FilterSheet
                relatedSubCategories={siblingSubCategories}
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
          
          {/* FEATURED SECTION (Conditionally Rendered) */}
          {featuredCompanies && featuredCompanies.length > 0 && (
            <div className="mb-8 border border-gray-200 bg-white rounded-xl p-4 sm:p-6">
               <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                    <TranslatableText text="Featured Companies" />
                  </h3>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#000032] text-white border shadow-md text-xs max-w-xs">
                        <p>
                            <TranslatableText text="These companies are sponsored placements." /> <br/>
                            <TranslatableText text="Results are relevant to your search category." />
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
               </div>
               
               <div className="space-y-4">
                 {featuredCompanies.map((company) => (
                   <CompanyListCard
                      key={company.id}
                      {...company}
                      badges={company.badges}
                      isFeatured={true}
                      trackingContext={{
                        query: userQuery || `SubCategory: ${subCategoryName}`,
                        location: locationFilter || "Global",
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
              <TranslatableText text="Companies" /> ({companies.length})
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
                    badges={company.badges || []}
                    trackingContext={{
                      query: userQuery || `Category: ${categoryName}`,
                      location: locationFilter || "Global",
                      userRegion: region,
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
                <LayoutGrid className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700">
                    <TranslatableText text="No companies found in this subcategory." />
                </p>
                <p className="text-sm text-gray-500 mt-2">
                    <TranslatableText text="Try adjusting your filters or checking other categories." />
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Related Categories */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <RelatedCategoriesSidebar
            categoryName={categoryName}
            categorySlug={categorySlug} 
            subCategories={relatedSubCategories} 
          />
        </div>

      </div>
    </div>
  );
}