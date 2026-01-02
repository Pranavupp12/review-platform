import { BusinessSignupForm } from "@/components/business_auth/business-signup-form";
import Link from "next/link";
import { Suspense } from "react";
import { Loader2, ChevronLeft, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma"; 

export const metadata = {
  title: "Create Free Business Account",
  description: "Join millions of businesses managing their reputation.",
};

export default async function BusinessSignupPage() {
 
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  return (
    // Unified background for the whole page
    <div className="min-h-screen relative bg-gray-50 overflow-hidden">
      
      {/* === FIXED BACKGROUND SHAPES === */}
      {/* Z-0: Sits behind everything. Pointer events none so clicks pass through. */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        
        {/* Shape 1: Top Left Circle (Light Teal) */}
        <div className="absolute -top-20 -left-30 w-[350px] h-[350px] bg-[#0892A5]/20 rounded-full" />
        
        {/* Shape 2: Bottom Right Circle (Light Teal) */}
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-[#0892A5]/60 rounded-full" />

        {/* Shape 3: Floating Triangle/Rotated Square near center-left */}
        <div className="hidden lg:block absolute top-180 left-[10%] w-64 h-64 bg-[#0892A5] rotate-45 rounded-3xl" />

        {/* Shape 4: small diamond  top-right */}
        <div className=" block lg:hidden absolute top-20 right-[15%] w-32 h-32 bg-[#0892A5] rotate-45 rounded-3xl" />
        
      </div>
      {/* ================================= */}


      {/* === SCROLLING CONTENT LAYER === */}
      {/* Z-10: Sits above the shapes. Flex container for the split layout. */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">

        {/* --- BACK BUTTON --- */}
        <div className="absolute top-6 left-6 z-50">
          <Link href="/business">
            <Button variant="ghost" className="text-gray-600 hover:text-black gap-2 pl-2">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>

        {/* --- LEFT COLUMN: Text Content --- */}
        {/* bg-transparent ensures the page background and shapes show through */}
        <div className=" pt-20 lg:pt-0 lg:w-[35%] bg-transparent p-8 lg:p-10 lg:pt-32 flex flex-col relative">
           
           <div>
              <div className="mb-12">
                 <div className="text-3xl font-bold text-black flex items-center gap-2">
                    <div className="bg-[#0892A5] text-white p-1.5 rounded-md">
                      <Star className="h-6 w-6 fill-current" />
                    </div>
                    Help
                 </div>
                 <div className="text-gray-600 font-regular text-xl pl-[42px] -mt-2">
                    Business
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="space-y-3">
                    <div className="flex items-start gap-3 font-bold text-lg leading-tight">
                       <CheckCircle2 className="h-6 w-6 text-black shrink-0 mt-0.5" />
                       Build credibility with reviews
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed pl-9">
                       Collect trustworthy reviews on an open, transparent platform millions of consumers use.
                    </p>
                 </div>

                 <div className="space-y-3">
                    <div className="flex items-start gap-3 font-bold  text-lg leading-tight">
                       <CheckCircle2 className="h-6 w-6 text-black shrink-0 mt-0.5" />
                       Strengthen your reputation
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed pl-9">
                       94% of new users that automated review invites increased their TrustScore*.
                    </p>
                 </div>

                 <div className="space-y-3">
                    <div className="flex items-start gap-3 font-bold  text-lg leading-tight">
                       <CheckCircle2 className="h-6 w-6 text-black shrink-0 mt-0.5" />
                       Grow performance
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed pl-9">
                       Help stars and content are proven to convert at higher rates than those of competitors.
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* --- RIGHT COLUMN: Form --- */}
        {/* Transparent container so shapes behind the form area are visible (until covered by the white card) */}
        <div className="lg:w-[65%] flex items-center justify-center p-4 lg:p-12">
           
           <div className="w-full max-w-3xl my-12 lg:my-0">
              {/* Solid White Card for readability */}
              <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 ">
                 

                 <Suspense fallback={<div className="h-96 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-[#0ABED6]"/></div>}>
                    <BusinessSignupForm categories={categories} />
                 </Suspense>

              </div>
           </div>
        </div>
      </div>
    </div>
  );
}