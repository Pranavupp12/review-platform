import { Progress } from "@/components/ui/progress";
import { Lock, Zap, Crown } from "lucide-react";
import Link from "next/link";

interface EmailUsageTrackerProps {
  plan: string;
  usage: number;
  limit: number;
}

export function EmailUsageTracker({ plan, usage, limit }: EmailUsageTrackerProps) {
  // Only hide tracker if limit is Infinity (Custom/Legacy Unlimited)
  if (limit === Infinity) return null; 

  const percentage = Math.min((usage / limit) * 100, 100);
  const remaining = Math.max(limit - usage, 0);

  // Helper for color based on plan
  const getProgressColor = () => {
     if (plan === 'GROWTH') return 'bg-blue-500';
     if (plan === 'SCALE') return 'bg-purple-500';
     return 'bg-[#0ABED6]'; // Default Cyan
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
           {plan === 'FREE' ? 'Free Plan Usage' : 'Monthly Email Allowance'}
        </h3>
        <span className="text-xs font-bold text-gray-500">
          {usage} / {limit} emails sent
        </span>
      </div>
      
      {/* Custom Progress Bar Color via Style or Class */}
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-3">
         <div 
            className={`h-full transition-all ${getProgressColor()}`} 
            style={{ width: `${percentage}%` }} 
         />
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500">
          {remaining === 0 ? (
            <span className="text-red-500 font-bold">Monthly Limit Reached</span>
          ) : (
            <span>{remaining} emails remaining this month</span>
          )}
        </p>
        
        {plan !== 'SCALE' && plan !== 'CUSTOM' && (
            <Link href="/dashboard/billing" className="text-xs text-gray-900 font-bold hover:underline flex items-center gap-1">
               <Zap className="h-3 w-3 text-yellow-500" /> Upgrade Plan
            </Link>
        )}
      </div>

      {remaining === 0 && (
         <div className="mt-3 bg-red-50 p-2 rounded text-xs text-red-700 border border-red-200 flex gap-2 items-center">
            <Lock className="h-3 w-3" />
            <span>You have hit your {plan} plan limit. Upgrade to increase your capacity.</span>
         </div>
      )}
    </div>
  );
}