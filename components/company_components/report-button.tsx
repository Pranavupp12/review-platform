"use client";

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { ReportModal } from './report-modal';
import { useRouter, usePathname } from 'next/navigation'; // Import these

export function ReportButton({ reviewId, isLoggedIn }: { reviewId: string, isLoggedIn: boolean }) {
  const [showReport, setShowReport] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    // --- Auth Check ---
    if (!isLoggedIn) {
      const loginUrl = `/login?callbackUrl=${encodeURIComponent(pathname)}&message=report_required`;
      router.push(loginUrl);
      return;
    }
    
    // Only open if logged in
    setShowReport(true);
  };

  return (
    <>
      <button 
        onClick={handleClick}
        className="ml-auto flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-red-600 transition-colors"
      >
        <Flag className="h-4 w-4" /> Report
      </button>

      <ReportModal 
        open={showReport} 
        setOpen={setShowReport} 
        reviewId={reviewId} 
      />
    </>
  );
}