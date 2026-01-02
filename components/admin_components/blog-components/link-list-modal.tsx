"use client";

import { useState } from "react";
import { linkCategoryToBlog } from "@/lib/blog-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListChecks, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface LinkListModalProps {
  blogId: string;
  currentCategoryId: string | null;
  currentCity: string | null; // ✅ New Prop
  categoryOptions: { id: string; name: string }[]; 
  cityOptions: string[]; // ✅ New Prop
}

export function LinkListModal({ 
  blogId, 
  currentCategoryId, 
  currentCity, 
  categoryOptions,
  cityOptions 
}: LinkListModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State
  const [selectedCatId, setSelectedCatId] = useState<string>(currentCategoryId || "none");
  const [selectedCity, setSelectedCity] = useState<string>(currentCity || "none");

  const handleSave = async () => {
    setLoading(true);
    
    // Logic: If Category is "none", remove everything.
    const catIdToSave = selectedCatId === "none" ? null : selectedCatId;
    // Logic: If City is "none" or Category is removed, city is null.
    const cityToSave = (selectedCity === "none" || !catIdToSave) ? null : selectedCity;
    
    const res = await linkCategoryToBlog(blogId, catIdToSave, cityToSave);
    
    if (res.success) {
      toast.success(catIdToSave ? "List settings updated!" : "List removed.");
      setOpen(false);
      window.location.reload(); 
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Attach Top 10 List">
            {currentCategoryId ? (
                 <Badge variant="default" className="bg-green-600 hover:bg-green-700 h-6 w-6 p-0 flex items-center justify-center rounded-full">
                    <ListChecks className="h-3 w-3 text-white" />
                 </Badge>
            ) : (
                 <ListChecks className="h-4 w-4 text-gray-400 hover:text-blue-600" />
            )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Attach "Top 10" List</DialogTitle>
          <DialogDescription>
            Configure a list of companies to display at the bottom of this blog.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          
          {/* 1. Category Select */}
          <div className="space-y-2">
            <Label>Category (Required)</Label>
            <Select value={selectedCatId} onValueChange={setSelectedCatId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-gray-500">-- No List (Remove) --</SelectItem>
                {categoryOptions.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. City Select (Optional) - Only active if category selected */}
          {selectedCatId !== "none" && (
             <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label>City (Optional)</Label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                    <div className="flex items-center gap-2">
                         <MapPin className="h-4 w-4 text-gray-400" />
                         <SelectValue placeholder="Global (All Cities)" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none" className="font-medium text-blue-600">Global (All Cities)</SelectItem>
                    {cityOptions.map((city, idx) => (
                    <SelectItem key={idx} value={city}>{city}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
             </div>
          )}

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading} className="bg-[#0ABED6] hover:bg-[#09A8BD] text-white">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
