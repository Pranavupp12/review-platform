import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CreateCampaignForm } from "@/components/business_dashboard/create-campaign-form";
import CampaignActions from "@/components/business_dashboard/campaign-actions";
import { EmailUsageTracker } from "@/components/business_dashboard/email-usage-tracker";
import { Mail, History, Users, Sparkles, Zap, Crown } from "lucide-react";
import { redirect } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Helper to format dates
function formatDate(date: Date) {
   return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ✅ CONFIG: Define limits for each plan
// Make sure these Keys match your Prisma Enum (likely uppercase: FREE, GROWTH, SCALE)
const PLAN_CONFIG: Record<string, { limit: number; batchSize: number }> = {
   FREE: { limit: 10, batchSize: 50 },
   GROWTH: { limit: 300, batchSize: Infinity },
   SCALE: { limit: 3000, batchSize: Infinity },
   CUSTOM: { limit: Infinity, batchSize: Infinity },
   // Fallback for legacy PRO users (Treat as Growth or Scale)
   PRO: { limit: 300, batchSize: Infinity } 
};

export const metadata = { title: "Email Marketing" };

export default async function MarketingPage() {
   const session = await auth();
   if (!session?.user?.companyId) return redirect("/business/login");

   // 1. Fetch Company Plan
   const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: { plan: true, emailUsageCount: true }
   });

   const campaigns = await prisma.campaign.findMany({
      where: { companyId: session.user.companyId },
      orderBy: { createdAt: 'desc' }
   });

   // 2. ✅ CALCULATE LIMITS DYNAMICALLY
   const userPlan = company?.plan || "FREE";
   
   // Get config for plan, or fallback to FREE if plan name doesn't exist
   const config = PLAN_CONFIG[userPlan] || PLAN_CONFIG.FREE;
   
   const usage = company?.emailUsageCount || 0;
   
   // Limit is reached if it's NOT infinite AND usage >= limit
   const isLimitReached = config.limit !== Infinity && usage >= config.limit;

   // Helper for badge styling
   const getBadge = (plan: string) => {
      switch(plan) {
         case "GROWTH": return <div className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center gap-2 border border-blue-200"><Sparkles className="h-3 w-3" /> Growth Plan</div>;
         case "SCALE": return <div className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full flex items-center gap-2 border border-purple-200"><Zap className="h-3 w-3" /> Scale Plan</div>;
         case "CUSTOM": return <div className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center gap-2 border border-amber-200"><Crown className="h-3 w-3" /> Custom Plan</div>;
         case "PRO": return <div className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center gap-2 border border-blue-200"><Sparkles className="h-3 w-3" /> Pro Plan</div>;
         default: return <div className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full border border-gray-200">Free Plan</div>;
      }
   };

   return (
      <div className="space-y-10 max-w-6xl mx-auto pb-20">

         {/* Header */}
         <div className="border-b border-gray-200 pb-5 flex justify-between items-start md:items-center">
            <div>
               <h1 className="text-3xl font-bold text-[#000032] flex items-center gap-3">
                  <Mail className="h-8 w-8 text-[#0ABED6]" /> Email Marketing
               </h1>
               <p className="text-gray-500 mt-1">
                  Design professional emails and invite customers to review your business.
               </p>
            </div>
            <div>
               {getBadge(userPlan)}
            </div>
         </div>

         {/* ✅ PASS DYNAMIC LIMITS TO TRACKER */}
         <EmailUsageTracker
            plan={userPlan}
            usage={usage}
            limit={config.limit}
         />

         {/* SECTION 1: CREATE CAMPAIGN */}
         <div className="space-y-4">
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-bold text-[#000032]">Create New Campaign</h2>
            </div>
            
            {/* ✅ FIXED: Explicitly pass batchSizeLimit based on the calculated config */}
            <CreateCampaignForm 
               userEmail={session.user.email || ""} 
               isLimitReached={isLimitReached} 
               batchSizeLimit={config.batchSize} 
            />
         </div>

         {/* SECTION 2: HISTORY TABLE */}
         <div className="space-y-4 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-[#000032] flex items-center gap-2">
               <History className="h-5 w-5" /> Campaign History
            </h2>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
               <Table>
                  <TableHeader className="bg-gray-50">
                     <TableRow>
                        <TableHead className="w-[200px]">Campaign Name</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Sent Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {campaigns.length === 0 ? (
                        <TableRow>
                           <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                              No campaigns found. Create your first one above!
                           </TableCell>
                        </TableRow>
                     ) : (
                        campaigns.map((c) => (
                           <TableRow key={c.id}>
                              <TableCell className="font-medium text-[#000032]">{c.name}</TableCell>
                              <TableCell className="text-gray-600 truncate max-w-[200px]">{c.subject}</TableCell>
                              <TableCell>
                                 <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.status === "SENT" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                    }`}>
                                    {c.status}
                                 </span>
                              </TableCell>
                              <TableCell>
                                 <div className="flex items-center gap-1 text-gray-600">
                                    <Users className="h-3 w-3" /> {c.recipients.length}
                                 </div>
                              </TableCell>
                              <TableCell className="text-gray-500 text-sm">{formatDate(c.createdAt)}</TableCell>
                              <TableCell className="text-right">
                                 <CampaignActions campaign={c as any} />
                              </TableCell>
                           </TableRow>
                        ))
                     )}
                  </TableBody>
               </Table>
            </div>
         </div>
      </div>
   );
}