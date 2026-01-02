"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  ExternalLink, 
  Building2, 
  MapPin, 
  Mail, 
  User, 
  Briefcase, 
  CheckCircle, 
  FileText 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface ClaimDetailsModalProps {
  claim: any; 
}

export function ClaimDetailsModal({ claim }: ClaimDetailsModalProps) {
  const isNew = !claim.companyId;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 px-2 text-xs gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
           <Eye className="h-3.5 w-3.5" />
           View
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-[#000032]">
            <Building2 className="h-5 w-5" />
            Application Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
           {/* 1. Header Status */}
           <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
              <span className="text-sm font-medium text-gray-700">Application Type</span>
              {isNew ? (
                 <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none shadow-none">New Registration</Badge>
              ) : (
                 <Badge variant="secondary" className="bg-gray-200 text-gray-700 hover:bg-gray-200 border-none shadow-none">Claiming Existing</Badge>
              )}
           </div>

           {/* 2. Applicant Info */}
           <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                 <User className="h-3.5 w-3.5" /> Applicant
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm p-4 border border-gray-200 rounded-lg">
                 <div>
                    <span className="block text-xs text-gray-500 mb-1">Full Name</span>
                    <span className="font-semibold text-gray-900">{claim.user.name || "N/A"}</span>
                 </div>
                 <div>
                    <span className="block text-xs text-gray-500 mb-1">User Email</span>
                    <span className="font-medium text-gray-900">{claim.user.email}</span>
                 </div>
              </div>
           </div>

           {/* 3. Business Info */}
           <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                 <Briefcase className="h-3.5 w-3.5" /> Business Data
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm p-4 border border-gray-200 rounded-lg">
                 <div className="col-span-2">
                    <span className="block text-xs text-gray-500 mb-1">Company Name</span>
                    <span className="font-bold text-base text-[#000032]">
                       {isNew ? claim.businessName : claim.company?.name}
                    </span>
                 </div>
                 
                 <div>
                    <span className="block text-xs text-gray-500 mb-1">Website</span>
                    {claim.website ? (
                        <a href={claim.website} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1 truncate max-w-[200px]">
                           {claim.website} <ExternalLink className="h-3 w-3" />
                        </a>
                    ) : (
                        <span className="text-gray-400 italic">Not provided</span>
                    )}
                 </div>

                 <div>
                    <span className="block text-xs text-gray-500 mb-1">Location</span>
                    {claim.city || claim.country ? (
                       <span className="flex items-center gap-1 font-medium">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          {claim.city}{claim.city && claim.country ? ", " : ""}{claim.country}
                       </span>
                    ) : (
                       <span className="text-gray-400 italic">Global / Online</span>
                    )}
                 </div>

                 {claim.companyId && (
                     <div className="col-span-2 pt-2 mt-2 border-t border-dashed border-gray-200">
                        <span className="block text-xs text-gray-500 mb-1">Target Profile ID</span>
                        <div className="flex items-center justify-between">
                            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{claim.companyId}</code>
                            <Link href={`/company/${claim.company?.slug}`} target="_blank" className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                               View Live Page <ExternalLink className="h-3 w-3" />
                            </Link>
                        </div>
                     </div>
                 )}
              </div>
           </div>

           {/* 4. Verification Proof */}
           <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                 <CheckCircle className="h-3.5 w-3.5" /> Verification Details
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm p-4 bg-blue-50/30 border border-blue-100 rounded-lg">
                 <div>
                    <span className="block text-xs text-gray-500 mb-1">Work Email</span>
                    <div className="flex items-center gap-1.5 font-medium text-blue-900">
                       <Mail className="h-3.5 w-3.5 text-blue-400" />
                       {claim.workEmail}
                    </div>
                 </div>
                 <div>
                    <span className="block text-xs text-gray-500 mb-1">Job Title</span>
                    <span className="font-medium text-gray-900">{claim.jobTitle}</span>
                 </div>
                 <div className="col-span-2 pt-3 border-t border-blue-100 mt-1">
                    <span className="block text-xs text-gray-500 mb-2">Proof of Ownership</span>
                    {claim.verificationDoc ? (
                       <a 
                         href={claim.verificationDoc} 
                         target="_blank" 
                         className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-md shadow-sm text-sm font-semibold hover:bg-gray-50 text-blue-600 w-full justify-center transition-colors"
                       >
                          <FileText className="h-4 w-4" /> View Submitted Document
                       </a>
                    ) : (
                       <div className="text-red-500 text-xs italic flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> No document uploaded
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}