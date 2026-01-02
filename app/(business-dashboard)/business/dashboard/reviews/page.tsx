import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ReviewReplyCard } from "@/components/business_dashboard/review-reply-card";
import { redirect } from "next/navigation";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { ReviewsFilter } from "@/components/business_dashboard/reviews-filter"; 
import { MessageSquare } from "lucide-react";

export const metadata = { title: "Manage Reviews - Business Center" };
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ 
    page?: string; 
    status?: string; 
    rating?: string; 
    sort?: string; 
  }>;
}

export default async function BusinessReviewsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.companyId) return redirect("/business/login");

  // 1. Parse Params
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const status = params.status || "all";
  const rating = params.rating || "all";
  const sort = params.sort || "newest";
  const PAGE_SIZE = 12;

  // 2. FETCH ALL REVIEWS (Lightweight Fetch)
  // We fetch all IDs and filter properties first to filter in Javascript.
  // This bypasses any database specific filtering bugs.
  const allReviewsRaw = await prisma.review.findMany({
    where: { companyId: session.user.companyId },
    select: { 
      id: true, 
      ownerReply: true, 
      starRating: true, 
      createdAt: true 
    },
    orderBy: { createdAt: 'desc' } // Default sort
  });

  // 3. APPLY FILTERS IN JAVASCRIPT (100% Reliable)
  let filteredReviews = allReviewsRaw;

  // Filter: Status
  if (status === "unreplied") {
    filteredReviews = filteredReviews.filter(r => !r.ownerReply || r.ownerReply.trim() === "");
  } else if (status === "replied") {
    filteredReviews = filteredReviews.filter(r => r.ownerReply && r.ownerReply.trim() !== "");
  }

  // Filter: Rating
  if (rating !== "all") {
    const targetRating = parseInt(rating);
    filteredReviews = filteredReviews.filter(r => r.starRating === targetRating);
  }

  // Filter: Sort (Manually sort the array)
  if (sort === 'oldest') {
    filteredReviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else if (sort === 'highest') {
    filteredReviews.sort((a, b) => b.starRating - a.starRating);
  } else if (sort === 'lowest') {
    filteredReviews.sort((a, b) => a.starRating - b.starRating);
  }
  // (Default 'newest' is already handled by the initial DB fetch orderBy)

  // 4. PAGINATION
  const totalReviews = filteredReviews.length;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const visibleReviewIds = filteredReviews.slice(startIndex, endIndex).map(r => r.id);

  // 5. FETCH FULL DATA FOR VISIBLE REVIEWS ONLY
  const reviews = await prisma.review.findMany({
    where: { id: { in: visibleReviewIds } },
    include: {
      user: { select: { name: true, image: true } },
    },
    // We need to maintain the sort order of our filtered list
    orderBy: sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' }
  });

  // Re-sort the fetched reviews to match exactly our filtered order (since "in" query doesn't guarantee order)
  const sortedReviews = visibleReviewIds.map(id => reviews.find(r => r.id === id)).filter(Boolean);

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { name: true }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
       <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-200 pb-5">
          <div>
             <h1 className="text-3xl font-bold text-[#000032]">Customer Reviews</h1>
             <p className="text-gray-500 mt-1">
                Showing {sortedReviews.length} of {totalReviews} reviews
             </p>
          </div>
          <ReviewsFilter />
       </div>

       {sortedReviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
             <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8" />
             </div>
             <h3 className="text-lg font-bold text-[#000032]">No reviews found</h3>
             <p className="text-gray-500 mt-2">
               {status !== "all" || rating !== "all" 
                 ? "Try clearing your filters to see more results." 
                 : "Wait for new reviews to appear here."}
             </p>
          </div>
       ) : (
          <>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedReviews.map((review) => (
                   <div key={review!.id} className="h-full">
                      <ReviewReplyCard 
                         review={review as any} 
                         companyName={company?.name || "Us"}
                      />
                   </div>
                ))}
             </div>
             <PaginationControls totalItems={totalReviews} pageSize={PAGE_SIZE} currentPage={currentPage} />
          </>
       )}
    </div>
  );
}