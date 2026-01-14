"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateCompanyPlan } from "@/lib/plan-actions"; 
import { toast } from "sonner";
import { Plan, Company } from "@prisma/client";
import { FeatureManagerModal } from "@/components/admin_components/feature-manager-modal";
import { BadgeModal } from "@/components/admin_components/badge-modal";
// ✅ Import Sponsored Modal
import { SponsoredModal } from "@/components/admin_components/sponsored-modal";

interface Props {
  company: Company;
}

export function PlanManager({ company }: Props) {
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Plan>(company.plan);

  const handlePlanChange = async (newPlan: Plan) => {
    setLoading(true);
    setCurrentPlan(newPlan); 

    const res = await updateCompanyPlan(company.id, newPlan);
    
    if (res.success) {
      toast.success(res.success);
    } else {
      toast.error(res.error || "Failed to update plan");
      setCurrentPlan(company.plan); 
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2 justify-end">
      {/* 1. Quick Plan Switcher */}
      <Select 
        value={currentPlan} 
        onValueChange={(val) => handlePlanChange(val as Plan)} 
        disabled={loading}
      >
        <SelectTrigger className="w-[110px] h-8 text-xs font-medium">
          <SelectValue placeholder="Select Plan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="FREE">Free</SelectItem>
          <SelectItem value="GROWTH">Growth</SelectItem>
          <SelectItem value="SCALE">Scale</SelectItem>
          <SelectItem value="CUSTOM">Custom</SelectItem>
        </SelectContent>
      </Select>
      
      {/* 2. Sponsorship Manager (New) */}
      <SponsoredModal
         companyId={company.id}
         companyName={company.name}
         initialSponsored={company.isSponsored}
         initialScope={company.sponsoredScope}
         plan={currentPlan} // Pass current plan to handle locking logic
      />

      {/* 3. Badge Manager */}
      <BadgeModal 
         companyId={company.id}
         companyName={company.name}
         currentBadges={company.badges}
         plan={currentPlan}
      />

      {/* 4. Feature Manager */}
      <FeatureManagerModal company={company} />
    </div>
  );
}