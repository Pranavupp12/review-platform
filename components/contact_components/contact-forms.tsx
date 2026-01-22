"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createSupportTicket } from "@/lib/actions";
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";
import { useTranslation } from "@/components/shared/translation-context";
import { translateContent } from "@/lib/translation-action";

export type ContactType = "review" | "technical" | "business" | null;

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ContactType;
}

// --- Common Schema Fields ---
const commonFields = {
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Please provide more details (min 10 chars)"),
};

// Hook to translate placeholders
const useTranslatedPlaceholder = (text: string) => {
    const { targetLang } = useTranslation();
    const [translated, setTranslated] = useState(text);
    
    useEffect(() => {
      if (targetLang === 'en') {
          setTranslated(text);
          return;
      }
      let isMounted = true;
      translateContent(text, targetLang).then(res => {
           if(isMounted && res.translation) setTranslated(res.translation)
      });
      return () => { isMounted = false; };
    }, [targetLang, text]);
    
    return translated;
};

// ---------------------------
// 1. REVIEW SUPPORT FORM
// ---------------------------
const reviewFormSchema = z.object({
  ...commonFields,
  reviewAuthor: z.string().min(2, "Review author name is required"), 
  reviewTitle: z.string().min(2, "Review title is required"),
  issueType: z.enum(["report_fake", "editing_issue", "removal_request", "other"]),
});

function ReviewSupportForm({ onSuccess }: { onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof reviewFormSchema>>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { 
        name: "", 
        email: "", 
        message: "", 
        reviewAuthor: "", 
        reviewTitle: "" 
    },
  });

  // Translated Placeholders
  const authorPlaceholder = useTranslatedPlaceholder("e.g. John Doe");
  const titlePlaceholder = useTranslatedPlaceholder("e.g. 'Great Service!'");
  const descPlaceholder = useTranslatedPlaceholder("Describe the situation...");

  async function onSubmit(data: z.infer<typeof reviewFormSchema>) {
    setIsSubmitting(true);
    const result = await createSupportTicket({ ...data, type: "REVIEW" });
    if (result.success) {
        toast.success("Request submitted successfully.");
        onSuccess();
    } else {
        toast.error("Failed to submit. Please try again.");
    }
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
                <FormLabel><TranslatableText text="Your Name" /></FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
                <FormLabel><TranslatableText text="Your Email" /></FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="issueType" render={({ field }) => (
          <FormItem>
            <FormLabel><TranslatableText text="Issue Type" /></FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                  <SelectTrigger>
                      <SelectValue placeholder={<TranslatableText text="Select issue" />} />
                  </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="report_fake"><TranslatableText text="Report Fake/Suspicious Review" /></SelectItem>
                <SelectItem value="editing_issue"><TranslatableText text="Trouble Editing My Review" /></SelectItem>
                <SelectItem value="removal_request"><TranslatableText text="Request Review Removal" /></SelectItem>
                <SelectItem value="other"><TranslatableText text="Other" /></SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                <TranslatableText text="Which review are you referring to?" />
            </p>
            
            <FormField control={form.control} name="reviewAuthor" render={({ field }) => (
            <FormItem>
                <FormLabel className="text-xs"><TranslatableText text="Review Author Name" /></FormLabel>
                <FormControl><Input placeholder={authorPlaceholder} className="bg-white" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
            )} />
            
            <FormField control={form.control} name="reviewTitle" render={({ field }) => (
            <FormItem>
                <FormLabel className="text-xs"><TranslatableText text="Review Title" /></FormLabel>
                <FormControl><Input placeholder={titlePlaceholder} className="bg-white" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
            )} />
        </div>

        <FormField control={form.control} name="message" render={({ field }) => (
          <FormItem>
              <FormLabel><TranslatableText text="Additional Details" /></FormLabel>
              <FormControl><Textarea placeholder={descPlaceholder} className="resize-none" {...field} /></FormControl>
              <FormMessage />
          </FormItem>
        )} />
        
        <Button type="submit" className="w-full bg-[#0ABED6] hover:bg-[#09A8BD]" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} <TranslatableText text="Submit Request" />
        </Button>
      </form>
    </Form>
  );
}

// ---------------------------
// 2. TECHNICAL SUPPORT FORM
// ---------------------------
const techFormSchema = z.object({
  ...commonFields,
  deviceInfo: z.string().optional(),
  category: z.enum(["account_setup", "login_issue", "bug_report", "feature_request"]),
});

function TechnicalSupportForm({ onSuccess }: { onSuccess: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<z.infer<typeof techFormSchema>>({
      resolver: zodResolver(techFormSchema),
      defaultValues: { name: "", email: "", message: "", deviceInfo: "" },
    });

    const devicePlaceholder = useTranslatedPlaceholder("e.g., Chrome on Windows");
    const msgPlaceholder = useTranslatedPlaceholder("Describe the steps to reproduce the issue...");
  
    async function onSubmit(data: z.infer<typeof techFormSchema>) {
      setIsSubmitting(true);
      const result = await createSupportTicket({ ...data, type: "TECHNICAL" });
      if (result.success) {
          toast.success("Support ticket created.");
          onSuccess();
      } else {
          toast.error("Failed to submit.");
      }
      setIsSubmitting(false);
    }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel><TranslatableText text="Name" /></FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel><TranslatableText text="Account Email" /></FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
        <FormField control={form.control} name="category" render={({ field }) => (
          <FormItem>
            <FormLabel><TranslatableText text="Category" /></FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder={<TranslatableText text="Select category" />} /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="account_setup"><TranslatableText text="Account Setup & Verification" /></SelectItem>
                <SelectItem value="login_issue"><TranslatableText text="Login or Password Issue" /></SelectItem>
                <SelectItem value="bug_report"><TranslatableText text="Report a Bug/Error" /></SelectItem>
                <SelectItem value="feature_request"><TranslatableText text="Feature Request" /></SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="deviceInfo" render={({ field }) => (
          <FormItem>
              <FormLabel><TranslatableText text="Browser/Device (Optional)" /></FormLabel>
              <FormControl><Input placeholder={devicePlaceholder} {...field} /></FormControl>
              <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="message" render={({ field }) => (
          <FormItem>
              <FormLabel><TranslatableText text="What's happening?" /></FormLabel>
              <FormControl><Textarea placeholder={msgPlaceholder} className="resize-none" {...field} /></FormControl>
              <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full bg-[#0ABED6] hover:bg-[#09A8BD]" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} <TranslatableText text="Submit Ticket" />
        </Button>
      </form>
    </Form>
  );
}

// ---------------------------
// 3. BUSINESS INQUIRY FORM
// ---------------------------
const businessFormSchema = z.object({
  ...commonFields,
  companyName: z.string().min(2, "Company name is required"),
  jobTitle: z.string().optional(),
  inquiryType: z.enum(["sales", "partnership", "api_access", "press"]),
});

function BusinessInquiryForm({ onSuccess }: { onSuccess: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<z.infer<typeof businessFormSchema>>({
      resolver: zodResolver(businessFormSchema),
      defaultValues: { name: "", email: "", message: "", companyName: "", jobTitle: "" },
    });

    const msgPlaceholder = useTranslatedPlaceholder("Tell us about your business needs...");
  
    async function onSubmit(data: z.infer<typeof businessFormSchema>) {
      setIsSubmitting(true);
      const result = await createSupportTicket({ ...data, type: "BUSINESS" });
      if (result.success) {
          toast.success("Inquiry sent successfully.");
          onSuccess();
      } else {
          toast.error("Failed to send inquiry.");
      }
      setIsSubmitting(false);
    }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel><TranslatableText text="Full Name" /></FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel><TranslatableText text="Work Email" /></FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="companyName" render={({ field }) => (
                <FormItem><FormLabel><TranslatableText text="Company Name" /></FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="jobTitle" render={({ field }) => (
                <FormItem><FormLabel><TranslatableText text="Job Title (Optional)" /></FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
        <FormField control={form.control} name="inquiryType" render={({ field }) => (
          <FormItem>
            <FormLabel><TranslatableText text="Inquiry Type" /></FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder={<TranslatableText text="Select type" />} /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="sales"><TranslatableText text="Sales & Plans" /></SelectItem>
                <SelectItem value="partnership"><TranslatableText text="Partnership Opportunity" /></SelectItem>
                <SelectItem value="api_access"><TranslatableText text="API & Integration" /></SelectItem>
                <SelectItem value="press"><TranslatableText text="Press & Media" /></SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="message" render={({ field }) => (
          <FormItem>
              <FormLabel><TranslatableText text="How can we help?" /></FormLabel>
              <FormControl><Textarea placeholder={msgPlaceholder} className="resize-none" {...field} /></FormControl>
              <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full bg-[#0ABED6] hover:bg-[#09A8BD]" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} <TranslatableText text="Contact Sales" />
        </Button>
      </form>
    </Form>
  );
}

// ---------------------------
// MODAL WRAPPER
// ---------------------------
export function ContactModal({ isOpen, onClose, type }: ContactModalProps) {
  const titles = {
    review: "Review Support Team",
    technical: "Technical Assistance",
    business: "Business Solutions",
    null: ""
  };

  const descriptions = {
    review: "Get help with specific reviews, reporting issues, or moderation questions.",
    technical: "Facing issues with your account setup, login, or bugs? Let us know.",
    business: "Connect with our team regarding partnerships, sales, or enterprise needs."
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
             <TranslatableText text={type ? titles[type] : ""} />
          </DialogTitle>
          <DialogDescription>
             <TranslatableText text={type ? descriptions[type] : ""} />
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            {type === "review" && <ReviewSupportForm onSuccess={onClose} />}
            {type === "technical" && <TechnicalSupportForm onSuccess={onClose} />}
            {type === "business" && <BusinessInquiryForm onSuccess={onClose} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}