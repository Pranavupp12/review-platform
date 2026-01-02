import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { BarChart3, Sparkles, TrendingUp, Search, AlertTriangle } from "lucide-react";
import { CompanyAnalyticsView } from "@/components/admin_components/admin-analytics/company-analytics-view";
import { FeaturePaywall } from "@/components/business_dashboard/feature-paywall";

export const dynamic = 'force-dynamic';

export default async function BusinessAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.companyId) return redirect("/business/login");

  const companyId = session.user.companyId;

  // 1. Fetch Company & Reviews
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      category: true,
      reviews: {
        orderBy: { createdAt: 'desc' },
        select: { 
            starRating: true, 
            createdAt: true, 
            keywords: true,
            comment: true 
        } 
      }
    }
  });

  if (!company) return notFound();

  // 2. CHECK PLAN STATUS
  const isPro = company.plan === "PRO"; 

  // 3. IF FREE PLAN: SHOW ANALYTICS PAYWALL
  if (!isPro) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-8 pb-20">
         <div className="flex justify-between items-start border-b border-gray-200 pb-5">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    Analytics Report
                    <BarChart3 className="h-6 w-6 text-gray-400" />
                </h1>
                <p className="text-gray-500 mt-1">
                  Unlock deep insights and grow your business with our Pro tools.
                </p>
            </div>
            <div className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-bold rounded-full flex items-center gap-2">
               Free Plan
            </div>
         </div>

         {/* ✅ PAYWALL: ANALYTICS FEATURES ONLY */}
         <FeaturePaywall 
            title="Unlock Professional Insights"
            description="See what customers really think. Upgrade to Pro to reveal hidden trends and sentiment analysis."
            features={[
              { 
                icon: TrendingUp, 
                text: "6-Month Performance Trends", 
                colorClass: "text-blue-500" 
              },
              { 
                icon: Search, 
                text: "AI Keyword & Sentiment Analysis", 
                colorClass: "text-purple-500" 
              },
              { 
                icon: AlertTriangle, 
                text: "Negative Feedback Risk Alerts", 
                colorClass: "text-red-500" 
              }
            ]}
         />
      </div>
    );
  }

  // 4. IF PRO PLAN: SHOW ANALYTICS
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 pb-20">
      <div className="flex justify-between items-start">
         <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                Analytics Report
                <BarChart3 className="h-6 w-6 text-gray-400" />
            </h1>
            <p className="text-gray-500 mt-1">
              Performance metrics and sentiment analysis for {company.name}.
            </p>
         </div>
         <div className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-full flex items-center gap-2">
            <Sparkles className="h-3 w-3" /> Pro Plan Active
         </div>
      </div>

      <CompanyAnalyticsView 
         company={company}
         reviews={company.reviews}
         isPro={isPro} 
      />
    </div>
  );
}