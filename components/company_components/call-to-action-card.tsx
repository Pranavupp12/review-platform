"use client";

import { useState } from "react";
import { Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackPhoneClick } from "@/lib/lead-actions"; // ✅ Import Action

interface CallToActionCardProps {
  phoneNumber?: string;
  companyId: string; // ✅ Add companyId prop
}

export function CallToActionCard({ phoneNumber, companyId }: CallToActionCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!phoneNumber) return null;

  const handleReveal = async () => {
    setLoading(true);
    // Fire and forget tracking (don't block UI)
    trackPhoneClick(companyId);
    
    // Simulate slight delay for effect/processing
    setTimeout(() => {
        setIsRevealed(true);
        setLoading(false);
    }, 300);
  };

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-none">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 bg-[#0ABED6]/20 rounded-full flex items-center justify-center">
          <Phone className="h-5 w-5 text-[#0ABED6]" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Call Today</h3>
          <p className="text-xs text-gray-500">Speak to a representative</p>
        </div>
      </div>

      {!isRevealed ? (
        <Button 
          className="w-full bg-[#0ABED6] hover:bg-[#0ABED6]/80 text-white font-semibold"
          onClick={handleReveal}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Call Now"}
        </Button>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-center animate-in fade-in duration-300">
          <p className="text-sm text-[#0ABED6] font-medium mb-1">Call us at:</p>
          <a 
            href={`tel:${phoneNumber}`} 
            className="text-xl font-bold text-[#0ABED6] hover:underline block"
          >
            {phoneNumber}
          </a>
        </div>
      )}
    </div>
  );
}