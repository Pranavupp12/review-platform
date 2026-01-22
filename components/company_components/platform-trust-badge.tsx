import { Shield, Star } from 'lucide-react';
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

export function PlatformTrustBadge() {
  return (
    <div className="flex items-center justify-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 mb-8 mx-auto w-fit">
      {/* Icon Wrapper */}
      <div className="relative shrink-0 flex items-center justify-center">
        <Shield className="h-9 w-9 text-[#0892A5] fill-[#0892A5] drop-shadow-[0_2px_6px_#0892A566]" />
        <Star className="h-3.5 w-3.5 text-white fill-white absolute mt-0.5" /> 
      </div>
      
      <p className="text-md font-medium text-slate-700 leading-relaxed">
        <TranslatableText text="Companies on" /> <span className="font-bold text-slate-900">help</span> <TranslatableText text="cannot pay to remove reviews or use incentives to influence ratings." />
      </p>
    </div>
  );
}