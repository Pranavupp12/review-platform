import { prisma } from "@/lib/prisma";
import { 
  CheckCircle, 
  Clock,
  FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ClaimActionButtons } from "@/components/admin_components/claim-action-buttons";
import { ClaimDetailsModal } from "@/components/admin_components/claim-details-modal";

export const metadata = { title: 'Business Claims - Admin' };

export default async function AdminClaimsPage() {
  
  const claims = await prisma.businessClaim.findMany({
    where: { status: "PENDING" },
    include: {
      user: true,
      company: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Verification Requests</h1>
          <p className="text-sm text-gray-500">Review business ownership claims and new listings.</p>
        </div>
        <Badge variant="outline" className="px-3 py-1 bg-white">
           {claims.length} Pending
        </Badge>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {claims.length === 0 ? (
          <div className="p-16 text-center">
             <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8" />
             </div>
             <h3 className="text-lg font-bold text-gray-900">All caught up!</h3>
             <p className="text-gray-500">There are no pending claims to review right now.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-3">Applicant</th>
                  <th className="px-6 py-3 text-center">Details</th>
                  <th className="px-6 py-3">Verification</th>
                  <th className="px-6 py-3">Submitted</th>
                  <th className="px-6 py-3 text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50/50 transition-colors">
                    
                    {/* 1. APPLICANT */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                           {(claim.user.name || claim.workEmail || "U")[0].toUpperCase()}
                        </div>
                        <div>
                           <div className="font-bold text-gray-900">{claim.user.name || "Unknown"}</div>
                           <div className="text-xs text-gray-500">{claim.user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* 2. BUSINESS DETAILS (BUTTON ONLY) */}
                    <td className="px-6 py-4 text-center">
                        <ClaimDetailsModal claim={claim} />
                    </td>

                    {/* 3. VERIFICATION DOCS */}
                    <td className="px-6 py-4">
                        <div className="space-y-1">
                           <div className="text-xs font-medium text-gray-900">{claim.workEmail}</div>
                           <div className="text-xs text-gray-500">{claim.jobTitle}</div>
                           
                           {claim.verificationDoc ? (
                              <a 
                                href={claim.verificationDoc} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline mt-1"
                              >
                                 <FileText className="h-3 w-3" /> Doc Attached
                              </a>
                           ) : (
                              <span className="text-xs text-red-400 italic mt-1 block">Missing Doc</span>
                           )}
                        </div>
                    </td>

                    {/* 4. SUBMITTED DATE */}
                    <td className="px-6 py-4 text-gray-500 text-xs">
                       <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(claim.createdAt).toLocaleDateString()}
                       </div>
                    </td>

                    {/* 5. ACTIONS */}
                    <td className="px-6 py-4 text-right">
                       <ClaimActionButtons claimId={claim.id} />
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}