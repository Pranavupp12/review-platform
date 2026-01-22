
import Image from "next/image";
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

export function BusinessProfileFeature() {
  return (
    <section className="bg-gray-50 py-20 overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column: Image (Phone/Profile Mockup) */}
        <div className="relative h-[500px] w-full flex items-center justify-center order-2 lg:order-1">
           {/* Image Container */}
              <div className="relative h-full w-full overflow-hidden ">
                <Image
                  src="/images/features-banner2.png" 
                  alt="Business Profile Page on Mobile"
                  fill
                  className="object-cover"
                />
              </div>
        </div>

        {/* Right Column: Text Content */}
        <div className="space-y-8 order-1 lg:order-2  text-center lg:text-left">
          
          <div className="space-y-4">
            <span className="text-[#0892A5] font-medium tracking-wide uppercase text-sm">
              <TranslatableText text="Business Profile" />
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-black leading-tight tracking-tight">
              <TranslatableText text="Catch the eye of future customers" />
            </h2>
          </div>
          
          <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
            <p>
              <TranslatableText text="Reviews are published right to your profile page on Help, creating an endless stream of fresh and relevant content about your brand." />
            </p>
            <p>
              <TranslatableText text="This rich, user-generated content helps improve your rankings in search results, making it easier for new customers to find and trust you." />
            </p>
          </div>
        
        </div>

      </div>
    </section>
  );
}