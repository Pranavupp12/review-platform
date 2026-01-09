"use client";

import { useActionState } from 'react';
import { createCampaign } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin_components/blog-components/rich-text-editor";
import { Loader2, Send, ImagePlus, Save, Lock, UserPlus, Link as LinkIcon, MousePointerClick, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import Image from "next/image";

interface CampaignFormProps {
   userEmail: string;
   isLimitReached?: boolean;
   // ✅ NEW PROP: Receive the batch limit (e.g., 50 or Infinity)
   batchSizeLimit?: number; 
}

export function CreateCampaignForm({ userEmail, isLimitReached = false, batchSizeLimit = 50 }: CampaignFormProps) {
   const [state, formAction, isPending] = useActionState(createCampaign, null);
   const formRef = useRef<HTMLFormElement>(null);

   // Content States
   const [content, setContent] = useState("<p>Write your message here...</p>");
   const [logoPreview, setLogoPreview] = useState<string | null>(null);
   const [bannerPreview, setBannerPreview] = useState<string | null>(null);
   const [templateType, setTemplateType] = useState<"INVITE" | "PROMOTIONAL">("INVITE");
   const [actionType, setActionType] = useState("SEND");

   // ✅ NEW: Recipient Counting State
   const [recipientCount, setRecipientCount] = useState(0);

   useEffect(() => {
      if (state?.success) {
         if (state.status === "DRAFT") {
            toast.success("Campaign saved as draft.");
         } else {
            toast.success("Campaign sent successfully!");
         }
         formRef.current?.reset();
         setContent("<p>Write your message here...</p>");
         setLogoPreview(null);
         setBannerPreview(null);
         setTemplateType("INVITE");
         setRecipientCount(0); // Reset count
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

   // ✅ NEW: Count recipients dynamically
   const handleRecipientsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      // Split by comma, newline, or semicolon, and filter out empty strings
      const count = val.split(/[\n,;]+/).filter(email => email.trim().length > 0).length;
      setRecipientCount(count);
   };

   // Check if batch limit is exceeded
   const isBatchExceeded = batchSizeLimit !== Infinity && recipientCount > batchSizeLimit;

   return (
      <form ref={formRef} action={formAction} className="space-y-8">

         <input type="hidden" name="actionType" value={actionType} />
         <input type="hidden" name="templateType" value={templateType} />

         {/* --- 1. Campaign Type --- */}
         <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-[#000032] border-b pb-2">1. Campaign Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div
                  onClick={() => setTemplateType("INVITE")}
                  className={`cursor-pointer border-2 rounded-xl p-4 flex items-start gap-4 transition-all ${templateType === "INVITE" ? "border-blue-600 bg-blue-50" : "border-gray-100 hover:border-blue-200"}`}
               >
                  <div className={`p-2 rounded-full ${templateType === "INVITE" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                     <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                     <h4 className="font-bold text-sm text-[#000032]">Review Invitation</h4>
                     <p className="text-xs text-gray-500 mt-1">Includes a "Rate Us" button automatically.</p>
                  </div>
               </div>

               <div
                  onClick={() => setTemplateType("PROMOTIONAL")}
                  className={`cursor-pointer border-2 rounded-xl p-4 flex items-start gap-4 transition-all ${templateType === "PROMOTIONAL" ? "border-purple-600 bg-purple-50" : "border-gray-100 hover:border-purple-200"}`}
               >
                  <div className={`p-2 rounded-full ${templateType === "PROMOTIONAL" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                     <LinkIcon className="h-5 w-5" />
                  </div>
                  <div>
                     <h4 className="font-bold text-sm text-[#000032]">Promotional / Custom</h4>
                     <p className="text-xs text-gray-500 mt-1">You define the button and link.</p>
                  </div>
               </div>
            </div>
         </div>

         {/* --- 2. Campaign Details --- */}
         <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-[#000032] border-b pb-2">2. Campaign Details</h3>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label>Campaign Name</Label>
                  <Input name="name" placeholder="e.g. Summer Sale" required />
               </div>
               <div className="space-y-2">
                  <Label>Subject Line</Label>
                  <Input name="subject" placeholder="e.g. A gift for you!" required />
               </div>
            </div>
            <div className="space-y-2">
               <Label>Reply-To Email</Label>
               <Input name="senderEmail" defaultValue={userEmail} required />
            </div>
         </div>

         {/* --- 3. Design & Content --- */}
         <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-bold text-[#000032] border-b pb-2">3. Design & Content</h3>
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                  <Label>Header Logo</Label>
                  <div className="flex items-center gap-4">
                     <div className="h-16 w-16 rounded border bg-gray-50 flex items-center justify-center overflow-hidden relative">
                        {logoPreview ? <Image src={logoPreview} alt="Logo" fill className="object-contain" /> : <span className="text-xs text-gray-400">Default</span>}
                     </div>
                     <Label htmlFor="logo" className="cursor-pointer text-sm text-blue-600 hover:underline">Upload Custom</Label>
                     <Input id="logo" name="logo" type="file" accept="image/*" className="hidden" onChange={(e) => handleImage(e, setLogoPreview)} />
                  </div>
               </div>
               <div className="space-y-2">
                  <Label>Promotional Banner</Label>
                  <div className="relative w-full h-24 rounded border bg-gray-50 flex items-center justify-center overflow-hidden">
                     {bannerPreview ? <Image src={bannerPreview} alt="Banner" fill className="object-cover" /> : <div className="text-center"><ImagePlus className="h-6 w-6 text-gray-300 mx-auto" /><span className="text-xs text-gray-400">Upload Banner</span></div>}
                     <Input type="file" name="banner" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={(e) => handleImage(e, setBannerPreview)} />
                  </div>
               </div>
            </div>
            <div className="space-y-2">
               <Label>Message Body</Label>
               <RichTextEditor value={content} onChange={setContent} />
               <input type="hidden" name="htmlContent" value={content} />
            </div>
            {templateType === "PROMOTIONAL" && (
               <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 text-purple-800 font-bold text-sm"><MousePointerClick className="h-4 w-4" /> Custom Button</div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2"><Label className="text-purple-900">Button Text</Label><Input name="customBtnText" placeholder="Shop Now" required /></div>
                     <div className="space-y-2"><Label className="text-purple-900">Target URL</Label><Input name="customBtnUrl" placeholder="https://..." required /></div>
                  </div>
               </div>
            )}
         </div>

         {/* --- 4. Recipients (VALIDATION ADDED) --- */}
         <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
               <h3 className="font-bold text-[#000032]">4. Recipients</h3>
               <span className={`text-xs font-bold px-2 py-1 rounded-full ${isBatchExceeded ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}>
                  Count: {recipientCount} / {batchSizeLimit === Infinity ? "∞" : batchSizeLimit}
               </span>
            </div>
            
            <Textarea
               name="recipients"
               placeholder="client1@gmail.com, client2@yahoo.com"
               className={`font-mono text-sm min-h-[100px] ${isBatchExceeded ? "border-red-500 focus-visible:ring-red-500" : ""}`}
               onChange={handleRecipientsChange}
            />
            
            {/* Validation Message */}
            {isBatchExceeded ? (
               <div className="flex items-center gap-2 text-red-600 text-sm animate-in fade-in">
                  <AlertCircle className="h-4 w-4" />
                  <span>Batch limit exceeded. Please reduce recipients to {batchSizeLimit} or upgrade your plan.</span>
               </div>
            ) : (
               <p className="text-xs text-gray-500">
                  {batchSizeLimit === Infinity 
                     ? "You can send unlimited emails in this batch." 
                     : `Max ${batchSizeLimit} recipients allowed per batch on your current plan.`}
               </p>
            )}
         </div>

         {/* --- Action Buttons --- */}
         <div className="flex justify-end gap-4 pb-10">
            <Button
               type="submit"
               variant="outline"
               disabled={isPending}
               onClick={() => setActionType("DRAFT")}
               className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 min-w-[140px]"
            >
               {isPending && actionType === "DRAFT" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
               Save as Draft
            </Button>

            {isLimitReached ? (
               <Button disabled className="bg-gray-300 text-gray-500 cursor-not-allowed flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Monthly Limit Reached
               </Button>
            ) : (
               <Button
                  type="submit"
                  name="actionType"
                  value="SEND"
                  onClick={() => setActionType("SEND")}
                  // ✅ Disable if Batch Size is Exceeded
                  disabled={isPending || isBatchExceeded}
                  className="bg-[#0ABED6] hover:bg-[#09accl] text-white min-w-[150px]"
               >
                  {isPending && actionType === "SEND" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Campaign
               </Button>
            )}
         </div>
      </form>
   );
}