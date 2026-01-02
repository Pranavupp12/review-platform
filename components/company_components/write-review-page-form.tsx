"use client";

import { useState } from "react";
import { useActionState } from 'react';
import { createReview } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRatingInput } from "@/components/shared/star-rating-input"; 
import { Loader2, Upload, X, ChevronRight, CheckCircle2, CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface WriteReviewPageFormProps {
  companyId: string;
  companyName: string;
  companySlug: string;
  isLoggedIn: boolean;
}

export function WriteReviewPageForm({ companyId, companyName, companySlug, isLoggedIn }: WriteReviewPageFormProps) {
  const router = useRouter();
  
  // Steps: 1 = Rating, 2 = Details, 3 = Success
  const [step, setStep] = useState(1);
  const [rating, setRating] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const [state, formAction, isPending] = useActionState(createReview, null);

  // Handle Image Uploads
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handle Server Action Success
  if (state?.success && step !== 3) {
    setStep(3);
  }

  // --- RENDER: SUCCESS STEP ---
  if (step === 3) {
    return (
      <div className="text-center py-12 animate-in zoom-in duration-300">
         <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
         </div>
         <h2 className="text-3xl font-bold text-[#000032] mb-4">Review Submitted!</h2>
         <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Thank you for sharing your experience with <strong>{companyName}</strong>. Your review helps others make better decisions.
         </p>
         <Button 
            onClick={() => router.push(`/company/${companySlug}`)}
            className="h-12 px-8 bg-[#000032] text-white rounded-full font-bold"
         >
            Return to Company Page
         </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="max-w-2xl mx-auto bg-white rounded-xl overflow-hidden">
      
      {/* Progress Bar */}
      <div className="h-2 bg-gray-100 w-full">
         <div 
           className="h-full bg-[#0ABED6] transition-all duration-500 ease-out"
           style={{ width: step === 1 ? "50%" : "100%" }} 
         />
      </div>

      <div className="p-8 md:p-10">
        
        {/* Hidden Inputs for Form Submission */}
        <input type="hidden" name="companyId" value={companyId} />
        <input type="hidden" name="rating" value={rating} />
        {/* We assume date is strictly handled via client state -> hidden input if needed, 
            or your server action reads 'dateOfExperience' from formData */}
        <input type="hidden" name="dateOfExperience" value={date ? date.toISOString() : ""} />


        {/* --- STEP 1: RATING --- */}
        <div className={cn(step === 1 ? "block" : "hidden", "animate-in fade-in slide-in-from-right-4 duration-300")}>
           <h1 className="text-3xl font-bold text-[#000032] mb-2 text-center">
             Rate your experience
           </h1>
           <p className="text-gray-500 text-center mb-8">
             How would you rate <strong>{companyName}</strong>?
           </p>

           <div className="flex justify-center mb-10">
              {/* Using your custom Block/Star Input */}
              <div className="scale-125">
                 <StarRatingInput 
                    rating={rating} 
                    onRatingChange={(val) => {
                        setRating(val);
                        // Optional: Auto-advance after a brief delay
                        setTimeout(() => setStep(2), 400); 
                    }} 
                 />
              </div>
           </div>

           <div className="flex justify-end">
              <Button 
                type="button"
                disabled={rating === 0} 
                onClick={() => setStep(2)}
                className="bg-[#0ABED6] hover:bg-[#0ABED6]/80 text-white rounded-full px-6 h-10 font-bold"
              >
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
           </div>
        </div>


        {/* --- STEP 2: DETAILS --- */}
        <div className={cn(step === 2 ? "block" : "hidden", "animate-in fade-in slide-in-from-right-4 duration-300")}>
           
           <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#000032]">Tell us more</h2>
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="text-sm text-gray-500 hover:text-[#0ABED6] font-medium"
              >
                Change Rating
              </button>
           </div>

           <div className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                 <Label className="font-bold text-gray-700">Give your review a title</Label>
                 <Input 
                   name="title" 
                   placeholder="What's most important to know?" 
                   className="h-12 bg-gray-50 border-gray-200"
                   required
                 />
              </div>

              {/* Review Text */}
              <div className="space-y-2">
                 <Label className="font-bold text-gray-700">Tell us about your experience</Label>
                 <Textarea 
                   name="content" 
                   placeholder="What did you like or dislike? How was the service?" 
                   className="min-h-[150px] bg-gray-50 border-gray-200 resize-none p-4"
                   required
                 />
              </div>

              {/* Date of Experience */}
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Date of experience</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full h-12 justify-start hover:bg-gray-200 text-left font-normal bg-gray-50 border-gray-200",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                 <Label className="font-bold text-gray-700">Add photos (Optional)</Label>
                 
                 <div className="grid grid-cols-4 gap-4">
                    {previews.map((src, idx) => (
                       <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                          <Image src={src} alt="Preview" fill className="object-cover" />
                          <button 
                             type="button"
                             onClick={() => removeImage(idx)}
                             className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                             <X className="h-3 w-3" />
                          </button>
                       </div>
                    ))}
                    
                    <label className="border-2 border-dashed border-gray-200 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-[#0ABED6] transition-colors">
                       <Upload className="h-6 w-6 text-gray-400 mb-2" />
                       <span className="text-xs text-gray-500 font-medium">Add</span>
                       <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageChange}
                          name="images" // Make sure action handles getAll('images')
                       />
                    </label>
                 </div>
              </div>

              {state?.error && (
                 <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm font-medium">
                    {state.error}
                 </div>
              )}

              <div className="pt-4">
                {isLoggedIn ? (
                    <Button 
                        type="submit" 
                        disabled={isPending}
                        className="w-full h-14 bg-[#0ABED6] hover:bg-[#0ABED6]/80 text-white text-lg font-bold rounded-xl shadow-lg"
                    >
                        {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Submit Review"}
                    </Button>
                ) : (
                    <Button 
                        type="button"
                        onClick={() => router.push(`/login?callbackUrl=/write-review/${companySlug}`)}
                        className="w-full h-14 bg-[#0ABED6] hover:bg-[#0ABED6]/80 text-white text-lg font-bold rounded-xl shadow-lg"
                    >
                        Log in to Submit
                    </Button>
                )}
                
                <p className="text-center text-xs text-gray-400 mt-4">
                   By submitting, you certify that this review is based on your own genuine experience.
                </p>
              </div>

           </div>
        </div>

      </div>
    </form>
  );
}