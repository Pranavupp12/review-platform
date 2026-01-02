"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { toggleCompanyPlan } from "@/lib/actions";
import { toast } from "sonner";

export function PlanToggle({ companyId, currentPlan }: { companyId: string, currentPlan: "FREE" | "PRO" }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const newPlan = currentPlan === "FREE" ? "PRO" : "FREE";
    
    const res = await toggleCompanyPlan(companyId, newPlan);
    
    if (res.success) {
      toast.success(res.success);
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  };

  if (currentPlan === "FREE") {
    return (
      <Button size="sm" variant="outline" onClick={handleToggle} disabled={loading} className="text-blue-600 border-blue-200 hover:bg-blue-50">
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowUpCircle className="h-3 w-3 mr-1" />}
        Upgrade to PRO
      </Button>
    );
  }

  return (
    <Button size="sm" variant="ghost" onClick={handleToggle} disabled={loading} className="text-red-600 hover:bg-red-50 hover:text-red-700">
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowDownCircle className="h-3 w-3 mr-1" />}
        Downgrade
    </Button>
  );
}