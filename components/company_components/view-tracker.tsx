// components/company_components/view-tracker.tsx
"use client";

import { useEffect, useRef } from "react"; // 1. Import useRef
import { incrementReviewReads } from "@/lib/actions";

export function ViewTracker({ reviewIds }: { reviewIds: string[] }) {
  // 2. Create a ref to track if we have sent the data
  const hasRun = useRef(false);

  useEffect(() => {
    // 3. Check if we already ran
    if (hasRun.current) return;

    if (reviewIds.length > 0) {
      // 4. Mark as run BEFORE calling the action
      hasRun.current = true;
      
      console.log("👀 ViewTracker firing (Once)");
      incrementReviewReads(reviewIds);
    }
  }, [reviewIds]);

  return null;
}