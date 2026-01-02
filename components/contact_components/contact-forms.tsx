"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useState } from "react";

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

// ---------------------------
// 1. REVIEW SUPPORT FORM
// ---------------------------
const reviewFormSchema = z.object({
  ...commonFields,
  // New identifying fields (Replaced reviewUrl)
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
            <FormItem><FormLabel>Your Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem><FormLabel>Your Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <FormField control={form.control} name="issueType" render={({ field }) => (
          <FormItem>
            <FormLabel>Issue Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select issue" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="report_fake">Report Fake/Suspicious Review</SelectItem>
                <SelectItem value="editing_issue">Trouble Editing My Review</SelectItem>
                <SelectItem value="removal_request">Request Review Removal</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        {/* Target Review Identification Section */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Which review are you referring to?</p>
            
            <FormField control={form.control} name="reviewAuthor" render={({ field }) => (
            <FormItem>
                <FormLabel className="text-xs">Review Author Name</FormLabel>
                <FormControl><Input placeholder="e.g. John Doe" className="bg-white" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
            )} />
            
            <FormField control={form.control} name="reviewTitle" render={({ field }) => (
            <FormItem>
                <FormLabel className="text-xs">Review Title</FormLabel>
                <FormControl><Input placeholder="e.g. 'Great Service!'" className="bg-white" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
            )} />
        </div>

        <FormField control={form.control} name="message" render={({ field }) => (
          <FormItem><FormLabel>Additional Details</FormLabel><FormControl><Textarea placeholder="Describe the situation..." className="resize-none" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        
        <Button type="submit" className="w-full bg-[#0ABED6] hover:bg-[#09A8BD]" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit Request
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
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Account Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
        <FormField control={form.control} name="category" render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="account_setup">Account Setup & Verification</SelectItem>
                <SelectItem value="login_issue">Login or Password Issue</SelectItem>
                <SelectItem value="bug_report">Report a Bug/Error</SelectItem>
                <SelectItem value="feature_request">Feature Request</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="deviceInfo" render={({ field }) => (
          <FormItem><FormLabel>Browser/Device (Optional)</FormLabel><FormControl><Input placeholder="e.g., Chrome on Windows" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="message" render={({ field }) => (
          <FormItem><FormLabel>What's happening?</FormLabel><FormControl><Textarea placeholder="Describe the steps to reproduce the issue..." className="resize-none" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit" className="w-full bg-[#0ABED6] hover:bg-[#09A8BD]" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit Ticket
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
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Work Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="companyName" render={({ field }) => (
                <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="jobTitle" render={({ field }) => (
                <FormItem><FormLabel>Job Title (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
        <FormField control={form.control} name="inquiryType" render={({ field }) => (
          <FormItem>
            <FormLabel>Inquiry Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="sales">Sales & Plans</SelectItem>
                <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                <SelectItem value="api_access">API & Integration</SelectItem>
                <SelectItem value="press">Press & Media</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="message" render={({ field }) => (
          <FormItem><FormLabel>How can we help?</FormLabel><FormControl><Textarea placeholder="Tell us about your business needs..." className="resize-none" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit" className="w-full bg-[#0ABED6] hover:bg-[#09A8BD]" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Contact Sales
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
          <DialogTitle>{type ? titles[type] : ""}</DialogTitle>
          <DialogDescription>
            {type ? descriptions[type] : ""}
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