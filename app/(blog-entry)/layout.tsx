import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin_components/admin-sidebar";

export default async function BlogEntryLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // @ts-ignore
  if (!session || session.user.role !== "BLOG_ENTRY") return redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ✅ Pass Role and Name */}
      <AdminSidebar userRole="BLOG_ENTRY" userName={session.user.name || "Writer"} />
      <div className="flex-1 p-8 ml-[3.5rem] lg:ml-[3.5rem]">
        {children}
      </div>
    </div>
  );
}