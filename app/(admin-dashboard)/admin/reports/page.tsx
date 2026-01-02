import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReportActionCell } from '@/components/admin_components/report-action-cell'; 
import { ArchiveReportButton } from '@/components/admin_components/archive-report-button'; 
import { PaginationControls } from '@/components/shared/pagination-controls';
import { ReportFilters } from '@/components/admin_components/page-filters/report-filters'; // ✅ Import Filters
import { Inbox } from 'lucide-react';

// Import Prisma types
import { Prisma } from '@prisma/client';

export const metadata = { title: 'Manage Reports - Admin' };
export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ 
    page?: string;
    query?: string;    // ✅ Search Text
    status?: string;   // ✅ Filter Status
    reason?: string;   // ✅ Filter Reason
  }>;
};

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  
  const page = Number(resolvedSearchParams.page) || 1;
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  // Extract Filters
  const query = resolvedSearchParams.query || "";
  const status = resolvedSearchParams.status || "";
  const reason = resolvedSearchParams.reason || "";

  // 1. Build Dynamic WHERE Clause
  const where: Prisma.ReportWhereInput = {
    archived: false, // Always show only active reports
  };

  // Search Logic (Reporter Name OR Review Comment)
  if (query) {
    where.OR = [
      { user: { name: { contains: query, mode: 'insensitive' } } },
      { review: { comment: { contains: query, mode: 'insensitive' } } },
    ];
  }

  // Exact Match Filters
  if (status && status !== 'all') {
    where.status = status as any;
  }

  if (reason && reason !== 'all') {
    where.reason = reason as any;
  }

  // 2. Fetch Data & Count with filters
  const [reports, totalCount] = await Promise.all([
    prisma.report.findMany({
      where, // ✅ Apply filters
      include: {
        user: true, 
        review: {
          include: { user: true, company: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: skip, 
      take: pageSize
    }),
    prisma.report.count({ where }) // ✅ Apply filters to count
  ]);

  const getStatusBadge = (status: string) => {
    switch(status) {
        case 'PENDING': return <Badge variant="destructive">Pending</Badge>;
        case 'WAITING_FOR_EDIT': return <Badge className="bg-orange-500 hover:bg-orange-600">Waiting for Edit</Badge>;
        case 'RESOLVED': return <Badge className="bg-green-500 hover:bg-green-600">Resolved</Badge>;
        case 'EDITED': return <Badge className="bg-blue-500 hover:bg-blue-600">Edited</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Moderation Queue</h1>
            <p className="text-sm text-gray-500">Review and resolve user-flagged content</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 shadow-sm">
            Total Active: <span className="text-gray-900 font-bold ml-1">{totalCount}</span>
        </div>
      </div>
      
      {/* ✅ Add Filter Component Here */}
      <ReportFilters />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {reports.length === 0 ? (
          // Empty State Handling
          <div className="p-12 text-center flex flex-col items-center justify-center">
             <div className="bg-gray-50 p-4 rounded-full mb-3">
               <Inbox className="h-8 w-8 text-gray-400" />
             </div>
             <h3 className="text-lg font-medium text-gray-900">No active reports</h3>
             <p className="text-gray-500 mt-1">Great job! The moderation queue is clear.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Reported By</th>
                  <th className="px-6 py-3">Reason</th>
                  <th className="px-6 py-3">Review Content</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-4 py-3 w-[50px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 border">
                            <AvatarImage src={report.user.image || ''}/>
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-gray-900">{report.user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold text-red-700 bg-red-50 border border-red-100">
                        {report.reason.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex flex-col gap-1">
                          <p className="font-bold text-xs text-gray-500 uppercase tracking-wide">
                              {report.review?.company.name || 'Unknown Company'}
                          </p>
                          <p className={`truncate text-sm italic ${report.status === 'EDITED' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                            "{report.review?.comment}"
                          </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-6 py-4">
                      {report.status !== 'RESOLVED' && (
                          <ReportActionCell report={report} />
                      )}
                      {report.status === 'RESOLVED' && (
                          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                            ✓ Resolved
                          </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <ArchiveReportButton reportId={report.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Pagination Controls (Only show if there are items) */}
        {reports.length > 0 && (
            <div className="border-t border-gray-100 p-4">
                <PaginationControls 
                    totalItems={totalCount} 
                    pageSize={pageSize} 
                    currentPage={page} 
                />
            </div>
        )}
      </div>
    </div>
  );
}