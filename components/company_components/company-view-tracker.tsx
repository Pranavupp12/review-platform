"use client";

import { useEffect, useRef } from "react";
import { incrementCompanyView } from "@/lib/actions";

export function CompanyViewTracker({ companyId }: { companyId: string }) {
  // 1. Create a ref to track if we have sent the data
  const hasRun = useRef(false);

  useEffect(() => {
    // 2. Check if we already ran (Prevents double-counting in React Strict Mode)
    if (hasRun.current) return;

    if (companyId) {
      // 3. Mark as run BEFORE calling the action
      hasRun.current = true;
      
      console.log("👀 CompanyViewTracker firing (Once)");
      incrementCompanyView(companyId);
    }
  }, [companyId]);

  return null;
}