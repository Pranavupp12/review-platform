import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin_components/admin-sidebar"; // Import the sidebar

export default async function DataEntryLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // @ts-ignore
  if (!session || session.user.role !== "DATA_ENTRY") return redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ✅ Pass Role and Name */}
      <AdminSidebar userRole="DATA_ENTRY" userName={session.user.name || "Staff"} />
      <div className="flex-1 p-8 ml-[3.5rem] lg:ml-[3.5rem]"> {/* Add margin-left for collapsed sidebar */}
        {children}
      </div>
    </div>
  );
}