'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateRecipes } from '@/lib/actions';
import { Lightbulb, ChefHat, Clock } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import type { Recipe } from '@/ai/flows/generate-recipes-flow';

export default function RecipeGenerator() {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGenerateRecipes = () => {
    if (!ingredients.trim()) {
      toast({
        title: 'No Ingredients',
        description: 'Please enter some ingredients to get recipe ideas.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      setRecipes([]);
      const result = await generateRecipes(ingredients);
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        setRecipes(result.recipes ?? []);
        if (!result.recipes || result.recipes.length === 0) {
           toast({
            title: 'No Recipes Found',
            description: 'The AI could not generate recipes from the ingredients provided. Try being more specific.',
          });
        } else {
            toast({
                title: 'Recipes Generated!',
                description: 'Your creative recipe ideas are ready.',
            });
        }
      }
    });
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            AI Recipe Idea Generator
          </CardTitle>
          <CardDescription>
            Enter a list of leftover ingredients (e.g., "chicken breast, tomatoes, basil") and let AI create recipes for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Textarea
              placeholder="Enter ingredients here..."
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="min-h-[100px]"
            />
            <Button onClick={handleGenerateRecipes} disabled={isPending}>
              <ChefHat className="mr-2 h-4 w-4" />
              {isPending ? 'Generating Ideas...' : 'Generate Recipes'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {isPending && (
           <div className="grid gap-6 md:grid-cols-2">
             {[...Array(2)].map((_, i) => (
                <Card key={i} className="shadow-md">
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                         <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </CardContent>
                </Card>
             ))}
           </div>
        )}

        {recipes.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {recipes.map((recipe, index) => (
              <Card key={index} className="flex flex-col shadow-md">
                <CardHeader>
                  <CardTitle>{recipe.title}</CardTitle>
                  <CardDescription>{recipe.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    <div>
                        <h4 className="font-semibold mb-2">Ingredients:</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2">Instructions:</h4>
                        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                            {recipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
                        </ol>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Prep Time: {recipe.prepTime}</span>
                    </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
