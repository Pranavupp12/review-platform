import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { CompanyAnalyticsView } from "@/components/admin_components/admin-analytics/company-analytics-view"; 
import { ALL_FEATURES } from "@/lib/plan-config";
import { getSearchAnalytics } from "@/lib/get-advance-analytics"; // ✅ Reuse helper
import Link from "next/link";
import { ChevronRight, BarChart3, Sparkles } from "lucide-react";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ companyId: string }>;
}

export default async function CompanyAnalyticsPage({ params }: PageProps) {
  const session = await auth();
  
  // 🔒 Admin Check
  // @ts-ignore
  if (session?.user?.role !== "ADMIN") return redirect("/admin/companies");

  const { companyId } = await params;

  // ✅ FETCH EVERYTHING IN PARALLEL (Performance Optimization)
  const [company, reviews, searchStats] = await Promise.all([
    // 1. Fetch Company
    prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        logoImage: true,
        websiteUrl: true,
        slug: true,
        rating: true,
        plan: true,
        features: true, 
        isSponsored: true,
      }
    }),

    // 2. Fetch Reviews
    prisma.review.findMany({
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
    }),

    // 3. Fetch Advanced Search Stats
    getSearchAnalytics(companyId)
  ]);

  if (!company) return notFound();

  // ✅ ADMIN OVERRIDE: 
  // We pass ALL features so Admins see the full report regardless of the actual plan.
  const adminViewFeatures = Object.values(ALL_FEATURES) as string[];

  return (
    <div className="max-w-7xl mx-auto p-6">
      
      {/* ✅ RESTORED: Header / Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
         <Link href="/admin/companies" className="hover:text-blue-600 transition-colors">
            Companies
         </Link>
         <ChevronRight className="h-4 w-4" />
         <span className="text-gray-900 font-medium">{company.name}</span>
         <ChevronRight className="h-4 w-4" />
         <span>Analytics Report</span>
      </div>

      <div className="flex justify-between items-start mb-8">
         <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                Analytics Report: {company.name}
                <BarChart3 className="h-6 w-6 text-gray-400" />
            </h1>
            <p className="text-gray-500 mt-1">
              Comprehensive performance, search, and sentiment analysis.
            </p>
         </div>
         
         {/* ✅ RESTORED: Plan Badge (Informational for Admin) */}
         <div className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-2 border ${
             company.plan === 'FREE' 
               ? "bg-gray-100 text-gray-600 border-gray-200" 
               : "bg-blue-100 text-blue-700 border-blue-200"
         }`}>
            {company.plan !== 'FREE' && <Sparkles className="h-3 w-3" />}
            {company.plan} Plan
         </div>
      </div>

      {/* Main Dashboard Component */}
      <CompanyAnalyticsView 
         company={company}
         reviews={reviews}
         features={adminViewFeatures} // ✅ Admin gets full access
         searchStats={searchStats} 
         userRole="ADMIN"
      />
    </div>
  );
}