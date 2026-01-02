"use client";

import { useState } from "react";
import { 
  MoreHorizontal, 
  Eye, 
  Trash2, 
  Loader2, 
  AlertTriangle,
  Send,
  Users,
  Edit,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin_components/blog-components/rich-text-editor"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { deleteCampaign, sendDraft, updateDraft } from "@/lib/actions";
import { toast } from "sonner";
import Image from "next/image";

interface CampaignProps {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: string;
  sentCount: number;
  createdAt: Date;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  recipients?: string[];
}

export default function CampaignActions({ campaign }: { campaign: CampaignProps }) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false); // ✅ New Edit State
  const [isPending, setIsPending] = useState(false);

  // Edit Form State
  const [editContent, setEditContent] = useState(campaign.content);
  const [logoPreview, setLogoPreview] = useState<string | null>(campaign.logoUrl || null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(campaign.bannerUrl || null);

  // --- HANDLERS ---
  
  const handleDelete = async () => {
    setIsPending(true);
    const res = await deleteCampaign(campaign.id);
    if (res.success) {
      toast.success("Campaign deleted.");
      setIsDeleteOpen(false);
    } else {
      toast.error(res.error);
    }
    setIsPending(false);
  };

  const handleSendDraft = async () => {
     setIsPending(true);
     const res = await sendDraft(campaign.id);
     if (res.success) {
        toast.success("Draft sent successfully!");
        setIsSendOpen(false);
     } else {
        toast.error(res.error);
     }
     setIsPending(false);
  };

  // ✅ New Update Handler
  const handleUpdateDraft = async (formData: FormData) => {
    setIsPending(true);
    formData.append("campaignId", campaign.id);
    formData.append("htmlContent", editContent);

    const res = await updateDraft(null, formData); // Call Server Action
    if (res.success) {
        toast.success(res.success);
        setIsEditOpen(false);
    } else {
        toast.error(res.error);
    }
    setIsPending(false);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>, setPreview: (s: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          
          {/* ACTIONS FOR DRAFTS ONLY */}
          {campaign.status === "DRAFT" && (
              <>
                <DropdownMenuItem onClick={() => setIsSendOpen(true)} className="cursor-pointer text-blue-600 font-medium focus:text-blue-700">
                    <Send className="mr-2 h-4 w-4" /> Send Now
                </DropdownMenuItem>
                
                {/* ✅ EDIT BUTTON */}
                <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="cursor-pointer">
                    <Edit className="mr-2 h-4 w-4" /> Edit Draft
                </DropdownMenuItem>
              </>
          )}

          <DropdownMenuItem onClick={() => setIsViewOpen(true)} className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4" /> View Details
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="cursor-pointer text-red-600 focus:text-red-600">
            <Trash2 className="mr-2 h-4 w-4" /> Delete Record
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* --- 1. EDIT DRAFT MODAL (New) --- */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Draft Campaign</DialogTitle>
          </DialogHeader>
          
          <form action={handleUpdateDraft} className="space-y-6 py-2">
             
             {/* Basic Info */}
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <Label>Campaign Name</Label>
                   <Input name="name" defaultValue={campaign.name} required />
                </div>
                <div className="space-y-2">
                   <Label>Subject Line</Label>
                   <Input name="subject" defaultValue={campaign.subject} required />
                </div>
             </div>

             {/* Images Grid */}
             <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border">
                {/* Logo */}
                <div className="space-y-2">
                    <Label className="text-xs text-gray-500 uppercase font-bold">Header Logo</Label>
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded border bg-white flex items-center justify-center overflow-hidden relative shrink-0">
                            {logoPreview ? <Image src={logoPreview} alt="Logo" fill className="object-contain" /> : <span className="text-xs text-gray-300">None</span>}
                        </div>
                        <div className="flex-1">
                            <Input name="logo" type="file" accept="image/*" className="text-xs h-9" onChange={(e) => handleImage(e, setLogoPreview)} />
                        </div>
                    </div>
                </div>
                {/* Banner */}
                <div className="space-y-2">
                    <Label className="text-xs text-gray-500 uppercase font-bold">Banner Image</Label>
                    <div className="relative w-full h-12 rounded border bg-white flex items-center justify-center overflow-hidden group">
                         {bannerPreview ? <Image src={bannerPreview} alt="Banner" fill className="object-cover" /> : <span className="text-xs text-gray-300">No Banner</span>}
                         <Input name="banner" type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleImage(e, setBannerPreview)} />
                    </div>
                    <p className="text-[10px] text-gray-400 text-center">Click image to replace</p>
                </div>
             </div>

             {/* Editor */}
             <div className="space-y-2">
                 <Label>Email Content</Label>
                 <RichTextEditor value={editContent} onChange={setEditContent} />
             </div>

             {/* Recipients */}
             <div className="space-y-2">
                 <Label>Recipients (Comma separated)</Label>
                 <Textarea 
                    name="recipients" 
                    // Join array back to string for editing
                    defaultValue={campaign.recipients?.join(", ")} 
                    className="min-h-[80px] font-mono text-sm"
                 />
             </div>

             <DialogFooter>
                 <Button type="button" variant="outline" className="hover:bg-gray-100" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                 <Button type="submit" disabled={isPending} className="bg-[#0ABED6] hover:bg-[#0ABED6]/80 text-white">
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                 </Button>
             </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- 2. VIEW DETAILS MODAL (Existing) --- */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-50">
           {/* ... (Existing View Code) ... */}
           {/* I'm keeping your existing View logic here implicitly */}
            <DialogHeader>
                <DialogTitle>Campaign Preview</DialogTitle>
                <DialogDescription>Subject: <span className="font-medium text-black">{campaign.subject}</span></DialogDescription>
            </DialogHeader>
            <div className="mx-auto w-full max-w-[600px] bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm mt-2">
                {campaign.logoUrl && <div className="text-center p-5 border-b border-gray-100 bg-white"><img src={campaign.logoUrl} alt="Logo" className="h-12 object-contain mx-auto" /></div>}
                {campaign.bannerUrl && <div className="w-full"><img src={campaign.bannerUrl} alt="Banner" className="w-full h-auto block" /></div>}
                <div className="p-8 text-[#333] leading-relaxed"><div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: campaign.content }} /></div>
                <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t border-gray-100">Sent by {campaign.name}</div>
            </div>
            {/* Recipients List */}
            <div className="mx-auto w-full max-w-[600px] mt-6">
              <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Users className="h-4 w-4 text-[#0ABED6]" /> Target Audience ({campaign.recipients?.length || 0})</h4>
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                 {campaign.recipients && campaign.recipients.length > 0 ? (
                    <div className="max-h-[150px] overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                        {campaign.recipients.map((email, idx) => (
                           <div key={idx} className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded border border-gray-100 flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>{email}
                           </div>
                        ))}
                    </div>
                 ) : <p className="text-sm text-gray-400 italic text-center py-4">No recipients listed.</p>}
              </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- 3. DELETE MODAL (Existing) --- */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
           <DialogHeader>
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-red-600" /></div>
               <div><DialogTitle className="text-red-900">Delete Campaign?</DialogTitle><DialogDescription className="mt-1">Are you sure? This cannot be undone.</DialogDescription></div>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-4 sm:justify-end gap-2">
             <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
             <Button variant="destructive" onClick={handleDelete} disabled={isPending} className="bg-red-600 hover:bg-red-700">{isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- 4. SEND CONFIRM MODAL (Existing) --- */}
      <Dialog open={isSendOpen} onOpenChange={setIsSendOpen}>
        <DialogContent className="sm:max-w-md">
           <DialogHeader>
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center"><Send className="h-5 w-5 text-blue-600" /></div>
               <div><DialogTitle>Send Campaign Now?</DialogTitle><DialogDescription className="mt-1">Status will change to <span className="font-mono text-xs bg-green-100 text-green-700 px-1 rounded">SENT</span>.</DialogDescription></div>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-4 sm:justify-end gap-2">
             <Button variant="outline" onClick={() => setIsSendOpen(false)}>Cancel</Button>
             <Button onClick={handleSendDraft} disabled={isPending} className="bg-[#0ABED6] text-white hover:bg-[#09A8BD]">{isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Yes, Send Emails"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}