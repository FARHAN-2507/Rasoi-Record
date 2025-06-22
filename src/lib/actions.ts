'use server';

import { generateWeeklySummary as generateWeeklySummaryFlow } from "@/ai/flows/generate-weekly-summary";
import { generateRecipes as generateRecipesFlow, type Recipe } from "@/ai/flows/generate-recipes-flow";
import type { WastageEntry } from "@/types";

export async function generateWeeklySummary(data: WastageEntry[]) {
    if (!data || data.length === 0) {
        return { summary: "No wastage data available for the selected period to generate a summary." };
    }

    try {
        const wastageData = JSON.stringify(data.map(d => ({
            item: d.item,
            quantity: `${d.quantity} ${d.unit}`,
            reason: d.reason,
            date: d.date.toISOString().split('T')[0]
        })));
        
        const result = await generateWeeklySummaryFlow({ wastageData });
        return { summary: result.summary };
    } catch (error) {
        console.error("Error generating summary:", error);
        return { error: "Failed to generate summary. The AI model might be busy. Please try again later." };
    }
}

export async function generateRecipes(ingredients: string): Promise<{ recipes: Recipe[] | null; error?: string }> {
    if (!ingredients.trim()) {
        return { recipes: [], error: "Please enter some ingredients." };
    }

    try {
        const result = await generateRecipesFlow({ ingredients });
        return { recipes: result.recipes };
    } catch (error) {
        console.error("Error generating recipes:", error);
        return { recipes: null, error: "Failed to generate recipes. The AI model might be busy or the input may be invalid. Please try again." };
    }
}
