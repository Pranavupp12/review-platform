
import Image from "next/image"; 
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

export function BeDiscoveredFeature() {
  return (
    <section className="py-20 overflow-hidden bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column: Text Content */}
        <div className="space-y-8 order-1 max-w-3xl text-center lg:text-left">
          <div className="space-y-4">
            <span className="text-[#0892A5] font-bold tracking-wide uppercase text-sm">
              <TranslatableText text="Categories" />
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-black leading-tight tracking-tight">
              <TranslatableText text="Be discovered" />
            </h2>
          </div>
          
          <div className="space-y-6 text-lg text-gray-600 font-medium leading-relaxed  mx-auto lg:mx-0">
            <p>
              <TranslatableText text="Make it even easier for consumers to find you and drive traffic to your profile page by selecting up to six business categories." />
            </p>
            <p>
              <TranslatableText text="Or, instantly import them directly from your Google My Business profile to get set up fast." />
            </p>
          </div>
          
        </div>

        {/* Right Column: Image Placeholder */}
        <div className="relative h-[500px] w-full flex items-center justify-center order-1 lg:order-2">
              {/* Main Image Placeholder */}
              <div className="relative h-full w-full overflow-hidden flex items-center justify-center">
                    <Image
                      src="/images/features-banner3.png" 
                      alt="Be Discovered via Categories"
                      fill
                      className="object-cover"
                    />
              </div>
           </div>
        </div>
    </section>
  );
}