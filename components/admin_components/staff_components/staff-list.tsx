"use client";

import { deleteStaffAccount, editStaffAccount } from "@/lib/admin-staff-actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, 
  DialogDescription, DialogFooter, DialogClose 
} from "@/components/ui/dialog";
// ✅ Import Select components for the Edit Form
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Trash2, Edit, Loader2, AlertTriangle, Shield, PenTool } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export function StaffList({ staff }: { staff: any[] }) {
  
  return (
    <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                No staff members found.
              </TableCell>
            </TableRow>
          ) : (
            staff.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {/* ✅ Updated Role Badges */}
                  {user.role === "BLOG_ENTRY" ? (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200 gap-1 border-purple-200">
                       <PenTool className="h-3 w-3" /> Blog Writer
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 gap-1 border-blue-200">
                       <Shield className="h-3 w-3" /> Data Entry
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right flex justify-end gap-2">
                  
                  {/* Edit Dialog */}
                  <EditStaffDialog user={user} />
                  
                  {/* Delete Dialog */}
                  <DeleteStaffDialog userId={user.id} userName={user.name} />

                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// --- SUB-COMPONENT: EDIT DIALOG (UPDATED) ---
function EditStaffDialog({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleEdit(formData: FormData) {
    setLoading(true);
    // Append ID manually if not using hidden input for everything
    // formData.append("id", user.id); 
    
    const res = await editStaffAccount(formData);
    setLoading(false);
    
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Details updated successfully.");
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon"><Edit className="h-4 w-4 text-gray-500" /></Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Edit Staff Details</DialogTitle></DialogHeader>
        <form action={handleEdit} className="space-y-4">
          <input type="hidden" name="id" value={user.id} />
          
          <div className="space-y-2">
            <Label>Name</Label>
            <Input name="name" defaultValue={user.name} required />
          </div>
          
          <div className="space-y-2">
            <Label>Email</Label>
            <Input name="email" defaultValue={user.email} required />
          </div>

          {/* ✅ NEW: Role Selection Dropdown */}
          <div className="space-y-2">
            <Label>Role</Label>
            <Select name="role" defaultValue={user.role} required>
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DATA_ENTRY">Data Entry (Companies)</SelectItem>
                <SelectItem value="BLOG_ENTRY">Content Writer (Blogs)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>New Password (Optional)</Label>
            <Input name="password" type="password" placeholder="Leave blank to keep current" />
          </div>

          <Button type="submit" className="w-full bg-[#0ABED6] hover:bg-[#09accl]" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- SUB-COMPONENT: DELETE DIALOG (UNCHANGED) ---
function DeleteStaffDialog({ userId, userName }: { userId: string, userName: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const res = await deleteStaffAccount(userId);
    setLoading(false);
    
    if (res?.error) toast.error(res.error);
    else {
      toast.success("Account deleted.");
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
           <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
             <AlertTriangle className="h-5 w-5" /> Confirm Deletion
          </DialogTitle>
          <DialogDescription>
             Are you sure you want to delete the account for <strong>{userName}</strong>?
             <br />This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 justify-end mt-4">
           <DialogClose asChild>
             <Button variant="outline" className="hover:bg-gray-100" disabled={loading}>Cancel</Button>
           </DialogClose>
           <Button 
             onClick={handleDelete} 
             variant="destructive" 
             disabled={loading}
             className="bg-red-600 hover:bg-red-700"
           >
             {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
             {loading ? "Deleting..." : "Delete Account"}
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}