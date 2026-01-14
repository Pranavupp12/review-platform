import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BarChart3, Sparkles } from "lucide-react";
import { CompanyAnalyticsView } from "@/components/admin_components/admin-analytics/company-analytics-view";
import { getSearchAnalytics } from "@/lib/get-advance-analytics"; 
// ✅ IMPORT NEW HELPER
import { getCompanyFeatures } from "@/lib/plan-config";

export const dynamic = 'force-dynamic';

export default async function BusinessAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.companyId) return redirect("/business/login");

  const companyId = session.user.companyId;

  // 1. Fetch Company & Features
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      logoImage: true,
      websiteUrl: true,
      slug: true,
      rating: true,
      plan: true,
      // ✅ Fetch Override Field for Helper
      enableAnalytics: true, 
      // We can keep 'features' if used elsewhere, but analytics logic moves to helper
      features: true, 
      isSponsored: true,
    }
  });

  if (!company) return <div>Company not found</div>;

  // 2. ✅ CALCULATE EFFECTIVE TIER
  // This handles: Plan Default (Free/Growth) + Admin Overrides
  const featureConfig = getCompanyFeatures(company);
  const analyticsTier = featureConfig.analyticsTier; // "BASIC" | "ADVANCED" | "PRO"

  // 3. Fetch Reviews
  const reviews = await prisma.review.findMany({
    where: { companyId: companyId },
    orderBy: { createdAt: 'desc' },
    select: { 
        id: true,
        starRating: true, 
        createdAt: true, 
        keywords: true,
        comment: true,
        user: { select: { name: true, image: true } }
    }
  });

  // 4. Fetch Stats
  const searchStats = await getSearchAnalytics(companyId);

  // 5. Render
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
         
         <div className={`px-3 py-1 text-sm font-bold rounded-full flex items-center gap-2 border ${
             company.plan === 'FREE' 
               ? "bg-gray-100 text-gray-600 border-gray-200" 
               : "bg-blue-100 text-blue-700 border-blue-200"
         }`}>
            {company.plan !== 'FREE' && <Sparkles className="h-3 w-3" />}
            {company.plan} Plan Active
         </div>
      </div>

      {/* ✅ Pass the computed Tier */}
      <CompanyAnalyticsView 
         company={company}
         reviews={reviews}
         analyticsTier={analyticsTier} // 👈 New Prop
         searchStats={searchStats}
         userRole={session.user.role}
      />
    </div>
  );
}