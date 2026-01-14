"use client";

import { useState, useEffect } from "react";
import { getCompetitors, getComparisonData } from "@/lib/comparison-actions";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowUpRight, ArrowDownRight, Minus, 
  MapPin, Search, MousePointerClick, Eye, Zap 
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // ✅ Import Table

interface ComparisonTabProps {
  companyId: string;
  companyName: string;
}

export function ComparisonTab({ companyId, companyName }: ComparisonTabProps) {
  const [competitors, setCompetitors] = useState<{id: string, name: string}[]>([]);
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>("");
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCompetitors(companyId).then(setCompetitors);
  }, [companyId]);

  useEffect(() => {
    if (!selectedCompetitor) return;
    setLoading(true);
    getComparisonData(companyId, selectedCompetitor)
      .then((data) => {
        setComparisonData(data);
        setLoading(false);
      });
  }, [selectedCompetitor, companyId]);

  const selectedName = competitors.find(c => c.id === selectedCompetitor)?.name || "Competitor";

  // Helper for Metric Difference
  const MetricDiff = ({ val1, val2, suffix = "" }: { val1: number, val2: number, suffix?: string }) => {
    const diff = val1 - val2;
    const isPositive = diff > 0;
    const isZero = diff === 0;

    return (
      <div className={`flex items-center text-xs font-bold mt-1 ${isZero ? "text-gray-400" : isPositive ? "text-green-600" : "text-red-600"}`}>
        {isZero ? <Minus className="h-3 w-3 mr-1" /> : isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
        {isZero ? "Equal" : `${Math.abs(diff).toFixed(1)}${suffix} ${isPositive ? "Higher" : "Lower"}`}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Competitor Selector */}
      <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
        <span className="font-medium text-gray-700">Compare against:</span>
        <Select onValueChange={setSelectedCompetitor}>
          <SelectTrigger className="w-[280px] bg-white">
            <SelectValue placeholder="Select a competitor" />
          </SelectTrigger>
          <SelectContent>
            {competitors.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedCompetitor ? (
        <div className="text-center py-20 bg-white border border-dashed rounded-xl text-gray-400">
          Select a competitor from the dropdown to start comparison.
        </div>
      ) : loading ? (
        <div className="text-center py-20 text-gray-500">Analyzing data...</div>
      ) : comparisonData ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

          {/* 1. KEY METRICS COMPARISON */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CTR Card */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2"><Zap className="h-4 w-4 text-yellow-500" /> Click-Through Rate (CTR)</CardTitle></CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">You ({companyName})</p>
                    <div className="text-2xl font-bold">{comparisonData.myData.ctr.toFixed(1)}%</div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-1">{selectedName}</p>
                    <div className="text-xl font-medium text-gray-600">{comparisonData.theirData.ctr.toFixed(1)}%</div>
                  </div>
                </div>
                <div className="mt-2 border-t pt-2">
                  <MetricDiff val1={comparisonData.myData.ctr} val2={comparisonData.theirData.ctr} suffix="%" />
                </div>
              </CardContent>
            </Card>

             {/* Impressions Card */}
             <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2"><Eye className="h-4 w-4 text-blue-500" /> Total Impressions</CardTitle></CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">You</p>
                    <div className="text-2xl font-bold">{comparisonData.myData.totalImpressions}</div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-1">{selectedName}</p>
                    <div className="text-xl font-medium text-gray-600">{comparisonData.theirData.totalImpressions}</div>
                  </div>
                </div>
                <div className="mt-2 border-t pt-2">
                   <MetricDiff val1={comparisonData.myData.totalImpressions} val2={comparisonData.theirData.totalImpressions} />
                </div>
              </CardContent>
            </Card>

            {/* Clicks Card */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2"><MousePointerClick className="h-4 w-4 text-green-500" /> Total Clicks</CardTitle></CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">You</p>
                    <div className="text-2xl font-bold">{comparisonData.myData.totalClicks}</div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-1">{selectedName}</p>
                    <div className="text-xl font-medium text-gray-600">{comparisonData.theirData.totalClicks}</div>
                  </div>
                </div>
                <div className="mt-2 border-t pt-2">
                  <MetricDiff val1={comparisonData.myData.totalClicks} val2={comparisonData.theirData.totalClicks} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 2. TOP QUERIES TABLES (Side-by-Side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Search className="h-4 w-4 text-purple-500" /> Top Queries (You)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <TableList data={comparisonData.myData.topQueries} type="query" />
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50/50 border-dashed">
              <CardHeader className="pb-3 border-b border-gray-200">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-600">
                  <Search className="h-4 w-4 text-gray-400" /> Top Queries ({selectedName})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <TableList data={comparisonData.theirData.topQueries} type="query" />
              </CardContent>
            </Card>
          </div>

          {/* 3. TOP LOCATIONS TABLES (Side-by-Side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-500" /> Top Locations (You)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <TableList data={comparisonData.myData.topLocations} type="location" />
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50/50 border-dashed">
              <CardHeader className="pb-3 border-b border-gray-200">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" /> Top Locations ({selectedName})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <TableList data={comparisonData.theirData.topLocations} type="location" />
              </CardContent>
            </Card>
          </div>

        </div>
      ) : null}
    </div>
  );
}

// ✅ NEW: Clean Table List Component
function TableList({ data, type }: { data: any[], type: 'query' | 'location' }) {
  if (data.length === 0) return <div className="p-6 text-center text-xs text-gray-400 italic">No data available.</div>;
  
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="h-9 text-xs">{type === 'query' ? 'Search Term' : 'Region'}</TableHead>
          <TableHead className="h-9 text-xs text-right">Volume</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, i) => (
          <TableRow key={i} className="hover:bg-transparent">
            <TableCell className="py-2 text-sm font-medium text-gray-700 capitalize">
               {type === 'query' ? item.query : item.location}
            </TableCell>
            <TableCell className="py-2 text-right">
               <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                 {item.count}
               </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}