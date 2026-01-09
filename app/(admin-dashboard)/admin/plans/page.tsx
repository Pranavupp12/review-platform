import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
// ✅ CHANGED: Import the new Manager instead of the old Toggle
import { PlanManager } from "@/components/admin_components/plan-manager";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { PlanFilters } from "@/components/admin_components/page-filters/plan-filters";
import { Building2, Inbox } from "lucide-react"; 
import { Prisma, Plan } from '@prisma/client';

export const metadata = { title: 'Manage Plans - Admin' };

// ✅ Helper to format date as dd/mm/yyyy
function formatDate(date: Date | null) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Helper for Badge Colors based on Plan
function getPlanBadgeColor(plan: Plan) {
  switch (plan) {
    case "GROWTH":
      return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200";
    case "SCALE":
      return "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200";
    case "CUSTOM":
      return "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200";
    case "FREE":
    default:
      return "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200";
  }
}

type PageProps = {
  searchParams: Promise<{ 
    page?: string;
    query?: string;
    plan?: string;
  }>;
};

export default async function ManagePlansPage({ searchParams }: PageProps) {
  const session = await auth();
  
  if (session?.user?.role !== "ADMIN") {
    // If they are DATA_ENTRY, kick them out
    return redirect("/admin/companies"); 
  }

  const resolvedSearchParams = await searchParams;
  
  const page = Number(resolvedSearchParams.page) || 1;
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const query = resolvedSearchParams.query || "";
  const plan = resolvedSearchParams.plan || "";

  const where: Prisma.CompanyWhereInput = {};

  if (query) {
    where.name = { contains: query, mode: 'insensitive' };
  }

  // ✅ UPDATED: Handle dynamic plan filtering
  // Assuming your PlanFilters component sends "GROWTH", "SCALE", etc. as query params
  if (plan && plan !== "ALL") {
    // We cast to Plan to match the Prisma Enum type
    where.plan = plan as Plan;
  }

  const [companies, totalCount] = await Promise.all([
    prisma.company.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: skip,
      take: pageSize,
      // ✅ UPDATED: Select 'features' so we can pass them to the manager
      select: { 
        id: true, 
        name: true, 
        plan: true, 
        features: true, // <--- Critical for the new logic
        createdAt: true, 
        slug: true 
      }
    }),
    prisma.company.count({ where })
  ]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold flex items-center gap-2">
            Manage Company Plans
         </h1>
         <div className="bg-white px-4 py-2 rounded-md border shadow-sm text-sm">
            Total Results: <strong>{totalCount}</strong>
         </div>
      </div>

      <PlanFilters />

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        {companies.length === 0 ? (
           <div className="p-12 text-center flex flex-col items-center justify-center">
             <div className="bg-gray-50 p-4 rounded-full mb-3">
               <Inbox className="h-8 w-8 text-gray-400" />
             </div>
             <h3 className="text-lg font-medium text-gray-900">No companies found</h3>
             <p className="text-gray-500 mt-1">Try adjusting your filters.</p>
           </div>
        ) : (
          <>
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Current Plan</TableHead>
                  <TableHead className="text-right">Manage Features</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                          <div>{company.name}</div>
                          <div className="text-xs text-gray-400">/{company.slug}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500">
                        {formatDate(company.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getPlanBadgeColor(company.plan)} border`}>
                          {company.plan}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* ✅ UPDATED: New PlanManager Component */}
                      <PlanManager 
                        companyId={company.id} 
                        currentPlan={company.plan} 
                        currentFeatures={company.features}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="p-4 border-t border-gray-100">
                <PaginationControls 
                    totalItems={totalCount} 
                    pageSize={pageSize} 
                    currentPage={page} 
                />
            </div>
          </>
        )}
      </div>
    </div>
  );
}