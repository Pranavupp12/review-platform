import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default async function BusinessUnknownPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const { name } = await searchParams;
  const initialName = name || "Your Business";

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
       
       {/* --- TOP HERO SECTION (White) --- */}
       <div className="bg-gray-50 pb-32 pt-24 ">
          <div className="container mx-auto px-4 text-center max-w-4xl">
             
             <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
               We couldn't find "{initialName}"
             </h1>
             
             <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed">
               This is actually good news! It means you can be the first to claim <strong>{initialName}</strong> and start building your reputation today.
             </p>
          </div>
       </div>

       {/* --- GREEN CURVE BACKGROUND --- */}
       <div className="absolute top-[350px] left-0 right-0 h-[420px] bg-[#0892A5] -skew-y-3 transform origin-top-left z-0" />
       
       {/* --- CONTENT OVERLAY --- */}
       <div className="container mx-auto px-4 relative z-10 -mt-20 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
             
             {/* LEFT: Value Props (Only visible on Desktop) */}
             <div className="hidden lg:block pt-12 text-white/90 space-y-8">
                <div>
                    <h3 className="text-3xl font-bold text-white mb-4">Why register now?</h3>
                    <p className="text-lg text-white/80 leading-relaxed">
                        90% of customers check reviews before visiting a business. Take control of what they see by creating your official profile.
                    </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-full">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium text-lg">Get a verified "Business" badge</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-full">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium text-lg">Access free analytics dashboard</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-full">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium text-lg">Reply to customer reviews</span>
                   </div>
                </div>
             </div>

             {/* RIGHT: Call to Action Card */}
             <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 lg:mt-0">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-[#000032] mb-2">Claim this profile</h2>
                    <p className="text-gray-500">
                        Create a free account to instantly register <strong>{initialName}</strong> on our platform.
                    </p>
                </div>

                <div className="space-y-4">
                    <Link href={`/business/signup?name=${encodeURIComponent(initialName)}&new=true`} className="block">
                        <Button size="lg" className="w-full bg-[#000032] hover:bg-[#000032]/90 text-white h-14 text-lg font-bold rounded-xl shadow--md">
                        Register Now
                        <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-100" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-400">or</span>
                        </div>
                    </div>

                    <Link href="/business" className="block">
                        <Button variant="outline" size="lg" className="w-full h-12 text-gray-600 border-gray-200 hover:bg-gray-50 rounded-xl">
                        Search for a different business
                        </Button>
                    </Link>
                </div>

                <p className="text-xs text-center text-gray-400 mt-6">
                    Registration is free and takes less than 2 minutes.
                </p>
             </div>

          </div>
       </div>

    </div>
  );
}