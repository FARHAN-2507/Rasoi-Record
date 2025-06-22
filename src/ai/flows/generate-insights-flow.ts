'use server';
/**
 * @fileOverview An AI-powered insight generator for food wastage.
 *
 * - generateSmartInsights - The exported function to call the flow.
 * - SmartInsight - The type for a single insight object.
 * - GenerateSmartInsightsInput - The input type for the function.
 * - GenerateSmartInsightsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartInsightSchema = z.object({
  title: z.string().describe('A short, catchy title for the insight.'),
  finding: z.string().describe('A detailed description of the pattern or issue identified in the data.'),
  suggestion: z.string().describe('A concrete, actionable suggestion to address the finding.'),
});
export type SmartInsight = z.infer<typeof SmartInsightSchema>;

const GenerateSmartInsightsInputSchema = z.object({
  wastageData: z.string().describe('A JSON string containing the weekly wastage data, with item name, quantity, reason, and optional cost.'),
});
export type GenerateSmartInsightsInput = z.infer<typeof GenerateSmartInsightsInputSchema>;

const GenerateSmartInsightsOutputSchema = z.object({
  insights: z.array(SmartInsightSchema).describe('An array of 2-3 smart insights based on the data.'),
});
export type GenerateSmartInsightsOutput = z.infer<typeof GenerateSmartInsightsOutputSchema>;

export async function generateSmartInsights(input: GenerateSmartInsightsInput): Promise<GenerateSmartInsightsOutput> {
  return generateSmartInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSmartInsightsPrompt',
  input: {schema: GenerateSmartInsightsInputSchema},
  output: {schema: GenerateSmartInsightsOutputSchema},
  prompt: `You are an expert restaurant operations consultant specializing in food waste reduction.
  Analyze the following JSON data representing food wastage over the past week.

  Data: {{{wastageData}}}

  Your task is to identify 2-3 key patterns, problems, or opportunities within this data. For each one, provide a clear finding and an actionable suggestion.

  Prioritize insights that have a significant financial impact. If cost data is included, use it to frame your findings and suggestions in terms of monetary savings.

  Example Insights:
  - Finding: "There's a consistent spike in 'Bread' spoilage on Mondays, costing an estimated $25 this week." Suggestion: "Review your weekend bread inventory and adjust Monday's order down by 15% to see if that reduces spoilage and saves cost."
  - Finding: "Preparation Waste for 'Onions' is unusually high." Suggestion: "Conduct a brief training session with kitchen staff on proper onion dicing techniques to maximize yield."
  - Finding: "Expired avocados accounted for over $50 in waste." Suggestion: "Switch to a supplier with a more frequent delivery schedule for avocados to minimize spoilage."

  Focus on providing practical, easy-to-implement advice that leads to cost savings. Ensure the output is valid JSON that adheres to the provided schema.
  `,
});

const generateSmartInsightsFlow = ai.defineFlow(
  {
    name: 'generateSmartInsightsFlow',
    inputSchema: GenerateSmartInsightsInputSchema,
    outputSchema: GenerateSmartInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
