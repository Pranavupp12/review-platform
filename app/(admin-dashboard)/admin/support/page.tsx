import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Mail, Briefcase, Wrench, MessageSquare, CheckCircle2, Clock, Inbox } from 'lucide-react';
import { SupportTicketModal } from '@/components/admin_components/support-ticket-modal';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { SupportFilters } from '@/components/admin_components/page-filters/support-filters'; 

// Import Prisma types
import { Prisma } from '@prisma/client';

export const metadata = { title: 'Support Inbox - Admin' };
export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ 
    page?: string;
    query?: string;   // ✅ Search Text
    type?: string;    // ✅ Filter Ticket Type
    status?: string;  // ✅ Filter Status (OPEN/CLOSED)
  }>;
};

export default async function AdminSupportPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  
  const page = Number(resolvedSearchParams.page) || 1;
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  // Extract Filters
  const query = resolvedSearchParams.query || "";
  const type = resolvedSearchParams.type || "";
  const status = resolvedSearchParams.status || "";

  // 1. Build Dynamic WHERE Clause
  const where: Prisma.SupportTicketWhereInput = {};

  // Search logic (Name OR Email OR Message)
  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
      { message: { contains: query, mode: 'insensitive' } },
    ];
  }

  // Exact Match Filters
  if (type && type !== 'all') {
    where.type = type as any; // Cast to enum type if needed
  }

  if (status && status !== 'all') {
    where.status = status as any;
  }

  // 2. Fetch Data & Count with filters
  const [tickets, totalCount] = await Promise.all([
    prisma.supportTicket.findMany({
      where, // ✅ Apply filters
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: pageSize
    }),
    prisma.supportTicket.count({ where }) // ✅ Apply filters to count
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'REVIEW': return <MessageSquare className="h-4 w-4 text-orange-600" />;
      case 'TECHNICAL': return <Wrench className="h-4 w-4 text-blue-600" />;
      case 'BUSINESS': return <Briefcase className="h-4 w-4 text-purple-600" />;
      default: return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Support Inbox</h1>
            <p className="text-sm text-gray-500">Manage user inquiries and help requests</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 shadow-sm">
            Total Tickets: <span className="text-gray-900 font-bold ml-1">{totalCount}</span>
        </div>
      </div>

      {/* ✅ Add Filter Component Here */}
      <SupportFilters />
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {tickets.length === 0 ? (
          // Empty State Handling
          <div className="p-12 text-center flex flex-col items-center justify-center">
             <div className="bg-gray-50 p-4 rounded-full mb-3">
               <Inbox className="h-8 w-8 text-gray-400" />
             </div>
             <h3 className="text-lg font-medium text-gray-900">No tickets found</h3>
             <p className="text-gray-500 mt-1">Try clearing your filters to see more results.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs">
                  <tr>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">From</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Message Preview</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                  {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium">
                          <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                              {getTypeIcon(ticket.type)}
                          </div>
                          <span className="capitalize text-gray-700 font-semibold">{ticket.type.toLowerCase()}</span>
                      </div>
                      </td>
                      <td className="px-6 py-4">
                      <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{ticket.name}</span>
                          <span className="text-xs text-gray-500">{ticket.email}</span>
                      </div>
                      </td>
                      <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-gray-50 font-normal text-gray-600 border-gray-200">
                          {ticket.category?.replace(/_/g, ' ') || 'General'}
                      </Badge>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                      <p className="truncate text-gray-500 w-[250px]">
                          {ticket.message}
                      </p>
                      </td>
                      <td className="px-6 py-4">
                          {ticket.status === 'OPEN' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                  <Clock className="h-3 w-3" /> Open
                              </span>
                          ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                  <CheckCircle2 className="h-3 w-3" /> Closed
                              </span>
                          )}
                      </td>
                      <td className="px-6 py-4 text-right">
                          <SupportTicketModal ticket={ticket} />
                      </td>
                  </tr>
                  ))}
              </tbody>
              </table>
          </div>
        )}

        {/* 4. Pagination Controls (Only show if there are items) */}
        {tickets.length > 0 && (
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