'use server';
/**
 * @fileOverview An AI-powered recipe generator.
 *
 * - generateRecipes - The exported function to call the flow.
 * - Recipe - The type for a single recipe object.
 * - GenerateRecipesInput - The input type for the generateRecipes function.
 * - GenerateRecipesOutput - The return type for the generateRecipes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecipeSchema = z.object({
    title: z.string().describe('The title of the recipe.'),
    description: z.string().describe('A short, enticing description of the dish.'),
    ingredients: z.array(z.string()).describe('A list of ingredients required for the recipe.'),
    instructions: z.array(z.string()).describe('The step-by-step instructions for preparing the dish.'),
    prepTime: z.string().describe('Estimated preparation time (e.g., "15 minutes").'),
});
export type Recipe = z.infer<typeof RecipeSchema>;

const GenerateRecipesInputSchema = z.object({
  ingredients: z.string().describe('A comma-separated list of ingredients the user has.'),
});
export type GenerateRecipesInput = z.infer<typeof GenerateRecipesInputSchema>;

const GenerateRecipesOutputSchema = z.object({
  recipes: z.array(RecipeSchema).describe('An array of 2-3 recipe suggestions.'),
});
export type GenerateRecipesOutput = z.infer<typeof GenerateRecipesOutputSchema>;

export async function generateRecipes(input: GenerateRecipesInput): Promise<GenerateRecipesOutput> {
  return generateRecipesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipesPrompt',
  input: {schema: GenerateRecipesInputSchema},
  output: {schema: GenerateRecipesOutputSchema},
  prompt: `You are a creative chef who specializes in minimizing food waste by creating delicious recipes from leftovers.

  A user has the following ingredients: {{{ingredients}}}

  Please generate 2-3 distinct and creative recipe ideas based on these ingredients. For each recipe, provide a title, a short description, a list of ingredients (you can include common pantry staples not in the original list if necessary), step-by-step instructions, and an estimated prep time.

  Focus on recipes that are practical for a restaurant setting, potentially as staff meals or special menu items. Ensure the output is valid JSON that adheres to the provided schema.
  `,
});

const generateRecipesFlow = ai.defineFlow(
  {
    name: 'generateRecipesFlow',
    inputSchema: GenerateRecipesInputSchema,
    outputSchema: GenerateRecipesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
