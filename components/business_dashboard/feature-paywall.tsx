import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeaturePaywallProps {
  title: string;
  description: string;
  features: {
    icon: React.ElementType;
    text: string;
    colorClass: string;
  }[];
}

export function FeaturePaywall({ title, description, features }: FeaturePaywallProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50/50 p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
      
      {/* Background Blur Effect */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden flex flex-wrap gap-4 p-4 grayscale blur-sm">
         <div className="w-full h-32 bg-black rounded-lg" />
         <div className="w-1/2 h-32 bg-black rounded-lg" />
         <div className="w-1/3 h-32 bg-black rounded-lg" />
      </div>

      <div className="relative z-10 max-w-md mx-auto space-y-6">
        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="h-8 w-8 text-blue-600" />
        </div>
        
        <h3 className="text-2xl font-bold text-[#000032]">{title}</h3>
        <p className="text-gray-600">
          You are currently on the <span className="font-semibold text-gray-900">Free Plan</span>. 
          {description}
        </p>

        {/* Feature List */}
        <div className="grid grid-cols-1 gap-3 text-left bg-white p-4 rounded-lg shadow-sm border border-gray-100">
           {features.map((feature, idx) => (
             <div key={idx} className="flex items-center gap-3">
                <feature.icon className={`h-5 w-5 ${feature.colorClass}`} />
                <span className="text-sm font-medium text-gray-700">{feature.text}</span>
             </div>
           ))}
        </div>

        {/* Link to Settings/Billing */}
        <Link href="/business/dashboard/settings">
           <Button size="lg" className="w-full bg-[#0ABED6] hover:bg-[#09a8bd] text-white font-bold mt-2">
             View Plans & Upgrade
           </Button>
        </Link>
      </div>
    </div>
  );
}