import { notFound } from 'next/navigation';
import { getCompanyBySlug, getSimilarCompanies } from '@/lib/data';
import { CompanyHeader } from '@/components/company_components/company-header';
import { CompanyPhotoCarousel } from '@/components/company_components/company-photo-carousel';
import { TransparencyCard } from '@/components/company_components/transparency-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BlockRating } from "@/components/shared/block-rating";
import { Star } from 'lucide-react';
import { auth } from '@/auth';
import { ReviewInteractions } from '@/components/company_components/review-interactions';
import { ViewTracker } from '@/components/company_components/view-tracker';
import { ReviewImages } from '@/components/company_components/review-images';
import { CompanyAboutSection } from '@/components/company_components/company-about-section';
import { ReviewFilterBar } from '@/components/company_components/review-filter-bar';
import { RatingDistribution } from '@/components/company_components/rating-distribution';
import { PlatformTrustBadge } from '@/components/company_components/platform-trust-badge';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { CompanyViewTracker } from "@/components/company_components/company-view-tracker";
import { ReviewOwnerReply } from '@/components/company_components/review-owner-reply';
import { CallToActionCard } from '@/components/company_components/call-to-action-card';
import { ContactDetailsCard } from '@/components/company_components/contact-details-card';
import { SimilarCompaniesCarousel } from '@/components/company_components/similar-companies-carousel';
import { BusinessUpdatesCarousel } from '@/components/company_components/business-updates-carousel';
import { RequestQuoteCard } from '@/components/company_components/request-quote-card';
import { getCompanyFeatures } from "@/lib/plan-config";
import { ShowcaseCarousel } from '@/components/company_components/showcase-carousel';

// ✅ IMPORTS FOR TRANSLATION SYSTEM
import { TranslationProvider } from "@/components/shared/translation-context";
import { FloatingLanguageSelector } from "@/components/shared/floating-language-selector";
import { TranslatableText } from "@/components/shared/translatable-text";

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { companySlug } = await params;
  const company = await getCompanyBySlug(companySlug);
  if (!company) return { title: 'Company Not Found' };
  return { title: `${company.name} Reviews` };
}

export default async function CompanyProfilePage({ params, searchParams }: PageProps) {
  const session = await auth();
  const currentUserId = session?.user?.id;
  const isLoggedIn = !!session?.user;

  const { companySlug } = await params;
  const resolvedSearchParams = await searchParams;

  const tag = resolvedSearchParams.tag;
  const search = resolvedSearchParams.search;
  const rating = resolvedSearchParams.rating;
  const sort = resolvedSearchParams.sort || 'recent';
  const page = Number(resolvedSearchParams.page) || 1;

  // 1. Fetch Company Data
  const company = await getCompanyBySlug(companySlug, tag, search, sort, rating, page);

  if (!company) {
    notFound();
  }

  // 2. CALCULATE FEATURES
  const features = getCompanyFeatures(company);

  // 3. Fetch Similar Companies
  let relatedCompanies: any[] = [];
  if (!features.shouldHideCompetitors) {
    relatedCompanies = await getSimilarCompanies(company.category.id, company.id);
  }

  const reviewIds = company.reviews.map(r => r.id);
  const jsonLd = { "@context": "https://schema.org", "@type": "Organization", "name": company.name };

  // ✅ FIX: The Provider must wrap EVERYTHING returned here
  return (
    <TranslationProvider>
      <div className="min-h-screen bg-white pb-20">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <ViewTracker reviewIds={reviewIds} />
        <CompanyViewTracker companyId={company.id} />

        <div className="container mx-auto max-w-7xl px-4 py-4">

          {/* ✅ LANGUAGE SELECTOR */}
          <FloatingLanguageSelector />

          {/* =========================================
              SECTION 1: INFO & CONTACT
              ========================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

            {/* LEFT: Header, Photos, About */}
            <div className="lg:col-span-2 space-y-8">
              <CompanyHeader
                id={company.id}
                name={company.name}
                slug={company.slug}
                logoImage={company.logoImage}
                websiteUrl={company.websiteUrl}
                address={company.address}
                rating={company.rating}
                reviewCount={company.reviewCount}
                categoryName={company.category.name}
                categorySlug={company.category.slug}
                isLoggedIn={isLoggedIn}
                claimed={company.claimed}
              />

              <PlatformTrustBadge />

              {/* Showcase */}
              {company.showcaseItems && company.showcaseItems.length > 0 && (
                <ShowcaseCarousel
                  items={company.showcaseItems}
                  type={company.companyType || "SERVICE"}
                  companyName={company.name}
                  companyLogo={company.logoImage}
                />
              )}

              {/* Business Updates */}
              {(features.updateLimit > 0 || company.plan !== 'FREE') && (company as any).updates && (company as any).updates.length > 0 && (
                <BusinessUpdatesCarousel
                  updates={(company as any).updates}
                  companyName={company.name}
                  companyLogo={company.logoImage}
                />
              )}

              <CompanyPhotoCarousel
                images={company.otherImages}
              />

              <CompanyAboutSection company={company} />
            </div>

            {/* RIGHT: Contact Sidebar */}
            <div className="space-y-3 h-fit">
              <ContactDetailsCard
                websiteUrl={company.websiteUrl}
                email={(company as any).contact?.email || (company as any).email}
                address={company.address}
              />

              {features.hasLeadGen && (
                <>
                  <RequestQuoteCard
                    companyId={company.id}
                    companyName={company.name}
                  />
                  <CallToActionCard
                    phoneNumber={(company as any).contact?.phone || (company as any).phone || "1-800-123-4567"}
                    companyId={company.id}
                  />
                </>
              )}

              <TransparencyCard
                companyName={company.name}
                claimed={company.claimed}
                badges={company.badges}
                plan={company.plan}
              />
            </div>
          </div>

          {/* =========================================
              SECTION 2: SIMILAR COMPANIES
              ========================================= */}
          {!features.shouldHideCompetitors && (
            <div className="mb-12 ">
              <SimilarCompaniesCarousel
                categoryName={company.category.name}
                companies={relatedCompanies}
              />
            </div>
          )}

          {/* =========================================
              SECTION 3: REVIEWS & STATS
              ========================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="reviews-section">

            {/* RIGHT: Stats Sidebar */}
            <div className="space-y-6 h-fit lg:sticky lg:top-18">
              <RatingDistribution
                distribution={company.distribution}
                totalReviews={company.reviewCount}
                companySlug={company.slug}
                companyId={company.id}
                companyName={company.name}
                isLoggedIn={isLoggedIn}
                averageRating={company.rating}
              />
            </div>

            {/* LEFT: Reviews List */}
            <div className="lg:col-span-2 space-y-4">
              <div id="reviews" className="lg:sticky lg:top-16 z-20">
                <ReviewFilterBar
                  companySlug={companySlug}
                  topKeywords={company.topKeywords}
                  activeTag={tag}
                  activeSort={sort}
                />
              </div>

              {(tag || search || sort !== 'recent') && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  Found <strong>{company.pagination?.totalItems || company.reviews.length}</strong> reviews
                </div>
              )}

              {/* Reviews Loop */}
              <div className="space-y-6">
                {company.reviews.length > 0 ? (
                  <>
                    {company.reviews.map((review) => {
                      const createdDate = review.createdAt ? new Date(review.createdAt) : new Date(review.dateOfExperience);
                      const displayDate = !isNaN(createdDate.getTime()) ? createdDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent';
                      
                      return (
                        <div key={review.id} className="bg-white p-6 border-b border-gray-200">
                          {/* Review Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border bg-gray-50">
                                <AvatarImage src={review.user.image || ''} />
                                <AvatarFallback>{review.user.name?.[0] || 'U'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-bold text-gray-900 text-sm">{review.user.name}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>{review.user.country || 'International'}</span>
                                  <span>•</span>
                                  <span>{review.user.totalReviews} reviews</span>
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-gray-400">{displayDate}</span>
                          </div>

                          <div className="mb-3">
                            <BlockRating value={review.starRating} size="sm" />
                          </div>
                          
                          {/* ✅ TRANSLATABLE REVIEW TITLE */}
                          <div className="mb-2">
                             <TranslatableText 
                                text={review.reviewTitle || ""} // Guard against null
                                className="font-bold text-lg text-gray-900"
                             />
                          </div>

                          {/* ✅ TRANSLATABLE REVIEW BODY */}
                          <div className="mb-4">
                             <TranslatableText 
                                text={review.comment || ""} 
                                className="text-gray-700 leading-relaxed text-sm md:text-base"
                             />
                          </div>

                          <ReviewImages images={review.relatedImages || []} />

                          <ReviewInteractions
                            reviewId={review.id}
                            initialHelpfulCount={review.helpfulVotes?.length || 0}
                            isHelpfulInitial={currentUserId ? review.helpfulVotes?.some((vote: any) => vote.userId === currentUserId) : false}
                            latestVoterName={review.helpfulVotes?.[0]?.user?.name || null}
                            companyName={company.name}
                            isLoggedIn={isLoggedIn}
                          />

                          <ReviewOwnerReply
                            replyText={review.ownerReply}
                            replyDate={review.ownerReplyDate}
                            companyName={company.name}
                          />
                        </div>
                      );
                    })}

                    {company.pagination && (
                      <PaginationControls
                        totalItems={company.pagination.totalItems}
                        pageSize={company.pagination.pageSize}
                        currentPage={company.pagination.currentPage}
                      />
                    )}
                  </>
                ) : (
                  <div className="bg-white p-12 text-center">
                    <Star className="h-8 w-8 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">No reviews yet</h3>
                    <p className="text-gray-500 mb-6">Be the first to share your experience.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TranslationProvider>
  );
}