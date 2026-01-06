"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { processApproval, getOriginalData, resolveCategoryNames } from "@/lib/approval-actions"; 
import { toast } from "sonner";
import { Loader2, Check, X, Eye, ExternalLink, Search, ArrowRight, MapPin, Layers, Calendar, Mail, Phone, Globe } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// --- HELPER: DIFF FIELD COMPONENT ---
function DiffField({ label, oldVal, newVal, type = "text" }: { label: string, oldVal?: any, newVal: any, type?: "text" | "image" | "link" }) {
    
    const normalize = (v: any) => (v === null || v === undefined) ? "" : v;
    const cleanOld = normalize(oldVal);
    const cleanNew = normalize(newVal);
    
    const isUpdate = oldVal !== undefined; 
    const isChanged = isUpdate && JSON.stringify(cleanOld) !== JSON.stringify(cleanNew);

    if (!isChanged) {
        if (type === "image") {
            if (!cleanNew) return null; 
            return (
                <div className="p-2">
                    <span className="text-xs font-bold text-gray-500 uppercase block mb-1">{label}</span>
                    <div className="h-16 w-16 relative border rounded bg-white overflow-hidden">
                        <Image src={cleanNew} alt={label} fill className="object-contain" />
                    </div>
                </div>
            );
        }
        return (
            <div className="p-2">
                <span className="text-xs font-bold text-gray-500 uppercase block mb-1">{label}</span>
                <div className="text-sm font-medium text-gray-900 truncate">
                    {type === "link" && cleanNew ? (
                        <a href={cleanNew} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1">
                            {cleanNew} <ExternalLink className="h-3 w-3" />
                        </a>
                    ) : (
                        cleanNew || <span className="text-gray-400 italic text-xs">-</span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-yellow-50/50 p-2 rounded border border-yellow-200">
            <span className="text-xs font-bold text-gray-500 uppercase block mb-1">{label} (Changed)</span>
            
            {type === "image" ? (
                 <div className="flex items-center gap-4">
                    {cleanOld && (
                        <div className="opacity-50 grayscale">
                             <span className="text-[10px] text-red-500 font-bold block mb-1">PREVIOUS</span>
                             <div className="h-16 w-16 relative border rounded bg-white overflow-hidden">
                                <Image src={cleanOld} alt="Old" fill className="object-contain" />
                             </div>
                        </div>
                    )}
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <div>
                         <span className="text-[10px] text-green-600 font-bold block mb-1">NEW</span>
                         {cleanNew ? (
                            <div className="h-20 w-20 relative border rounded bg-white shadow-sm overflow-hidden">
                                <Image src={cleanNew} alt="New" fill className="object-contain" />
                            </div>
                         ) : <span className="text-xs text-gray-400">Removed</span>}
                    </div>
                </div>
            ) : (
                <div className="text-sm">
                    <div className="text-red-500 line-through text-xs mb-1 opacity-60 truncate">
                        {cleanOld || "(Empty)"}
                    </div>
                    <div className="text-green-700 font-semibold flex items-center gap-2">
                         {type === "link" ? (
                            <a href={cleanNew} target="_blank" className="hover:underline flex items-center gap-1">
                                {cleanNew} <ExternalLink className="h-3 w-3" />
                            </a>
                         ) : (
                            cleanNew || <span className="text-gray-400 italic">Cleared</span>
                         )}
                    </div>
                </div>
            )}
        </div>
    );
}

export function PendingChangeList({ requests }: { requests: any[] }) {
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [originalData, setOriginalData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);
  
  const [resolvedNames, setResolvedNames] = useState({
      oldCat: "", oldSub: "",
      newCat: "", newSub: ""
  });

  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
        if (!selectedReq) {
            setOriginalData({});
            setResolvedNames({ oldCat: "", oldSub: "", newCat: "", newSub: "" });
            return;
        }
        setLoadingData(true);

        let og: any = {};
        if (selectedReq.action === "UPDATE" && selectedReq.targetId) {
            og = await getOriginalData(selectedReq.model, selectedReq.targetId) || {};
        }
        setOriginalData(og);

        if (selectedReq.model === "COMPANY") {
            const newData = selectedReq.data;
            const oldData = og;

            const oldNames = await resolveCategoryNames(oldData?.categoryId, oldData?.subCategoryId);
            const newNames = await resolveCategoryNames(newData?.categoryId, newData?.subCategoryId);

            setResolvedNames({
                oldCat: oldNames.categoryName,
                oldSub: oldNames.subCategoryName,
                newCat: newNames.categoryName,
                newSub: newNames.subCategoryName
            });
        }
        setLoadingData(false);
    }
    fetchData();
  }, [selectedReq]);

  async function handleAction(decision: "APPROVE" | "REJECT") {
    if (decision === "REJECT" && !rejectMode) {
      setRejectMode(true);
      return;
    }
    
    if (decision === "REJECT" && !rejectReason.trim()) {
        toast.error("Please provide a reason for rejection.");
        return;
    }

    setActionLoading(true);
    const res = await processApproval(selectedReq.id, decision, rejectReason);
    setActionLoading(false);

    if (res.success) {
      toast.success(decision === "APPROVE" ? "Changes Published!" : "Request Rejected.");
      setSelectedReq(null);
      setRejectMode(false);
      setRejectReason("");
      router.refresh(); 
    } else {
      toast.error(res.error || "Action failed");
    }
  }

  const renderContent = () => {
    if (!selectedReq) return null;
    if (loadingData) return <div className="p-12 text-center text-gray-500 flex flex-col items-center"><Loader2 className="animate-spin h-8 w-8 mb-2" /> Fetching details...</div>;

    const newData = selectedReq.data;
    const oldData = originalData || {}; 

    // === COMPANY VIEW ===
    if (selectedReq.model === "COMPANY") {
        return (
            <div className="space-y-6">
                
                {/* 1. Identity & Logo */}
                <div className="grid grid-cols-[auto_1fr] gap-6 border-b pb-6">
                    <DiffField 
                        label="Logo" 
                        type="image" 
                        oldVal={oldData.logoImage} 
                        newVal={newData.logoImage} 
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DiffField label="Company Name" oldVal={oldData.name} newVal={newData.name} />
                        <DiffField label="Website URL" type="link" oldVal={oldData.websiteUrl} newVal={newData.websiteUrl} />
                    </div>
                </div>

                {/* 2. Categorization */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6">
                    <DiffField label="Category" oldVal={resolvedNames.oldCat} newVal={resolvedNames.newCat} />
                    <DiffField label="Sub-Category" oldVal={resolvedNames.oldSub} newVal={resolvedNames.newSub} />
                    <DiffField label="Type" oldVal={oldData.companyType} newVal={newData.companyType} />
                </div>

                {/* 3. Location - ✅ EXPANDED TO SHOW ALL FIELDS */}
                <div className="border-b pb-6 space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Location Details
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <DiffField label="Country" oldVal={oldData.country} newVal={newData.country} />
                         <DiffField label="State/Province" oldVal={oldData.state} newVal={newData.state} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <DiffField label="City" oldVal={oldData.city} newVal={newData.city} />
                         <DiffField label="Sub-City/Area" oldVal={oldData.subCity} newVal={newData.subCity} />
                    </div>

                    <DiffField label="Full Address" oldVal={oldData.address} newVal={newData.address} />
                </div>

                {/* 4. Description */}
                <div className="space-y-4 border-b pb-6">
                     <div className="bg-gray-50 rounded p-2 border">
                        <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Description</span>
                        <p className="text-sm whitespace-pre-wrap text-gray-700">{newData.description || newData.briefIntroduction}</p>
                     </div>
                </div>

                {/* 5. Contact & Meta */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6">
                    <DiffField label="Email" oldVal={oldData.contactEmail} newVal={newData.contactEmail} />
                    <DiffField label="Phone" oldVal={oldData.phone} newVal={newData.phone} />
                    
                    <div>
                        <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Created Date</span>
                        <div className="text-sm font-medium text-gray-700">
                           {newData.createdAt ? format(new Date(newData.createdAt), "dd MMM yyyy") : "N/A"}
                        </div>
                    </div>
                </div>
                
                {/* 6. SEO */}
                <div className="bg-slate-50 p-4 rounded-lg border">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Search className="h-4 w-4" /> SEO Settings
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                        <DiffField 
                            label="Keywords" 
                            oldVal={Array.isArray(oldData.keywords) ? oldData.keywords.join(", ") : oldData.keywords} 
                            newVal={Array.isArray(newData.keywords) ? newData.keywords.join(", ") : newData.keywords} 
                        />
                    </div>
                </div>

            </div>
        );
    }

    // === BLOG VIEW ===
    if (selectedReq.model === "BLOG") {
         return (
            <div className="space-y-6">
                <div className="grid grid-cols-[auto_1fr] gap-6 border-b pb-6">
                    <DiffField label="Cover Image" type="image" oldVal={oldData.imageUrl} newVal={newData.imageUrl} />
                    <div className="space-y-4">
                        <DiffField label="Headline" oldVal={oldData.headline} newVal={newData.headline} />
                        <DiffField label="Slug (URL)" oldVal={oldData.blogUrl} newVal={newData.blogUrl} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b pb-6">
                    <DiffField label="Category" oldVal={oldData.category} newVal={newData.category} />
                    <DiffField label="Author" oldVal={oldData.authorName} newVal={newData.authorName} />
                </div>

                <div className="border-b pb-6">
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Content</label>
                    <div className="prose prose-sm max-w-none border p-4 rounded bg-white h-60 overflow-y-auto">
                         <div dangerouslySetInnerHTML={{ __html: newData.content }} />
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">SEO Settings</h4>
                    <div className="space-y-3">
                        <DiffField label="Meta Title" oldVal={oldData.metaTitle} newVal={newData.metaTitle} />
                        <DiffField label="Meta Desc" oldVal={oldData.metaDescription} newVal={newData.metaDescription} />
                        <DiffField label="Keywords" oldVal={oldData.metaKeywords} newVal={newData.metaKeywords} />
                    </div>
                </div>
            </div>
         );
    }

    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
            <TableHeader className="bg-gray-50">
                <TableRow>
                    <TableHead>Change Type</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {requests.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No pending requests found.
                        </TableCell>
                    </TableRow>
                ) : (
                    requests.map((req) => (
                    <TableRow key={req.id}>
                        <TableCell>
                             <div className="flex items-center gap-2">
                                <Badge className={req.action === "CREATE" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}>
                                    {req.action}
                                </Badge>
                                <span className="text-xs font-bold text-gray-500">{req.model}</span>
                             </div>
                        </TableCell>
                        <TableCell className="font-medium">
                            {req.model === "COMPANY" ? req.data.name : req.data.headline}
                        </TableCell>
                        <TableCell><span className="text-gray-600">{req.requester.name}</span></TableCell>
                        <TableCell className="text-gray-500 text-sm">{format(new Date(req.createdAt), "dd MMM, HH:mm")}</TableCell>
                        <TableCell className="text-right">
                             <Button onClick={() => setSelectedReq(req)} variant="outline" size="sm" className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                <Eye className="h-4 w-4" /> Review
                             </Button>
                        </TableCell>
                    </TableRow>
                    ))
                )}
            </TableBody>
        </Table>

      <Dialog open={!!selectedReq} onOpenChange={(o) => { if(!o) setSelectedReq(null); setRejectMode(false); }}>
         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
            <DialogHeader className="border-b pb-4">
               <DialogTitle className="flex items-center gap-2 text-xl">
                  Reviewing: <span className="text-blue-600 font-bold">{selectedReq?.model} {selectedReq?.action}</span>
               </DialogTitle>
               <DialogDescription>
                  Review the submission details below.
               </DialogDescription>
            </DialogHeader>
            
            <div className="py-6 flex-1 overflow-y-auto">
                {renderContent()}

                {rejectMode && (
                    <div className="mt-6 bg-red-50 p-4 rounded-lg border border-red-100 animate-in fade-in zoom-in-95 duration-200">
                    <label className="text-sm font-bold text-red-700 mb-2 block">Reason for Rejection:</label>
                    <Textarea 
                        placeholder="e.g. Spelling errors, incorrect image..." 
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="bg-white border-red-200 focus-visible:ring-red-500"
                    />
                    </div>
                )}
            </div>

            <DialogFooter className="border-t pt-4 flex sm:justify-end gap-4">
                {!rejectMode ? (
                <>
                    <Button variant="destructive" onClick={() => handleAction("REJECT")} className="bg-red-50 text-red-600 hover:bg-red-100 border-none shadow-none">
                        <X className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700 px-6" onClick={() => handleAction("APPROVE")} disabled={actionLoading}>
                        {actionLoading ? <Loader2 className="animate-spin" /> : <><Check className="mr-2 h-4 w-4" /> Approve & Publish</>}
                    </Button>
                </>
                ) : (
                <div className="flex w-full justify-end gap-3">
                    <Button variant="ghost" onClick={() => setRejectMode(false)}>Back</Button>
                    <Button variant="destructive" onClick={() => handleAction("REJECT")} disabled={actionLoading}>
                        {actionLoading ? <Loader2 className="animate-spin" /> : "Confirm Rejection"}
                    </Button>
                </div>
                )}
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}