"use client";

import { useState, useEffect, useActionState } from "react";
import { createCategory, deleteCategory, createSubCategory, deleteSubCategory } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ChevronRight, ChevronDown, FolderTree, Layers } from "lucide-react";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/admin_components/delete-category-dialog"; // ✅ Import the dialog

// --- Form Component (Unchanged) ---
interface ActionState {
  error?: string;
  success?: boolean;
}

function AddItemForm({ action, placeholder, hiddenName, hiddenValue }: any) {
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(action, null);
  
  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    } else if (state?.success) {
      toast.success("Item created successfully");
      // Optional: Reset form could be handled by a ref here if needed
    }
  }, [state]);

  return (
    <form action={formAction} className="flex gap-2 mt-2">
      {hiddenName && <input type="hidden" name={hiddenName} value={hiddenValue} />}
      <Input name="name" placeholder={placeholder} required className="h-9 text-sm" />
      <Button size="sm" type="submit" disabled={isPending} className="bg-[#0ABED6] hover:bg-[#09A8BD]">
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  );
}

// --- Main Manager Component ---

export function CategoryManager({ categories }: { categories: any[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // ✅ State for Deletion Logic
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [subCategoryToDelete, setSubCategoryToDelete] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // ✅ Handler: Confirm Delete Category
  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setDeleteLoading(true);
    
    const res = await deleteCategory(categoryToDelete);
    
    setDeleteLoading(false);
    setCategoryToDelete(null); // Close dialog

    if(res.error) toast.error(res.error);
    else toast.success("Category deleted");
  };

  // ✅ Handler: Confirm Delete Sub-Category
  const confirmDeleteSubCategory = async () => {
    if (!subCategoryToDelete) return;
    setDeleteLoading(true);

    const res = await deleteSubCategory(subCategoryToDelete);

    setDeleteLoading(false);
    setSubCategoryToDelete(null); // Close dialog

    if(res.error) toast.error(res.error);
    else toast.success("Subcategory deleted");
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Add Main Category Block */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-[#000032] mb-4 flex items-center gap-2">
           <Layers className="h-5 w-5 text-[#0ABED6]" /> Add Main Category
        </h3>
        <div className="max-w-md">
           <AddItemForm action={createCategory} placeholder="e.g. Software & Tech" />
        </div>
      </div>

      {/* 2. List Categories */}
      <div className="grid gap-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            
            <div className="flex items-center justify-between p-4 bg-gray-50/50">
               <button 
                 onClick={() => toggleExpand(category.id)}
                 className="flex items-center gap-3 font-bold text-[#000032] hover:text-[#0ABED6] transition-colors"
               >
                 {expanded[category.id] ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                 {category.name}
                 <span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                   {category.subCategories.length}
                 </span>
               </button>

               <Button 
                 variant="ghost" 
                 size="icon" 
                 // ✅ Instead of confirm(), we set state to open dialog
                 onClick={() => setCategoryToDelete(category.id)}
                 className="text-gray-400 hover:text-red-500 hover:bg-red-50"
               >
                 <Trash2 className="h-4 w-4" />
               </Button>
            </div>

            {expanded[category.id] && (
              <div className="p-4 border-t border-gray-100 bg-white animate-in slide-in-from-top-2">
                 
                 <div className="space-y-2 mb-4 pl-4 border-l-2 border-gray-100">
                    {category.subCategories.length === 0 && (
                      <p className="text-sm text-gray-400 italic">No subcategories yet.</p>
                    )}
                    
                    {category.subCategories.map((sub: any) => (
                       <div key={sub.id} className="flex items-center justify-between group">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                             <FolderTree className="h-3 w-3 text-gray-400" />
                             {sub.name}
                          </div>
                          <button 
                            // ✅ Instead of confirm(), we set state to open dialog
                            onClick={() => setSubCategoryToDelete(sub.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                       </div>
                    ))}
                 </div>

                 <div className="pl-4">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Add Subcategory</p>
                    <div className="max-w-sm">
                      <AddItemForm 
                        action={createSubCategory} 
                        placeholder={`Add to ${category.name}...`} 
                        hiddenName="categoryId" 
                        hiddenValue={category.id} 
                      />
                    </div>
                 </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ✅ 3. Render Dialogs Controlled by State */}
      
      {/* Category Delete Dialog */}
      <DeleteDialog 
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={confirmDeleteCategory}
        loading={deleteLoading}
        title="Delete Category?"
        description="This action cannot be undone. All subcategories inside this category will also be permanently deleted."
      />

      {/* SubCategory Delete Dialog */}
      <DeleteDialog 
        isOpen={!!subCategoryToDelete}
        onClose={() => setSubCategoryToDelete(null)}
        onConfirm={confirmDeleteSubCategory}
        loading={deleteLoading}
        title="Delete Subcategory?"
        description="Are you sure you want to remove this subcategory? This action cannot be undone."
      />

    </div>
  );
}