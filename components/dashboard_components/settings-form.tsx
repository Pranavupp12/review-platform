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
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="bg-[#0ABED6] hover:bg-[#09A8BD] text-white w-full md:w-auto" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      <TranslatableText text="Save Changes" />
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
            <h3 className="font-medium text-gray-900">
                <TranslatableText text="Profile Picture" />
            </h3>
            <p className="text-xs text-gray-500">
                <TranslatableText text="Supports JPG, PNG or GIF. Max size 5MB." />
            </p>
            
            <div className="flex gap-2 justify-center sm:justify-start">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="h-4 w-4 mr-2" /> <TranslatableText text="Upload New" />
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
            <Label htmlFor="name">
                <TranslatableText text="Display Name" />
            </Label>
            <Input id="name" name="name" defaultValue={user.name || ''} required />
          </div>

          {/* Country Select */}
          <div className="grid gap-2">
            <Label htmlFor="country">
                <TranslatableText text="Country" />
            </Label>
            <Select name="country" defaultValue={user.country || undefined}>
              <SelectTrigger>
                <SelectValue placeholder={<TranslatableText text="Select country" />} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US"><TranslatableText text="United States" /></SelectItem>
                <SelectItem value="UK"><TranslatableText text="United Kingdom" /></SelectItem>
                <SelectItem value="IN"><TranslatableText text="India" /></SelectItem>
                <SelectItem value="CA"><TranslatableText text="Canada" /></SelectItem>
                <SelectItem value="AU"><TranslatableText text="Australia" /></SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Gender Select */}
          <div className="grid gap-2">
            <Label htmlFor="gender">
                <TranslatableText text="Gender" />
            </Label>
            <Select name="gender" defaultValue={user.gender || undefined}>
              <SelectTrigger>
                <SelectValue placeholder={<TranslatableText text="Select gender" />} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male"><TranslatableText text="Male" /></SelectItem>
                <SelectItem value="Female"><TranslatableText text="Female" /></SelectItem>
                <SelectItem value="Non-binary"><TranslatableText text="Non-binary" /></SelectItem>
                <SelectItem value="Prefer not to say"><TranslatableText text="Prefer not to say" /></SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Read Only Email */}
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="email" className="text-muted-foreground">
                <TranslatableText text="Email" />
            </Label>
            <Input id="email" value={user.email || ''} disabled className="bg-gray-50 text-gray-500" />
          </div>
      </div>

      {state?.error && (
        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md border border-red-100">
            <TranslatableText text={state.error} />
        </div>
      )}
      
      {state?.success && (
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
          <TranslatableText text="Profile updated successfully!" />
        </div>
      )}

      <div className="pt-4 border-t">
          <SubmitButton />
      </div>
    </form>
  );
}