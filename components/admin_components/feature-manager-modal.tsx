"use client";

import { useState } from "react";
import { Company } from "@prisma/client";
import { updateCompanyFeatures } from "@/lib/plan-actions"; 
import { getCompanyFeatures } from "@/lib/plan-config"; 
import { BADGE_CONFIG, PLAN_AUTO_BADGES } from "@/lib/badges"; 

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Save, Sparkles, Unlock, ShieldCheck, Info } from "lucide-react";
import { toast } from "sonner";

interface FeatureModalProps {
  company: Company;
}

// Helper to prevent re-renders
const ToggleSelect = ({ name, label, dbValue, activeValue }: any) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center">
      <Label>{label}</Label>
      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${activeValue ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
         {activeValue ? "Active" : "Off"}
      </span>
    </div>
    <Select name={name} defaultValue={dbValue === null ? "default" : String(dbValue)}>
      <SelectTrigger className="h-8 text-xs">
        <SelectValue placeholder="Override..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="default">Use Plan Default</SelectItem>
        <SelectItem value="true" className="text-green-600 font-medium">Force Enable</SelectItem>
        <SelectItem value="false" className="text-red-600 font-medium">Force Disable</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

export function FeatureManagerModal({ company }: FeatureModalProps) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const effective = getCompanyFeatures(company);
  const plan = company.plan || "FREE";
  
  // @ts-ignore
  const enforcedBadges = PLAN_AUTO_BADGES[plan] || [];
  const isCustomPlan = plan === "CUSTOM";

  const handleSave = async (formData: FormData) => {
    setIsSaving(true);
    // Note: We are NOT sending badges here anymore. Badges are handled by the other modal.
    const res = await updateCompanyFeatures(company.id, formData);
    setIsSaving(false);
    if (res.success) {
      toast.success("Features Updated");
      setOpen(false);
    } else {
      toast.error("Error updating settings");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 text-gray-500 hover:bg-gray-200">
           <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Config: {company.name}
            <span className={`text-xs px-2 py-1 rounded border ${isCustomPlan ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-100 border-gray-200'}`}>
               {company.plan}
            </span>
          </DialogTitle>
        </DialogHeader>

        <form action={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          
          {/* LEFT COLUMN: Features */}
          <div className="space-y-6">
             <div className="space-y-4 border p-4 rounded-lg bg-gray-50/50">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-500" /> Resource Limits
                </h3>
                <div className="space-y-3">
                    <div className="space-y-1">
                        <Label className="text-xs">Emails / Month</Label>
                        <Input name="emailLimit" type="number" placeholder={`Default: ${effective.emailLimit}`} defaultValue={company.customEmailLimit ?? ""} />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Updates / Month</Label>
                        <Input name="updateLimit" type="number" placeholder={`Default: ${effective.updateLimit}`} defaultValue={company.customUpdateLimit ?? ""} />
                    </div>
                </div>
             </div>

             <div className="space-y-4 border p-4 rounded-lg bg-gray-50/50">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <Unlock className="h-4 w-4 text-purple-500" /> Feature Overrides
                </h3>
                <div className="space-y-4">
                    <ToggleSelect name="analytics" label="Adv. Analytics" dbValue={company.enableAnalytics} activeValue={effective.analyticsTier !== "BASIC"} />
                    <ToggleSelect name="leadGen" label="Lead Gen Cards" dbValue={company.enableLeadGen} activeValue={effective.hasLeadGen} />
                    <ToggleSelect name="competitors" label="Hide Competitors" dbValue={company.hideCompetitors} activeValue={effective.shouldHideCompetitors} />
                </div>
             </div>
          </div>

          {/* RIGHT COLUMN: READ-ONLY Badge Info */}
          <div className="border p-4 rounded-lg bg-white shadow-sm h-fit">
            <div className="flex items-center justify-between mb-4">
                 <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-600" /> Included Badges
                 </h3>
                 {isCustomPlan && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">Manual</span>}
            </div>

            <div className="mb-4 bg-blue-50 p-3 rounded text-xs text-blue-800 flex items-start gap-2">
               <Info className="h-4 w-4 shrink-0 mt-0.5" />
               <p>
                 {isCustomPlan 
                    ? "Custom plans have no automatic badges. Use the badge icon button to manually assign them."
                    : `The following badges are automatically included with the ${plan} plan.`
                 }
               </p>
            </div>

            <div className="space-y-2">
                {isCustomPlan ? (
                    <div className="text-center py-6 text-gray-400 text-sm italic border-2 border-dashed rounded-lg">
                        Fully Customizable via Badge Menu
                    </div>
                ) : (
                    enforcedBadges.length > 0 ? enforcedBadges.map((badgeId: string) => {
                        const config = BADGE_CONFIG[badgeId];
                        if (!config) return null;
                        const Icon = config.icon;

                        return (
                            <div key={badgeId} className="flex items-center gap-3 p-2 rounded border bg-gray-50 border-gray-200 opacity-80">
                                <span className={`p-1 rounded-full ${config.bg} scale-75`}>
                                    <Icon className={`h-3 w-3 ${config.color}`} />
                                </span>
                                <div>
                                    <span className="text-sm font-medium block">{config.label}</span>
                                    <span className="text-[10px] text-gray-500">{config.description}</span>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="text-center py-4 text-gray-400 text-sm">
                            No automatic badges for this plan.
                        </div>
                    )
                )}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 flex justify-end pt-4 border-t mt-2">
             <Button type="submit" disabled={isSaving} className="bg-[#000032] min-w-[150px]">
                {isSaving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Settings</>}
             </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}