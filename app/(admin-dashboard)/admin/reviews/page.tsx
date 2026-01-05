import { prisma } from '@/lib/prisma';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DeleteItemButton } from '@/components/admin_components/delete-item-button';
import { adminDeleteReview } from '@/lib/actions';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { ReviewFilters } from '@/components/admin_components/page-filters/review-filters'; // ✅ Import Filters
import { Inbox } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

// Import Prisma types
import { Prisma } from '@prisma/client';

export const metadata = { title: 'Manage Reviews - Admin' };

type PageProps = {
  searchParams: Promise<{ 
    page?: string;
    query?: string;    // ✅ Search text
    rating?: string;   // ✅ Star rating filter
  }>;
};

export default async function AdminReviewsPage({ searchParams }: PageProps) {
  const session = await auth();

  // 🔒 Security Check
  if (session?.user?.role !== "ADMIN") {
    // If they are DATA_ENTRY, kick them out
    return redirect("/admin/companies");
  }

  const resolvedSearchParams = await searchParams;

  
  const page = Number(resolvedSearchParams.page) || 1;
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  // Extract Filters
  const query = resolvedSearchParams.query || "";
  const rating = resolvedSearchParams.rating ? parseInt(resolvedSearchParams.rating) : undefined;

  // 1. Build Dynamic WHERE Clause
  const where: Prisma.ReviewWhereInput = {};

  // Filter by Search Term (Searches User Name, Company Name, Title, OR Comment)
  if (query) {
    where.OR = [
      { user: { name: { contains: query, mode: 'insensitive' } } },
      { company: { name: { contains: query, mode: 'insensitive' } } },
      { reviewTitle: { contains: query, mode: 'insensitive' } },
      { comment: { contains: query, mode: 'insensitive' } },
    ];
  }

  // Filter by Rating
  if (rating) {
    where.starRating = rating;
  }

  // 2. Fetch Data & Count with filters
  const [reviews, totalCount] = await Promise.all([
    prisma.review.findMany({
      where, // ✅ Apply filters
      skip: skip,
      take: pageSize,
      include: { user: true, company: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.count({ where }), // ✅ Apply filters to count
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Manage Reviews</h1>
           <p className="text-sm text-gray-500">Monitor and moderate user feedback</p>
        </div>
        <Badge variant="secondary" className="px-3 py-1 text-sm">
            {totalCount} Total
        </Badge>
      </div>

      {/* ✅ FILTER COMPONENT */}
      <ReviewFilters />
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {reviews.length === 0 ? (
          // Empty State
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="bg-gray-50 p-4 rounded-full mb-3">
              <Inbox className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No reviews found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Company</th>
                  <th className="px-6 py-3">Rating</th>
                  <th className="px-6 py-3">Review</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border">
                          <AvatarImage src={review.user.image || ''} />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="max-w-[150px] truncate">
                          <p className="font-medium text-gray-900 truncate">{review.user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{review.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/company/${review.company.slug}`} target="_blank" className="font-medium text-[#0ABED6] hover:underline">
                        {review.company.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={review.starRating >= 4 ? "default" : "secondary"} className={review.starRating >= 4 ? "bg-green-100 text-green-800 hover:bg-green-200 border-transparent" : "bg-orange-100 text-orange-800 hover:bg-orange-200 border-transparent"}>
                        {review.starRating} ★
                      </Badge>
                    </td>
                    <td className="px-6 py-4 max-w-xs group relative">
                      <p className="truncate font-medium">{review.reviewTitle}</p>
                      <p className="truncate text-gray-500 text-xs">{review.comment}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DeleteItemButton 
                        id={review.id} 
                        itemName={`review by ${review.user.name}`}
                        deleteAction={adminDeleteReview}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Show Pagination only if we have results */}
        {reviews.length > 0 && (
          <div className='pb-5'>
             <PaginationControls totalItems={totalCount} pageSize={pageSize} currentPage={page} />
          </div>
        )}
        
      </div>
    </div>
  );
}