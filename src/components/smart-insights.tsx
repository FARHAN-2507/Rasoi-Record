"use client";

import { useState, useTransition } from "react";
import { Lightbulb, Rocket, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { generateSmartInsights } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import type { WastageEntry } from "@/types";
import { Skeleton } from "./ui/skeleton";
import type { SmartInsight } from "@/ai/flows/generate-insights-flow";

type SmartInsightsProps = {
  data: WastageEntry[];
};

export default function SmartInsights({ data }: SmartInsightsProps) {
  const [insights, setInsights] = useState<SmartInsight[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weeklyData = data.filter(entry => entry.date >= sevenDaysAgo);

  const handleGenerateInsights = () => {
    startTransition(async () => {
      setInsights(null);
      const result = await generateSmartInsights(weeklyData);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        setInsights(result.insights ?? []);
         if (!result.insights || result.insights.length === 0) {
           toast({
            title: 'No New Insights',
            description: 'The AI could not find any specific insights this week. Keep up the good work!',
          });
        } else {
            toast({
                title: "Insights Generated!",
                description: "Your AI-powered suggestions are ready.",
            });
        }
      }
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <Wand2 className="h-6 w-6 text-primary" />
              Smart Insights
            </CardTitle>
            <CardDescription>
              Let AI analyze your weekly data for actionable advice.
            </CardDescription>
          </div>
          <Button onClick={handleGenerateInsights} disabled={isPending || weeklyData.length === 0}>
            <Rocket className="mr-2 h-4 w-4" />
            {isPending ? "Analyzing..." : "Get Insights"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="min-h-[150px]">
        {isPending ? (
          <div className="space-y-4">
             <div className="space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        ) : insights && insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-4">
                <Lightbulb className="h-5 w-5 mt-1 text-accent flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground">{insight.finding}</p>
                  <p className="text-sm font-medium mt-1">Suggestion: <span className="font-normal">{insight.suggestion}</span></p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Click "Get Insights" for personalized advice.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
