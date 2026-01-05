import { prisma } from "@/lib/prisma";
import { CategoryManager } from "@/components/admin_components/category-manager";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';
export const metadata = { title: "Manage Categories" };

export default async function AdminCategoriesPage() {

  const session = await auth();

  // 🔒 Security Check
  if (session?.user?.role !== "ADMIN") {
    // If they are DATA_ENTRY, kick them out
    return redirect("/admin/companies"); 
  }
  
  // Fetch categories with their subcategories included
  const categories = await prisma.category.findMany({
    include: {
      subCategories: {
        orderBy: { name: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
         <h1 className="text-3xl font-bold text-[#000032]">Category Management</h1>
         <p className="text-gray-500">Organize your platform's industry structure.</p>
      </div>

      <CategoryManager categories={categories} />
    </div>
  );
}