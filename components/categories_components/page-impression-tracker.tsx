'use client';

import { useEffect, useRef } from 'react';
import { trackBatchImpressions } from '@/lib/track-click';

interface PageImpressionTrackerProps {
  companyIds: string[];
  query: string;
  location?: string;
  userRegion?: string;
}

export default function PageImpressionTracker({ 
  companyIds, 
  query, 
  location = 'global', 
  userRegion = 'unknown' 
}: PageImpressionTrackerProps) {
  
  const hasFired = useRef(false);

  useEffect(() => {
    // Only fire if we have IDs and haven't fired yet
    if (!hasFired.current && companyIds.length > 0) {
      trackBatchImpressions(companyIds, query, location, userRegion);
      hasFired.current = true;
    }
  }, [companyIds, query, location, userRegion]);

  return null; // Renders nothing
}