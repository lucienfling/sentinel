import { useState } from "react";
import { useGetPerformanceMetrics, useGetPerformanceTrends } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function Analytics() {
  const [range, setRange] = useState<"daily" | "weekly" | "monthly" | "yearly">("weekly");
  const [trendRange, setTrendRange] = useState<"weekly" | "monthly" | "yearly">("monthly");

  const { data: metrics } = useGetPerformanceMetrics({ range });
  const { data: trends } = useGetPerformanceTrends({ range: trendRange });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-foreground">Performance Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Deep work, focus, and operational tempo.</p>
        </div>
        <Select value={range} onValueChange={(val: any) => setRange(val)}>
          <SelectTrigger className="w-[180px] bg-[#16161A] border-border">
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </header>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard 
            title="Focus Hours" 
            value={`${metrics.focusHours}h`} 
            change={metrics.comparedToPrevious.focusHoursChange} 
            suffix="vs last period" 
          />
          <MetricCard 
            title="Deep Work" 
            value={`${metrics.deepWorkHours}h`} 
            change={metrics.comparedToPrevious.deepWorkChange} 
            suffix="vs last period" 
          />
          <MetricCard 
            title="Tasks Completed" 
            value={metrics.tasksFinished.toString()} 
            change={metrics.comparedToPrevious.tasksChange} 
            suffix="vs last period" 
          />
          <MetricCard 
            title="Response Time" 
            value={`${metrics.emailResponseTimeMinutes}m`} 
            change={0} // placeholder
            suffix="avg email turnaround" 
          />
        </div>
      )}

      <Card className="bg-[#16161A] border-border mb-8">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">Productivity Trend</CardTitle>
          <Select value={trendRange} onValueChange={(val: any) => setTrendRange(val)}>
            <SelectTrigger className="w-[140px] h-8 bg-[#0a0a0b] border-border">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            {trends && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A2A30" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                    tickFormatter={(val) => val.substring(5)} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#16161A', borderColor: '#2A2A30', borderRadius: '8px' }}
                    itemStyle={{ color: '#f4f4f5' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="productivityScore" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, change, suffix }: { title: string, value: string, change: number, suffix: string }) {
  const isPositive = change >= 0;
  return (
    <Card className="bg-[#16161A] border-border">
      <CardContent className="p-6">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-light text-foreground">{value}</span>
          <span className={cn(
            "text-sm font-medium",
            isPositive ? "text-emerald-500" : "text-destructive"
          )}>
            {isPositive ? "+" : ""}{change}%
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{suffix}</p>
      </CardContent>
    </Card>
  );
}