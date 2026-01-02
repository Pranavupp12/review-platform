"use client";

import { ShieldCheck, ShieldAlert, Info } from "lucide-react"; 
import { BADGE_CONFIG } from "@/lib/badges";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TransparencyCardProps {
  companyName: string;
  claimed: boolean;
  badges: string[];
}

export function TransparencyCard({ companyName, claimed, badges = [] }: TransparencyCardProps) {
  
  // ✅ FILTER: Exclude 'MOST_RELEVANT' from the list
  const visibleBadges = badges.filter(badgeId => badgeId !== "MOST_RELEVANT");

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
                This card displays the company's verification status and special badges awarded based on their performance, statistics, and community relevancy.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        Transparency
      </h3>
      
      <div className="space-y-5">
        
        {/* Claimed Status Block */}
        <div className="flex gap-3 items-start">
          <div className={`p-2 rounded-full shrink-0 ${claimed ? 'bg-emerald-50' : 'bg-gray-100'}`}>
            {claimed ? <ShieldCheck className="h-5 w-5 text-emerald-600" /> : <ShieldAlert className="h-5 w-5 text-gray-500" />}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{claimed ? "Claimed Profile" : "Unclaimed Profile"}</p>
            <p className="text-xs text-gray-500">
              {claimed ? `${companyName} has verified ownership.` : `${companyName} hasn't verified ownership.`}
            </p>
          </div>
        </div>

        {/* ✅ Render Filtered Badges */}
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