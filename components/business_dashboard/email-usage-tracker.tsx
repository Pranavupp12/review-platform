import { Progress } from "@/components/ui/progress";
import { Lock, Zap } from "lucide-react";
import Link from "next/link";
// import { Plan } from "@prisma/client"; // Optional: Use real type if available

interface EmailUsageTrackerProps {
  plan: string; // ✅ Changed from 'isPro: boolean' to 'plan: string'
  usage: number;
  limit: number;
}

export function EmailUsageTracker({ plan, usage, limit }: EmailUsageTrackerProps) {
  // Hide tracker if they are PRO
  if (plan === 'PRO') return null; 

  const percentage = Math.min((usage / limit) * 100, 100);
  const remaining = Math.max(limit - usage, 0);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
           Free Plan Usage
        </h3>
        <span className="text-xs font-bold text-gray-500">
          {usage} / {limit} emails sent
        </span>
      </div>
      
      <Progress value={percentage} className="h-2 mb-3" />
      
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500">
          {remaining === 0 ? (
            <span className="text-red-500 font-bold">Limit Reached</span>
          ) : (
            <span>{remaining} emails remaining this month</span>
          )}
        </p>
        
        <Link href="/dashboard/billing" className="text-xs text-[#0ABED6] font-bold hover:underline flex items-center gap-1">
          <Zap className="h-3 w-3" /> Upgrade for Unlimited
        </Link>
      </div>

      {remaining === 0 && (
         <div className="mt-3 bg-gray-50 p-2 rounded text-xs text-gray-600 border border-gray-200 flex gap-2 items-center">
            <Lock className="h-3 w-3 text-gray-400" />
            <span>You hit your monthly limit. Upgrade to Pro to send more campaigns.</span>
         </div>
      )}
    </div>
  );
}