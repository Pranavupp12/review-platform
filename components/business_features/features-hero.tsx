import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export function FeaturesHero() {
  return (
    <section className="bg-gray-50 text-black py-20 relative overflow-hidden">
    
      <div className="container mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Column: Text Content */}
        <div className="space-y-4 max-w-3xl text-center lg:text-left">
          <span className="text-[#0892A5] font-medium tracking-wide uppercase text-sm">
              Reviews 
         </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Everything you need to <span className="text-[#0892A5]">manage</span> your reputation.
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            From collecting more reviews to analyzing customer sentiment, our suite of tools helps you turn feedback into your competitive advantage.
          </p>
          <div className="flex gap-4 pt-4">
            <Link href="/business/signup?new=true">
              <Button size="lg" className="bg-[#0ABED6] hover:bg-[#0ABED6]/80 text-white rounded-full px-8 h-14 text-lg font-medium transition-all">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column: Image Placeholder */}
        <div className="relative h-[500px] w-full overflow-hidden ">
          <div className="relative w-full h-full flex items-center justify-center ">
             <Image
                src="/images/features-banner.png" 
                alt="Help Business Features Dashboard"
                fill
                className="object-cover"
                priority
             />
             
          </div>
        </div>

      </div>
    </section>
  );
}