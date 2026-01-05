"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { upsertCompany } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, Plus, Edit, ImagePlus, X, MapPin } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useGeoLocation, GeoItem } from "@/lib/hooks/use-geo-location";

interface SubCategoryOption { id: string; name: string; }
interface CategoryOption { id: string; name: string; subCategories: SubCategoryOption[]; }
interface GalleryItem { id: string; url: string; file?: File; isExisting: boolean; }

// ✅ 1. ADDED userRole to Interface
interface CompanyModalProps { 
  categories: CategoryOption[]; 
  company?: any; 
  userRole: string; 
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full bg-[#000032] hover:bg-[#000032]/90 text-white" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEdit ? "Save Changes" : "Create Company")}
    </Button>
  );
}

// ✅ 2. ADDED userRole to Props Destructuring
export function CompanyModal({ categories, company, userRole }: CompanyModalProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(upsertCompany, null);
  const isEdit = !!company;

  const { fetchCountries, fetchStates, fetchCities, loading: geoLoading } = useGeoLocation();

  // --- LOCATION STATE ---
  const [countriesList, setCountriesList] = useState<GeoItem[]>([]);
  const [statesList, setStatesList] = useState<GeoItem[]>([]);
  const [citiesList, setCitiesList] = useState<GeoItem[]>([]);

  const [selectedCountryId, setSelectedCountryId] = useState<string>("");
  const [selectedStateId, setSelectedStateId] = useState<string>("");

  // Initialize names with existing company data
  const [selectedCountryName, setSelectedCountryName] = useState<string>(company?.country || "");
  const [selectedStateName, setSelectedStateName] = useState<string>(company?.state || "");
  const [selectedCityName, setSelectedCityName] = useState<string>(company?.city || "");

  const [logoPreview, setLogoPreview] = useState<string | null>(company?.logoImage || null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isClaimed, setIsClaimed] = useState(company?.claimed || false);
  const [isDomainVerified, setIsDomainVerified] = useState(!!company?.domainVerified);
  const [keywords, setKeywords] = useState<string[]>(company?.keywords || []);
  const [keywordInput, setKeywordInput] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(company?.categoryId || "");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>(company?.subCategoryId || "");
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    if (open) {
      setLogoPreview(company?.logoImage || null);
      setLogoFile(null);
      setIsClaimed(company?.claimed || false);
      setIsDomainVerified(!!company?.domainVerified);
      setKeywords(company?.keywords || []);
      setKeywordInput("");
      setSelectedCategoryId(company?.categoryId || "");
      setSelectedSubCategoryId(company?.subCategoryId || "");

      // Reset location names
      setSelectedCountryName(company?.country || "");
      setSelectedStateName(company?.state || "");
      setSelectedCityName(company?.city || "");

      const existingImages = (company?.otherImages || []).map((url: string, index: number) => ({
        id: `existing-${index}`,
        url: url,
        isExisting: true
      }));
      setGalleryItems(existingImages);

      // Async: Hydrate the dropdown lists and IDs
      const initLocation = async () => {
        const cList = await fetchCountries();
        setCountriesList(cList);

        if (company?.country) {
          const matchedCountry = cList.find(c => c.name === company.country);
          if (matchedCountry) {
            const cId = matchedCountry.geonameId.toString();
            setSelectedCountryId(cId);

            // Load States
            const sList = await fetchStates(Number(cId));
            setStatesList(sList);

           if (company?.state) {
              const matchedState = sList.find(s => s.name === company.state);
              if (matchedState) {
                const sId = matchedState.geonameId.toString();
                setSelectedStateId(sId);
                
                if (matchedCountry.isoCode && matchedState.adminCode) {
                    const cities = await fetchCities(matchedCountry.isoCode, matchedState.adminCode, matchedState.name);
                    setCitiesList(cities);
                }
              }
            }
          }
        }
      };
      initLocation();
    }
  }, [open, company, fetchCountries, fetchStates, fetchCities]);

  // --- HANDLERS ---
  const handleCountryChange = async (valId: string) => {
    setSelectedCountryId(valId);
    const cObj = countriesList.find(c => c.geonameId.toString() === valId);
    setSelectedCountryName(cObj?.name || "");

    // Reset children
    setSelectedStateId("");
    setSelectedStateName("");
    setStatesList([]);
    setSelectedCityName("");
    setCitiesList([]);

    // Fetch States
    const sList = await fetchStates(Number(valId));
    setStatesList(sList);
  };

  const handleStateChange = async (valId: string) => {
    setSelectedStateId(valId);
    
    const sObj = statesList.find(s => s.geonameId.toString() === valId);
    setSelectedStateName(sObj?.name || "");

    const cObj = countriesList.find(c => c.geonameId.toString() === selectedCountryId);

    setSelectedCityName("");
    setCitiesList([]);

    if (cObj?.isoCode && sObj?.adminCode) {
      const cList = await fetchCities(cObj.isoCode, sObj.adminCode, sObj.name);
      setCitiesList(cList);
    }
  };

  const handleCityChange = (val: string) => {
    setSelectedCityName(val);
  };

  useEffect(() => {
    if (state?.success) {
      setOpen(false);
      toast.success("Company saved successfully");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  const availableSubCategories = useMemo(() => {
    const cat = categories.find(c => c.id === selectedCategoryId);
    return cat ? cat.subCategories : [];
  }, [selectedCategoryId, categories]);

  const handleCategoryChange = (val: string) => {
    setSelectedCategoryId(val);
    setSelectedSubCategoryId("");
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newItems: GalleryItem[] = newFiles.map((file, index) => ({
        id: `new-${Date.now()}-${index}`,
        url: URL.createObjectURL(file),
        file: file,
        isExisting: false
      }));
      setGalleryItems(prev => [...prev, ...newItems]);
    }
  };

  const removeGalleryImage = (idToRemove: string) => {
    setGalleryItems(prev => prev.filter(item => item.id !== idToRemove));
  };

  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = keywordInput.trim().toLowerCase();
      if (newTag && !keywords.includes(newTag)) {
        setKeywords(prev => [...prev, newTag]);
      }
      setKeywordInput("");
    }
  };

  const removeKeyword = (tagToRemove: string) => {
    setKeywords(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (formData: FormData) => {
    const newFilesToUpload = galleryItems.filter(item => !item.isExisting && item.file);
    const existingUrlsToKeep = galleryItems.filter(item => item.isExisting).map(item => item.url);
    newFilesToUpload.forEach(item => { if (item.file) formData.append('otherImages', item.file); });
    formData.set('retainedImages', JSON.stringify(existingUrlsToKeep));

    if (logoFile) formData.set('logo', logoFile);
    if (isClaimed) formData.set('claimed', 'on'); else formData.delete('claimed');
    if (isDomainVerified) formData.set('domainVerified', 'on'); else formData.delete('domainVerified');

    formData.set('keywords', keywords.join(','));
    if (selectedCategoryId) formData.set('categoryId', selectedCategoryId);
    if (selectedSubCategoryId) formData.set('subCategoryId', selectedSubCategoryId);

    formAction(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200">
            <Edit className="h-4 w-4 text-gray-600" />
          </Button>
        ) : (
          <Button className="bg-[#000032] hover:bg-[#000032]/90 text-white">
            <Plus className="h-4 w-4 mr-2" /> Add Company
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${company.name}` : "Add New Company"}</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-6 py-4">
          {isEdit && <input type="hidden" name="companyId" value={company.id} />}

          <input type="hidden" name="country" value={selectedCountryName} />
          <input type="hidden" name="state" value={selectedStateName} />
          <input type="hidden" name="city" value={selectedCityName} />

          {/* Logo & Basic Info */}
          <div className="space-y-2">
            <Label>Company Logo</Label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden relative shrink-0">
                {logoPreview ? <Image src={logoPreview} alt="Logo" fill className="object-contain p-1" /> : <span className="text-xs text-gray-400">No Logo</span>}
              </div>
              <div className="flex-1">
                <Label htmlFor="logo" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"><Upload className="h-4 w-4" /> Choose Logo</Label>
                <Input id="logo" name="logo" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input id="name" name="name" defaultValue={company?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" defaultValue={company?.websiteUrl} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="categoryId" value={selectedCategoryId} onValueChange={handleCategoryChange}>
                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subCategoryId">Sub Category</Label>
              <Select
                name="subCategoryId"
                value={selectedSubCategoryId}
                onValueChange={setSelectedSubCategoryId}
                disabled={!selectedCategoryId || availableSubCategories.length === 0}
              >
                <SelectTrigger><SelectValue placeholder={availableSubCategories.length === 0 && selectedCategoryId ? "No subcategories" : "Select Sub Category"} /></SelectTrigger>
                <SelectContent>
                  {availableSubCategories.map((sub) => <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyType">Company Type</Label>
            <Select name="companyType" defaultValue={company?.companyType || "SERVICE"}>
              <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SERVICE">Service Based</SelectItem>
                <SelectItem value="PRODUCT">Product Based</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location Details */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <Label className="text-blue-600 font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Location Details {geoLoading && <Loader2 className="h-3 w-3 animate-spin text-gray-500" />}
            </Label>

            <div className="grid grid-cols-2 gap-4">

              {/* Country */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Country</Label>
                <Select value={selectedCountryId} onValueChange={handleCountryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedCountryName || "Select Country"} />
                  </SelectTrigger>
                  <SelectContent>
                    {countriesList.map((c) => (
                      <SelectItem key={c.geonameId} value={c.geonameId.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* State */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">State / Province</Label>
                <Select value={selectedStateId} onValueChange={handleStateChange} disabled={!selectedCountryId}>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedStateName || "Select State"} />
                  </SelectTrigger>
                  <SelectContent>
                    {statesList.map((s) => (
                      <SelectItem key={s.geonameId} value={s.geonameId.toString()}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">City / Area</Label>
                <Select value={selectedCityName} onValueChange={handleCityChange} disabled={!selectedStateId}>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedCityName || "Select City"} />
                  </SelectTrigger>
                  <SelectContent>
                    {citiesList.length === 0 ? (
                      <SelectItem value="none" disabled>No cities found</SelectItem>
                    ) : (
                      Array.from(new Map(citiesList.map(city => [city.name, city])).values())
                        .map((city) => {

                          let displayName = city.name;
                          if (selectedStateName === "Delhi" || selectedStateName === "NCT") {
                            const genericNames = ["West", "North", "South", "East", "Central", "North West", "North East", "South West", "South East", "Shahdara"];
                            if (genericNames.includes(city.name)) {
                              displayName = `${city.name} Delhi`;
                            }
                          }

                          return (
                            <SelectItem key={city.geonameId} value={displayName}>
                              {displayName}
                            </SelectItem>
                          );
                        })
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Sub City / Area</Label>
                <Input name="subCity" defaultValue={company?.subCity} placeholder="e.g. Downtown" />
              </div>
            </div>

            <div className="pt-2">
              <Label className="text-xs text-gray-500">Full Address</Label>
              <Textarea name="address" defaultValue={company?.address} placeholder="Street, Building, etc." className="mt-1" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={company?.briefIntroduction} className="min-h-[100px]" />
          </div>

          <div className="space-y-3">
            <Label>Keywords (SEO)</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-gray-50 min-h-[60px]">
              {keywords.map(tag => (
                <Badge key={tag} variant="secondary" className="px-2 py-1 flex items-center gap-1 bg-white border-gray-200 text-gray-700">
                  {tag} <button type="button" onClick={() => removeKeyword(tag)} className="hover:text-red-500 ml-1"><X className="h-3 w-3" /></button>
                </Badge>
              ))}
              <input value={keywordInput} onChange={e => setKeywordInput(e.target.value)} onKeyDown={handleAddKeyword} placeholder="Type tag & hit Enter..." className="flex-1 bg-transparent border-none outline-none text-sm" />
            </div>
            <input type="hidden" name="keywords" value={keywords.join(',')} />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center"><Label>Company Showcase</Label><span className="text-xs text-gray-500">{galleryItems.length}/6 images</span></div>
            <div className="grid grid-cols-4 gap-3">
              {galleryItems.map((item) => (
                <div key={item.id} className="relative aspect-square rounded-md border overflow-hidden group bg-gray-50">
                  <Image src={item.url} alt="Preview" fill className="object-cover" />
                  <button type="button" onClick={() => removeGalleryImage(item.id)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500"><X className="h-3 w-3" /></button>
                </div>
              ))}
              {galleryItems.length < 6 && (
                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 hover:border-[#0ABED6]">
                  <ImagePlus className="h-6 w-6 text-gray-400 mb-1" />
                  <input ref={galleryInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryChange} />
                </label>
              )}
            </div>
          </div>

          {/* ✅ 3. RESTRICTED SECTION: Hidden for DATA_ENTRY role */}
          {userRole !== 'DATA_ENTRY' && (
            <div className="flex flex-col gap-3 border p-4 rounded-md bg-gray-50/50">
              <div className="flex items-center space-x-2">
                <Checkbox id="claimed" checked={isClaimed} onCheckedChange={(c) => setIsClaimed(c as boolean)} />
                <Label htmlFor="claimed" className="text-sm font-medium">Business Claimed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="domainVerified" checked={isDomainVerified} onCheckedChange={(c) => setIsDomainVerified(c as boolean)} />
                <Label htmlFor="domainVerified" className="text-sm font-medium flex items-center gap-2">
                  Domain Verified
                </Label>
              </div>
            </div>
          )}

          {state?.error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{state.error}</div>}

          <div className="pt-2"><SubmitButton isEdit={isEdit} /></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}