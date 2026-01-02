import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CreateCampaignForm } from "@/components/business_dashboard/create-campaign-form";
import CampaignActions from "@/components/business_dashboard/campaign-actions";
import { EmailUsageTracker } from "@/components/business_dashboard/email-usage-tracker";
import { Mail, History, Users, Sparkles, Megaphone, Palette } from "lucide-react";
import { redirect } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Helper to format dates
function formatDate(date: Date) {
   return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const metadata = { title: "Email Marketing" };

export default async function MarketingPage() {
   const session = await auth();
   if (!session?.user?.companyId) return redirect("/business/login");

   // 1. Fetch Company Plan
   const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: { plan: true, emailUsageCount: true }
   });

   // 2. If PRO, fetch data and render content
   const campaigns = await prisma.campaign.findMany({
      where: { companyId: session.user.companyId },
      orderBy: { createdAt: 'desc' }
   });

   // 1. Define Limit Logic
   const FREE_LIMIT = 10;
   const usage = company?.emailUsageCount || 0;
   const isPro = company?.plan === "PRO";
   
   // A user is blocked if they are NOT Pro AND have hit the limit
   const isLimitReached = !isPro && usage >= FREE_LIMIT;

   return (
      <div className="space-y-10 max-w-6xl mx-auto pb-20">

         {/* Header */}
         <div className="border-b border-gray-200 pb-5 flex justify-between items-start md:items-center">

            {/* Left: Title & Description */}
            <div>
               <h1 className="text-3xl font-bold text-[#000032] flex items-center gap-3">
                  <Mail className="h-8 w-8 text-[#0ABED6]" /> Email Marketing
               </h1>
               <p className="text-gray-500 mt-1">
                  Design professional emails and invite customers to review your business.
               </p>
            </div>

            {/* Right: Plan Badge */}
            <div>
               {company?.plan === "PRO" ? (
                  <div className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-full flex items-center gap-2 border border-blue-200 shadow-sm">
                     <Sparkles className="h-3.5 w-3.5 fill-blue-500 text-blue-500" /> Pro Active
                  </div>
               ) : (
                  <div className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-bold rounded-full border border-gray-200 flex items-center gap-2">
                     Free Plan
                  </div>
               )}
            </div>

         </div>

         {/* ✅ ADD THIS: Usage Tracker for Free Users */}
         <EmailUsageTracker
            plan={company?.plan || "FREE"}
            usage={company?.emailUsageCount || 0}
            limit={10}
         />

         {/* SECTION 1: CREATE CAMPAIGN */}
         <div className="space-y-4">
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-bold text-[#000032]">Create New Campaign</h2>
            </div>
            <CreateCampaignForm userEmail={session.user.email || ""} isLimitReached={isLimitReached} />
         </div>

         {/* SECTION 2: HISTORY TABLE (Existing code...) */}
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
                                 <CampaignActions campaign={{
                                    id: c.id,
                                    name: c.name,
                                    subject: c.subject,
                                    content: c.content,
                                    status: c.status,
                                    sentCount: c.sentCount,
                                    createdAt: c.createdAt,
                                    logoUrl: c.logoUrl,
                                    bannerUrl: c.bannerUrl,
                                    recipients: c.recipients,
                                 }} 
                                 />
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