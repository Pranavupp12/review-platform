"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendDomainVerification } from "@/lib/actions";
import { Loader2, Mail, Send } from "lucide-react";
import { toast } from "sonner";

export function VerifyDomainForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    const res = await sendDomainVerification(formData);
    setLoading(false);

    if (res.success) {
      setSent(true);
      toast.success("Verification email sent!");
    } else {
      toast.error(res.error || "Failed to send email");
    }
  };

  if (sent) {
    return (
      <div className="bg-white p-4 rounded-lg border border-amber-200 text-sm text-amber-900 text-center animate-in fade-in">
        <Mail className="h-6 w-6 mx-auto mb-2 text-amber-600" />
        <strong>Email Sent!</strong>
        <p className="mt-1 text-xs text-gray-600">Check your inbox for the link.</p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3">
      <Input 
        name="companyEmail" 
        placeholder="name@company.com" 
        className="bg-white border-amber-200 focus-visible:ring-amber-500 h-9 text-sm" 
        required 
        type="email"
      />
      <Button size="sm" type="submit" disabled={loading} className="bg-[#000032] hover:bg-[#000032]/80 text-white w-full h-9">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
        Send Verification Link
      </Button>
    </form>
  );
}