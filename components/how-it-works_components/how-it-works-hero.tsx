import { Button } from "@/components/ui/button";
import Link from "next/link";
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

export function HowItWorksHero() {
  return (
    <div className="bg-[#0892A5] text-white py-20 sm:py-15 relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0ABED6] rounded-full blur-[120px] opacity-20 -mr-32 -mt-32"></div>
      
      <div className="container mx-auto max-w-6xl px-4 text-center relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
          <TranslatableText text="Behind every review is an" /> <br/>
          <span className="text-white"><TranslatableText text="experience" /></span> <TranslatableText text="that matters." />
        </h1>
        <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-2xl mx-auto leading-relaxed">
          <TranslatableText text="We bridge the gap between businesses and consumers. Here is how we ensure those connections are honest, transparent, and helpful for everyone." />
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/write-review">
            <Button size="lg" className="bg-white hover:bg-[#0ABED6] hover:text-white text-[#0ABED6] rounded-full h-12 px-8 font-semibold">
              <TranslatableText text="Write a review" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}