"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { submitQuoteRequest } from "@/lib/lead-actions";

interface RequestQuoteCardProps {
  companyId: string;
  companyName: string;
}

export function RequestQuoteCard({ companyId, companyName }: RequestQuoteCardProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await submitQuoteRequest(companyId, formData);

    setLoading(false);

    if (result.success) {
      setOpen(false);
      toast.success("Request Sent!", {
        description: "The company has received your details and will contact you shortly."
      });
    } else {
      toast.error("Error", {
        description: result.error || "Something went wrong."
      });
    }
  }

  return (
    <>
      <Card className="border-blue-100 rounded-none overflow-hidden ">
        <CardContent className="px-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-[#0ABED6]/20 p-2 rounded-full">
              <FileText className="h-6 w-6 text-[#0ABED6]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Get a Quote</h3>
              <p className="text-xs text-gray-500">Direct response from the company</p>
            </div>
          </div>
          <Button 
            className="w-full bg-[#0ABED6] hover:bg-[#0ABED6]/80 text-white font-semibold"
            onClick={() => setOpen(true)}
          >
            Request a Quote
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Quote from {companyName}</DialogTitle>
            <DialogDescription>
              Share your requirements and contact details. {companyName} will get back to you shortly.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="john@example.com" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="details">Details / Requirements</Label>
              <Textarea 
                id="details" 
                name="details" 
                placeholder="Hi, I am looking for a quote regarding..." 
                className="min-h-[120px]"
                required 
              />
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="ghost" className="hover:bg-gray-100 hover:text-black" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0ABED6] hover:bg-[#0ABED6]/80" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Send Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}