import { Button } from "@/components/ui/button";
import Link from "next/link";
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

export function HowItWorksHero() {
  return (
    <div className="bg-gray-100 text-black py-25  relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute top-60 left-110 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-accent/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-accent/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-48 h-24 bg-accent/40 rounded-full blur-3xl pointer-events-none" style={{ transform: 'rotate(-20deg)' }} />
      <div className="absolute hidden sm:block top-25 right-40 w-40 h-32 bg-accent/40 rounded-full blur-3xl pointer-events-none" style={{ transform: 'rotate(10deg)' }} />
      
      <div className="container mx-auto max-w-6xl px-4 text-center relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
          <TranslatableText text="Behind every review is an experience" /> <br/>
          <TranslatableText text="that matters." />
        </h1>
        <p className="text-lg md:text-xl text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed">
          <TranslatableText text="We bridge the gap between businesses and consumers. Here is how we ensure those connections are honest, transparent, and helpful for everyone." />
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/write-review">
            <Button size="lg" className="bg-[#0ABED6] hover:bg-[#0ABED6]/80 text-white rounded-full h-12 px-8 font-semibold">
              <TranslatableText text="Write a review" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}