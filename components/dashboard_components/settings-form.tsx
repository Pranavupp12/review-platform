"use client";

import React, { useActionState, useState, useRef } from 'react';
import { updateUserProfile } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, User } from "lucide-react";
import { useFormStatus } from "react-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="bg-[#0ABED6] hover:bg-[#09A8BD] text-white w-full md:w-auto" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Save Changes
    </Button>
  );
}

export function SettingsForm({ user }: { user: any }) {
  const [state, formAction] = useActionState(updateUserProfile, null);
  
  // Image Preview State
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.image);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a temporary URL for preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  return (
    <form action={formAction} className="space-y-8 max-w-2xl">
      
      {/* --- IMAGE UPLOAD SECTION --- */}
      <div className="flex flex-col items-center sm:flex-row gap-6 p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
          <AvatarImage src={previewUrl || ''} className="object-cover" />
          <AvatarFallback className="text-2xl font-bold bg-gray-200 text-gray-500">
             {user.name?.[0]?.toUpperCase() || <User />}
          </AvatarFallback>
        </Avatar>
        
        <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-medium text-gray-900">Profile Picture</h3>
            <p className="text-xs text-gray-500">Supports JPG, PNG or GIF. Max size 5MB.</p>
            
            <div className="flex gap-2 justify-center sm:justify-start">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="h-4 w-4 mr-2" /> Upload New
                </Button>
                <Input 
                  ref={fileInputRef}
                  type="file" 
                  name="image" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
            </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
          {/* Name Input */}
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" name="name" defaultValue={user.name || ''} required />
          </div>

          {/* Country Select */}
          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Select name="country" defaultValue={user.country || undefined}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="UK">United Kingdom</SelectItem>
                <SelectItem value="IN">India</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Gender Select (New) */}
          <div className="grid gap-2">
            <Label htmlFor="gender">Gender</Label>
            <Select name="gender" defaultValue={user.gender || undefined}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Non-binary">Non-binary</SelectItem>
                <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Read Only Email */}
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="email" className="text-muted-foreground">Email</Label>
            <Input id="email" value={user.email || ''} disabled className="bg-gray-50 text-gray-500" />
          </div>
      </div>

      {state?.error && (
        <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md border border-red-100">{state.error}</p>
      )}
      
      {state?.success && (
        <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
          Profile updated successfully!
        </p>
      )}

      <div className="pt-4 border-t">
          <SubmitButton />
      </div>
    </form>
  );
}