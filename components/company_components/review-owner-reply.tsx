
interface ReviewOwnerReplyProps {
  replyText: string | null;
  replyDate: Date | null;
  companyName: string;
  companyLogo?: string | null;
}

export function ReviewOwnerReply({ 
  replyText, 
  replyDate, 
  companyName 
}: ReviewOwnerReplyProps) {
  
  if (!replyText) return null;

  return (
    <div className="mt-6 ml-4 md:ml-8 relative">
        
      {/* Connector Line Visual */}
        {/* 1. Vertical Line: Changed 'bottom-0' to 'h-6' to stop it partway down */}
      <div className="absolute -left-4 md:-left-8 top-0 h-6 w-0.5 bg-gray-100" />
      
      {/* 2. Horizontal Line: Changed 'top-5' to 'top-6' to align perfectly with the bottom of the vertical line */}
      <div className="absolute -left-4 md:-left-8 top-6 w-4 md:w-8 h-0.5 bg-gray-100" />

      <div className="bg-gray-50 rounded-lg p-5 border-l-4 border-[#0ABED6]">
        <div className="flex items-center gap-2 mb-2">
           
           <span className="font-bold text-sm text-[#000032]">
             Reply from {companyName}
           </span>
           
           {replyDate && (
             <>
               <span className="text-gray-300">•</span>
               <span className="text-xs text-gray-500">
                 {new Date(replyDate).toLocaleDateString(undefined, { 
                   year: 'numeric', 
                   month: 'long', 
                   day: 'numeric' 
                 })}
               </span>
             </>
           )}
        </div>
        
        <p className="text-gray-700 text-sm leading-relaxed">
          {replyText}
        </p>
      </div>
    </div>
  );
}