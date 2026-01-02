
import { HelpfulButton } from './helpful-button';
import { ShareButton } from './share-button';
import { ReportButton } from './report-button';

interface ReviewInteractionsProps {
  reviewId: string;
  initialHelpfulCount: number;
  isHelpfulInitial: boolean;
  latestVoterName: string | null;
  companyName: string;
  isLoggedIn: boolean;
}

export function ReviewInteractions({ 
  reviewId, 
  initialHelpfulCount, 
  isHelpfulInitial ,
  latestVoterName,
  companyName,
  isLoggedIn,
}: ReviewInteractionsProps) {
  return (
    <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
      <HelpfulButton 
        reviewId={reviewId} 
        initialCount={initialHelpfulCount} 
        initialState={isHelpfulInitial} 
        latestVoterName={latestVoterName}
        isLoggedIn={isLoggedIn}
      />
      
      <ShareButton reviewId={reviewId} companyName={companyName} />
      
      <ReportButton reviewId={reviewId} isLoggedIn={isLoggedIn} />
    </div>
  );
}