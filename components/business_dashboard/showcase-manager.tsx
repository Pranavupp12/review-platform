"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
// ✅ Import the new upload action
import { 
  updateCompanyType, addShowcaseItem, updateShowcaseItem, deleteShowcaseItem, uploadShowcaseImage 
} from "@/lib/showcase-actions"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Package, Briefcase, Lock, Plus, Trash2, ImageIcon, 
  ExternalLink, Pencil, AlertTriangle, Loader2 
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Prisma } from "@prisma/client"; 

type CompanyWithShowcase = Prisma.CompanyGetPayload<{
  include: { showcaseItems: true }
}>;

interface ShowcaseManagerProps {
  company: CompanyWithShowcase;
}

export function ShowcaseManager({ company }: ShowcaseManagerProps) {
  const [showcasePending, setShowcasePending] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [newItemImages, setNewItemImages] = useState<string[]>([]);
  
  // ✅ New Upload State
  const [isUploading, setIsUploading] = useState(false);
  
  const hasAccess = company.plan === "GROWTH" || company.plan === "SCALE" || company.plan === "CUSTOM";
  const companyType = company.companyType || "SERVICE";
  const isTypeLocked = !!company.companyType; 

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: { name: "", description: "", linkUrl: "" }
  });

  // --- ACTIONS ---

  const onTypeChange = async (val: string) => {
    toast.promise(updateCompanyType(company.id, val as any), {
        loading: "Setting business type...",
        success: "Type set successfully",
        error: "Failed to update"
    });
  };

  // ✅ Handle File Input Change
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB Limit check
         toast.error("File size too large (Max 5MB)");
         return;
    }

    setIsUploading(true);
    
    // Create FormData to send file to server action
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadShowcaseImage(formData);

    if (result.success && result.url) {
        setNewItemImages((prev) => [...prev, result.url!]);
        toast.success("Image uploaded");
    } else {
        toast.error("Upload failed");
    }
    
    // Reset input value so same file can be selected again if deleted
    e.target.value = ""; 
    setIsUploading(false);
  };

  const handleEdit = (item: any) => {
      setEditingId(item.id);
      setValue("name", item.name);
      setValue("description", item.description);
      setValue("linkUrl", item.linkUrl || "");
      setNewItemImages(item.images || []);
      setModalOpen(true);
  };

  const handleCreate = () => {
      setEditingId(null);
      reset();
      setNewItemImages([]);
      setModalOpen(true);
  };

  const onShowcaseSubmit = async (data: any) => {
    setShowcasePending(true);
    let result;
    if (editingId) {
        result = await updateShowcaseItem(editingId, { ...data, images: newItemImages });
    } else {
        result = await addShowcaseItem(company.id, { ...data, images: newItemImages, type: companyType });
    }

    if (result.success) {
        toast.success(editingId ? "Item updated" : "Item added");
        setModalOpen(false);
        reset();
        setNewItemImages([]);
        setEditingId(null);
    } else {
        toast.error("Operation failed");
    }
    setShowcasePending(false);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setShowcasePending(true);
    try {
        await deleteShowcaseItem(itemToDelete);
        toast.success("Item deleted");
        setDeleteModalOpen(false);
        setItemToDelete(null);
    } catch (error) {
        toast.error("Failed to delete item");
    }
    setShowcasePending(false);
  };

  const filteredItems = company.showcaseItems?.filter(item => item.type === companyType) || [];

  return (
    <div className="space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
            <div>
                <h1 className="text-2xl font-bold text-[#000032] flex items-center gap-2">
                    {companyType === 'PRODUCT' ? <Package className="h-6 w-6 text-[#0ABED6]" /> : <Briefcase className="h-6 w-6 text-[#0ABED6]" />}
                    {companyType === 'PRODUCT' ? 'Product Inventory' : 'Service Menu'}
                </h1>
                <p className="text-gray-500 mt-1">Manage the items displayed on your public profile.</p>
            </div>
            {!hasAccess && (
                <div className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 self-start">
                    <Lock className="h-3 w-3" /> Upgrade to Unlock
                </div>
            )}
        </div>

        {!hasAccess ? (
            <div className="p-12 border border-dashed rounded-xl bg-gray-50 text-center flex flex-col items-center justify-center gap-4">
               {/* ... Locked UI ... */}
               <div className="p-4 bg-white rounded-full shadow-sm"><Lock className="h-8 w-8 text-gray-400" /></div>
               <h3 className="font-bold text-gray-900">Feature Locked</h3>
               {/* ... */}
            </div>
        ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                
                {/* 1. CONFIGURATION CARD */}
                <div className="bg-white p-6 border rounded-xl shadow-sm space-y-4">
                     {/* ... Business Type Radio Group ... */}
                     <div className="flex justify-between items-start">
                        <Label className="block font-semibold text-gray-700">Business Type Configuration</Label>
                        {isTypeLocked && (
                            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                                <Lock className="h-3 w-3" /><span>Selection Locked</span>
                            </div>
                        )}
                    </div>
                    <RadioGroup defaultValue={companyType} onValueChange={onTypeChange} disabled={isTypeLocked} className="flex gap-4">
                         {/* ... Radio Options ... */}
                         <div className={`flex items-center space-x-2 border rounded-lg p-3 flex-1 transition-colors ${isTypeLocked ? 'bg-gray-50 opacity-80 cursor-not-allowed' : 'bg-white hover:bg-gray-50 cursor-pointer'}`}>
                            <RadioGroupItem value="SERVICE" id="r-service" />
                            <Label htmlFor="r-service" className="flex items-center gap-2 w-full cursor-pointer"><Briefcase className="h-4 w-4 text-blue-500" /> Service Based</Label>
                        </div>
                        <div className={`flex items-center space-x-2 border rounded-lg p-3 flex-1 transition-colors ${isTypeLocked ? 'bg-gray-50 opacity-80 cursor-not-allowed' : 'bg-white hover:bg-gray-50 cursor-pointer'}`}>
                            <RadioGroupItem value="PRODUCT" id="r-product" />
                            <Label htmlFor="r-product" className="flex items-center gap-2 w-full cursor-pointer"><Package className="h-4 w-4 text-orange-500" /> Product Based</Label>
                        </div>
                    </RadioGroup>
                    {!isTypeLocked && <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded border border-blue-100"><AlertTriangle className="h-4 w-4 inline mr-2"/>Choose carefully. Setting locks on adding items.</div>}
                </div>

                {/* 2. TABLE CARD */}
                <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-semibold text-gray-700">All Items ({filteredItems.length})</h3>
                        <Button onClick={handleCreate} className="bg-[#0ABED6] hover:bg-[#09A8BD] text-white shadow-sm">
                            <Plus className="h-4 w-4 mr-2" /> Add Item
                        </Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                {companyType === 'PRODUCT' && <TableHead className="w-[80px]">Image</TableHead>}
                                <TableHead className="w-[200px]">Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {/* ... Table Rows Mapping ... */}
                             {filteredItems.map((item: any) => (
                                <TableRow key={item.id} className="group">
                                    {companyType === 'PRODUCT' && (
                                        <TableCell>
                                            {item.images?.[0] ? <div className="relative h-10 w-10 rounded overflow-hidden bg-gray-100 border"><Image src={item.images[0]} alt="img" fill className="object-cover" /></div> : <div className="h-10 w-10 bg-gray-50 rounded flex items-center justify-center border border-dashed"><ImageIcon className="h-4 w-4 text-gray-300" /></div>}
                                        </TableCell>
                                    )}
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{item.name}</span>
                                            {item.linkUrl && <a href={item.linkUrl} target="_blank" className="flex items-center text-xs text-blue-500 hover:underline mt-0.5">View Link <ExternalLink className="h-3 w-3 ml-1" /></a>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-500 max-w-[300px]"><p className="line-clamp-2 text-sm">{item.description}</p></TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="h-8 w-8 text-gray-500 hover:text-blue-600"><Pencil className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(item.id)} className="h-8 w-8 text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                             ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        )}

        {/* --- MODAL --- */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editingId ? "Edit" : "Add"} {companyType === 'SERVICE' ? 'Service' : 'Product'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                    <div>
                        <Label>Name</Label>
                        <Input {...register("name", { required: true })} placeholder={`e.g. ${companyType === 'SERVICE' ? 'Web Design' : 'Ergonomic Chair'}`} />
                    </div>
                    
                    <div>
                        <Label>Description</Label>
                        <Textarea {...register("description", { required: true })} placeholder="Describe features and benefits..." />
                    </div>

                    {companyType === 'PRODUCT' && (
                        <>
                            <div>
                                <Label>Link URL <span className="text-gray-400 font-normal">(Optional)</span></Label>
                                <Input {...register("linkUrl")} placeholder="https://..." type="url" />
                            </div>

                            {/* ✅ UPDATED IMAGE UPLOAD SECTION */}
                            <div>
                                <Label className="mb-3 block font-semibold text-sm">Product Images (Max 2)</Label>
                                <div className="flex gap-4">
                                    {/* Existing Images */}
                                    {newItemImages.map((img, i) => (
                                        <div key={i} className="relative h-24 w-24 rounded-lg overflow-hidden border border-gray-200 group">
                                            <Image src={img} alt="Product" fill className="object-cover" />
                                            <button type="button" onClick={() => setNewItemImages(prev => prev.filter((_, index) => index !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Upload Trigger - Styled like previous widget but uses Input */}
                                    {newItemImages.length < 2 && (
                                        <div className="relative border-2 border-dashed border-gray-200 rounded-lg h-24 w-24 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-colors">
                                            {isUploading ? (
                                                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                                            ) : (
                                                <>
                                                    <ImageIcon className="h-6 w-6 text-gray-400 mb-1" />
                                                    <span className="text-[10px] text-gray-500 font-medium">Upload</span>
                                                    {/* Hidden File Input */}
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        onChange={handleImageUpload} 
                                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                                        title="Upload Image"
                                                    />
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    <Button onClick={handleSubmit(onShowcaseSubmit)} className="w-full bg-[#0ABED6] hover:bg-[#09A8BD]" disabled={showcasePending || isUploading}>
                        {showcasePending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : editingId ? "Update Item" : "Create Item"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>

        {/* --- DELETE CONFIRMATION DIALOG --- */}
        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Delete Item</DialogTitle>
                    <DialogDescription>Are you sure you want to delete this item? This action cannot be undone.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={confirmDelete} disabled={showcasePending}>
                        {showcasePending ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}