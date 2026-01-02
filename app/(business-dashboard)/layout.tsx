import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { BusinessSidebar } from "@/components/business_dashboard/business-sidebar";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Lock } from "lucide-react";

export default async function BusinessDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 1. Auth Guard
  if (!session?.user) {
    return redirect("/business/login");
  }

  // 2. Role Guard (Must be BUSINESS or ADMIN)
  if (session.user.role !== "BUSINESS" && session.user.role !== "ADMIN") {
    return redirect("/"); 
  }

  // 3. Company Guard (Must have a company linked)
  if (!session.user.companyId) {
    return redirect("/business/pending"); 
  }

  // ✅ 4. FETCH COMPANY STATUS (New Addition)
  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { isFrozen: true, name: true }
  });

  // ✅ 5. GLOBAL FREEZE CHECK (New Addition)
  // If frozen, return this "Wall" instead of the Sidebar + Children
  if (company?.isFrozen) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
          
          <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8" />
          </div>
          
          <h1 className="text-2xl font-bold text-[#000032] mb-2">Access Restricted</h1>
          <p className="text-gray-500 mb-6 leading-relaxed">
            The account for <span className="font-semibold text-gray-900">{company.name}</span> has been temporarily frozen by our administration team.
          </p>
          
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6 text-sm text-red-800 text-left flex gap-3">
             <AlertTriangle className="h-5 w-5 shrink-0" />
             <p>You cannot access the dashboard, reply to reviews, or manage campaigns while the account is frozen.</p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full bg-[#000032] hover:bg-[#000032]/90 h-10">
              <Link href="mailto:support@platform.com?subject=Account Frozen Appeal">
                Contact Support
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full border-gray-200">
              <Link href="/business">Back to Homepage</Link>
            </Button>
          </div>
          
          <p className="mt-8 text-xs text-gray-400">
             ID: {session.user.companyId} • Please reference this ID when contacting support.
          </p>
        </div>
      </div>
    );
  }

  // 6. Normal Render (If not frozen)
  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessSidebar />
       <main className="flex-1 ml-[3.5rem] p-8 overflow-y-hidden min-h-screen">
        {children}
      </main>
    </div>
  );
}