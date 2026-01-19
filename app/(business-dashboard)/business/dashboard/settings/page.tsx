import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/business_dashboard/settings-form";
import { redirect } from "next/navigation";

export const metadata = { title: "Settings - Business Center" };

export default async function BusinessSettingsPage() {
  const session = await auth();
  if (!session?.user?.companyId) return redirect("/business/login");

  // 1. Fetch Company Data
  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    include: {
        showcaseItems: true // <--- CRITICAL ADDITION
    }
  });

  if (!company) return <div>Company not found</div>;

  // 2. CHANGED: Fetch ALL Categories with their Subcategories
  // We need the full tree so the user can switch categories dynamically
  const categories = await prisma.category.findMany({
    include: {
      subCategories: {
        select: { id: true, name: true }, // Select only what we need
        orderBy: { name: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6 mx-0 lg:mx-20">
       <div className="border-b border-gray-200 pb-5">
          <h1 className="text-3xl font-bold text-[#000032]">Edit Profile</h1>
          <p className="text-gray-500 mt-1">
             Update your contact details, location, and business information.
          </p>
       </div>

       {/* 3. Pass the full categories tree instead of just subCategories */}
       <SettingsForm 
          company={company} 
          categories={categories} 
       />
    </div>
  );
}