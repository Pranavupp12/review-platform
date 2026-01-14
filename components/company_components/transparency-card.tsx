"use client";

import { Info } from "lucide-react"; 
import { BADGE_CONFIG, PLAN_AUTO_BADGES } from "@/lib/badges"; 
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TransparencyCardProps {
  companyName: string;
  claimed?: boolean;
  badges: string[];
  plan?: string;
}

export function TransparencyCard({ companyName, badges = [], plan = "FREE" }: TransparencyCardProps) {
  
  const normalizedPlan = plan?.toUpperCase() || "FREE";

  let finalBadges: string[] = [];

  // ✅ FIX: Handle Custom Plan Differently
  if (normalizedPlan === "CUSTOM") {
    // For Custom Plans, we trust the DB 'badges' array 100%. 
    // The Admin has full manual control, so we don't strip anything out.
    finalBadges = [...badges];
  } else {
    // For Standard Plans (Free, Growth, Scale), we enforce the rules:
    
    // 1. Get Automatic Badges for the CURRENT Plan
    const currentPlanBadges = PLAN_AUTO_BADGES[normalizedPlan] || [];

    // 2. Identify badges that are "owned" by the Plan System
    const allPlanBadges = new Set(
      Object.values(PLAN_AUTO_BADGES).flat()
    );

    // 3. Filter DB List: Remove any badge that is supposed to be managed by a Plan.
    // (This prevents a Free user from keeping 'Category Leader' if they downgrade)
    const manualBadges = badges.filter(b => !allPlanBadges.has(b));

    // 4. Merge: (Clean Manual Badges) + (Enforced Plan Badges)
    finalBadges = Array.from(new Set([...manualBadges, ...currentPlanBadges]));
  }

  // 5. Filter out 'MOST_RELEVANT' (If you want this hidden from this specific card)
  const visibleBadges = finalBadges.filter(badgeId => badgeId !== "MOST_RELEVANT");

  if (visibleBadges.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 border border-gray-200 space-y-5">
      <h3 className="font-bold text-gray-900 flex items-center gap-2">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
               <Info className="h-4 w-4 text-gray-400 hover:text-[#0ABED6] cursor-help transition-colors" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[280px] bg-gray-900 text-white border-gray-800" side="top" align="start">
              <p className="text-xs leading-relaxed">
                This card displays special badges awarded to {companyName} based on their performance and verification status.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        Transparency
      </h3>
      
      <div className="space-y-5">
        {visibleBadges.map((badgeId) => {
           const config = BADGE_CONFIG[badgeId];
           if (!config) return null;
           
           const Icon = config.icon;
           return (
             <div key={badgeId} className="flex gap-3 items-start animate-in fade-in slide-in-from-left-2">
                <div className={`p-2 rounded-full shrink-0 ${config.bg}`}>
                   <Icon className={`h-5 w-5 ${config.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{config.label}</p>
                  <p className="text-xs text-gray-500">{config.description}</p>
                </div>
             </div>
           );
        })}
      </div>
    </div>
  );
}