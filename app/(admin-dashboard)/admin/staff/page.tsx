import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StaffList } from "@/components/admin_components/staff_components/staff-list";
import { CreateStaffForm } from "@/components/admin_components/staff_components/create-staff-form";
import { Users, ShieldAlert } from "lucide-react";

export default async function ManageStaffPage() {
  const session = await auth();
  
  // 🔒 Security: Only ADMIN (Super Admin) can access this page
  // @ts-ignore
  if (session?.user?.role !== "ADMIN") {
    return redirect("/admin");
  }

  // ✅ FIX: Fetch BOTH "DATA_ENTRY" and "BLOG_ENTRY" staff
  const staffMembers = await prisma.user.findMany({
    where: { 
      role: { in: ["DATA_ENTRY", "BLOG_ENTRY"] } // <-- Updated filter
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    }
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-5">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="h-8 w-8 text-[#0ABED6]" /> Staff Management
           </h1>
           <p className="text-gray-500 mt-1">Manage accounts for your data entry and content team.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Create Form */}
        <div className="xl:col-span-1 space-y-6">
            <CreateStaffForm />
            
            {/* Helpful Note */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
               <div className="flex items-center gap-2 font-bold mb-2">
                  <ShieldAlert className="h-4 w-4" /> Access Control
               </div>
               <p>
                 Staff members created here will have specific dashboard access:
               </p>
               <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                 <li><strong>Data Entry:</strong> Companies Management only.</li>
                 <li><strong>Content Writer:</strong> Blog Management only.</li>
               </ul>
               <p className="mt-2">They cannot see revenue, reports, or manage other staff.</p>
            </div>
        </div>

        {/* Right Column: Staff List */}
        <div className="xl:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="font-semibold text-gray-700">Active Staff Accounts</h2>
                </div>
                {/* Now this list will include your Blog Entry staff too */}
                <StaffList staff={staffMembers} />
            </div>
        </div>
      </div>
    </div>
  );
}