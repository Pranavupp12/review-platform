import { ShieldCheck, ScanFace, Scale, Users } from 'lucide-react';
// ✅ Import the Translator Component
import { TranslatableText } from "@/components/shared/translatable-text";

export function TrustBentoGrid() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto max-w-6xl px-4">
        
        {/* Header */}
        <div className="mb-12 max-w-2xl ">
          <h2 className="text-3xl font-bold text-black ">
            <TranslatableText text="Why you can trust us" />
          </h2>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
          
          {/* Card 1: Verified Identity (Large) - COLOR #0892A5 */}
          <div className="group md:col-span-2 bg-[#0892A5] rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            {/* Background Icon Decoration */}
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck className="w-64 h-64 text-white" />
            </div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  <TranslatableText text="Verified Experiences" />
                </h3>
                <div className="text-white/90 text-lg leading-relaxed max-w-md font-medium">
                  <TranslatableText text="We ensure reviews are written by real people about real experiences. Our advanced verification systems check for authenticity before a review goes live." />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: AI Detection (Small) - COLOR #0ABED6 */}
          <div className="bg-[#0ABED6] rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
             <div className="absolute -right-6 -top-6 bg-white/10 w-32 h-32 rounded-full blur-2xl pointer-events-none" />
            
            <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
              <ScanFace className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                <TranslatableText text="24/7 Fraud Sweep" />
              </h3>
              <div className="text-white/90 text-sm font-medium leading-relaxed">
                <TranslatableText text="Our custom algorithms scan the platform around the clock to detect and remove fake reviews." />
              </div>
            </div>
          </div>

          {/* Card 3: No Bias (Small) - COLOR #0ABED6 */}
          <div className="bg-[#0ABED6] rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
             <div className="absolute -left-6 -bottom-6 bg-white/10 w-32 h-32 rounded-full blur-2xl pointer-events-none" />

            <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                <TranslatableText text="Zero Bias" />
              </h3>
              <div className="text-white/90 text-sm font-medium leading-relaxed">
                <TranslatableText text="Companies cannot delete negative reviews. We treat all feedback equally to maintain integrity." />
              </div>
            </div>
          </div>

          {/* Card 4: Community Power (Large) - COLOR #0892A5 */}
          <div className="md:col-span-2 bg-[#0892A5] rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden">
             {/* Background Icon Decoration */}
             <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="w-64 h-64 text-white" />
             </div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8 h-full">
              <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  <TranslatableText text="Community Driven" />
                </h3>
                <div className="text-white/90 text-lg leading-relaxed font-medium max-w-xl">
                  <TranslatableText text='Our community of millions of reviewers helps us spot suspicious activity. Every review has a "Report" flag, allowing us to investigate concerns immediately.' />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}