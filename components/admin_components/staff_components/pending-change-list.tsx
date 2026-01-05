"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { processApproval } from "@/lib/approval-actions";
import { toast } from "sonner";
import { Loader2, Check, X, Eye, ExternalLink, FileText, Image as ImageIcon, MapPin, Layers, Globe } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function PendingChangeList({ requests }: { requests: any[] }) {
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAction(decision: "APPROVE" | "REJECT") {
    if (decision === "REJECT" && !rejectMode) {
      setRejectMode(true);
      return;
    }
    
    if (decision === "REJECT" && !rejectReason.trim()) {
        toast.error("Please provide a reason for rejection.");
        return;
    }

    setLoading(true);
    const res = await processApproval(selectedReq.id, decision, rejectReason);
    setLoading(false);

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

  // --- HELPER: RENDER PREVIEW CONTENT ---
  const renderPayloadPreview = (req: any) => {
    const data = req.data;

    // 1. BLOG PREVIEW
    if (req.model === "BLOG") {
        return (
            <div className="space-y-6">
                {/* Header Image */}
                {data.imageUrl ? (
                    <div className="relative h-48 w-full rounded-lg overflow-hidden border bg-gray-100">
                        <Image src={data.imageUrl} alt="Cover" fill className="object-cover" />
                    </div>
                ) : (
                    <div className="h-20 w-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">No Cover Image</div>
                )}

                <div>
                    <h3 className="text-xl font-bold text-gray-900">{data.headline}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Globe className="h-3 w-3" />
                        <span className="font-mono bg-gray-100 px-1 rounded">/{data.blogUrl}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">
                    <div>
                        <span className="text-xs font-bold text-gray-500 uppercase">Category</span>
                        <p className="text-sm font-medium">{data.category}</p>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-gray-500 uppercase">Author</span>
                        <p className="text-sm font-medium">{data.authorName}</p>
                    </div>
                </div>

                <div>
                    <span className="text-xs font-bold text-gray-500 uppercase mb-2 block">Content Preview</span>
                    <div className="prose prose-sm max-w-none border p-4 rounded-lg bg-white h-60 overflow-y-auto">
                        <div dangerouslySetInnerHTML={{ __html: data.content }} />
                    </div>
                </div>

                <div className="space-y-2 border-t pt-4">
                    <h4 className="font-semibold text-sm flex items-center gap-2"><FileText className="h-4 w-4" /> SEO Metadata</h4>
                    <div className="text-xs space-y-1 text-gray-600">
                        <p><span className="font-bold">Title:</span> {data.metaTitle}</p>
                        <p><span className="font-bold">Desc:</span> {data.metaDescription}</p>
                        <p><span className="font-bold">Keywords:</span> {data.metaKeywords}</p>
                    </div>
                </div>
            </div>
        );
    }

    // 2. COMPANY PREVIEW
    if (req.model === "COMPANY") {
        return (
            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="h-20 w-20 relative rounded-lg border bg-white shadow-sm shrink-0 overflow-hidden">
                        {data.logoImage ? (
                            <Image src={data.logoImage} alt="Logo" fill className="object-contain p-2" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-400 text-xs">No Logo</div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{data.name}</h3>
                        <a href={data.websiteUrl} target="_blank" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                            {data.websiteUrl} <ExternalLink className="h-3 w-3" />
                        </a>
                        <div className="flex flex-wrap gap-2 mt-2">
                             {data.claimed && <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Claimed</Badge>}
                             {data.domainVerified && <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">Verified</Badge>}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">
                    <div>
                        <span className="text-xs font-bold text-gray-500 uppercase">Location</span>
                        <div className="flex items-center gap-1 text-sm font-medium mt-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            {data.city}, {data.state}, {data.country}
                        </div>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-gray-500 uppercase">Category</span>
                        <div className="flex items-center gap-1 text-sm font-medium mt-1">
                            <Layers className="h-3 w-3 text-gray-400" />
                            ID: {data.categoryId}
                        </div>
                    </div>
                </div>

                <div>
                    <span className="text-xs font-bold text-gray-500 uppercase mb-2 block">Description</span>
                    <p className="text-sm text-gray-700 bg-white p-3 rounded border whitespace-pre-wrap">
                        {data.briefIntroduction || data.description}
                    </p>
                </div>

                {data.otherImages && data.otherImages.length > 0 && (
                    <div>
                        <span className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-2">
                            <ImageIcon className="h-3 w-3" /> Gallery ({data.otherImages.length})
                        </span>
                        <div className="grid grid-cols-4 gap-2">
                            {data.otherImages.map((img: string, idx: number) => (
                                <a key={idx} href={img} target="_blank" className="relative aspect-square rounded overflow-hidden border group">
                                    <Image src={img} alt="Gallery" fill className="object-cover transition-transform group-hover:scale-105" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }
    return <pre className="text-xs bg-slate-950 text-green-400 p-4 rounded overflow-auto">{JSON.stringify(data, null, 2)}</pre>;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* ✅ TABLE VIEW */}
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
                {requests.map((req) => (
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
                        <TableCell>
                            <span className="text-gray-600">{req.requester.name}</span>
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                             {format(new Date(req.createdAt), "dd MMM, HH:mm")}
                        </TableCell>
                        <TableCell className="text-right">
                             <Button onClick={() => setSelectedReq(req)} variant="outline" size="sm" className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                <Eye className="h-4 w-4" /> Review
                             </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>

      {/* --- REVIEW MODAL --- */}
      <Dialog open={!!selectedReq} onOpenChange={(o) => { if(!o) setSelectedReq(null); setRejectMode(false); }}>
         <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
            <DialogHeader className="border-b pb-4">
               <DialogTitle className="flex items-center gap-2 text-xl">
                  Reviewing: <span className="text-blue-600 font-bold">{selectedReq?.model} {selectedReq?.action}</span>
               </DialogTitle>
               <DialogDescription>
                  Verify the details below. Images and links are rendered for preview.
               </DialogDescription>
            </DialogHeader>
            
            {selectedReq && (
               <div className="py-6 flex-1 overflow-y-auto">
                  {renderPayloadPreview(selectedReq)}

                  {rejectMode && (
                     <div className="mt-6 bg-red-50 p-4 rounded-lg border border-red-100 animate-in fade-in zoom-in-95 duration-200">
                        <label className="text-sm font-bold text-red-700 mb-2 block">
                           Reason for Rejection:
                        </label>
                        <Textarea 
                           placeholder="e.g. Spelling errors, incorrect image..." 
                           value={rejectReason}
                           onChange={(e) => setRejectReason(e.target.value)}
                           className="bg-white border-red-200 focus-visible:ring-red-500"
                        />
                     </div>
                  )}
               </div>
            )}

            {/* ✅ UPDATED FOOTER: No Cancel Button, Added Gap */}
            <DialogFooter className="border-t pt-4 flex sm:justify-end gap-4">
                {!rejectMode ? (
                <>
                    <Button 
                        variant="destructive" 
                        onClick={() => handleAction("REJECT")}
                        className="bg-red-50 text-red-600 hover:bg-red-100 border-none shadow-none"
                    >
                        <X className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button 
                        className="bg-green-600 hover:bg-green-700 px-6" 
                        onClick={() => handleAction("APPROVE")} 
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><Check className="mr-2 h-4 w-4" /> Approve & Publish</>}
                    </Button>
                </>
                ) : (
                <div className="flex w-full justify-end gap-3">
                    <Button variant="ghost" onClick={() => setRejectMode(false)}>Back</Button>
                    <Button variant="destructive" onClick={() => handleAction("REJECT")} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : "Confirm Rejection"}
                    </Button>
                </div>
                )}
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}