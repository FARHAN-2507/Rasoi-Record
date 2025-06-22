"use client";

import { useState, useTransition } from "react";
import { BrainCircuit, Sparkles, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { generateWeeklySummary } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import type { WastageEntry } from "@/types";
import { Skeleton } from "./ui/skeleton";

type WeeklySummaryProps = {
  data: WastageEntry[];
};

export default function WeeklySummary({ data }: WeeklySummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weeklyData = data.filter(entry => entry.date >= sevenDaysAgo);

  const handleGenerateSummary = () => {
    startTransition(async () => {
      const result = await generateWeeklySummary(weeklyData);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        setSummary(null);
      } else {
        setSummary(result.summary ?? null);
        toast({
            title: "Summary Generated",
            description: "AI-powered weekly report is ready."
        });
      }
    });
  };

  const handleViewReport = () => {
    if (summary) {
        router.push(`/report?summary=${encodeURIComponent(summary)}`);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <BrainCircuit className="h-6 w-6 text-primary" />
                    Weekly AI Summary
                </CardTitle>
                <CardDescription>
                    Get AI-powered insights on your wastage for the last 7 days.
                </CardDescription>
            </div>
             <div className="flex gap-2">
                <Button onClick={handleGenerateSummary} disabled={isPending || weeklyData.length === 0}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isPending ? "Generating..." : "Generate"}
                </Button>
                 <Button onClick={handleViewReport} disabled={!summary || isPending} variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Print
                </Button>
             </div>
        </div>
      </CardHeader>
      <CardContent className="min-h-[120px]">
        {isPending ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : summary ? (
          <p className="text-sm text-foreground/80 whitespace-pre-line">{summary}</p>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Click "Generate" to get your weekly report.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
