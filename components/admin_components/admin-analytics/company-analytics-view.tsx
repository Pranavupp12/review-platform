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
  Zap, Eye, MousePointerClick, DollarSign, Search, Info, MapPin
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { generateCompanyInsight } from "@/lib/search-action";
import { getSearchAnalytics } from "@/lib/get-advance-analytics";
import { AnalyticsPaywall } from "@/components/business_dashboard/analytics-paywall";
import { MetricCard } from "@/components/admin_components/admin-analytics/metric-card";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tooltip as UiTooltip
} from "@/components/ui/tooltip";
import { ReviewCard } from "@/components/shared/review-card";

interface CompanyAnalyticsViewProps {
  company: any;
  reviews: any[];
  isPro: boolean;
}

// --- HELPER: Info Tooltip ---
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

// --- HELPER: Keyword Highlighter ---
const HighlightedText = ({ text, keywords, type }: { text: string, keywords: string[], type: 'positive' | 'negative' }) => {
  if (!keywords || keywords.length === 0 || !text) return <>{text}</>;

  const snippetsToHighlight = keywords
    .map(k => {
      const parts = k.split(':');
      // Format: "topic:sentiment:snippet"
      // If snippet exists (index 2), use it. Otherwise use topic (index 0).
      if (parts.length >= 3) {
        return parts.slice(2).join(':').trim();
      }
      return parts[0].trim();
    })
    .filter(k => k.length > 0);

  if (snippetsToHighlight.length === 0) return <>{text}</>;

  // Escape special chars for Regex
  const escapedSnippets = snippetsToHighlight.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedSnippets.join('|')})`, 'gi');

  const parts = text.split(regex);

  const highlightClass = type === 'positive'
    ? "bg-green-100 text-green-800 px-1 rounded font-medium"
    : "bg-red-100 text-red-800 px-1 rounded font-medium";

  return (
    <span>
      {parts.map((part, i) =>
        snippetsToHighlight.some(k => k.toLowerCase() === part.toLowerCase())
          ? <span key={i} className={highlightClass}>{part}</span>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
};

// --- HELPER: Custom Chart Tooltip ---
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-100 shadow-xl rounded-xl text-sm min-w-[220px] z-50">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
          <p className="font-bold text-gray-900 capitalize">{data.topic}</p>
          <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">Avg: {data.avgRating.toFixed(1)} ★</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-red-700">
            <span className="flex items-center gap-2 text-xs font-medium"><div className="w-2 h-2 rounded-full bg-red-500" /> Negative</span>
            <span className="font-bold text-xs">{data.negPct}% <span className="text-gray-400 font-normal">({data.negCount})</span></span>
          </div>
          <div className="flex justify-between items-center text-amber-700">
            <span className="flex items-center gap-2 text-xs font-medium"><div className="w-2 h-2 rounded-full bg-amber-500" /> Neutral</span>
            <span className="font-bold text-xs">{data.neuPct}% <span className="text-gray-400 font-normal">({data.neuCount})</span></span>
          </div>
          <div className="flex justify-between items-center text-green-700">
            <span className="flex items-center gap-2 text-xs font-medium"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Positive</span>
            <span className="font-bold text-xs">{data.posPct}% <span className="text-gray-400 font-normal">({data.posCount})</span></span>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between text-gray-500 text-xs">
          <span>Total Mentions</span>
          <span className="font-medium text-gray-900">{data.total}</span>
        </div>
      </div>
    );
  }
  return null;
};

export function CompanyAnalyticsView({ company, reviews, isPro }: CompanyAnalyticsViewProps) {

  // --- STATE ---
  const [aiData, setAiData] = useState<{
    summary: string;
    suggestions: string[];
    trendAnalysis: string;
    sentimentAnalysis: string;
    sentimentActions: string[];
  } | null>(null);

  const [searchStats, setSearchStats] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(true);

  // --- CALCULATIONS ---
  const totalReviews = reviews.length;
  const positiveReviews = reviews.filter(r => r.starRating >= 4).length;
  const negativeReviews = reviews.filter(r => r.starRating <= 2).length;
  const nss = totalReviews > 0 ? Math.round(((positiveReviews - negativeReviews) / totalReviews) * 100) : 0;
  const currentScore = company.rating || 0;

  // --- EFFECT: Fetch Data ---
  useEffect(() => {
    if (!isPro) return;

    const fetchData = async () => {
      let sStats = null;
      try {
        sStats = await getSearchAnalytics(company.id);
        setSearchStats(sStats);
      } catch (e) { console.error("Search stats failed", e); }

      const metricsData = {
        trustScore: currentScore,
        nss: nss,
        totalReviews: totalReviews,
        searchImpressions: sStats?.totals?.impressions || 0,
        ctr: Number(sStats?.totals?.ctr) || 0,
        adValue: sStats?.totals?.adSpend || "0.00"
      };

      if (reviews.length > 0) {
        const aiResult = await generateCompanyInsight(
          reviews,
          metricsData,
          sStats?.topQueries || []
        );
        if (aiResult) setAiData(aiResult);
      }
      setAiLoading(false);
    };

    fetchData();
  }, [reviews, isPro, company.id]);

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

  // --- KEYWORD DATA PREP ---
  const keywordMap: Record<string, { total: number; positive: number; negative: number; neutral: number; sumRating: number }> = {};

  reviews.forEach(r => {
    const rawKeywords = r.keywords || [];

    rawKeywords.forEach((entry: string) => {
      let topic = entry;
      let sentiment = 'neutral';

      // 1. Parse "topic:sentiment:snippet"
      if (entry.includes(':')) {
        const parts = entry.split(':');
        topic = parts[0];
        sentiment = parts[1];
        // We ignore snippet (parts[2]) for the graph aggregation
      } else {
        // Fallback for old data
        topic = entry;
        if (r.starRating >= 4) sentiment = 'positive';
        else if (r.starRating <= 2) sentiment = 'negative';
      }

      // 2. Init Map
      if (!keywordMap[topic]) {
        keywordMap[topic] = { total: 0, positive: 0, negative: 0, neutral: 0, sumRating: 0 };
      }

      // 3. Update Counts
      keywordMap[topic].total++;
      keywordMap[topic].sumRating += r.starRating;

      if (sentiment === 'positive') keywordMap[topic].positive++;
      else if (sentiment === 'negative') keywordMap[topic].negative++;
      else keywordMap[topic].neutral++;
    });
  });

  const keywordAnalysis = Object.entries(keywordMap).map(([topic, data]) => {
    const posPct = Math.round((data.positive / data.total) * 100);
    const negPct = Math.round((data.negative / data.total) * 100);
    const neuPct = Math.round((data.neutral / data.total) * 100);

    return {
      topic,
      total: data.total,
      posCount: data.positive, // Used for tooltip
      neuCount: data.neutral,  // Used for tooltip
      negCount: data.negative, // Used for tooltip
      posPct,
      negPct,
      neuPct,
      avgRating: data.sumRating / data.total
    };
  });

  const topKeywords = [...keywordAnalysis].sort((a, b) => b.total - a.total).slice(0, 6);
  const riskAlert = keywordAnalysis.filter(k => k.total >= 1 && k.negPct >= 20).sort((a, b) => b.negPct - a.negPct)[0];

  // --- FILTERING: Backward Compatible Logic ---

  // Positive: Matches ":positive" tags OR (Legacy text + High Rating)
  const latestPositive = [...reviews]
    .filter(r => {
      const keywords = r.keywords || [];
      const hasSmartPositive = keywords.some((k: string) => k.toLowerCase().includes(':positive'));
      const hasLegacyPositive = r.starRating >= 4 && keywords.some((k: string) => !k.includes(':'));
      return hasSmartPositive || hasLegacyPositive;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Negative: Matches ":negative" tags OR (Legacy text + Low Rating)
  const latestNegative = [...reviews]
    .filter(r => {
      const keywords = r.keywords || [];
      const hasSmartNegative = keywords.some((k: string) => k.toLowerCase().includes(':negative'));
      const hasLegacyNegative = r.starRating <= 2 && keywords.some((k: string) => !k.includes(':'));
      return hasSmartNegative || hasLegacyNegative;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

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

        {isPro ? (
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
        ) : (
          <Card className="bg-gray-50 border-gray-200 opacity-60 relative overflow-hidden">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-400 flex items-center">Risk Alert</CardTitle></CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-gray-400">Locked</div>
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 backdrop-blur-[1px]">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* --- SECTION 2: PRO CONTENT --- */}
      {!isPro ? (
        <AnalyticsPaywall />
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* Search Analytics */}
          {searchStats && (
            <div className="space-y-4">
              <div className="flex items-center gap-2"><Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" /><h2 className="text-xl font-bold text-gray-900">Search & PPC Performance</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard title="Search Impressions" value={searchStats.totals.impressions} helperText="Appearances in search." icon={<Eye className="h-4 w-4 text-blue-500" />} />
                <MetricCard title="Total Clicks" value={searchStats.totals.clicks} helperText="Clicks to your profile." icon={<MousePointerClick className="h-4 w-4 text-green-500" />} />
                <MetricCard title="Click-Through Rate" value={`${searchStats.totals.ctr}%`} helperText="Percentage of clicks per impression." icon={<Zap className="h-4 w-4 text-yellow-500" />} />
                <MetricCard title="Est. Ad Value" value={`$${searchStats.totals.adSpend}`} helperText="Monetary value of organic traffic." icon={<DollarSign className="h-4 w-4 text-purple-500" />} />
              </div>

              {/* Search Query Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Search className="h-4 w-4 text-blue-500" />
                    Top Performing Search Queries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-500">
                        <tr>
                          <th className="px-4 py-3 font-medium">Search Query / Filter</th>
                          <th className="px-4 py-3 font-medium">User Region</th>
                          <th className="px-4 py-3 font-medium text-right">Impressions</th>
                          <th className="px-4 py-3 font-medium text-right">Clicks</th>
                          <th className="px-4 py-3 font-medium text-right">CTR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {searchStats.topQueries.length > 0 ? (
                          searchStats.topQueries.map((q: any, i: number) => (
                            <tr key={i} className="hover:bg-gray-50/50">
                              <td className="px-4 py-3 align-top">
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900 capitalize text-sm">{q.query}</span>
                                  {(q.location && q.location !== 'Global') && (
                                    <div className="flex items-center gap-1 text-[11px] text-blue-600 bg-blue-50 w-fit px-1.5 py-0.5 rounded border border-blue-100 mt-1">
                                      <Search className="h-3 w-3" />
                                      In: {q.location}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 align-top">
                                {(!q.userRegion || q.userRegion === 'unknown') ? (
                                  <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-400 px-2 py-1 rounded-md border border-gray-200">
                                    Unknown
                                  </span>
                                ) : (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-700">
                                    <div className="bg-gray-100 p-1 rounded-full text-gray-500"><MapPin className="h-3 w-3" /></div>
                                    <span className="capitalize font-medium">{q.userRegion}</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right align-top pt-3">{q.impressions}</td>
                              <td className="px-4 py-3 text-right align-top pt-3">{q.clicks}</td>
                              <td className="px-4 py-3 text-right align-top pt-3 text-blue-600 font-medium">
                                {((q.clicks / (q.impressions || 1)) * 100).toFixed(1)}%
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                              No search data recorded yet.
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

          {/* AI Insights & Executive Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

          {/* Tabs */}
          <Tabs defaultValue="performance" className="space-y-4">
            <TabsList>
              <TabsTrigger value="performance">Performance Trends</TabsTrigger>
              <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
            </TabsList>

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
                  <div className="flex items-center gap-2 mb-3 text-blue-800 font-bold"><BookOpen className="h-4 w-4" /> How to read these charts</div>
                  <ul className="space-y-3 text-sm text-blue-900/80 leading-relaxed">
                    <li className="flex gap-2"><span className="font-bold text-blue-700 shrink-0">TrustScore:</span><span>Shows reputation over time.</span></li>
                    <li className="flex gap-2"><span className="font-bold text-blue-700 shrink-0">Volume:</span><span>Number of new reviews.</span></li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sentiment" className="space-y-6">

              {/* Stacked Sentiment Graph */}
              <Card className="col-span-1 lg:col-span-2 shadow-sm border-gray-200">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Topic Sentiment Distribution
                        <InfoTooltip text="Sentiment is analyzed per topic based on text mentions, independent of the star rating. This reveals negative feedback hidden within positive reviews." />
                      </CardTitle>
                      <CardDescription>
                        See exactly how customers feel about key aspects of your business.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50/50 rounded-xl border border-gray-100 items-center">
                      <span className="text-xs font-bold text-gray-500 mr-2 uppercase tracking-wide">
                        Most Talked About:
                      </span>
                      {topKeywords.length > 0 ? topKeywords.map((k, i) => (
                        <div key={i} className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-md border border-gray-200 shadow-sm">
                          <span className="font-medium text-xs capitalize text-gray-700">{k.topic}</span>
                          <span className="text-[10px] text-gray-400">({k.total})</span>
                        </div>
                      )) : <span className="text-sm text-gray-400 italic">No topics found yet.</span>}
                    </div>

                    <div className="h-[400px] w-full mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={topKeywords}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          barCategoryGap="30%"
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis
                            dataKey="topic"
                            tick={{ fontSize: 12, fill: '#6b7280', textTransform: 'capitalize', fontWeight: 500 } as any}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                          />
                          <YAxis
                            unit="%"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#9ca3af' }}
                          />

                          <Tooltip content={<CustomChartTooltip />} cursor={{ fill: '#f9fafb' }} />
                          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} iconType="circle" />

                          <Bar dataKey="negPct" name="Negative" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} maxBarSize={60} />
                          <Bar dataKey="neuPct" name="Neutral" stackId="a" fill="#f59e0b" maxBarSize={60} />
                          <Bar dataKey="posPct" name="Positive" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-3 text-purple-800 font-bold z-10">
                    <Sparkles className="h-5 w-5" /> AI Sentiment Analysis
                  </div>
                  <p className="text-sm text-purple-900/80 leading-relaxed font-medium z-10">
                    {aiLoading ? "Reading reviews..." : (aiData?.sentimentAnalysis || "Insufficient review data.")}
                  </p>
                </div>

                <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-3 text-orange-800 font-bold z-10">
                    <Zap className="h-5 w-5" /> Recommended Fixes
                  </div>
                  <ul className="space-y-2 z-10 relative">
                    {(aiData?.sentimentActions || ["Analyzing complaints..."]).map((action, i) => (
                      <li key={i} className="text-sm text-orange-900/80 flex gap-2 items-start">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

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

            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}