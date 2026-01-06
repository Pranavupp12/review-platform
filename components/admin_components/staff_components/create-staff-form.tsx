"use client";

import { createStaffAccount } from "@/lib/admin-staff-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // ✅ Import Select components
import { toast } from "sonner";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";

export function CreateStaffForm() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    const res = await createStaffAccount(formData);
    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Staff account created successfully!");
      // Optional: You can reload the page to refresh the list
      window.location.reload(); 
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add New Staff</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="space-y-4">
          
          <div className="space-y-2">
            <Label>Name</Label>
            <Input name="name" placeholder="John Doe" required />
          </div>
          
          <div className="space-y-2">
            <Label>Email</Label>
            <Input name="email" type="email" placeholder="staff@company.com" required />
          </div>

          {/* ✅ NEW: Role Selection Dropdown */}
          <div className="space-y-2">
            <Label>Assign Role</Label>
            <Select name="role" defaultValue="DATA_ENTRY" required>
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DATA_ENTRY">Data Entry (Companies Only)</SelectItem>
                <SelectItem value="BLOG_ENTRY">Content Writer (Blogs Only)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <Input name="password" type="password" placeholder="******" required />
          </div>

          <Button type="submit" className="w-full bg-[#0ABED6] hover:bg-[#0ABED6]/80" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Create Account
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}