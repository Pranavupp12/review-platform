import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AddBusinessUpdateModal } from "@/components/business_dashboard/add-business-update-modal";
import { EditBusinessUpdateModal } from "@/components/business_dashboard/edit-business-update-modal";
import { DeleteUpdateButton } from "@/components/business_dashboard/delete-update-modal";
import { FeaturePaywall } from "@/components/business_dashboard/feature-paywall"; // ✅ Import
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ExternalLink, Newspaper, Globe, Sparkles, Rss } from "lucide-react";

export default async function BusinessUpdatesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  // 1. FIND THE USER'S COMPANY & PLAN
  const claim = await prisma.businessClaim.findFirst({
    where: { userId: session.user.id },
    include: { company: true }
  });

  if (!claim || !claim.company) {
    return <div className="p-6">No Company Found</div>;
  }

  const companyId = claim.company.id;
  const isPro = claim.company.plan === "PRO"; // ✅ Check Plan

  // 2. CHECK PAYWALL
  if (!isPro) {
    return (
      <div className="space-y-6 p-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold tracking-tight">Business Articles</h1>
        </div>
        <FeaturePaywall
          title="Publish Company News"
          description="Boost your SEO and keep customers engaged by publishing rich articles and updates on your profile."
          features={[
            { icon: Newspaper, text: "Post Unlimited Articles", colorClass: "text-blue-500" },
            { icon: Globe, text: "SEO Backlinks to Your Site", colorClass: "text-green-500" },
            { icon: Rss, text: "Customer Engagement Feed", colorClass: "text-purple-500" },
          ]}
        />
      </div>
    );
  }

  // 3. Fetch Updates (Only if PRO)
  const updates = await prisma.businessUpdate.findMany({
    where: { companyId: companyId },
    orderBy: { createdAt: "desc" },
  });

  // ... (Return the rest of your existing PRO content logic here)
  return (
    <div className="space-y-6 p-6">
      {/* Use your existing PRO page layout code here... */}
      {/* Header with Pro Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Business Articles
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Pro
            </span>
          </h1>
        </div>
        <AddBusinessUpdateModal companyId={companyId} />
      </div>

      {/* Existing Table Logic... */}
      <div className="space-y-4">
        {/* ... (Your existing table code) ... */}
        <div className="rounded-md border border-gray-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Content</TableHead>
                <TableHead className="hidden md:table-cell">Link</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {updates.map((update) => (
                <TableRow key={update.id}>
                  <TableCell>
                    <Avatar className="h-10 w-10 rounded-md border bg-gray-100">
                      <AvatarImage src={update.imageUrl} className="object-cover" />
                      <AvatarFallback className="text-xs">IMG</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">{update.title}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground max-w-[300px] truncate text-sm">{update.content}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {update.linkUrl ? (
                      <a href={update.linkUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline text-xs bg-blue-50 px-2 py-1 rounded-full w-fit">
                        Visit <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : <span className="text-xs text-gray-400 italic">None</span>}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-gray-500">{format(new Date(update.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <EditBusinessUpdateModal companyId={companyId} update={update} />
                      <DeleteUpdateButton updateId={update.id} companyId={companyId} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}