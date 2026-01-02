import { prisma } from '@/lib/prisma';
import { RefreshStatsButton } from '@/components/admin_components/refresh-stats-button';
import { ReviewActivityChart } from '@/components/admin_components/charts/review-activity-chart';
import { 
  Building2, 
  MessageSquare, 
  ShieldAlert, 
  LifeBuoy, 
  TrendingUp, 
  Star,
  Info,
  Calendar,
  Activity,
  ArrowUpRight,
  AlertTriangle,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { format, addDays } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  
  // 1. Calculate Date for 30-day chart history
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 2. Fetch all data in parallel
  const [
    userCount,
    companyCount,
    reviewCount,
    pendingReports,
    openTickets,
    claimedCompanies,
    recentReviews,
    analytics,
    chartReviews,
    unverifiedClaims 
  ] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    prisma.review.count(),
    prisma.report.count({ where: { archived: false, status: 'PENDING' } }), 
    prisma.supportTicket.count({ where: { status: 'OPEN' } }),
    prisma.company.count({ where: { claimed: true } }), 
    prisma.review.findMany({ 
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: true, company: true }
    }),
    prisma.platformAnalytics.findFirst({ orderBy: { date: 'desc' } }),
    prisma.review.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true }
    }),
    prisma.company.findMany({
      where: { 
        claimed: true, 
        domainVerified: null 
      },
      select: { 
        id: true, 
        name: true, 
        slug: true, 
        claimedAt: true, 
        createdAt: true 
      },
      take: 6,
      orderBy: { claimedAt: 'desc' }
    })
  ]);

  // --- 3. PROCESS DATA FOR CHART ---
  const reviewsByDate: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    reviewsByDate[dateKey] = 0;
  }

  chartReviews.forEach(r => {
    const dateKey = new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (reviewsByDate[dateKey] !== undefined) reviewsByDate[dateKey]++;
  });

  const chartData = Object.entries(reviewsByDate).map(([date, count]) => ({ date, count }));
  
  // --- 4. CALCULATIONS & DEFAULTS ---
  const claimedPercentage = companyCount > 0 ? ((claimedCompanies / companyCount) * 100).toFixed(1) : 0;
  
  const stats = analytics || {
    newUsers: 0,
    newReviews: 0,
    avgSentiment: 0,
    date: new Date()
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <Calendar className="h-4 w-4" /> 
              {format(new Date(), "EEEE, MMMM do, yyyy")}
            </p>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
                <p className="text-xs text-gray-400 font-medium uppercase">Last Snapshot</p>
                <p className="text-sm font-bold text-gray-700">
                    {analytics ? format(new Date(analytics.date), "MMM d, h:mm a") : "Never"}
                </p>
            </div>
            <RefreshStatsButton />
        </div>
      </div>

      {/* --- SECTION 1: CRITICAL ACTION ITEMS --- */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${unverifiedClaims.length > 0 ? 'lg:grid-cols-3' : ''} gap-6`}>
        
        {/* 1. Pending Reports (Restored Footer) */}
        <Link href="/admin/reports" className="group block">
            <div className={`h-full p-6 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${pendingReports > 0 ? 'bg-orange-50 border-orange-200 hover:border-orange-300' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                <div>
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldAlert className={`h-5 w-5 ${pendingReports > 0 ? 'text-orange-600' : 'text-gray-400'}`} />
                                <h3 className={`font-semibold ${pendingReports > 0 ? 'text-orange-900' : 'text-gray-600'}`}>Pending Reports</h3>
                            </div>
                            <p className="text-sm text-gray-500 max-w-[90%]">User-flagged reviews requiring moderation.</p>
                        </div>
                        <span className={`text-4xl font-bold ${pendingReports > 0 ? 'text-orange-600' : 'text-gray-300'}`}>
                            {pendingReports}
                        </span>
                    </div>
                </div>
                {/* ✅ Restored Footer */}
                <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Live Data</span>
                    {pendingReports > 0 && <span className="text-xs font-bold text-orange-700 animate-pulse">Action Required</span>}
                </div>
            </div>
        </Link>

        {/* 2. Support Tickets (Restored Footer) */}
        <Link href="/admin/support" className="group block">
            <div className={`h-full p-6 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${openTickets > 0 ? 'bg-blue-50 border-blue-200 hover:border-blue-300' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                <div>
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <LifeBuoy className={`h-5 w-5 ${openTickets > 0 ? 'text-blue-600' : 'text-gray-400'}`} />
                                <h3 className={`font-semibold ${openTickets > 0 ? 'text-blue-900' : 'text-gray-600'}`}>Open Tickets</h3>
                            </div>
                            <p className="text-sm text-gray-500 max-w-[90%]">Customer inquiries waiting for a response.</p>
                        </div>
                        <span className={`text-4xl font-bold ${openTickets > 0 ? 'text-blue-600' : 'text-gray-300'}`}>
                            {openTickets}
                        </span>
                    </div>
                </div>
                {/* ✅ Restored Footer */}
                <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Live Data</span>
                    {openTickets > 0 && <span className="text-xs font-bold text-blue-700">Needs Response</span>}
                </div>
            </div>
        </Link>

        {/* 3. Pending Verifications */}
        {unverifiedClaims.length > 0 && (
           <div className="bg-white rounded-xl border border-yellow-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 bg-yellow-50 border-b border-yellow-100 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-900">Unverified Domains</h3>
                 </div>
                 <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full">
                    {unverifiedClaims.length} Pending
                 </span>
              </div>
              
              <div className="flex-1 overflow-y-auto max-h-[160px] divide-y divide-gray-100">
                 {unverifiedClaims.map((company) => {
                    // Logic: Start Date -> 30 Day Deadline -> Days Remaining
                    const startDate = company.claimedAt || company.createdAt || new Date();
                    const deadlineDate = addDays(new Date(startDate), 30);
                    const daysRemaining = differenceInCalendarDays(deadlineDate, new Date());
                    const isOverdue = daysRemaining < 0;

                    return (
                       <div key={company.id} className="p-3 hover:bg-gray-50 flex justify-between items-center group">
                          <div className="min-w-0">
                             <Link href={`/admin/companies?query=${company.name}`} className="block font-medium text-sm text-gray-900 truncate hover:text-blue-600 hover:underline">
                                {company.name}
                             </Link>
                             
                             <p className={`text-xs flex items-center gap-1 mt-0.5 ${isOverdue ? "text-red-600 font-bold" : "text-gray-500"}`}>
                                <Clock className="h-3 w-3" />
                                {isOverdue 
                                   ? `Overdue by ${Math.abs(daysRemaining)} days` 
                                   : `${daysRemaining} days remaining`
                                }
                             </p>
                          </div>
                          
                          {isOverdue ? (
                             <Tooltip>
                                <TooltipTrigger>
                                   <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                </TooltipTrigger>
                                <TooltipContent>Verification Overdue</TooltipContent>
                             </Tooltip>
                          ) : (
                             <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded">
                                Sent {format(new Date(startDate), "MMM d")}
                             </span>
                          )}
                       </div>
                    );
                 })}
              </div>
              <div className="bg-gray-50 p-2 text-center border-t border-gray-100">
                 <Link href="/admin/companies" className="text-xs font-medium text-blue-600 hover:underline">
                    Manage All
                 </Link>
              </div>
           </div>
        )}
      </div>

      {/* --- SECTION 2: GROWTH PULSE --- */}
      <div>
        <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-bold text-gray-900">Growth Pulse</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="New Users" value={`+${stats.newUsers}`} icon={TrendingUp} color="green" description="New accounts since last snapshot." timeSpan="Since Last Snapshot" />
            <StatCard title="New Reviews" value={`+${stats.newReviews}`} icon={MessageSquare} color="blue" description="Reviews published since last snapshot." timeSpan="Since Last Snapshot" />
            <StatCard title="Global Sentiment" value={stats.avgSentiment.toFixed(1)} icon={Star} color="yellow" description="Average star rating platform-wide." timeSpan="Weighted Average" />
        </div>
      </div>

      {/* --- SECTION 3: PLATFORM HEALTH --- */}
      <div>
        <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-bold text-gray-900">Platform Health</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CompactStat label="Total Users" value={userCount} desc="All registered accounts" timeSpan="Lifetime" />
            <CompactStat label="Total Reviews" value={reviewCount} desc="All published reviews" timeSpan="Lifetime" />
            <CompactStat label="Companies" value={companyCount} desc="Total business profiles" timeSpan="Lifetime" />
            <CompactStat label="Claim Rate" value={`${claimedPercentage}%`} desc="% of companies claimed" timeSpan="Current Ratio" />
        </div>
      </div>

      {/* --- SECTION 4: VISUAL DATA --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-gray-900">Review Velocity</h3>
                    <p className="text-sm text-gray-500">Daily review volume trends.</p>
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded-md text-xs font-medium text-gray-600">Last 30 Days</div>
            </div>
            <ReviewActivityChart data={chartData} />
         </div>

         <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Recent Activity</h3>
                <Link href="/admin/reviews" className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">
                    View All <ArrowUpRight className="h-3 w-3" />
                </Link>
            </div>
            <div className="divide-y divide-gray-100 flex-1 overflow-y-auto">
                {recentReviews.map(review => (
                    <div key={review.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                             <div className="flex items-center gap-1 bg-yellow-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-yellow-800">
                                <Star className="h-2.5 w-2.5 fill-yellow-700 text-yellow-700" />
                                {review.starRating}
                            </div>
                            <span className="text-[10px] text-gray-400">
                                {format(new Date(review.createdAt), "MMM d")}
                            </span>
                        </div>
                        <p className="text-xs font-medium text-gray-900 truncate mb-1">"{review.reviewTitle}"</p>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                            <span className="font-medium text-gray-700">{review.user?.name || 'Anon'}</span>
                            <span>reviewed</span>
                            <span className="font-medium text-blue-600 truncate max-w-[80px]">{review.company?.name}</span>
                        </div>
                    </div>
                ))}
                {recentReviews.length === 0 && (
                    <div className="p-8 text-center text-gray-400 text-sm">No recent activity.</div>
                )}
            </div>
         </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

// Helper function to calculate the difference in calendar days (Positive = Future, Negative = Past)
function differenceInCalendarDays(date1: Date, date2: Date) {
    const diffTime = date1.getTime() - date2.getTime(); // Deadline - Today
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
}

function StatCard({ title, value, icon: Icon, color, description, timeSpan }: any) {
    const colorStyles = {
        green: "bg-green-50 text-green-600 border-green-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
    }[color as string] || "bg-gray-50 text-gray-600";

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-1 mb-1">
                        <p className="text-sm font-medium text-gray-500">{title}</p>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="h-3.5 w-3.5 text-gray-300 hover:text-gray-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent><p className="max-w-xs">{description}</p></TooltipContent>
                        </Tooltip>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${colorStyles}`}><Icon className="h-6 w-6" /></div>
            </div>
            <div className="pt-4 border-t border-gray-50">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{timeSpan}</p>
            </div>
        </div>
    )
}

function CompactStat({ label, value, desc, timeSpan }: any) {
    return (
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">{label}</span>
                <Tooltip>
                    <TooltipTrigger><Info className="h-3.5 w-3.5 text-gray-300 hover:text-gray-500 cursor-help" /></TooltipTrigger>
                    <TooltipContent side="top"><p>{desc}</p></TooltipContent>
                </Tooltip>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">{timeSpan}</p>
        </div>
    )
}