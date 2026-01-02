// components/analytics/metric-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string; // e.g., "+12% this week"
  helperText: string;
  icon: React.ReactNode;
}

export function MetricCard({ title, value, subValue, helperText, icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {title}
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-gray-400 hover:text-blue-500 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px] text-xs bg-gray-900 text-white border-0">
                <p>{helperText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subValue && (
          <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
        )}
      </CardContent>
    </Card>
  );
}