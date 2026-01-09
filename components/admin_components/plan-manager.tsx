"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Settings, Loader2 } from "lucide-react";
import { updateCompanyPlan, toggleCompanyFeature } from "@/lib/plan-actions"; // Import from your new file
import { toast } from "sonner";
import { FEATURE_LABELS, PLAN_TEMPLATES } from "@/lib/plan-config";
import { Plan } from "@prisma/client";

interface Props {
  companyId: string;
  currentPlan: Plan;
  currentFeatures: string[];
}

export function PlanManager({ companyId, currentPlan, currentFeatures }: Props) {
  const [loading, setLoading] = useState(false);
  // We keep local state for instant UI feedback
  const [features, setFeatures] = useState<string[]>(currentFeatures);
  const [plan, setPlan] = useState<Plan>(currentPlan);

  // 1. Handle Switching Plans
  const handlePlanChange = async (newPlan: Plan) => {
    setLoading(true);
    // Optimistic Update: Switch plan & load default features for that plan immediately in UI
    setPlan(newPlan);
    // @ts-ignore
    setFeatures(PLAN_TEMPLATES[newPlan] || []);

    const res = await updateCompanyPlan(companyId, newPlan);
    
    if (res.success) {
      toast.success(res.success);
    } else {
      toast.error(res.error);
      // Revert on error (optional, simplified here)
    }
    setLoading(false);
  };

  // 2. Handle Toggling Individual Features
  const handleFeatureToggle = async (featureKey: string, checked: boolean) => {
    // Optimistic Update
    const newFeatures = checked 
      ? [...features, featureKey]
      : features.filter(f => f !== featureKey);
    
    setFeatures(newFeatures);

    // If we modify features manually, strictly speaking, we are "Customizing" the plan.
    // You might want to auto-switch the dropdown to 'CUSTOM' here visually, 
    // or just leave it as an "override". For now, we just toggle the feature.
    
    const res = await toggleCompanyFeature(companyId, featureKey, checked);
    if (!res.success) {
      toast.error(res.error);
      setFeatures(currentFeatures); // Revert
    }
  };

  return (
    <div className="flex items-center gap-2 justify-end">
      {/* Plan Dropdown */}
      <Select 
        value={plan} 
        onValueChange={(val) => handlePlanChange(val as Plan)} 
        disabled={loading}
      >
        <SelectTrigger className="w-[120px] h-8 text-xs font-medium">
          <SelectValue placeholder="Select Plan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="FREE">Free</SelectItem>
          <SelectItem value="GROWTH">Growth</SelectItem>
          <SelectItem value="SCALE">Scale</SelectItem>
          <SelectItem value="CUSTOM">Custom</SelectItem>
        </SelectContent>
      </Select>

      {/* Feature Manager Modal */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Features</DialogTitle>
            <DialogDescription>
                Manually override features for <span className="font-bold text-black">{plan}</span> plan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="border rounded-lg divide-y">
              {Object.entries(FEATURE_LABELS).map(([key, label]) => {
                const isEnabled = features.includes(key);
                return (
                    <div key={key} className="flex items-center space-x-3 p-3 hover:bg-gray-50">
                    <Checkbox 
                        id={key} 
                        checked={isEnabled}
                        onCheckedChange={(checked) => handleFeatureToggle(key, checked as boolean)}
                    />
                    <Label htmlFor={key} className="text-sm font-medium cursor-pointer flex-1">
                        {label}
                    </Label>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${isEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {isEnabled ? 'Active' : 'Off'}
                    </span>
                    </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}