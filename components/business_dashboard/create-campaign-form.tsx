"use client";

import { useActionState } from 'react';
import { createCampaign } from "@/lib/actions"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin_components/blog-components/rich-text-editor"; 
import { Loader2, Send, ImagePlus, Save, Lock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import Image from "next/image";

interface CampaignFormProps {
    userEmail: string;
    isLimitReached?: boolean;
}

export function CreateCampaignForm({ userEmail,isLimitReached = false }: CampaignFormProps) {
  const [state, formAction, isPending] = useActionState(createCampaign, null);
  
  // Ref to reset standard inputs (text, file)
  const formRef = useRef<HTMLFormElement>(null);

  // State for custom inputs
  const [content, setContent] = useState("<p>Write your message here...</p>");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  
  // State to track if user clicked "Send" or "Draft"
  const [actionType, setActionType] = useState("SEND");

  // Effect to handle Success/Error responses
  useEffect(() => {
    if (state?.success) {
      // 1. Show appropriate success message
      if(state.status === "DRAFT") {
          toast.success("Campaign saved as draft.");
      } else {
          toast.success("Campaign sent successfully!");
      }

      // 2. Reset Form Fields
      formRef.current?.reset(); 
      
      // 3. Reset Custom States
      setContent("<p>Write your message here...</p>");
      setLogoPreview(null);
      setBannerPreview(null);
      
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>, setPreview: (s: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
        setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <form ref={formRef} action={formAction} className="space-y-8">
       
       {/* ✅ Hidden Input to tell Server Action which button was clicked */}
       <input type="hidden" name="actionType" value={actionType} />
       
       {/* --- 1. Campaign Details --- */}
       <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-[#000032] border-b pb-2">1. Campaign Details</h3>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label>Campaign Name (Internal)</Label>
                <Input name="name" placeholder="e.g. Winter Sale 2025" required />
             </div>
             <div className="space-y-2">
                <Label>Email Subject Line</Label>
                <Input name="subject" placeholder="e.g. A special gift for you!" required />
             </div>
          </div>
          <div className="space-y-2">
             <Label>Reply-To Email</Label>
             <Input name="senderEmail" defaultValue={userEmail} required />
          </div>
       </div>

       {/* --- 2. Design & Content --- */}
       <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="font-bold text-[#000032] border-b pb-2">2. Design & Content</h3>
          
          <div className="grid grid-cols-2 gap-6">
             {/* Logo Upload */}
             <div className="space-y-2">
                <Label>Header Logo</Label>
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded border bg-gray-50 flex items-center justify-center overflow-hidden relative">
                        {logoPreview ? (
                            <Image src={logoPreview} alt="Logo" fill className="object-contain" />
                        ) : (
                            <span className="text-xs text-gray-400">Default</span>
                        )}
                    </div>
                    <Label htmlFor="logo" className="cursor-pointer text-sm text-blue-600 hover:underline">
                        Upload Custom
                    </Label>
                    <Input 
                        id="logo" 
                        name="logo" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleImage(e, setLogoPreview)} 
                    />
                </div>
             </div>

             {/* Banner Upload */}
             <div className="space-y-2">
                <Label>Promotional Banner</Label>
                <div className="relative w-full h-24 rounded border bg-gray-50 flex items-center justify-center overflow-hidden group">
                    {bannerPreview ? (
                        <Image src={bannerPreview} alt="Banner" fill className="object-cover" />
                    ) : (
                        <div className="text-center">
                            <ImagePlus className="h-6 w-6 text-gray-300 mx-auto" />
                            <span className="text-xs text-gray-400">Upload Banner</span>
                        </div>
                    )}
                    
                    {/* Z-Index 10 ensures this input sits on top and catches the click */}
                    <Input 
                        type="file" 
                        name="banner" 
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full" 
                        onChange={(e) => handleImage(e, setBannerPreview)} 
                    />
                </div>
             </div>
          </div>

          {/* Rich Text Editor */}
          <div className="space-y-2">
             <Label>Message Body</Label>
             <RichTextEditor 
                value={content} 
                onChange={setContent} 
             />
             {/* Hidden input to pass HTML to Server Action */}
             <input type="hidden" name="htmlContent" value={content} />
          </div>
       </div>

       {/* --- 3. Recipients --- */}
       <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-[#000032] border-b pb-2">3. Recipients</h3>
          <Textarea 
            name="recipients" 
            placeholder="client1@gmail.com, client2@yahoo.com" 
            className="font-mono text-sm min-h-[100px]" 
            // Not required if saving as draft, validation handled in server action
          />
          <p className="text-xs text-gray-500">Max 50 recipients per batch.</p>
       </div>

       {/* --- Action Buttons --- */}
       <div className="flex justify-end gap-4 pb-10">
          
          {/* SAVE AS DRAFT */}
          <Button 
            type="submit" 
            variant="outline"
            disabled={isPending}
            onClick={() => setActionType("DRAFT")} // Set intent to DRAFT
            className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100"
          >
             <Save className="h-4 w-4" />
             Save as Draft
          </Button>

          {/* SEND NOW */}
          {isLimitReached ? (
             <Button 
               disabled 
               className="bg-gray-300 text-gray-500 cursor-not-allowed flex items-center gap-2"
             >
               <Lock className="h-4 w-4" /> Limit Reached
             </Button>
          ) : (
             <Button 
               type="submit" 
               name="actionType" 
               value="SEND"
               className="bg-[#0ABED6] hover:bg-[#09accl] text-white"
             >
               Send Campaign
             </Button>
          )}
       </div>
    </form>
  );
}