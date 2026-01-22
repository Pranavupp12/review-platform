
import Image from 'next/image';
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

export function DataInsightsSection() {
  return (
    <section className="py-24 bg-[#F8F9FA]">
      <div className="container mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        
       {/* Left: Text Content */}
        <div className="space-y-8 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-black leading-tight">
            <TranslatableText text="Help Data Solutions," /> <br/>
            <TranslatableText text="powered by" /> <span className="text-[#0892A5]">InsightLayer</span>
          </h2>
          
          <p className="text-lg text-gray-700 font-medium leading-relaxed">
            <TranslatableText text="Embed rich consumer sentiment and trust signals into every strategic business decision." />
          </p>
          
          <div className="space-y-4">
            <p className="text-md text-gray-500 leading-relaxed">
              <TranslatableText text="Our intelligence layer goes beyond surface-level metrics. We help you understand the" /> <strong>"<TranslatableText text="Why" />"</strong> <TranslatableText text="behind customer behavior, not just the" /> "<TranslatableText text="What" />".
            </p>
            
            {/* New: Key Benefits List */}
            <ul className="space-y-3 mt-4">
              {[
                "Real-time Sentiment Analysis to spot trends early.",
                "Competitor Benchmarking against industry leaders.",
                "ROI Tracking to measure the impact of trust on revenue.",
                "Custom API integrations for your existing tech stack."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-600 text-md">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-[#0ABED6] shrink-0" />
                  <span><TranslatableText text={item} /></span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-gray-500 italic border-l-4 border-[#0ABED6] pl-4 py-1">
            "<TranslatableText text="Data without context is just noise. InsightLayer turns that noise into a clear signal for growth." />"
          </div>

        </div>

        {/* Right: Graphic */}
        <div className="relative">
           <div className=" p-3 relative z-10 overflow-hidden h-[450px] lg:h-[600px]">
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-50">
                <Image
                  src="/images/data-banner.png" 
                  alt="Data Insights Dashboard"
                  fill
                  className="object-cover"
                />
              </div>
           </div>

           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#0ABED6]/20 blur-[100px] -z-10 rounded-full" />
        </div>

      </div>
    </section>
  );
}