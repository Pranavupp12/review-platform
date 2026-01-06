"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  MapPin, 
  Globe, 
  Mail, 
  Phone, 
  Building2, 
  Tag, 
  Layers, 
  ShieldCheck, 
  AlertTriangle 
} from "lucide-react";
import Image from "next/image";

interface CompanyDetailsModalProps {
  company: any; 
}

export function CompanyDetailsModal({ company }: CompanyDetailsModalProps) {
  const isDomainVerified = !!company.domainVerified;

  // Helper to get contact info safely (handles nested objects or flat structure)
  const email = company.contact?.email || company.contactEmail || company.email;
  const phone = company.contact?.phone || company.phone;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Company Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-4">
          
          {/* 1. Header Section */}
          <div className="flex items-start gap-5">
            <div className="h-24 w-24 rounded-xl border bg-gray-50 flex items-center justify-center overflow-hidden relative shrink-0 shadow-sm">
              {company.logoImage ? (
                <Image 
                  src={company.logoImage} 
                  alt={company.name} 
                  fill 
                  className="object-contain p-2" 
                />
              ) : (
                <span className="font-bold text-3xl text-gray-300">{company.name[0]}</span>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                 <div>
                    <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                       {company.websiteUrl && (
                          <a href={company.websiteUrl.startsWith('http') ? company.websiteUrl : `https://${company.websiteUrl}`} target="_blank" className="flex items-center gap-1 hover:text-blue-600 hover:underline">
                            <Globe className="h-3.5 w-3.5" /> {company.websiteUrl}
                          </a>
                       )}
                       <span>•</span>
                       <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" /> 
                          <span className="capitalize">{company.companyType?.toLowerCase() || 'Service'}</span>
                       </span>
                    </div>
                 </div>
                 {company.claimed ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 px-3">Claimed</Badge>
                 ) : (
                    <Badge variant="secondary" className="text-gray-500">Unclaimed</Badge>
                 )}
              </div>
            </div>
          </div>

          {/* 2. Detailed Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
             
             {/* Domain Verification */}
             <div className="col-span-1 sm:col-span-2 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Domain Verification</h4>
                {isDomainVerified ? (
                   <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                         <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                         <div className="font-bold text-emerald-800 text-sm">Verified Ownership</div>
                         <div className="text-xs text-gray-500">
                            Verified via <span className="font-medium text-gray-700">{company.domainVerifyEmail}</span> 
                            {company.domainVerified && <span className="text-gray-400"> on {new Date(company.domainVerified).toLocaleDateString()}</span>}
                         </div>
                      </div>
                   </div>
                ) : (
                   <div className="flex items-center gap-3">
                      <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                         <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                         <div className="font-bold text-amber-800 text-sm">Not Verified</div>
                         <div className="text-xs text-gray-500">This company has not verified their domain email yet.</div>
                      </div>
                   </div>
                )}
             </div>

             <div className="col-span-1 sm:col-span-2 border-t border-gray-100 my-1"></div>

             {/* ✅ NEW: CONTACT INFO SECTION */}
             <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</h4>
                <div className="flex items-center gap-2 text-gray-900 font-medium">
                   <Mail className="h-4 w-4 text-gray-400" />
                   {email || <span className="text-gray-400 italic">Not provided</span>}
                </div>
             </div>
             <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone</h4>
                <div className="flex items-center gap-2 text-gray-900 font-medium">
                   <Phone className="h-4 w-4 text-gray-400" />
                   {phone || <span className="text-gray-400 italic">Not provided</span>}
                </div>
             </div>

             <div className="col-span-1 sm:col-span-2 border-t border-gray-100 my-1"></div>

             {/* Category Info */}
             <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category</h4>
                <div className="font-medium text-gray-900 flex items-center gap-2">
                   <Layers className="h-4 w-4 text-blue-500" />
                   {company.category?.name || 'N/A'}
                </div>
             </div>
             <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Sub Category</h4>
                <p className="font-medium text-gray-900">{company.subCategory?.name || 'N/A'}</p>
             </div>

             <div className="col-span-1 sm:col-span-2 border-t border-gray-100 my-1"></div>

             {/* Location Info */}
             <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Country</h4>
                <p className="font-medium text-gray-900">{company.country || 'N/A'}</p>
             </div>
             <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">State / Province</h4>
                <p className="font-medium text-gray-900">{company.state || 'N/A'}</p>
             </div>

             <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">City</h4>
                <p className="font-medium text-gray-900">{company.city || 'N/A'}</p>
             </div>
             <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Sub City / Area</h4>
                <p className="font-medium text-gray-900">{company.subCity || 'N/A'}</p>
             </div>

             {/* Address */}
             <div className="sm:col-span-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Address</h4>
                <div className="flex items-start gap-2 text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100">
                   <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-gray-400" />
                   <span>{company.address || 'No specific address on file.'}</span>
                </div>
             </div>
          </div>

          {/* 3. Description */}
          {company.briefIntroduction && (
            <div>
               <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">About</h4>
               <p className="text-sm text-gray-600 leading-relaxed bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                 {company.briefIntroduction}
               </p>
            </div>
          )}

          {/* 4. Keywords & Gallery */}
          {company.keywords && company.keywords.length > 0 && (
            <div>
               <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5" />Keywords
               </h4>
               <div className="flex flex-wrap gap-2">
                  {company.keywords.map((k: string) => (
                     <Badge key={k} variant="secondary" className="bg-white border-gray-200 text-gray-600 font-normal hover:bg-gray-50">
                        {k}
                     </Badge>
                  ))}
               </div>
            </div>
          )}

          {company.otherImages && company.otherImages.length > 0 && (
            <div>
               <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Showcase Gallery</h4>
               <div className="grid grid-cols-4 gap-3">
                  {company.otherImages.map((url: string, idx: number) => (
                     <div key={idx} className="relative aspect-square rounded-md border overflow-hidden bg-gray-50">
                        <Image src={url} alt="Gallery" fill className="object-cover" />
                     </div>
                  ))}
               </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}