"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Award, Loader2, Save, Lock, Sparkles } from "lucide-react";
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
import { BADGE_CONFIG } from "@/lib/badges"; 
import { updateCompanyBadges } from "@/lib/actions";
import { toast } from "sonner";

// ✅ 1. CONFIG: Define which badges are automatic for each plan
const PLAN_AUTO_BADGES: Record<string, string[]> = {
  FREE: [],
  GROWTH: ['COMMUNITY_FAV', 'VERIFIED_DETAILS'],
  SCALE: ['COMMUNITY_FAV', 'VERIFIED_DETAILS', 'CATEGORY_LEADER'],
  // Legacy/Custom plans fall back to empty or custom logic
  PRO: ['COMMUNITY_FAV', 'VERIFIED_DETAILS'], 
};

interface BadgeModalProps {
  companyId: string;
  companyName: string;
  currentBadges: string[];
  plan: string; // ✅ NEW: We need the plan to calculate logic
}

export function BadgeModal({ companyId, companyName, currentBadges, plan }: BadgeModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // ✅ 2. CALCULATE: Which badges are forced on by the plan?
  // We use "|| []" to handle cases where plan might be undefined/unknown
  const enforcedBadges = PLAN_AUTO_BADGES[plan] || [];

  // ✅ 3. EFFECT: When modal opens, merge existing DB badges with Plan badges
  useEffect(() => {
    // Combine current DB badges with Plan enforced badges (removing duplicates)
    const combined = Array.from(new Set([...currentBadges, ...enforcedBadges]));
    setSelectedBadges(combined);
  }, [currentBadges, plan, open]); // Re-run when modal opens

  const toggleBadge = (badgeId: string) => {
    // Prevent toggling if it's enforced by the plan
    if (enforcedBadges.includes(badgeId)) return;

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Award Badges to {companyName}</DialogTitle>
          <p className="text-sm text-muted-foreground">Current Plan: <span className="font-bold text-black">{plan}</span></p>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
           {/* Filter out MOST_RELEVANT as requested */}
           {Object.entries(BADGE_CONFIG).filter(([id]) => id !== "MOST_RELEVANT").map(([id, config]) => {
             const Icon = config.icon;
             
             // Check if this specific badge is enforced by the plan
             const isLocked = enforcedBadges.includes(id);

             return (
               <div key={id} className={`flex items-start space-x-3 border p-3 rounded-lg transition-colors ${isLocked ? "bg-gray-50 border-gray-200" : "hover:border-blue-300"}`}>
                 <Checkbox 
                    id={id} 
                    checked={selectedBadges.includes(id)}
                    onCheckedChange={() => toggleBadge(id)}
                    disabled={isLocked} // ✅ Disable interaction for enforced badges
                    className={isLocked ? "data-[state=checked]:bg-gray-400 data-[state=checked]:border-gray-400" : ""}
                 />
                 <div className="grid gap-1.5 leading-none w-full">
                   <label
                     htmlFor={id}
                     className="text-sm font-medium leading-none flex items-center justify-between gap-2"
                   >
                     <div className="flex items-center gap-2">
                        <span className={`p-1 rounded-full ${config.bg}`}>
                            <Icon className={`h-3 w-3 ${config.color}`} />
                        </span>
                        {config.label}
                     </div>
                     
                     {/* ✅ Visual Indicator for Locked Badges */}
                     {isLocked && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="h-2 w-2" /> Plan Benefit
                        </span>
                     )}
                   </label>
                   <p className="text-xs text-muted-foreground">
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
            Save Badges
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}