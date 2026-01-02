"use client";

import { useActionState } from 'react';
import { updateCompanyProfile } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ImageIcon, Save, MapPin, Phone, Mail, Tag } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Company } from "@prisma/client";
import { Country, State, City }  from 'country-state-city';

interface CategoryWithSubs {
  id: string;
  name: string;
  subCategories: { id: string; name: string }[];
}

interface SettingsFormProps {
  company: Company;
  categories: CategoryWithSubs[];
}

export function SettingsForm({ company, categories }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState(updateCompanyProfile, null);
  const router = useRouter();

  const [logoPreview, setLogoPreview] = useState<string | null>(company.logoImage);

  // --- 1. CATEGORY STATE ---
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(company.categoryId || "");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>(company.subCategoryId || "");

  const activeSubCategories = useMemo(() => {
    return categories.find(c => c.id === selectedCategoryId)?.subCategories || [];
  }, [selectedCategoryId, categories]);

  // --- 2. LOCATION STATE ---
  const [selectedCountryISO, setSelectedCountryISO] = useState<string>(""); 
  const [selectedStateISO, setSelectedStateISO] = useState<string>(""); 
  const [selectedCityName, setSelectedCityName] = useState<string>(company.city || "");

  // Memoize lists
  const countries = useMemo(() => Country.getAllCountries(), []);
  const states = useMemo(() => selectedCountryISO ? State.getStatesOfCountry(selectedCountryISO) : [], [selectedCountryISO]);
  const cities = useMemo(() => selectedStateISO ? City.getCitiesOfState(selectedCountryISO, selectedStateISO) : [], [selectedCountryISO, selectedStateISO]);

  // --- 3. FIX: HYDRATE LOCATION DATA ---
  // This logic runs ONCE on load to match DB Text -> ISO Code
  useEffect(() => {
    if (company.country) {
      const dbCountry = company.country.trim().toLowerCase();
      
      // 1. Find Country ISO
      const foundCountry = countries.find(
        c => c.name.toLowerCase() === dbCountry || c.isoCode.toLowerCase() === dbCountry
      );

      if (foundCountry) {
        setSelectedCountryISO(foundCountry.isoCode);
        
        // 2. Find State ISO (Only if country matched)
        if (company.state) {
          const dbState = company.state.trim().toLowerCase();
          const validStates = State.getStatesOfCountry(foundCountry.isoCode);
          
          const foundState = validStates.find(
            s => s.name.toLowerCase() === dbState || s.isoCode.toLowerCase() === dbState
          );

          if (foundState) {
            setSelectedStateISO(foundState.isoCode);
          }
        }
      }
    }
    // Also ensure City is set if it exists in DB
    if (company.city) setSelectedCityName(company.city);

  }, []); // Run once on mount

  // --- HANDLE SERVER RESPONSE ---
  useEffect(() => {
    if (state?.success) {
      toast.success("Profile updated successfully!");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  return (
    <form action={formAction} className="space-y-8 max-w-6xl">
      
      {/* HIDDEN INPUTS for Non-Form Elements */}
      <input type="hidden" name="country" value={countries.find(c => c.isoCode === selectedCountryISO)?.name || ""} />
      <input type="hidden" name="state" value={states.find(s => s.isoCode === selectedStateISO)?.name || ""} />
      <input type="hidden" name="city" value={selectedCityName} />
      <input type="hidden" name="companyId" value={company.id} />
      <input type="hidden" name="categoryId" value={selectedCategoryId} />
      <input type="hidden" name="subCategoryId" value={selectedSubCategoryId} />

      {/* --- BRANDING --- */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <div>
           <h3 className="text-lg font-bold text-[#000032] flex items-center gap-2">
             <ImageIcon className="h-5 w-5 text-[#0ABED6]" /> Branding
           </h3>
           <p className="text-sm text-gray-500">Update your company logo.</p>
        </div>
        
        <div className="space-y-3">
            <Label>Company Logo</Label>
            <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 rounded-full border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0 shadow-sm">
                {logoPreview ? (
                    <Image src={logoPreview} alt="Logo" fill className="object-cover" />
                ) : (
                    <ImageIcon className="h-8 w-8 text-gray-300" />
                )}
                </div>
                <div className="space-y-2">
                    <div className="relative overflow-hidden inline-block">
                        <input type="file" name="logo" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" onChange={handleImageChange} />
                        <Button type="button" variant="ghost" size="sm">Upload New Logo</Button>
                    </div>
                    <p className="text-xs text-gray-400">Recommended: 400x400px (JPG, PNG)</p>
                </div>
            </div>
        </div>
      </div>

      {/* --- BUSINESS DETAILS --- */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <div>
           <h3 className="text-lg font-bold text-[#000032] flex items-center gap-2">
             <Tag className="h-5 w-5 text-[#0ABED6]" /> Business Details
           </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* Category Select */}
           <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={selectedCategoryId} onValueChange={(val) => { setSelectedCategoryId(val); setSelectedSubCategoryId(""); }}>
                <SelectTrigger className="bg-white"><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
           </div>

           {/* SubCategory Select */}
           <div className="grid gap-2">
              <Label>Subcategory</Label>
              <Select value={selectedSubCategoryId} onValueChange={setSelectedSubCategoryId} disabled={!selectedCategoryId}>
                <SelectTrigger className="bg-white"><SelectValue placeholder="Select Subcategory" /></SelectTrigger>
                <SelectContent>
                  {activeSubCategories.map((sub) => <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>)}
                </SelectContent>
              </Select>
           </div>

           <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="description">About the Business</Label>
              <Textarea 
                id="description" 
                name="description" 
                defaultValue={company.briefIntroduction || ""} 
                className="min-h-[120px]"
              />
           </div>
        </div>
      </div>

      {/* --- LOCATION (Fixed) --- */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <div>
           <h3 className="text-lg font-bold text-[#000032] flex items-center gap-2">
             <MapPin className="h-5 w-5 text-[#0ABED6]" /> Location
           </h3>
        </div>
        
        <div className="grid gap-4">
           <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" defaultValue={company.address || ""} placeholder="123 Business Rd, Suite 100" />
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              {/* Country */}
              <div className="grid gap-2">
                 <Label>Country</Label>
                 <Select value={selectedCountryISO} onValueChange={(val) => { setSelectedCountryISO(val); setSelectedStateISO(""); setSelectedCityName(""); }}>
                   <SelectTrigger className="bg-white"><SelectValue placeholder={company.country || ""}/></SelectTrigger>
                   <SelectContent>
                     {countries.map((c) => <SelectItem key={c.isoCode} value={c.isoCode}>{c.name}</SelectItem>)}
                   </SelectContent>
                 </Select>
              </div>

              {/* State */}
              <div className="grid gap-2">
                 <Label>State / Province</Label>
                 <Select value={selectedStateISO } onValueChange={(val) => { setSelectedStateISO(val); setSelectedCityName(""); }} disabled={!selectedCountryISO}>
                   <SelectTrigger className="bg-white"><SelectValue placeholder={company.state || ""} /></SelectTrigger>
                   <SelectContent>
                     {states.map((s) => <SelectItem key={s.isoCode} value={s.isoCode}>{s.name}</SelectItem>)}
                   </SelectContent>
                 </Select>
              </div>

              {/* City */}
              <div className="grid gap-2">
                 <Label>City</Label>
                 <Select value={selectedCityName} onValueChange={setSelectedCityName} disabled={!selectedStateISO}>
                   <SelectTrigger className="bg-white"><SelectValue placeholder={company.city || ""} /></SelectTrigger>
                   <SelectContent>
                     {cities.map((city) => <SelectItem key={city.name} value={city.name}>{city.name}</SelectItem>)}
                   </SelectContent>
                 </Select>
              </div>

              {/* ✅ ADDED: Sub City / Area */}
              <div className="grid gap-2">
                 <Label htmlFor="subCity">Sub City / Area</Label>
                 <Input 
                   id="subCity" 
                   name="subCity" 
                   defaultValue={company.subCity || ""} 
                   placeholder="eg Downtown"
                   className="bg-white"
                 />
              </div>

           </div>
        </div>
      </div>

      {/* --- CONTACT INFO --- */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <div>
           <h3 className="text-lg font-bold text-[#000032] flex items-center gap-2">
             <Phone className="h-5 w-5 text-[#0ABED6]" /> Public Contact
           </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="grid gap-2">
              <Label htmlFor="publicEmail">Public Email</Label>
              <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                 {/* @ts-ignore */}
                 <Input id="publicEmail" name="publicEmail" defaultValue={company.contact?.email || ""} className="pl-10" />
              </div>
           </div>
           
           <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="relative">
                 <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                 {/* @ts-ignore */}
                 <Input id="phoneNumber" name="phoneNumber" defaultValue={company.contact?.phone || ""} className="pl-10" />
              </div>
           </div>

           <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="websiteUrl">Website</Label>
              <Input id="websiteUrl" name="websiteUrl" defaultValue={company.websiteUrl || ""} />
           </div>
        </div>
      </div>

      {/* --- SAVE BUTTON --- */}
      <div className="flex justify-end gap-4 pt-6 pb-10">
         <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
         <Button type="submit" disabled={isPending} className="bg-[#0ABED6] hover:bg-[#09A8BD] text-white font-bold px-8 shadow-sm">
           {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
           Save Changes
         </Button>
      </div>

    </form>
  );
}