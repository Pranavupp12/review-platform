"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useActionState } from 'react'; // Renamed hook in Next 15
import { submitBusinessClaim } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, CheckCircle, AlertCircle, Building2 } from "lucide-react";
import Link from "next/link";

// 👇 IMPORT LOCATION LIBRARY
import { Country, State }  from 'country-state-city';

interface BusinessSignupFormProps {
  categories: { id: string; name: string }[];
}

export function BusinessSignupForm({ categories }: BusinessSignupFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const isNewMode = searchParams.get('new') === 'true';
  const paramName = searchParams.get('name') || "";
  const paramId = searchParams.get('companyId') || "";

  const [state, formAction, isPending] = useActionState(submitBusinessClaim, null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // --- LOCATION STATE ---
  const [selectedCountryISO, setSelectedCountryISO] = useState<string>(""); 
  const [selectedStateISO, setSelectedStateISO] = useState<string>(""); 

  // Derived Data
  const countries = Country.getAllCountries();
  const states = selectedCountryISO ? State.getStatesOfCountry(selectedCountryISO) : [];

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

  // --- SUCCESS STATE ---
  if (success) {
    return (
      <div className="text-center py-10 flex flex-col items-center justify-center h-full">
           <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
              <CheckCircle className="h-10 w-10" />
           </div>
           
           <h2 className="text-3xl font-bold text-[#000032] mb-4">Application Received!</h2>
           
           <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 max-w-md mx-auto mb-8">
             <p className="text-gray-700 text-base leading-relaxed">
               We have received your verification request for <strong>{paramName || "your business"}</strong>.
             </p>
             <p className="text-gray-600 text-sm mt-4">
               Our team will review your documents and get back to you on your <strong>registered email ID</strong> with an activation link within 24 hours.
             </p>
           </div>

           <Button 
             className="bg-[#000032] hover:bg-[#000032]/90 text-white px-8 h-12 rounded-full font-bold shadow-lg" 
             onClick={() => router.push('/')}
           >
             Return Home
           </Button>
      </div>
    );
  }

  // --- NORMAL FORM STATE ---
  return (
    <>
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-3xl font-bold text-[#000032] mb-3">Create a free account</h1>
        <p className="text-base text-gray-600">
          Already have an account? <Link href="/business/login" className="text-[#0ABED6] font-medium hover:underline">Log in</Link>
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="isNewCompany" value={isNewMode ? "true" : "false"} />
        {!isNewMode && <input type="hidden" name="companyId" value={paramId} />}
        
        {/* HIDDEN INPUTS FOR LOCATION NAMES */}
        {/* We use these hidden inputs to send the NAME (e.g. "United States") to the backend, 
            while the Select components use the ISO code (e.g. "US") for logic. */}
        {isNewMode && (
          <>
            <input type="hidden" name="country" value={countries.find(c => c.isoCode === selectedCountryISO)?.name || ""} />
            <input type="hidden" name="state" value={states.find(s => s.isoCode === selectedStateISO)?.name || ""} />
          </>
        )}

        {/* SECTION 1: BUSINESS INFO (Only if New) */}
        {isNewMode && (
          <div className="space-y-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-2 text-[#000032] font-semibold border-b border-gray-200 pb-2">
               <Building2 className="h-4 w-4" /> Business Info
            </div>
            
            <div className="space-y-3">
              <div className="grid gap-1.5">
                <Label htmlFor="businessName">Company Name</Label>
                <Input 
                  id="businessName" 
                  name="businessName" 
                  defaultValue={paramName} 
                  placeholder="Acme Corp" 
                  required 
                  className="bg-white"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website" 
                  name="website" 
                  placeholder="https://acme.com" 
                  className="bg-white"
                />
              </div>

              {/* CATEGORY & LOCATION ROW */}
              <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="grid gap-1.5">
                    <Label htmlFor="category">Category</Label>
                    <Select name="categoryId" required>
                      <SelectTrigger className="bg-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Country Dropdown */}
                  <div className="grid gap-1.5">
                    <Label htmlFor="countrySelect">Country</Label>
                    <Select 
                      required 
                      value={selectedCountryISO} 
                      onValueChange={(val) => {
                         setSelectedCountryISO(val);
                         setSelectedStateISO(""); // Reset state when country changes
                      }}
                    >
                      <SelectTrigger className="bg-white"><SelectValue placeholder="Country" /></SelectTrigger>
                      <SelectContent>
                        {countries.map((c) => (
                            <SelectItem key={c.isoCode} value={c.isoCode}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
              </div>

              {/* State Dropdown (Replacing City) */}
              <div className="grid gap-1.5">
                  <Label htmlFor="stateSelect">State / Province</Label>
                  <Select 
                    required 
                    value={selectedStateISO} 
                    onValueChange={setSelectedStateISO}
                    disabled={!selectedCountryISO}
                  >
                    <SelectTrigger className="bg-white"><SelectValue placeholder="Select State" /></SelectTrigger>
                    <SelectContent>
                      {states.map((s) => (
                          <SelectItem key={s.isoCode} value={s.isoCode}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: VERIFICATION DETAILS */}
        <div className="space-y-4 p-5 bg-blue-50/30 rounded-xl border border-blue-100">
           <div className="flex items-center gap-2 mb-2 text-[#000032] font-semibold border-b border-blue-200 pb-2">
               <CheckCircle className="h-4 w-4" /> Verification & Login
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5 col-span-2">
                 <Label htmlFor="workEmail">Work Email (Login ID)</Label>
                 <Input id="workEmail" name="workEmail" type="email" placeholder="you@company.com" required className="bg-white" />
                 <p className="text-[10px] text-gray-500">We will send an activation link to this email.</p>
              </div>
              <div className="grid gap-1.5 col-span-2">
                 <Label htmlFor="jobTitle">Job Title</Label>
                 <Input id="jobTitle" name="jobTitle" placeholder="Owner, Manager..." required className="bg-white" />
              </div>
           </div>

           <div className="grid gap-2 pt-2">
              <Label>Proof of Ownership (Required)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-white hover:border-[#000032] transition-colors relative group bg-white/50">
                  <input 
                    type="file" 
                    name="verificationDoc" 
                    id="verificationDoc" 
                    accept="image/*,.pdf" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleFileChange}
                    required
                  />
                  <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-[#000032]">
                     <div className="p-3 bg-gray-100 rounded-full group-hover:bg-white transition-colors shadow-sm">
                        <Upload className="h-6 w-6" />
                     </div>
                     <span className="text-sm font-medium">
                       {fileName ? <span className="text-[#0ABED6] font-bold">{fileName}</span> : "Click to upload Business License or ID"}
                     </span>
                     <span className="text-[10px] text-gray-400">Supports JPG, PNG, PDF</span>
                  </div>
              </div>
           </div>
        </div>

        {state?.error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md text-sm border border-red-100">
             <AlertCircle className="h-4 w-4 shrink-0" />
             {state.error}
          </div>
        )}

        <Button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-[#000032] hover:bg-[#000032]/90 text-white font-bold h-12 rounded-full text-base shadow-lg transition-all"
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : (isNewMode ? "Submit Application" : "Submit Verification")}
        </Button>
      </form>
    </>
  );
}