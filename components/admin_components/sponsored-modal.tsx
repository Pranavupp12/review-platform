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
import { Megaphone, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { toggleSponsoredStatus } from "@/lib/actions"; // ✅ Import your action

interface SponsoredModalProps {
  companyId: string;
  companyName: string;
  initialSponsored: boolean;
  initialScope: string | null; // "GLOBAL" | "LOCAL" | null
}

export function SponsoredModal({ 
  companyId, 
  companyName,
  initialSponsored,
  initialScope
}: SponsoredModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Local State
  const [isSponsored, setIsSponsored] = useState(initialSponsored);
  const [scope, setScope] = useState<"GLOBAL" | "LOCAL">(
    (initialScope as "GLOBAL" | "LOCAL") || "GLOBAL"
  );

  const handleSave = async () => {
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
          className={initialSponsored ? "text-[#0ABED6] bg-cyan-50" : "text-gray-400"}
        >
           <Megaphone className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Sponsorship Settings</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Configure ad visibility for <strong>{companyName}</strong>.
          </p>
        </DialogHeader>

        <div className="py-4 space-y-6">
          
          {/* 1. Main Toggle */}
          <div className="flex items-center justify-between border p-3 rounded-lg bg-gray-50/50">
            <div className="space-y-0.5">
               <Label htmlFor="sponsor-mode" className="text-base font-semibold">Enable Sponsorship</Label>
               <p className="text-xs text-muted-foreground">
                 Pin to top of Category pages.
               </p>
            </div>
            <Switch 
              id="sponsor-mode" 
              checked={isSponsored}
              onCheckedChange={setIsSponsored}
            />
          </div>

          {/* 2. Scope Selector (Only visible if enabled) */}
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
                  {/* Global Option */}
                  <div>
                    <RadioGroupItem value="GLOBAL" id="global" className="peer sr-only" />
                    <Label
                      htmlFor="global"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-3 hover:bg-gray-50 hover:text-gray-900 peer-data-[state=checked]:border-[#0ABED6] peer-data-[state=checked]:bg-cyan-50/30 cursor-pointer transition-all"
                    >
                      <span className="mb-1 text-sm font-semibold">Global</span>
                      <span className="text-[10px] text-gray-500 text-center">Visible in ALL locations</span>
                    </Label>
                  </div>
                  
                  {/* Local Option */}
                  <div>
                    <RadioGroupItem value="LOCAL" id="local" className="peer sr-only" />
                    <Label
                      htmlFor="local"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-3 hover:bg-gray-50 hover:text-gray-900 peer-data-[state=checked]:border-[#0ABED6] peer-data-[state=checked]:bg-cyan-50/30 cursor-pointer transition-all"
                    >
                      <span className="mb-1 text-sm font-semibold">Local Only</span>
                      <span className="text-[10px] text-gray-500 text-center">Only in their specific City</span>
                    </Label>
                  </div>
               </RadioGroup>
             </div>
          )}

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-[#0ABED6] hover:bg-[#09A8BD] text-white">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}