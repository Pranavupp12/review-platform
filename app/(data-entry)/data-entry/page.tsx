import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Building2, Newspaper, ArrowRight, XCircle, Clock } from "lucide-react"; // import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { RecentSubmissionsTable } from "@/components/admin_components/staff_components/recent-submissions-table"; // ✅ Import the new table
import Link from "next/link";

export const metadata = { title: "Data Entry Dashboard" };

export default async function DataEntryDashboardPage() {
  const session = await auth();
  if (!session?.user) return redirect("/admin/login");

  // Fetch recent requests by this user
  const myRequests = await prisma.pendingChange.findMany({
    // @ts-ignore
    where: { requesterId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    take: 10 // Increased limit for the table
  });

  // Filter rejected items specifically for the alert box
  const rejectedItems = myRequests.filter(req => req.status === "REJECTED");

  return (
    <div className="max-w-6xl mx-auto pt-6 space-y-8 pb-20">
      
      {/* Header */}
      <div>
         <h1 className="text-3xl font-bold text-[#000032]">Data Entry Workspace</h1>
         <p className="text-gray-500">Welcome back, {session.user.name}</p>
      </div>

      {/* 🚨 REJECTION ALERT (Kept as high priority) */}
      {rejectedItems.length > 0 && (
         <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-in slide-in-from-top-2">
            <h3 className="font-bold text-red-800 flex items-center gap-2 mb-2">
               <XCircle className="h-5 w-5" /> Attention Required
            </h3>
            <p className="text-sm text-red-600 mb-3">The following submissions were returned by the Admin:</p>
            <div className="grid gap-2">
               {rejectedItems.map(item => (
                  <div key={item.id} className="bg-white p-3 rounded border border-red-100 flex justify-between items-start text-sm">
                     <div>
                        <span className="font-bold text-gray-800">{item.model} {item.action}</span>
                        <p className="text-red-600 mt-1">" {item.adminNote} "</p>
                     </div>
                     <span className="text-xs text-gray-400">{format(new Date(item.updatedAt), "dd MMM")}</span>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* Quick Actions */}
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

          <Link href="/data-entry/blogs" className="group">
            <div className="h-full bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-purple-500 transition-all cursor-pointer flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 bg-purple-50 rounded-full flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                <Newspaper className="h-8 w-8 text-purple-500 group-hover:text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Blog Management</h3>
                <p className="text-sm text-gray-500 mt-2">Write and publish articles.</p>
              </div>
              <div className="pt-4 text-purple-500 font-medium flex items-center gap-2 text-sm">
                Go to Blogs <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
      </div>

      {/* ✅ NEW TABLE SECTION */}
      <div className="space-y-4">
         <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-400" /> Recent Submissions
         </h2>
         <RecentSubmissionsTable submissions={myRequests} />
      </div>

    </div>
  );
}