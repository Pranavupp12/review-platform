import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ShowcaseManager } from "@/components/business_dashboard/showcase-manager";

export const metadata = { title: "Manage Products & Services" };

export default async function ShowcasePage() {
  const session = await auth();
  if (!session?.user?.companyId) return redirect("/business/login");

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    include: {
        showcaseItems: true // ✅ Fetch the items
    }
  });

  if (!company) return <div>Company not found</div>;

  return (
    <div className="mx-0 lg:mx-20 max-w-6xl py-6">
       <ShowcaseManager company={company} />
    </div>
  );
}