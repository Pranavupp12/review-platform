// app/(main)/dashboard/page.tsx

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getUserReviews, getUserHelpfulReviews, getHelpfulCountReceived, getUserTotalReads } from '@/lib/data';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MapPin, Heart, User, ShieldAlert, ShieldCheck } from 'lucide-react';
import { MyReviewCard } from '@/components/dashboard_components/my-review-card';
import { HelpfulReviewCard } from '@/components/dashboard_components/helpful-review-card';
import { ReportStatusCard } from '@/components/dashboard_components/report-status-card';
import { FlaggedReviewCard } from '@/components/dashboard_components/flagged-review-card';
import { DashboardStats } from '@/components/dashboard_components/dashboard-stats';
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'My Reviews - Dashboard',
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // 3. Fetch all required data in parallel
  const [reviews, helpfulReviews, totalHelpfulReceived, totalReads, userDetails] = await Promise.all([
    getUserReviews(session.user.id!),
    getUserHelpfulReviews(session.user.id!),
    getHelpfulCountReceived(session.user.id!),
    getUserTotalReads(session.user.id!),
    prisma.user.findUnique({
      where: { id: session.user.id }, select: {
        country: true,
        name: true,
        image: true
      }
    })
  ]);

  const displayName = userDetails?.name || session.user.name;
  const displayImage = userDetails?.image || ''

  const myReports = await prisma.report.findMany({
    where: { userId: session.user.id, archived: false },
    include: { review: { include: { company: true } } },
    orderBy: { createdAt: 'desc' }
  });

  // 1. Fetch Flagged Reviews
  const flaggedReviews = await prisma.review.findMany({
    where: { 
        userId: session.user.id,
        isFlagged: true 
    },
    include: { company: true },
    orderBy: { createdAt: 'desc' }
  });

  // 2. Filter 'reviews' to exclude flagged ones
  const cleanReviews = reviews.filter(r => !r.isFlagged);


  return (
    <div className="min-h-screen bg-white">

      {/* Header Section */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              {/* AVATAR CIRCLE */}
              <div className="h-24 w-24 rounded-full bg-[#0ABED6] flex items-center justify-center text-white shadow-sm overflow-hidden relative">
                {session.user.image ? (
                  <Image
                    src={displayImage}
                    alt="User"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <User className="h-12 w-12 text-white" />
                )}
              </div>
              <div>
                {/* Name is dynamic user data, usually not translated */}
                <h1 className="text-3xl font-bold text-gray-900"><TranslatableText text={displayName}/></h1>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-1 text-gray-500 text-sm">
                  {userDetails?.country && (
                    <>
                      <MapPin className="h-3 w-3" />
                      {/* Country names can be translated */}
                      <span><TranslatableText text={userDetails.country} /></span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <DashboardStats 
              reviewCount={reviews.length} 
              totalReads={totalReads} 
              totalHelpfulReceived={totalHelpfulReceived} 
            />
            
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 py-10 space-y-16">

        {/* SECTION 1: MY REVIEWS */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            <TranslatableText text="My Reviews" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cleanReviews.length > 0 ? (
              cleanReviews.map((review) => (
                <MyReviewCard key={review.id} review={review} />
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">
                    <TranslatableText text="You haven't written any reviews yet." />
                </p>
                <Link href="/write-review">
                  <Button className="bg-[#0ABED6] hover:bg-[#09A8BD] text-white">
                    <TranslatableText text="Write your first review" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: REVIEWS I FOUND HELPFUL */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
            <TranslatableText text="Reviews you found helpful" />
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {helpfulReviews.length > 0 ? (
              helpfulReviews.map((review) => (
                // @ts-ignore (Handling complex Prisma types in map)
                <HelpfulReviewCard key={review.id} review={review} />
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-white/50 rounded-xl border border-dashed border-gray-200">
                <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <ThumbsUp className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">
                    <TranslatableText text="You haven't marked any reviews as helpful yet." />
                </p>
                <Link href="/categories" className="text-[#0ABED6] hover:underline text-sm mt-2 inline-block">
                  <TranslatableText text="Browse reviews" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: MY REPORTS */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-orange-500" />
            <TranslatableText text="Report Status" />
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {myReports.length > 0 ? (
              myReports.map((report) => (
                <ReportStatusCard key={report.id} report={report} />
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-white/50 rounded-xl border border-dashed border-gray-200">
                <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <ShieldCheck className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">
                    <TranslatableText text="You have no active reports." />
                </p>
              </div>
            )}
          </div>
        </div>

        {/* --- FLAGGED REVIEWS SECTION (CONDITIONAL) --- */}
        {flaggedReviews.length > 0 && (
          <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-6 sm:p-8 animate-in fade-in slide-in-from-top-4">
             <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <ShieldAlert className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        <TranslatableText text="Attention Needed" />
                    </h2>
                    <p className="text-sm text-gray-500">
                        <TranslatableText text="The following reviews require your edits to remain public." />
                    </p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {flaggedReviews.map(review => (
                    // @ts-ignore
                    <FlaggedReviewCard key={review.id} review={review} />
                ))}
             </div>
          </div>
        )}

      </div>
    </div>
  );
}