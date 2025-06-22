"use client";

import { useMemo } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { WastageEntry } from "@/types";
import { wastageReasons } from "@/types";

type WastageChartsProps = {
  data: WastageEntry[];
};

const trendChartConfig = {
  cost: {
    label: "Cost ($)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const reasonChartConfig = {
    ...wastageReasons.reduce((acc, reason, index) => {
        acc[reason] = {
            label: reason,
            color: `hsl(var(--chart-${(index % 5) + 1}))`
        };
        return acc;
    }, {} as Record<string, {label: string, color: string}>)
} satisfies ChartConfig;

export default function WastageCharts({ data }: WastageChartsProps) {
  const trendData = useMemo(() => {
    const dailyData: { [key: string]: number } = {};
    const relevantData = data.filter(entry => typeof entry.cost === 'number');

    relevantData.forEach((entry) => {
      const dateStr = entry.date.toLocaleDateString('en-CA');
      if (dailyData[dateStr]) {
        dailyData[dateStr] += entry.cost!;
      } else {
        dailyData[dateStr] = entry.cost!;
      }
    });

    return Object.entries(dailyData)
      .map(([date, cost]) => ({ date, cost: parseFloat(cost.toFixed(2)) }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  const reasonData = useMemo(() => {
    const reasonTotals: { [key: string]: number } = {};
    wastageReasons.forEach(r => reasonTotals[r] = 0);

    const relevantData = data.filter(entry => typeof entry.cost === 'number');
    relevantData.forEach(entry => {
        if(reasonTotals[entry.reason] !== undefined) {
            reasonTotals[entry.reason] += entry.cost!;
        }
    });
    
    return Object.entries(reasonTotals).map(([name, value]) => ({name, value: parseFloat(value.toFixed(2))}));
  }, [data]);

  const hasCostData = data.some(entry => typeof entry.cost === 'number');

  if (!hasCostData) {
    return (
        <div className="grid gap-8 md:grid-cols-1">
            <Card className="shadow-md flex items-center justify-center min-h-[368px]">
                <CardHeader className="text-center">
                    <CardTitle>No Cost Data Available</CardTitle>
                    <CardDescription>
                        Start adding costs to your wastage entries to see financial charts.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    )
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">Cost Trend</CardTitle>
          <CardDescription>Daily total cost of wastage over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={trendChartConfig} className="h-[250px] w-full">
            <AreaChart data={trendData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
              <YAxis unit="$" />
              <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value) => `$${value}`} />} />
              <Area dataKey="cost" type="monotone" fill="var(--color-cost)" fillOpacity={0.4} stroke="var(--color-cost)" />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">Cost by Reason</CardTitle>
          <CardDescription>Total cost of wastage for each reason</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={reasonChartConfig} className="h-[250px] w-full">
                <BarChart data={reasonData} layout="vertical" margin={{left: 20}}>
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" hide unit="$" />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} width={120} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value) => `$${value}`} />} />
                    <Bar dataKey="value" layout="vertical" radius={4}>
                         {reasonData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={reasonChartConfig[entry.name as keyof typeof reasonChartConfig]?.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
