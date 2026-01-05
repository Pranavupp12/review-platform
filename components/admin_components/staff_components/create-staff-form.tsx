"use client";

import { createStaffAccount } from "@/lib/admin-staff-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      // Optional: Reset form logic here via ref or key
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