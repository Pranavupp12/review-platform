import { Ban, Globe, Lock, Megaphone } from 'lucide-react';
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

export function IntegritySection() {
  return (
    <section className="py-20 sm:py-10 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto max-w-6xl px-4">
        
        {/* Header */}
        <div className="mb-12 max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-black tracking-tight">
            <TranslatableText text="Our Promise of Neutrality" />
          </h2>
          <p className="text-lg text-gray-500 mt-4">
            <TranslatableText text="We built this platform on a simple foundation: money cannot buy trust. Here is how we keep the playing field level." />
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
          
          {/* Card 1: No Pay-to-Remove */}
          <div className="group md:col-span-2 bg-[#0892A5] rounded-3xl p-8 shadow-sm hover:shadow-lg  transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
              <Ban className="w-64 h-64 text-white" />
            </div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <Ban className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-3">
                  <TranslatableText text="No Pay-to-Remove" />
                </h3>
                <p className="text-white/90 text-md leading-relaxed max-w-md font-medium">
                  <TranslatableText text="Companies cannot pay us to delete negative reviews or hide feedback. It doesn't matter if they use our free tools or paid services—their reputation is earned, not bought." />
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Open Access */}
          <div className="bg-[#0ABED6] rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
             <div className="absolute -right-6 -top-6 bg-white/10 w-32 h-32 rounded-full blur-2xl pointer-events-none" />
            
            <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                <TranslatableText text="Open to Everyone" />
              </h3>
              <p className="text-white/90 text-sm font-medium leading-relaxed">
                <TranslatableText text="You don't need an invitation code to speak up. If you had an experience, you have a voice here." />
              </p>
            </div>
          </div>

          {/* Card 3: Privacy First */}
          <div className="bg-[#0ABED6] rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
             <div className="absolute -left-6 -bottom-6 bg-white/10 w-32 h-32 rounded-full blur-2xl pointer-events-none" />

            <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                <TranslatableText text="Reviewer Privacy" />
              </h3>
              <p className="text-white/90 text-sm font-medium leading-relaxed">
                <TranslatableText text="We protect your personal data. Companies can reply to you, but they can't access your private details." />
              </p>
            </div>
          </div>

          {/* Card 4: Uncensored */}
          <div className="md:col-span-2 bg-[#0892A5] rounded-3xl p-8 shadow-sm hover:shadow-lg  transition-all duration-300 relative overflow-hidden">
             <div className="absolute -bottom-10 -right-3 opacity-10 group-hover:opacity-20 transition-opacity ">
              <Megaphone className="w-64 h-64 text-white" />
             </div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8 h-full">
              <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm">
                <Megaphone className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-3">
                  <TranslatableText text="Uncensored Feedback" />
                </h3>
                <p className="text-white/90 text-md leading-relaxed font-medium max-w-xl">
                  <TranslatableText text="We don't moderate for sentiment. Whether a review is a 1-star complaint or a 5-star praise, it stays up as long as it follows our content guidelines." />
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}