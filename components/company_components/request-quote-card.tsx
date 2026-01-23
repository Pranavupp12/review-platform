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
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";
import { useTranslation } from "@/components/shared/translation-context";
import { translateContent } from "@/lib/translation-action";

interface RequestQuoteCardProps {
  companyId: string;
  companyName: string;
}

export function RequestQuoteCard({ companyId, companyName }: RequestQuoteCardProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { targetLang } = useTranslation();

  // Custom hook logic for placeholder translation if needed
  const useTranslatedPlaceholder = (text: string) => {
      const [translated, setTranslated] = useState(text);
      useState(() => {
        if (targetLang === 'en') return;
        translateContent(text, targetLang).then(res => {
             if(res.translation) setTranslated(res.translation)
        });
      });
      return translated;
  };

  const namePlaceholder = useTranslatedPlaceholder("John Doe");
  const emailPlaceholder = useTranslatedPlaceholder("john@example.com");
  const detailsPlaceholder = useTranslatedPlaceholder("Hi, I am looking for a quote regarding...");

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
              <h3 className="font-bold text-gray-900">
                <TranslatableText text="Get a Quote" />
              </h3>
              <p className="text-xs text-gray-500">
                <TranslatableText text="Direct response from the company" />
              </p>
            </div>
          </div>
          <Button 
            className="w-full bg-[#0ABED6]  rounded-full hover:bg-[#0ABED6]/80 text-white font-semibold"
            onClick={() => setOpen(true)}
          >
            <TranslatableText text="Request a Quote" />
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
                <TranslatableText text="Request Quote from" /> {companyName}
            </DialogTitle>
            <DialogDescription>
              <TranslatableText text="Share your requirements and contact details." /> {companyName} <TranslatableText text="will get back to you shortly." />
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                    <TranslatableText text="Full Name" />
                </Label>
                <Input id="name" name="name" placeholder={namePlaceholder} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                    <TranslatableText text="Email Address" />
                </Label>
                <Input id="email" name="email" type="email" placeholder={emailPlaceholder} required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="details">
                 <TranslatableText text="Details / Requirements" />
              </Label>
              <Textarea 
                id="details" 
                name="details" 
                placeholder={detailsPlaceholder} 
                className="min-h-[120px]"
                required 
              />
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="ghost" className="hover:bg-gray-100 hover:text-black" onClick={() => setOpen(false)}>
                <TranslatableText text="Cancel" />
              </Button>
              <Button type="submit" className="bg-[#0ABED6] hover:bg-[#0ABED6]/80" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> <TranslatableText text="Sending..." />
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> <TranslatableText text="Send Request" />
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