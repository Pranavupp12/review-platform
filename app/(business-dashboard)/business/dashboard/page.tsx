import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Star, TrendingUp, MessageSquare, Eye, ArrowRight, ShieldCheck, AlertTriangle 
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BlockRating } from "@/components/shared/block-rating";
import { VerifyDomainForm } from "@/components/business_auth/verify-domain-form"; 
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { differenceInCalendarDays, addDays } from "date-fns"; 

export const dynamic = 'force-dynamic';
export const metadata = { title: "Overview - Business Center" };

function formatDate(date: Date | string) {
   return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function BusinessDashboardPage() {
  const session = await auth();

  if (!session?.user?.companyId) return redirect("/business/login");

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    include: {
      _count: { select: { reviews: true } },
      reviews: {
         take: 3,
         orderBy: { createdAt: 'desc' },
         include: { user: true }
      }
    }
  });

  if (!company) return <div className="p-8">Company profile not found.</div>;

  // 1. FROZEN CHECK
  if (company.isFrozen) {
     return (
       <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center border border-red-100">
             <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
             <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Frozen</h1>
             <p className="text-gray-600 mb-6">
               Your business account has been restricted due to pending domain verification or policy violations.
             </p>
             <Button asChild className="w-full bg-[#000032]">
                <Link href="mailto:support@platform.com">Contact Support</Link>
             </Button>
          </div>
       </div>
     );
  }

  const isDomainVerified = !!company.domainVerified;

  // ✅ 2. UPDATED COUNTDOWN LOGIC
  // We use 'claimedAt' (when email was sent). Fallback to 'createdAt' if null.
  const startDate = company.claimedAt || company.createdAt || new Date(); 
  const deadlineDate = addDays(new Date(startDate), 30);
  const daysRemaining = differenceInCalendarDays(deadlineDate, new Date());
  
  const isOverdue = daysRemaining < 0;
  // If overdue, show 0 days remaining, but keep the 'isOverdue' flag true for the red UI
  const displayDays = isOverdue ? 0 : daysRemaining;


  // Profile Completion logic
  const hasLogo = !!company.logoImage;
  const hasDescription = !!company.briefIntroduction;
  const hasWebsite = !!company.websiteUrl;
  const completionCriteria = [hasLogo, hasDescription, hasWebsite,];
  const completedCount = completionCriteria.filter(Boolean).length;
  const completionScore = Math.round((completedCount / completionCriteria.length) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-200 pb-4 ">
        <div>
           <h1 className="text-3xl font-bold text-[#000032]">Overview</h1>
           <p className="text-gray-500 mt-1">
             Welcome back! Here's what's happening with <span className="font-semibold text-[#0ABED6]">{company.name}</span> today.
           </p>
        </div>
        <Link href={`/company/${company.slug}`} target="_blank">
            <Button variant="outline" className="gap-2 bg-white hover:bg-gray-50 text-[#000032] border-gray-200 shadow-sm">
                <Eye className="h-4 w-4" /> View Public Page
            </Button>
        </Link>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* ... (Keep your existing stats cards unchanged) ... */}
           {/* Card 1: TrustScore */}
           <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
               <CardTitle className="text-sm font-medium text-gray-500">TrustScore</CardTitle>
               <Star className="h-8 w-8 p-1 rounded-sm text-white fill-white bg-[#0892A5]" />
            </CardHeader>
            <CardContent>
               <div className="text-3xl font-bold text-[#000032]">
                  {(company.rating || 0).toFixed(1)} <span className="text-lg text-gray-400 font-normal">/ 5.0</span>
               </div>
               <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-500" /> 
                  <span className="text-green-600 font-medium">Live</span> based on all reviews
               </p>
            </CardContent>
         </Card>

         {/* Card 2: Total Reviews */}
         <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
               <CardTitle className="text-sm font-medium text-gray-500">Total Reviews</CardTitle>
               <MessageSquare className="h-8 w-8 text-[#0ABED6]" />
            </CardHeader>
            <CardContent>
               <div className="text-3xl font-bold text-[#000032]">{company._count.reviews}</div>
               <p className="text-xs text-muted-foreground mt-2">Lifetime volume</p>
            </CardContent>
         </Card>

         {/* Card 3: Profile Views */}
         <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
               <CardTitle className="text-sm font-medium text-gray-500">Profile Views</CardTitle>
               <Eye className="h-8 w-8 text-purple-500" />
            </CardHeader>
            <CardContent>
               <div className="text-3xl font-bold text-[#000032]">
                  {company.views || 0}
               </div>
               <p className="text-xs text-muted-foreground mt-2 text-gray-500">
                  Total page visits
               </p>
            </CardContent>
         </Card>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* LEFT COLUMN: Latest Reviews */}
         <div className="lg:col-span-2 space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="font-bold text-[#000032] text-lg">Latest Reviews</h3>
                <Link href="/business/dashboard/reviews" className="text-sm text-[#0ABED6] hover:underline font-medium flex items-center gap-1">
                   View all <ArrowRight className="h-3 w-3" />
                </Link>
             </div>
             
             {company.reviews.length > 0 ? (
                 <div className="space-y-4">
                    {company.reviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                           <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                 <Avatar className="h-10 w-10 border bg-gray-50">
                                    <AvatarImage src={review.user.image || ''} />
                                    <AvatarFallback className="text-[#000032] font-bold">
                                       {review.user.name?.[0] || 'U'}
                                    </AvatarFallback>
                                 </Avatar>
                                 <div>
                                    <p className="font-bold text-[#000032] text-sm">{review.user.name || "Anonymous"}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                       <span>Verified Reviewer</span>
                                    </div>
                                 </div>
                              </div>
                              <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                           </div>

                           <div className="mb-3">
                              <BlockRating value={review.starRating} size="sm" />
                           </div>
                           {review.reviewTitle && (
                              <h4 className="font-bold text-gray-900 mb-2 text-base">{review.reviewTitle}</h4>
                           )}

                           <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
                              "{review.comment}"
                           </p>

                           <div className="mb-5">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                 Date of experience: {review.dateOfExperience ? formatDate(review.dateOfExperience) : 'N/A'}
                              </span>
                           </div>
                           
                           <div className="pt-4 border-t border-gray-50 flex justify-end">
                              <Link href={`/business/dashboard/reviews`}>
                                  <Button size="sm" variant="ghost" className="text-[#0ABED6] hover:text-[#09A8BD] hover:bg-cyan-50 h-8 text-xs font-semibold">
                                     Reply to customer
                                  </Button>
                              </Link>
                           </div>
                        </div>
                    ))}
                 </div>
             ) : (
                 <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-gray-200">
                     {/* ... Empty State ... */}
                      <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="h-8 w-8" />
                     </div>
                     <h3 className="text-lg font-bold text-[#000032]">No reviews yet</h3>
                     <p className="text-gray-500 mt-2 max-w-sm mx-auto text-sm">
                        Your customers are waiting! Share your profile link to start collecting feedback.
                     </p>
                     <Button className="mt-6 bg-[#000032] hover:bg-[#000032]/90 text-white rounded-full">
                        Copy Profile Link
                     </Button>
                 </div>
             )}
         </div>

         {/* RIGHT COLUMN: Sidebar Cards */}
         <div className="space-y-6">
             
             {/* Invite Tools Card */}
             <div className="bg-[#000032] rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
                <div className="relative z-10">
                   <h3 className="font-bold text-lg mb-2">Get More Reviews</h3>
                   <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                      Use our automated tools to invite your customers via email.
                   </p>
                   <Link href="/business/dashboard/marketing">
                     <Button className="w-full bg-[#0ABED6] hover:bg-[#09A8BD] text-white border-none font-bold">
                        Launch Campaign
                     </Button>
                   </Link>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#0ABED6] rounded-full opacity-10 blur-2xl -mr-10 -mt-10" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500 rounded-full opacity-20 blur-2xl -ml-10 -mb-10" />
             </div>

             {/* ✅ 3. VERIFY DOMAIN CARD WITH DYNAMIC COUNTDOWN */}
             {!isDomainVerified && (
                <div className={`rounded-2xl border p-6 shadow-sm relative overflow-hidden ${isOverdue ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
                   <div className="flex items-start gap-3 mb-4">
                      <div className={`p-2 rounded-full shrink-0 mt-1 ${isOverdue ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                         <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#000032] text-lg leading-tight">Verify Domain</h3>
                        
                        {/* THE COUNTDOWN TEXT */}
                        <p className={`text-xs font-bold mt-1 ${isOverdue ? "text-red-700" : "text-amber-800"}`}>
                           {isOverdue 
                              ? "Verification Overdue. Account at risk." 
                              : `Required within ${displayDays} days.`
                           }
                        </p>
                      </div>
                   </div>
                   
                   <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      Confirm you own a company email (e.g. name@company.com) to secure your account.
                   </p>
                   
                   <VerifyDomainForm />
                </div>
             )}

             {/* ✅ Verified Success Card */}
             {isDomainVerified && (
                <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6 shadow-sm flex items-center gap-4">
                    <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                       <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                       <h3 className="font-bold text-[#000032]">Domain Verified</h3>
                       <p className="text-xs text-emerald-700 font-medium">{company.domainVerifyEmail}</p>
                    </div>
                </div>
             )}

             {/* Profile Health Card */}
             <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-[#000032] flex items-center gap-2">
                       <ShieldCheck className="h-4 w-4 text-[#0ABED6]" />
                       Profile Health
                    </h3>
                    <span className="text-xs font-bold text-[#0ABED6] bg-cyan-50 px-2 py-1 rounded-full">
                       {completionScore}%
                    </span>
                 </div>
                 
                 <div className="w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
                    <div 
                      className="bg-[#0ABED6] h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${completionScore}%` }}
                    />
                 </div>

                 <ul className="space-y-3">
                    <li className="flex items-center text-sm">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 shrink-0 ${hasLogo ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                           {hasLogo ? "✓" : "○"}
                        </div>
                        <span className={hasLogo ? "text-gray-500 line-through decoration-gray-300" : "text-[#000032] font-medium"}>
                           Upload Logo
                        </span>
                    </li>
                    <li className="flex items-center text-sm">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 shrink-0 ${hasDescription ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                           {hasDescription ? "✓" : "○"}
                        </div>
                        <span className={hasDescription ? "text-gray-500 line-through decoration-gray-300" : "text-[#000032] font-medium"}>
                           Add Description
                        </span>
                    </li>
                    <li className="flex items-center text-sm">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 shrink-0 ${hasWebsite ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                           {hasWebsite ? "✓" : "○"}
                        </div>
                        <span className={hasWebsite ? "text-gray-500 line-through decoration-gray-300" : "text-[#000032] font-medium"}>
                           Link Website
                        </span>
                    </li>
                 </ul>
                 
                 {completionScore < 100 && (
                    <Link href="/business/dashboard/settings">
                        <Button variant="outline" size="sm" className="w-full mt-6 border-dashed border-gray-300 text-gray-600 hover:text-[#000032] hover:bg-gray-100">
                           Complete Profile
                        </Button>
                    </Link>
                 )}
             </div>
         </div>
      </div>
    </div>
  );
}