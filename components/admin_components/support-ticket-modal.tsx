"use client";

import { useState } from "react";
import { updateTicketStatus } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Eye, CheckCircle, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SupportTicketModal({ ticket }: { ticket: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCloseTicket = async () => {
    setLoading(true);
    await updateTicketStatus(ticket.id, "CLOSED");
    setLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
           <Eye className="h-4 w-4 mr-1" /> View
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {/* FIX 1: Changed to gap-2 items-center to keep badge next to title */}
          <DialogTitle className="flex items-center gap-2">
             <span>Ticket Details</span>
             <Badge variant={ticket.status === 'OPEN' ? 'default' : 'secondary'}>{ticket.status}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
           {/* Basic Info */}
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Name</h4>
                 <p className="text-sm font-bold text-gray-900">{ticket.name}</p>
              </div>
              <div>
                 <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Email</h4>
                 <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900">{ticket.email}</p>
                    <a href={`mailto:${ticket.email}`} className="text-blue-500 hover:bg-blue-50 p-1 rounded">
                        <Mail className="h-3.5 w-3.5"/>
                    </a>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div>
                 <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Type</h4>
                 <p className="text-sm font-medium">{ticket.type}</p>
              </div>
              <div>
                 <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Category</h4>
                 <p className="text-sm font-medium capitalize">{ticket.category?.replace(/_/g, ' ') || 'General'}</p>
              </div>
           </div>

           {/* --- SECTION: TARGET REVIEW DETAILS --- */}
           {(ticket.reviewAuthor || ticket.reviewTitle) && (
             <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 space-y-3">
                <h4 className="text-xs font-bold text-orange-800 uppercase tracking-wider flex items-center gap-2">
                  Target Review Info
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-orange-600 font-semibold block mb-0.5">Author Name</span>
                    <p className="text-sm font-bold text-gray-900">{ticket.reviewAuthor || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-orange-600 font-semibold block mb-0.5">Review Title</span>
                    <p className="text-sm font-medium text-gray-900 italic">"{ticket.reviewTitle || "N/A"}"</p>
                  </div>
                </div>
             </div>
           )}

           {/* FIX 2: Changed layout to grid for Company/Role */}
           {ticket.companyName && (
             <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 grid grid-cols-2 gap-4">
                <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Company</h4>
                    <p className="text-sm font-medium text-gray-900">{ticket.companyName}</p>
                </div>
                {ticket.jobTitle && (
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Role</h4>
                        <p className="text-sm font-medium text-gray-900">{ticket.jobTitle}</p>
                    </div>
                )}
             </div>
           )}

           {ticket.deviceInfo && (
             <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Device Info</h4>
                <p className="text-sm font-mono text-gray-700">{ticket.deviceInfo}</p>
             </div>
           )}

           {/* Message Body */}
           <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Message</h4>
              <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-800 whitespace-pre-wrap leading-relaxed border border-gray-200">
                 {ticket.message}
              </div>
           </div>
        </div>

        <DialogFooter>
           {ticket.status === 'OPEN' && (
               <Button onClick={handleCloseTicket} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle className="mr-2 h-4 w-4" /> Mark as Resolved
               </Button>
           )}
           <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}