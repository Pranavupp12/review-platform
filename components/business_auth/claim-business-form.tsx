"use client";

import { useActionState } from 'react';
import { submitBusinessClaim } from "@/lib/actions"; // Reuse your existing action
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, CheckCircle, AlertCircle, Building2, Briefcase, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ClaimBusinessFormProps {
  companyId: string;
  companyName: string;
}

export function ClaimBusinessForm({ companyId, companyName }: ClaimBusinessFormProps) {
  const [state, formAction, isPending] = useActionState(submitBusinessClaim, null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      setSuccess(true);
    }
  }, [state]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  if (success) {
    return (
      <div className="text-center py-10 bg-white rounded-xl border border-gray-100 shadow-sm p-8">
           <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8" />
           </div>
           <h2 className="text-2xl font-bold text-[#000032] mb-2">Request Received!</h2>
           <p className="text-gray-600 mb-6">
             We are verifying your claim for <strong>{companyName}</strong>. Check your email for an activation link shortly.
           </p>
           <Button onClick={() => router.push('/business')} variant="outline" className='hover:bg-gray-100'>Return Home</Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="mb-6">
         <h2 className="text-2xl font-bold text-[#000032]">Verify Ownership</h2>
         <p className="text-gray-500 text-sm mt-1">
           To manage this profile, please provide your business credentials.
         </p>
      </div>

      <form action={formAction} className="space-y-5">
        {/* Hidden Fields needed for the Server Action */}
        <input type="hidden" name="isNewCompany" value="false" />
        <input type="hidden" name="companyId" value={companyId} />
        {/* Pass jobTitle as hidden fallback if you remove the visible input, but we keep it below */}

        <div className="space-y-4">
           <div className="grid gap-1.5">
              <Label htmlFor="workEmail" className="flex items-center gap-2">
                 <Mail className="h-4 w-4 text-[#0ABED6]" /> Work Email
              </Label>
              <Input 
                 id="workEmail" 
                 name="workEmail" 
                 type="email" 
                 placeholder="name@company.com" 
                 required 
                 className="bg-gray-50 h-11"
              />
           </div>

           <div className="grid gap-1.5">
              <Label htmlFor="jobTitle" className="flex items-center gap-2">
                 <Briefcase className="h-4 w-4 text-[#0ABED6]" /> Job Title
              </Label>
              <Input 
                 id="jobTitle" 
                 name="jobTitle" 
                 placeholder="e.g. Owner, Marketing Manager" 
                 required 
                 className="bg-gray-50 h-11"
              />
           </div>

           <div className="grid gap-1.5 pt-2">
              <Label className="flex items-center gap-2">
                 <Building2 className="h-4 w-4 text-[#0ABED6]" /> Verification Document
              </Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 hover:border-[#0ABED6] transition-colors relative cursor-pointer group">
                  <input 
                    type="file" 
                    name="verificationDoc" 
                    id="verificationDoc" 
                    accept="image/*,.pdf" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleFileChange}
                    required
                  />
                  <div className="flex flex-col items-center gap-1 text-gray-500 group-hover:text-[#000032]">
                     <Upload className="h-5 w-5 mb-1" />
                     <span className="text-sm font-medium">
                       {fileName ? <span className="text-[#0ABED6]">{fileName}</span> : "Upload Business License / ID"}
                     </span>
                  </div>
              </div>
           </div>
        </div>

        {state?.error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md text-sm">
             <AlertCircle className="h-4 w-4 shrink-0" />
             {state.error}
          </div>
        )}

        <Button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-[#000032] hover:bg-[#000032]/90 text-white font-bold h-12 rounded-lg text-base shadow-lg mt-2"
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Verification Request"}
        </Button>

        <p className="text-xs text-center text-gray-400 mt-4">
           By clicking Submit, you agree to our Terms of Service for Business.
        </p>
      </form>
    </div>
  );
}