"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Clock, AlertCircle, Search } from "lucide-react";
import { format } from "date-fns";

export function RecentSubmissionsTable({ submissions }: { submissions: any[] }) {
  const [selectedRejection, setSelectedRejection] = useState<any>(null);

  return (
    <>
      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
            <TableHeader className="bg-gray-50">
                <TableRow>
                    <TableHead>Change Type</TableHead>
                    <TableHead>Target Title / Name</TableHead>
                    <TableHead>Submitted On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {submissions.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                            No submissions found.
                        </TableCell>
                    </TableRow>
                ) : (
                    submissions.map((req) => (
                        <TableRow key={req.id}>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Badge 
                                      variant="outline" 
                                      className={req.action === "CREATE" ? "text-blue-700 bg-blue-50 border-blue-200" : "text-purple-700 bg-purple-50 border-purple-200"}
                                    >
                                        {req.action}
                                    </Badge>
                                    <span className="text-xs font-bold text-gray-500">{req.model}</span>
                                </div>
                            </TableCell>
                            
                            <TableCell className="font-medium text-gray-700">
                                {/* Dynamically grab the Name (Company) or Headline (Blog) */}
                                <span className="truncate max-w-[250px] block" title={req.data.name || req.data.headline}>
                                    {req.data.name || req.data.headline || "Untitled"}
                                </span>
                            </TableCell>
                            
                            <TableCell className="text-gray-500 text-sm">
                                {format(new Date(req.createdAt), "dd MMM, HH:mm")}
                            </TableCell>
                            
                            <TableCell>
                                {req.status === 'APPROVED' && (
                                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 shadow-none">
                                    <CheckCircle2 className="w-3 h-3 mr-1"/> Approved
                                  </Badge>
                                )}
                                {req.status === 'REJECTED' && (
                                  <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 shadow-none">
                                    <XCircle className="w-3 h-3 mr-1"/> Rejected
                                  </Badge>
                                )}
                                {req.status === 'PENDING' && (
                                  <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200 shadow-none">
                                    <Clock className="w-3 h-3 mr-1"/> Pending
                                  </Badge>
                                )}
                            </TableCell>
                            
                            <TableCell className="text-right">
                                {req.status === 'REJECTED' && req.adminNote ? (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1 h-8"
                                        onClick={() => setSelectedRejection(req)}
                                    >
                                        <AlertCircle className="h-4 w-4" /> View Reason
                                    </Button>
                                ) : (
                                   <span className="text-xs text-gray-300">-</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
      </div>

      {/* --- REJECTION REASON MODAL --- */}
      <Dialog open={!!selectedRejection} onOpenChange={(o) => !o && setSelectedRejection(null)}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="text-red-600 flex items-center gap-2">
                    <XCircle className="h-5 w-5" /> Submission Returned
                </DialogTitle>
                <DialogDescription>
                    The Admin returned your request for <strong>{selectedRejection?.model} {selectedRejection?.action}</strong>.
                </DialogDescription>
            </DialogHeader>
            
            <div className="bg-red-50 p-4 rounded-md border border-red-100 text-red-900 text-sm mt-2">
                <span className="font-bold block mb-1 uppercase text-xs text-red-700">Admin Note:</span>
                "{selectedRejection?.adminNote || "No specific reason provided."}"
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedRejection(null)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}