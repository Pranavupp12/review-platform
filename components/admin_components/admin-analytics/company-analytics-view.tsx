"use client";

import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  TrendingUp, MessageSquare, AlertTriangle, ThumbsUp, ThumbsDown,
  Lightbulb, Sparkles, BookOpen, Lock,
  Zap, Eye, MousePointerClick, DollarSign, Search, Info, MapPin,
  Scale, Phone, FileText, Users, ArrowUpCircle
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { generateCompanyInsight } from "@/lib/search-action";
import { MetricCard } from "@/components/admin_components/admin-analytics/metric-card";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tooltip as UiTooltip
} from "@/components/ui/tooltip";
import { ReviewCard } from "@/components/shared/review-card";
import { ComparisonTab } from "@/components/admin_components/admin-analytics/comparison-tab";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// ✅ UPDATED INTERFACE
interface CompanyAnalyticsViewProps {
  company: any;
  reviews: any[];
  searchStats: any;
  userRole?: string;
  // We replace the raw 'features' array with the computed Tier
  analyticsTier?: string; // "BASIC" | "ADVANCED" | "PRO"
  features?: string[]; // Kept optional for legacy support if needed
}

// --- HELPER COMPONENTS (Unchanged) ---
const InfoTooltip = ({ text }: { text: string }) => (
  <TooltipProvider delayDuration={300}>
    <UiTooltip>
      <TooltipTrigger asChild>
        <Info className="h-3.5 w-3.5 text-gray-400 hover:text-blue-500 cursor-help transition-colors ml-1.5" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[250px] bg-gray-900 text-white border-gray-800 text-xs leading-relaxed" side="top">
        {text}
      </TooltipContent>
    </UiTooltip>
  </TooltipProvider>
);

const HighlightedText = ({ text, keywords, type }: { text: string, keywords: string[], type: 'positive' | 'negative' | 'neutral' }) => {
  if (!keywords || keywords.length === 0 || !text) return <>{text}</>;
  const snippetsToHighlight = keywords.map(k => { const parts = k.split(':'); if (parts.length >= 3) { return parts.slice(2).join(':').trim(); } return parts[0].trim(); }).filter(k => k.length > 0);
  if (snippetsToHighlight.length === 0) return <>{text}</>;
  const escapedSnippets = snippetsToHighlight.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedSnippets.join('|')})`, 'gi');
  const parts = text.split(regex);
  const highlightClass = type === 'positive' ? "bg-green-100 text-green-800 px-1 rounded font-medium" : type === 'negative' ? "bg-red-100 text-red-800 px-1 rounded font-medium" : "bg-amber-100 text-amber-900 px-1 rounded font-medium";
  return <span>{parts.map((part, i) => snippetsToHighlight.some(k => k.toLowerCase() === part.toLowerCase()) ? <span key={i} className={highlightClass}>{part}</span> : <span key={i}>{part}</span>)}</span>;
};

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (<div className="bg-white p-4 border border-gray-100 shadow-xl rounded-xl text-sm min-w-[220px] z-50"><div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2"><p className="font-bold text-gray-900 capitalize">{data.topic}</p><span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">Avg: {data.avgRating.toFixed(1)} ★</span></div><div className="space-y-2"><div className="flex justify-between items-center text-red-700"><span className="flex items-center gap-2 text-xs font-medium"><div className="w-2 h-2 rounded-full bg-red-500" /> Negative</span><span className="font-bold text-xs">{data.negPct}% <span className="text-gray-400 font-normal">({data.negCount})</span></span></div><div className="flex justify-between items-center text-amber-700"><span className="flex items-center gap-2 text-xs font-medium"><div className="w-2 h-2 rounded-full bg-amber-500" /> Neutral</span><span className="font-bold text-xs">{data.neuPct}% <span className="text-gray-400 font-normal">({data.neuCount})</span></span></div><div className="flex justify-between items-center text-green-700"><span className="flex items-center gap-2 text-xs font-medium"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Positive</span><span className="font-bold text-xs">{data.posPct}% <span className="text-gray-400 font-normal">({data.posCount})</span></span></div></div><div className="mt-3 pt-2 border-t border-gray-100 flex justify-between text-gray-500 text-xs"><span>Total Mentions</span><span className="font-medium text-gray-900">{data.total}</span></div></div>);
  }
  return null;
};

// --- LOCKED OVERLAY COMPONENT ---
function LockedFeatureOverlay({ title, description }: { title: string, description: string }) {
  return (
    <div className="relative p-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="p-4 bg-white rounded-full shadow-sm mb-4">
            <Lock className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 max-w-md mb-6">{description}</p>
        <Link href="/business/billing">
            <Button className="bg-[#0ABED6] hover:bg-[#09A8BD] text-white">
                <ArrowUpCircle className="h-4 w-4 mr-2" /> Upgrade Plan
            </Button>
        </Link>
    </div>
  );
}

export function CompanyAnalyticsView({ company, reviews, analyticsTier = "BASIC", searchStats, userRole }: CompanyAnalyticsViewProps) {

  // ✅ 1. Determine Access Level Logic
  // - If User is ADMIN -> ALWAYS Access
  // - If Tier is ADVANCED or PRO -> Access
  const hasAdvancedAccess = 
      userRole === 'ADMIN' || 
      analyticsTier === 'ADVANCED' || 
      analyticsTier === 'PRO';

  const [aiData, setAiData] = useState<{
    summary: string;
    suggestions: string[];
    trendAnalysis: string;
    sentimentAnalysis: string;
    sentimentActions: string[];
  } | null>(null);

  const [aiLoading, setAiLoading] = useState(true);

  // --- DATA PROCESSING ---
  const totalReviews = reviews.length;
  const positiveReviews = reviews.filter(r => r.starRating >= 4).length;
  const negativeReviews = reviews.filter(r => r.starRating <= 2).length;
  const nss = totalReviews > 0 ? Math.round(((positiveReviews - negativeReviews) / totalReviews) * 100) : 0;
  const currentScore = company.rating || 0;

  useEffect(() => {
    // Generate AI for all (Basic Trend Analysis is Free)
    const generateAi = async () => {
      const metricsData = {
        trustScore: currentScore,
        nss: nss,
        totalReviews: totalReviews,
        searchImpressions: searchStats?.totals?.impressions || 0,
        ctr: Number(searchStats?.totals?.ctr) || 0,
        adValue: searchStats?.totals?.adSpend || "0.00",
        adClicks: searchStats?.totals?.adClicks || 0,
      };
      if (reviews.length > 0) {
        const aiResult = await generateCompanyInsight(reviews, metricsData, searchStats?.topQueries || []);
        if (aiResult) setAiData(aiResult);
      }
      setAiLoading(false);
    };
    generateAi();
  }, [reviews, company.id, searchStats]);

  // --- CHART DATA PREP ---
  const trendData = [];
  let previousScore = 0;
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const monthLabel = format(date, "MMM");
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const monthlyReviews = reviews.filter(r => isWithinInterval(new Date(r.createdAt), { start, end }));
    const monthlySum = monthlyReviews.reduce((acc, r) => acc + r.starRating, 0);
    const monthlyAvg = monthlyReviews.length > 0 ? parseFloat((monthlySum / monthlyReviews.length).toFixed(1)) : previousScore;
    if (monthlyReviews.length > 0) previousScore = monthlyAvg;
    trendData.push({ month: monthLabel, score: monthlyAvg, reviews: monthlyReviews.length });
  }

  // --- KEYWORD ANALYSIS ---
  const keywordMap: Record<string, { total: number; positive: number; negative: number; neutral: number; sumRating: number }> = {};
  reviews.forEach(r => {
    const rawKeywords = r.keywords || [];
    rawKeywords.forEach((entry: string) => {
      let topic = entry;
      let sentiment = 'neutral';
      if (entry.includes(':')) { const parts = entry.split(':'); topic = parts[0]; sentiment = parts[1]; }
      else { topic = entry; if (r.starRating >= 4) sentiment = 'positive'; else if (r.starRating <= 2) sentiment = 'negative'; }
      if (!keywordMap[topic]) { keywordMap[topic] = { total: 0, positive: 0, negative: 0, neutral: 0, sumRating: 0 }; }
      keywordMap[topic].total++;
      keywordMap[topic].sumRating += r.starRating;
      if (sentiment === 'positive') keywordMap[topic].positive++; else if (sentiment === 'negative') keywordMap[topic].negative++; else keywordMap[topic].neutral++;
    });
  });

  const keywordAnalysis = Object.entries(keywordMap).map(([topic, data]) => {
    const posPct = Math.round((data.positive / data.total) * 100);
    const negPct = Math.round((data.negative / data.total) * 100);
    const neuPct = Math.round((data.neutral / data.total) * 100);
    return { topic, total: data.total, posCount: data.positive, neuCount: data.neutral, negCount: data.negative, posPct, negPct, neuPct, avgRating: data.sumRating / data.total };
  });

  const topKeywords = [...keywordAnalysis].sort((a, b) => b.total - a.total).slice(0, 6);
  const riskAlert = keywordAnalysis.filter(k => k.total >= 1 && k.negPct >= 20).sort((a, b) => b.negPct - a.negPct)[0];

  // --- REVIEW GRIDS FILTERING ---
  const latestPositive = [...reviews].filter(r => { 
    const keywords = r.keywords || []; 
    const hasSmartPositive = keywords.some((k: string) => k.toLowerCase().includes(':positive')); 
    const hasLegacyPositive = r.starRating >= 4 && keywords.some((k: string) => !k.includes(':')); 
    return hasSmartPositive || hasLegacyPositive; 
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);

  const latestNegative = [...reviews].filter(r => { 
    const keywords = r.keywords || []; 
    const hasSmartNegative = keywords.some((k: string) => k.toLowerCase().includes(':negative')); 
    const hasLegacyNegative = r.starRating <= 2 && keywords.some((k: string) => !k.includes(':')); 
    return hasSmartNegative || hasLegacyNegative; 
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);

  const latestNeutral = [...reviews].filter(r => { 
    const keywords = r.keywords || []; 
    const hasSmartNeutral = keywords.some((k: string) => k.toLowerCase().includes(':neutral')); 
    const hasLegacyNeutral = (r.starRating > 2 && r.starRating < 4) && keywords.some((k: string) => !k.includes(':')); 
    return hasSmartNeutral || hasLegacyNeutral; 
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);

  return (
    <div className="space-y-8">

      {/* --- SECTION 1: KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">TrustScore <InfoTooltip text="Score based on review ratings and recency." /></CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{currentScore.toFixed(1)}</div></CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">Net Sentiment <InfoTooltip text="Balance between positive and negative feedback." /></CardTitle>
            {nss > 0 ? <ThumbsUp className="h-4 w-4 text-blue-500" /> : <ThumbsDown className="h-4 w-4 text-red-500" />}
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{nss}</div></CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">Total Reviews <InfoTooltip text="Total verified reviews collected." /></CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalReviews}</div></CardContent>
        </Card>

        <Card className={riskAlert ? "bg-red-50 border-red-100" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
              Risk Alert <InfoTooltip text="Topics generating high negative sentiment." />
            </CardTitle>
            <AlertTriangle className={`h-4 w-4 ${riskAlert ? "text-red-600" : "text-gray-400"}`} />
          </CardHeader>
          <CardContent>
            {riskAlert ? (
              <>
                <div className="text-xl font-bold text-red-700 capitalize">{riskAlert.topic}</div>
                <p className="text-xs text-red-600/80">{riskAlert.negPct}% Negative</p>
              </>
            ) : (
              <>
                <div className="text-xl font-bold text-green-700">All Clear</div>
                <p className="text-xs text-green-600/80">No major risks</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- SECTION 2: SEARCH & PPC (Locked/Hidden based on plan) --- */}
      {hasAdvancedAccess && searchStats && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-2">
             <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
             <h2 className="text-xl font-bold text-gray-900">Search & PPC Performance</h2>
             <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded border border-purple-200 font-medium">Growth Feature</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MetricCard title="Search Impressions" value={searchStats.totals?.impressions || 0} helperText="Appearances in search." icon={<Eye className="h-4 w-4 text-blue-500" />} />
              <MetricCard 
                  title="Total Clicks" 
                  value={searchStats.totals?.clicks || 0} 
                  // ✅ Show breakdown if sponsored, otherwise just total
                  helperText={company.isSponsored ? `${searchStats.totals?.adClicks || 0} from Sponsored slots` : "Clicks to your profile."} 
                  icon={<MousePointerClick className="h-4 w-4 text-green-500" />} 
              />
              <MetricCard title="Click-Through Rate" value={`${searchStats.totals?.ctr || 0}%`} helperText="Percentage of clicks per impression." icon={<Zap className="h-4 w-4 text-yellow-500" />} />
              <MetricCard title="Est. Ad Value" value={`$${searchStats.totals?.adSpend || "0.00"}`} helperText="Monetary value of organic traffic." icon={<DollarSign className="h-4 w-4 text-purple-500" />} />
            </div>

            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="flex items-center gap-2"><Users className="h-5 w-5 text-orange-500" /><h2 className="text-xl font-bold text-gray-900">Lead Generation</h2></div>
              <MetricCard title="Calls Generated" value={searchStats.totals?.calls || 0} helperText="CTA Button clicks" icon={<Phone className="h-4 w-4 text-purple-500" />} />
              <MetricCard title="Leads Generated" value={searchStats.totals?.leads || 0} helperText="Quote requests" icon={<FileText className="h-4 w-4 text-orange-500" />} />
            </div>
          </div>

          <Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2 text-base">
      <Search className="h-4 w-4 text-blue-500" /> Top Performing Search Queries
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-500">
          <tr>
            <th className="px-4 py-3 font-medium">Search Query / Location</th>
            <th className="px-4 py-3 font-medium">User Region</th>
            <th className="px-4 py-3 font-medium text-right">Impressions</th>
            <th className="px-4 py-3 font-medium text-right">Total Clicks</th>
            
            {/* ✅ CHANGE 1: Conditionally Render Header */}
            {company.isSponsored && (
               <th className="px-4 py-3 font-medium text-right text-purple-600">Ad Clicks</th>
            )}
            
            <th className="px-4 py-3 font-medium text-right">CTR</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {(searchStats.topQueries || []).length > 0 ? (
            (searchStats.topQueries || []).map((q: any, i: number) => (
              <tr key={i} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 align-top">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 capitalize text-sm">{q.query}</span>
                    {(q.location && q.location !== 'Global') && (
                      <div className="flex items-center gap-1 text-[11px] text-blue-600 bg-blue-50 w-fit px-1.5 py-0.5 rounded border border-blue-100 mt-1">
                        <Search className="h-3 w-3" /> In: {q.location}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  {(!q.userRegion || q.userRegion === 'unknown') ? (
                    <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-400 px-2 py-1 rounded-md border border-gray-200">Unknown</span>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-gray-700">
                      <div className="bg-gray-100 p-1 rounded-full text-gray-500"><MapPin className="h-3 w-3" /></div>
                      <span className="capitalize font-medium">{q.userRegion}</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-right pt-3">{q.impressions || 0}</td>
                <td className="px-4 py-3 text-right pt-3">{q.clicks || 0}</td>
                
                {/* ✅ CHANGE 2: Conditionally Render Data Cell */}
                {company.isSponsored && (
                    <td className="px-4 py-3 text-right pt-3 font-bold text-purple-600 bg-purple-50/30">
                        {q.adClicks || 0}
                    </td>
                )}

                <td className="px-4 py-3 text-right pt-3 text-blue-600 font-medium">
                  {(((q.clicks || 0) / (q.impressions || 1)) * 100).toFixed(1)}%
                </td>
              </tr>
            ))
          ) : (
            <tr>
                {/* ✅ CHANGE 3: Dynamic ColSpan */}
                <td colSpan={company.isSponsored ? 6 : 5} className="px-4 py-8 text-center text-gray-400">
                    No search query data available yet.
                </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </CardContent>
</Card>
        </div>
      )}

      {/* --- SECTION 3: EXECUTIVE SUMMARY --- */}
      {hasAdvancedAccess && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <div className="lg:col-span-2 bg-gradient-to-r from-[#000032] to-[#000050] rounded-xl p-6 text-white shadow-lg relative overflow-hidden min-h-[180px]">
            <div className="absolute top-0 right-0 p-6 opacity-10"><Sparkles className="h-32 w-32" /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4"><Sparkles className="h-5 w-5 text-[#0ABED6]" /><h3 className="font-bold text-lg">{aiLoading ? "Analyzing Business Data..." : "Executive Business Summary"}</h3></div>
              <p className="text-blue-100 leading-relaxed text-lg font-medium">"{aiData?.summary || "Insufficient data."}"</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm min-h-[180px]">
            <div className="flex items-center gap-2 mb-4"><Lightbulb className="h-5 w-5 text-yellow-500" /><h3 className="font-bold text-gray-900">Strategic Suggestions</h3></div>
            <ul className="space-y-3">
              {(aiData?.suggestions || ["Analyzing metrics..."]).map((s, i) => (
                <li key={i} className="text-sm text-gray-600 flex gap-3 items-start"><span className="text-[#0ABED6] mt-1.5 text-[10px]">●</span><span>{s}</span></li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* --- SECTION 4: TABS (Mixed Access) --- */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance Trends</TabsTrigger>
          <TabsTrigger value="sentiment" className="flex items-center gap-2">
            Sentiment Analysis {!hasAdvancedAccess && <Lock className="h-3 w-3 text-gray-400" />}
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            Comparison {!hasAdvancedAccess && <Lock className="h-3 w-3 text-gray-400" />}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Performance */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card><CardHeader><CardTitle>TrustScore History</CardTitle></CardHeader><CardContent className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={trendData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" /><YAxis domain={[0, 5]} /><Tooltip /><Line type="monotone" dataKey="score" stroke="#0ABED6" strokeWidth={3} /></LineChart></ResponsiveContainer></CardContent></Card>
            <Card><CardHeader><CardTitle>Review Volume</CardTitle></CardHeader><CardContent className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={trendData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="reviews" fill="#000032" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-purple-50 p-6 rounded-xl border border-purple-100 relative overflow-hidden flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3 text-purple-800 font-bold z-10">
                <Sparkles className="h-5 w-5" /> AI Trend Insight
              </div>
              <p className="text-sm text-purple-900/80 leading-relaxed font-medium z-10">
                {aiLoading ? "Analyzing trends..." : (aiData?.trendAnalysis || "Not enough historical data to analyze trends yet.")}
              </p>
              <div className="absolute top-[-20px] right-[-20px] opacity-5"><Sparkles className="h-32 w-32 text-purple-600" /></div>
            </div>
            <div className="lg:col-span-1 bg-blue-50 p-6 rounded-xl border border-blue-100 h-full flex flex-col justify-center">
               <div className="flex items-center gap-2 mb-3 text-blue-800 font-bold"><BookOpen className="h-4 w-4" /> How to read charts</div>
               <p className="text-sm text-blue-800/80">Monitor your TrustScore closely. Sudden drops often indicate a recent influx of negative reviews that need attention.</p>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Sentiment (Locked for Free) */}
        <TabsContent value="sentiment" className="space-y-6">
            {!hasAdvancedAccess ? (
                <LockedFeatureOverlay 
                    title="Unlock Sentiment Analysis" 
                    description="Dive deep into customer feelings with topic extraction, negative keyword highlighting, and AI-driven action plans."
                />
            ) : (
                <>
                {/* 1. Stacked Sentiment Graph */}
                <Card className="col-span-1 lg:col-span-2 shadow-sm border-gray-200">
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2">Topic Sentiment Distribution</CardTitle>
                    <CardDescription>See exactly how customers feel about key aspects of your business.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="h-[400px] w-full mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topKeywords} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barCategoryGap="30%">
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="topic" tick={{ fontSize: 12, fill: '#6b7280', textTransform: 'capitalize' } as any} axisLine={false} tickLine={false} dy={10} />
                            <YAxis unit="%" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                            <Tooltip content={<CustomChartTooltip />} cursor={{ fill: '#f9fafb' }} />
                            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} iconType="circle" />
                            <Bar dataKey="negPct" name="Negative" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} maxBarSize={60} />
                            <Bar dataKey="neuPct" name="Neutral" stackId="a" fill="#f59e0b" maxBarSize={60} />
                            <Bar dataKey="posPct" name="Positive" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
                        </BarChart>
                        </ResponsiveContainer>
                    </div>
                    </CardContent>
                </Card>

                {/* 2. AI Sentiment & Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-indigo-50 p-6 rounded-xl border border-indigo-100 relative overflow-hidden flex flex-col justify-center min-h-[160px]">
                    <div className="flex items-center gap-2 mb-3 text-indigo-900 font-bold z-10">
                        <Sparkles className="h-5 w-5 text-indigo-600 fill-indigo-200" /> AI Sentiment Analysis
                    </div>
                    <p className="text-sm text-indigo-900/80 leading-relaxed font-medium z-10">
                        {aiLoading ? "Analyzing sentiment..." : (aiData?.sentimentAnalysis || "Insufficient data to analyze sentiment depth.")}
                    </p>
                    <div className="absolute top-[-20px] right-[-20px] opacity-5"><Sparkles className="h-32 w-32 text-indigo-600" /></div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 h-full flex flex-col justify-center min-h-[160px]">
                    <div className="flex items-center gap-2 mb-3 text-gray-900 font-bold">
                        <Lightbulb className="h-5 w-5 text-yellow-500" /> Recommended Actions
                    </div>
                    <ul className="space-y-2">
                        {(aiData?.sentimentActions || ["Gather more reviews to unlock actions."]).slice(0, 3).map((action, i) => (
                        <li key={i} className="text-xs text-gray-600 flex gap-2 items-start"><span className="text-indigo-500 mt-0.5 text-[10px] shrink-0">●</span><span>{action}</span></li>
                        ))}
                    </ul>
                    </div>
                </div>

                {/* 3. Review Grids (Positive / Neutral / Negative) */}
                <div className="space-y-8 mt-6">
                    {/* Positive Grid */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <ThumbsUp className="h-5 w-5 text-green-600" />
                        Top Positive Mentions
                      </h3>
                      {latestPositive.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {latestPositive.map((r: any, i: number) => (
                            <div key={`${r.id}-${i}`} className="h-full">
                              <ReviewCard
                                userName={r.user?.name || "Anonymous"}
                                userInitials={r.user?.name?.[0] || "A"}
                                userAvatarUrl={r.user?.image}
                                rating={r.starRating}
                                className="w-full h-full max-w-none shadow-sm hover:shadow-md transition-shadow"
                                textClassName="line-clamp-6"
                                reviewText={<HighlightedText
                                  text={r.comment || r.text || r.content}
                                  keywords={r.keywords?.filter((k: string) =>
                                    k.toLowerCase().includes(':positive') || (!k.includes(':') && r.starRating >= 4)
                                  )}
                                  type="positive"
                                /> as any}
                                companyName={company.name}
                                companyLogoUrl={company.logoImage}
                                companyDomain={company.websiteUrl}
                                companySlug={company.slug}
                                createdAt={r.createdAt}
                                dateOfExperience={r.dateOfExperience || r.createdAt}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-gray-400">
                          No positive reviews with specific keywords found recently.
                        </div>
                      )}
                    </div>

                    {/* Neutral Grid */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <Scale className="h-5 w-5 text-amber-500" />
                        Neutral / Balanced Feedback
                      </h3>
                      {latestNeutral.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {latestNeutral.map((r: any, i: number) => (
                            <div key={`${r.id}-${i}`} className="h-full">
                              <ReviewCard
                                userName={r.user?.name || "Anonymous"}
                                userInitials={r.user?.name?.[0] || "A"}
                                userAvatarUrl={r.user?.image}
                                rating={r.starRating}
                                className="w-full h-full max-w-none shadow-sm hover:shadow-md transition-shadow"
                                textClassName="line-clamp-6"
                                reviewText={<HighlightedText
                                  text={r.comment || r.text || r.content}
                                  keywords={r.keywords?.filter((k: string) =>
                                    k.toLowerCase().includes(':neutral') || (!k.includes(':') && r.starRating > 2 && r.starRating < 4)
                                  )}
                                  type="neutral"
                                /> as any}
                                companyName={company.name}
                                companyLogoUrl={company.logoImage}
                                companyDomain={company.websiteUrl}
                                companySlug={company.slug}
                                createdAt={r.createdAt}
                                dateOfExperience={r.dateOfExperience || r.createdAt}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-gray-400">
                          No neutral or balanced feedback found recently.
                        </div>
                      )}
                    </div>

                    {/* Negative Grid */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        Critical Issues
                      </h3>
                      {latestNegative.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {latestNegative.map((r: any, i: number) => (
                            <div key={`${r.id}-${i}`} className="h-full relative group">
                              {r.starRating >= 4 && (
                                <div className="absolute bottom-7 right-4 z-10 bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200">
                                  Mixed Sentiment
                                </div>
                              )}
                              <ReviewCard
                                userName={r.user?.name || "Anonymous"}
                                userInitials={r.user?.name?.[0] || "A"}
                                userAvatarUrl={r.user?.image}
                                rating={r.starRating}
                                className="w-full h-full max-w-none shadow-sm hover:shadow-md transition-shadow"
                                textClassName="line-clamp-6"
                                reviewText={<HighlightedText
                                  text={r.comment || r.text || r.content}
                                  keywords={r.keywords?.filter((k: string) =>
                                    k.toLowerCase().includes(':negative') || (!k.includes(':') && r.starRating <= 2)
                                  )}
                                  type="negative"
                                /> as any}
                                companyName={company.name}
                                companyLogoUrl={company.logoImage}
                                companyDomain={company.websiteUrl}
                                companySlug={company.slug}
                                createdAt={r.createdAt}
                                dateOfExperience={r.dateOfExperience || r.createdAt}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-gray-400">
                          No critical issues found recently. Great job!
                        </div>
                      )}
                    </div>
                </div>
                </>
            )}
        </TabsContent>

        {/* Tab 3: Comparison (Locked for Free) */}
        <TabsContent value="comparison" className="space-y-6">
            {!hasAdvancedAccess ? (
                <LockedFeatureOverlay 
                    title="Unlock Competitor Comparison" 
                    description="Benchmark your performance against industry leaders. See how your TrustScore and Sentiment metrics stack up."
                />
            ) : (
                <ComparisonTab
                    companyId={company.id}
                    companyName={company.name}
                />
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}