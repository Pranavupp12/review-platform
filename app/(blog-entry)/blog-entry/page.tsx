import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Newspaper, ArrowRight, LogOut, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RecentSubmissionsTable } from "@/components/admin_components/staff_components/recent-submissions-table"; 

export default async function BlogDashboard() {
  const session = await auth();
  if (!session?.user) return redirect("/admin/login");

  // 1. FETCH RECENT BLOG SUBMISSIONS
  const myRequests = await prisma.pendingChange.findMany({
    where: { 
      requesterId: session.user.id,
      model: "BLOG" 
    },
    orderBy: { updatedAt: 'desc' },
    take: 10 
  });

  const rejectedItems = myRequests.filter(req => req.status === "REJECTED");

  return (
    // ✅ FIX: Added w-full, overflow-x-hidden, and responsive padding
    <div className="max-w-xl lg:max-w-5xl mx-auto overflow-x-hidden">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Blog Content Workspace</h1>
           <p className="text-gray-500">Welcome, {session.user.name}</p>
        </div>
      </div>

      {/* Alert Section */}
      {rejectedItems.length > 0 && (
         <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <h3 className="font-bold text-red-800 flex items-center gap-2 mb-2">
               <XCircle className="h-5 w-5" /> Attention Required
            </h3>
            <p className="text-sm text-red-600">
              You have {rejectedItems.length} blog submission(s) that require attention.
            </p>
         </div>
      )}

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/blog-entry/blogs" className="group">
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:border-purple-500 hover:shadow-md transition-all flex flex-col items-center text-center">
              <div className="h-20 w-20 bg-purple-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                <Newspaper className="h-10 w-10 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Manage Blogs</h2>
              <p className="text-gray-500 mt-2">Write, edit, and publish articles.</p>
              <div className="mt-6 flex items-center text-purple-600 font-semibold">
                Go to Editor <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </div>
          </Link>
      </div>

      {/* Recent Submissions Table */}
      <div className="space-y-4">
         <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-400" /> Recent Blog Submissions
         </h2>
         {/* The overflow fix needs to happen INSIDE this component too */}
         <RecentSubmissionsTable submissions={myRequests} />
      </div>

    </div>
  );
}