"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Loader2, Save } from "lucide-react";
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
import { BADGE_CONFIG } from "@/lib/badges"; // Import your config
import { updateCompanyBadges } from "@/lib/actions";
import { toast } from "sonner";

interface BadgeModalProps {
  companyId: string;
  companyName: string;
  currentBadges: string[];
}

export function BadgeModal({ companyId, companyName, currentBadges }: BadgeModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedBadges, setSelectedBadges] = useState<string[]>(currentBadges);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const toggleBadge = (badgeId: string) => {
    setSelectedBadges(prev => 
      prev.includes(badgeId) 
        ? prev.filter(b => b !== badgeId) 
        : [...prev, badgeId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Call the Server Action
    const result = await updateCompanyBadges(companyId, selectedBadges);
    
    setIsSaving(false);

    if (result?.error) {
      // ❌ ERROR: Show the limit message
      toast.error(result.error);
    } else {
      // ✅ SUCCESS: Close modal and refresh
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
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
           {Object.entries(BADGE_CONFIG).filter(([id]) => id !== "MOST_RELEVANT").map(([id, config]) => {
             const Icon = config.icon;
             return (
               <div key={id} className="flex items-start space-x-3 border p-3 rounded-lg">
                 <Checkbox 
                    id={id} 
                    checked={selectedBadges.includes(id)}
                    onCheckedChange={() => toggleBadge(id)}
                 />
                 <div className="grid gap-1.5 leading-none">
                   <label
                     htmlFor={id}
                     className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                   >
                     <span className={`p-1 rounded-full ${config.bg}`}>
                        <Icon className={`h-3 w-3 ${config.color}`} />
                     </span>
                     {config.label}
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