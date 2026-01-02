"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Trash } from "lucide-react";
import { toast } from "sonner"; 

interface SimpleImageUploadProps {
  onChange: (url: string) => void;
  onRemove: () => void;
  value: string;
}

export default function SimpleImageUpload({ onChange, onRemove, value }: SimpleImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    
    // ⚠️ REPLACE WITH YOUR UNSIGNED PRESET NAME
    formData.append("upload_preset", "blog_upload");
    
    try {
      // 1. DEBUG: Check if the Env Variable is actually being read
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      console.log("Debug: Using Cloud Name:", cloudName); // Check your browser console for this!

      if (!cloudName) {
        throw new Error("Cloud Name is missing. Check your .env file and restart the server.");
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await response.json();

      if (!response.ok) {
        // Cloudinary errors are usually nested in data.error.message
        throw new Error(data.error?.message || "Upload failed with status " + response.status);
      }

      if (data.secure_url) {
        onChange(data.secure_url);
        toast.success("Image uploaded successfully");
      }
    } catch (error: any) {
      console.error("Upload Error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative w-full max-w-sm aspect-video rounded-lg overflow-hidden border bg-gray-100 group">
           <img src={value} alt="Uploaded" className="object-cover w-full h-full" />
           <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
             <Button type="button" variant="destructive" size="sm" onClick={() => onRemove()}>
               <Trash className="h-4 w-4 mr-2" /> Remove
             </Button>
           </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Input 
             type="file" 
             accept="image/*"
             disabled={uploading}
             onChange={handleFileChange}
             className="max-w-xs cursor-pointer"
          />
          {uploading && (
             <div className="flex items-center text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Uploading...
             </div>
          )}
        </div>
      )}
    </div>
  );
}