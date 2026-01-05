import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PendingChangeList } from "@/components/admin_components/staff_components/pending-change-list";
import { ShieldCheck, Inbox } from "lucide-react";

// Force dynamic rendering so you always see new requests immediately
export const dynamic = "force-dynamic";

export const metadata = { title: "Data Approval Center" };

export default async function DataApprovalPage() {
  const session = await auth();
  
  // @ts-ignore
  if (session?.user?.role !== "ADMIN") {
    return redirect("/dashboard");
  }

  // Fetch only Pending changes
  const pendingRequests = await prisma.pendingChange.findMany({
    where: { status: "PENDING" },
    include: { 
        requester: { select: { name: true, email: true } } 
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b pb-6">
        <div className="bg-blue-50 p-3 rounded-full">
            <ShieldCheck className="h-8 w-8 text-[#0ABED6]" />
        </div>
        <div>
           <h1 className="text-2xl font-bold text-[#000032]">Data Approval Center</h1>
           <p className="text-gray-500">Review, approve, or reject changes submitted by staff.</p>
        </div>
      </div>

      {/* Content */}
      {pendingRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-gray-300 rounded-xl">
            <div className="bg-gray-50 p-4 rounded-full mb-3">
                <Inbox className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
            <p className="text-gray-500">There are no pending changes to review.</p>
        </div>
      ) : (
        <PendingChangeList requests={pendingRequests} />
      )}
    </div>
  );
}