import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CompanyAnalyticsView } from "@/components/admin_components/admin-analytics/company-analytics-view";
import Link from "next/link";
import { ChevronRight, BarChart3 } from "lucide-react";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ companyId: string }>;
}

export default async function CompanyAnalyticsPage({ params }: PageProps) {
  const { companyId } = await params;

  // 1. Fetch Company & Reviews
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      category: true,
      reviews: {
        orderBy: { createdAt: 'desc' },
        // Fetch fields needed for analytics + USER DETAILS
        select: { 
            id: true,         // Explicitly select ID for unique keys
            starRating: true, 
            createdAt: true, 
            keywords: true,
            comment: true,
            user: {           // ✅ Added this section
              select: {
                name: true,
                image: true
              }
            }
        } 
      }
    }
  });

  if (!company) return notFound();

  const isPro = company.plan === "PRO";

  return (
    <div className="max-w-7xl mx-auto p-6">
      
      {/* Header / Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
         <Link href="/admin/companies" className="hover:text-blue-600">Companies</Link>
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
            <p className="text-gray-500 mt-1">Comprehensive performance and sentiment analysis.</p>
         </div>
         <div className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-full">
            {isPro ? "Pro Plan Active" : "Free Plan"}
         </div>
      </div>

      {/* The Main Dashboard Component */}
      <CompanyAnalyticsView 
         company={company}
         reviews={company.reviews}
         isPro={true}
      />
    </div>
  );
}