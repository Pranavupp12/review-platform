import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Building2, ArrowRight, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RecentSubmissionsTable } from "@/components/admin_components/staff_components/recent-submissions-table";

export default async function DataEntryDashboardPage() {
  const session = await auth();
  // @ts-ignore
  if (!session?.user || (session.user.role !== "DATA_ENTRY" && session.user.role !== "ADMIN")) {
     return redirect("/admin/login");
  }

  // Fetch only COMPANY requests
  const myRequests = await prisma.pendingChange.findMany({
    where: { 
      requesterId: session.user.id,
      model: "COMPANY" 
    },
    orderBy: { updatedAt: 'desc' },
    take: 10 
  });


  return (
    <div className="max-w-xl lg:max-w-6xl mx-auto pt-6 space-y-8 pb-20">
      
      <div>
         <h1 className="text-3xl font-bold text-[#000032]">Data Entry Workspace</h1>
         <p className="text-gray-500">Welcome back, {session.user.name}. Manage company profiles.</p>
      </div>


      {/* ✅ ONLY COMPANIES CARD (Blog card removed) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/data-entry/companies" className="group">
            <div className="h-full bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-[#0ABED6] transition-all cursor-pointer flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-[#0ABED6] transition-colors">
                <Building2 className="h-8 w-8 text-[#0ABED6] group-hover:text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Manage Companies</h3>
                <p className="text-sm text-gray-500 mt-2">Add or edit company profiles.</p>
              </div>
              <div className="pt-4 text-[#0ABED6] font-medium flex items-center gap-2 text-sm">
                Go to Companies <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
      </div>

      <div className="space-y-4">
         <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-400" /> Recent Company Submissions
         </h2>
         <RecentSubmissionsTable submissions={myRequests} />
      </div>

    </div>
  );
}