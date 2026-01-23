import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

export function BusinessHero() {
    return (
        <section className="bg-gray-100 overflow-hidden relative">

     <div className="absolute top-60 left-110 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-accent/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-accent/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-48 h-24 bg-accent/40 rounded-full blur-3xl pointer-events-none" style={{ transform: 'rotate(-20deg)' }} />
      <div className="absolute hidden sm:block top-25 right-40 w-40 h-32 bg-accent/40 rounded-full blur-3xl pointer-events-none" style={{ transform: 'rotate(10deg)' }} />

            <div className="container mx-auto max-w-7xl px-4 py-20 sm:py-10 grid grid-cols-1 lg:grid-cols-2  items-center">

                {/* Left Column: Text & CTA */}
                <div className="space-y-8 text-center lg:text-left z-10">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-[1.1] tracking-tight">
                        <TranslatableText text="The world's largest independent customer feedback platform" />
                    </h1>
                    <p className="text-lg lg:text-xl text-gray-500 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed">
                        <TranslatableText text="Attract and keep customers with Help's review platform and powerful analytics tools." />
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                        <Link href="/business/signup?new=true">
                            <Button className="bg-[#0ABED6]  hover:bg-[#0ABED6]/80  text-white h-14 px-8 rounded-full text-lg font-regular w-full sm:w-auto transition-all">
                                <TranslatableText text="Start for free" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Right Column: Hero Image */}
                <div className="relative h-[400px] lg:h-[450px] w-full hidden lg:block z-10">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-full h-full flex items-center justify-center">
                            <Image
                                src="/images/business-banner5.png"
                                alt="Business Growth Analytics"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}