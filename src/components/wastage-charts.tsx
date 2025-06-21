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
  wastage: {
    label: "Wastage (kg)",
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
    data.forEach((entry) => {
      // Simple normalization to kg for charting. This is a simplification.
      const quantityInKg = entry.unit === 'g' ? entry.quantity / 1000 : entry.unit.match(/L|ml/) ? 0 : entry.quantity;
      const dateStr = entry.date.toLocaleDateString('en-CA');
      if (dailyData[dateStr]) {
        dailyData[dateStr] += quantityInKg;
      } else {
        dailyData[dateStr] = quantityInKg;
      }
    });

    return Object.entries(dailyData)
      .map(([date, wastage]) => ({ date, wastage: parseFloat(wastage.toFixed(2)) }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  const reasonData = useMemo(() => {
    const reasonTotals: { [key: string]: number } = {};
    wastageReasons.forEach(r => reasonTotals[r] = 0);

    data.forEach(entry => {
        const quantityInKg = entry.unit === 'g' ? entry.quantity / 1000 : entry.unit.match(/L|ml/) ? 0 : entry.quantity;
        if(reasonTotals[entry.reason] !== undefined) {
            reasonTotals[entry.reason] += quantityInKg;
        }
    });
    
    return Object.entries(reasonTotals).map(([name, value]) => ({name, value: parseFloat(value.toFixed(2))}));

  }, [data]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">Wastage Trend</CardTitle>
          <CardDescription>Daily total wastage over time (normalized to kg)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={trendChartConfig} className="h-[250px] w-full">
            <AreaChart data={trendData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
              <YAxis />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Area dataKey="wastage" type="monotone" fill="var(--color-wastage)" fillOpacity={0.4} stroke="var(--color-wastage)" />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">Wastage by Reason</CardTitle>
          <CardDescription>Total wastage for each reason (normalized to kg)</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={reasonChartConfig} className="h-[250px] w-full">
                <BarChart data={reasonData} layout="vertical" margin={{left: 20}}>
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" hide/>
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} width={120} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
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
