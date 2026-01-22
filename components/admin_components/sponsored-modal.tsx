"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Megaphone, Loader2, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { toggleSponsoredStatus } from "@/lib/actions";

interface SponsoredModalProps {
  companyId: string;
  companyName: string;
  initialSponsored: boolean;
  initialScope: string | null;
  plan: string;
}

export function SponsoredModal({ 
  companyId, 
  companyName,
  initialSponsored,
  initialScope,
  plan
}: SponsoredModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [isSponsored, setIsSponsored] = useState(initialSponsored);
  const [scope, setScope] = useState<"GLOBAL" | "LOCAL">(
    (initialScope as "GLOBAL" | "LOCAL") || "GLOBAL"
  );

  // --- LOGIC: Define Permissions based on Plan ---
  
  // 1. CUSTOM: Full Admin Control (Read/Write)
  const isEditable = plan === "CUSTOM";

  // 2. SCALE: Automatically Active (Read Only)
  const isAutoIncluded = plan === "SCALE";

  // 3. OTHERS (Free/Growth): Disabled (Locked)
  const isLocked = !isEditable && !isAutoIncluded;


  const handleSave = async () => {
    if (!isEditable) return; 

    setLoading(true);
    const result = await toggleSponsoredStatus(companyId, isSponsored, scope);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Sponsorship settings updated!");
      setOpen(false);
      router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost"
          size="icon" 
          title="Manage Sponsorship"
          // Highlight button if sponsored (either manually OR via auto-plan)
          className={initialSponsored ? "text-[#0ABED6] bg-cyan-50" : "text-gray-400 hover:text-blue-600"}
        >
           <Megaphone className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Sponsorship Settings</DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
             <span>Plan: <span className="font-bold text-black">{plan}</span></span>
          </div>
        </DialogHeader>

        {/* --- CASE 1: LOCKED (Free/Growth) --- */}
        {isLocked && (
            <div className="py-8 text-center flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-gray-50">
                <div className="p-3 bg-white rounded-full mb-3 shadow-sm">
                    <Lock className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-900">Feature Locked</h3>
                <div className="text-sm text-gray-500 mt-1 max-w-[250px]">
                    Sponsorship is available on Scale and Custom plans.
                </div>
                <div className="mt-4 text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Upgrade to unlock
                </div>
            </div>
        )}

        {/* --- CASE 2: AUTO INCLUDED (Scale) --- */}
        {isAutoIncluded && (
            <div className="py-6 text-center flex flex-col items-center justify-center border border-emerald-100 rounded-lg bg-emerald-50/50">
                <div className="p-3 bg-white rounded-full mb-3 shadow-sm border border-emerald-100">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900">Active via Plan</h3>
                <div className="text-sm text-gray-600 mt-1 max-w-[280px]">
                    This plan includes automatic Local Sponsorship.
                </div>
                <p className="text-xs text-gray-400 mt-4 italic">
                    To change scope to Global, switch to Custom plan.
                </p>
            </div>
        )}

        {/* --- CASE 3: EDITABLE (Custom) --- */}
        {isEditable && (
            <div className="py-4 space-y-6">
                <div className="flex items-center justify-between border p-3 rounded-lg bg-gray-50/50">
                    <div className="space-y-0.5">
                        <Label htmlFor="sponsor-mode" className="text-base font-semibold">Enable Sponsorship</Label>
                        <p className="text-xs text-muted-foreground">Pin to top of Category pages.</p>
                    </div>
                    <Switch 
                        id="sponsor-mode" 
                        checked={isSponsored}
                        onCheckedChange={setIsSponsored}
                    />
                </div>

                {isSponsored && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                        <Label className="text-xs font-bold uppercase text-gray-500 tracking-wide">
                            Visibility Scope
                        </Label>
                        <RadioGroup 
                            value={scope} 
                            onValueChange={(val) => setScope(val as "GLOBAL" | "LOCAL")}
                            className="grid grid-cols-2 gap-3"
                        >
                            {/* Global */}
                            <div>
                                <RadioGroupItem value="GLOBAL" id="global" className="peer sr-only" />
                                <Label htmlFor="global" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-3 hover:bg-gray-50 peer-data-[state=checked]:border-[#0ABED6] peer-data-[state=checked]:bg-cyan-50/30 cursor-pointer">
                                    <span className="mb-1 text-sm font-semibold">Global</span>
                                    <span className="text-[10px] text-gray-500 text-center">Visible in ALL locations</span>
                                </Label>
                            </div>
                            
                            {/* Local */}
                            <div>
                                <RadioGroupItem value="LOCAL" id="local" className="peer sr-only" />
                                <Label htmlFor="local" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-3 hover:bg-gray-50 peer-data-[state=checked]:border-[#0ABED6] peer-data-[state=checked]:bg-cyan-50/30 cursor-pointer">
                                    <span className="mb-1 text-sm font-semibold">Local Only</span>
                                    <span className="text-[10px] text-gray-500 text-center">Only in their specific City</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                )}
            </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          
          {/* Only show Save button if Editable */}
          {isEditable && (
              <Button onClick={handleSave} disabled={loading} className="bg-[#0ABED6] hover:bg-[#09A8BD] text-white">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}