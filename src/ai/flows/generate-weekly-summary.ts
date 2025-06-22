'use server';

/**
 * @fileOverview A weekly wastage summary report generator.
 *
 * - generateWeeklySummary - A function that handles the generation of a weekly summary report.
 * - GenerateWeeklySummaryInput - The input type for the generateWeeklySummary function.
 * - GenerateWeeklySummaryOutput - The return type for the generateWeeklySummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWeeklySummaryInputSchema = z.object({
  wastageData: z.string().describe('A JSON string containing the weekly wastage data, with item name, quantity, reason, and optional cost.'),
});
export type GenerateWeeklySummaryInput = z.infer<typeof GenerateWeeklySummaryInputSchema>;

const GenerateWeeklySummaryOutputSchema = z.object({
  summary: z.string().describe('A brief summary report highlighting key wastage trends for the week.'),
});
export type GenerateWeeklySummaryOutput = z.infer<typeof GenerateWeeklySummaryOutputSchema>;

export async function generateWeeklySummary(input: GenerateWeeklySummaryInput): Promise<GenerateWeeklySummaryOutput> {
  return generateWeeklySummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWeeklySummaryPrompt',
  input: {schema: GenerateWeeklySummaryInputSchema},
  output: {schema: GenerateWeeklySummaryOutputSchema},
  prompt: `You are an expert in analyzing food wastage data and generating concise weekly summary reports.

  Analyze the following weekly wastage data and generate a brief summary report highlighting key trends and issues.

  Data: {{{wastageData}}}

  Focus on identifying:
  - Items with the highest wastage quantities and, if available, highest cost.
  - Most common reasons for wastage.
  - The total financial impact of waste if cost data is provided.
  - Any significant changes or patterns.

  The summary should be no more than 200 words and provide actionable insights for reducing wastage. Prioritize financial impact in your summary.
  `,
});

const generateWeeklySummaryFlow = ai.defineFlow(
  {
    name: 'generateWeeklySummaryFlow',
    inputSchema: GenerateWeeklySummaryInputSchema,
    outputSchema: GenerateWeeklySummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
