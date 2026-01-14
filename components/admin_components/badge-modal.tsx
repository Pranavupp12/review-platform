"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Award, Loader2, Save, Sparkles, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
// ✅ Import Config from centralized file
import { BADGE_CONFIG, PLAN_AUTO_BADGES } from "@/lib/badges"; 
import { updateCompanyBadges } from "@/lib/actions";
import { toast } from "sonner";

interface BadgeModalProps {
  companyId: string;
  companyName: string;
  currentBadges: string[];
  plan: string; 
}

export function BadgeModal({ companyId, companyName, currentBadges, plan }: BadgeModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // ✅ 1. Determine Enforced Badges based on Plan
  // If plan is CUSTOM, this returns [], meaning nothing is locked.
  const enforcedBadges = PLAN_AUTO_BADGES[plan] || [];
  const isCustomPlan = plan === "CUSTOM";

  // ✅ 2. Sync State when Modal Opens
  useEffect(() => {
    if (open) {
      // Ensure enforced badges are always included in the selection
      const combined = Array.from(new Set([...currentBadges, ...enforcedBadges]));
      setSelectedBadges(combined);
    }
  }, [currentBadges, enforcedBadges, open]); 

  const toggleBadge = (badgeId: string) => {
    // If it's a standard plan, prevent unchecking enforced badges
    if (!isCustomPlan && enforcedBadges.includes(badgeId)) return;

    setSelectedBadges(prev => 
      prev.includes(badgeId) 
        ? prev.filter(b => b !== badgeId) 
        : [...prev, badgeId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateCompanyBadges(companyId, selectedBadges);
    setIsSaving(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Badges updated successfully");
      setOpen(false);
      router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 border-yellow-200">
           <Award className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Award Badges</DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Current Plan: <span className="font-bold text-black">{plan}</span></span>
            {isCustomPlan && (
                <span className="flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                    <Unlock className="h-3 w-3" /> Fully Unlocked
                </span>
            )}
          </div>
        </DialogHeader>
        
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
           {/* We filter out MOST_RELEVANT as you requested to keep its logic separate */}
           {Object.entries(BADGE_CONFIG).filter(([id]) => id !== "MOST_RELEVANT").map(([id, config]) => {
             const Icon = config.icon;
             
             // Check if this specific badge is forced by the plan
             // If Custom Plan, nothing is forced/locked.
             const isLocked = !isCustomPlan && enforcedBadges.includes(id);

             return (
               <div 
                 key={id} 
                 onClick={() => toggleBadge(id)}
                 className={`flex items-start space-x-3 border p-3 rounded-lg transition-all cursor-pointer select-none
                    ${isLocked ? "bg-gray-50 border-gray-200 opacity-80" : "hover:border-blue-300 hover:bg-blue-50/30"}
                    ${selectedBadges.includes(id) && !isLocked ? "border-blue-200 bg-blue-50/20" : ""}
                 `}
               >
                 <Checkbox 
                    id={id} 
                    checked={selectedBadges.includes(id)}
                    onCheckedChange={() => toggleBadge(id)}
                    disabled={isLocked} 
                    className={isLocked ? "data-[state=checked]:bg-gray-400 data-[state=checked]:border-gray-400" : ""}
                 />
                 <div className="grid gap-1.5 leading-none w-full">
                   <div className="text-sm font-medium leading-none flex items-center justify-between gap-2">
                     <div className="flex items-center gap-2">
                        <span className={`p-1 rounded-full ${config.bg}`}>
                            <Icon className={`h-3 w-3 ${config.color}`} />
                        </span>
                        {config.label}
                     </div>
                     
                     {/* Visual Indicators */}
                     {isLocked && (
                        <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="h-2 w-2" /> Plan Benefit
                        </span>
                     )}
                   </div>
                   <p className="text-xs text-muted-foreground pr-4">
                     {config.description}
                   </p>
                 </div>
               </div>
             );
           })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-[#000032]">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}