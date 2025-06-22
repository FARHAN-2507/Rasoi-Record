'use client';

import { useState } from 'react';
import { Target, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import type { WastageEntry } from '@/types';

type GoalTrackerProps = {
  weeklyData: WastageEntry[];
  goal: number | undefined;
  onUpdateGoal: (newGoal: number) => Promise<void>;
};

export default function GoalTracker({ weeklyData, goal, onUpdateGoal }: GoalTrackerProps) {
  const [newGoal, setNewGoal] = useState(goal || 0);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const totalWeeklyCost = weeklyData
    .reduce((sum, entry) => sum + (entry.cost || 0), 0);

  const progress = goal && goal > 0 ? (totalWeeklyCost / goal) * 100 : 0;
  
  const handleSave = async () => {
    if (newGoal <= 0) {
      toast({
        title: 'Invalid Goal',
        description: 'Please set a goal greater than $0.',
        variant: 'destructive',
      });
      return;
    }
    await onUpdateGoal(newGoal);
    toast({
      title: 'Goal Updated!',
      description: `Your new weekly waste goal is $${newGoal}.`,
    });
    setIsOpen(false);
  };

  const hasCostData = weeklyData.some(entry => typeof entry.cost === 'number' && entry.cost > 0);

  if (!hasCostData) {
      return null; // Don't show the component if there's no cost data to track
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
            <div>
                 <CardTitle className="font-headline text-2xl flex items-center gap-2">
                  <Target className="h-6 w-6 text-primary" />
                  Weekly Goal
                </CardTitle>
                <CardDescription>
                  Set and track your weekly waste reduction goal.
                </CardDescription>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>Set Your Weekly Goal</DialogTitle>
                    <DialogDescription>
                        Enter your target maximum waste cost for the week. This helps you stay on track.
                    </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input
                            id="goal"
                            type="number"
                            value={newGoal}
                            onChange={(e) => setNewGoal(Number(e.target.value))}
                            placeholder="e.g., 150"
                            className="col-span-3"
                        />
                    </div>
                    <DialogFooter>
                         <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSave}>Save Goal</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {goal && goal > 0 ? (
          <div className="space-y-3">
             <Progress value={progress > 100 ? 100 : progress} className="h-3" />
             <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground">Current: ${totalWeeklyCost.toFixed(2)}</span>
                <span className="text-foreground">Goal: ${goal.toFixed(2)}</span>
             </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            Click the edit icon to set your first weekly goal!
          </div>
        )}
      </CardContent>
       {goal && goal > 0 && (
         <CardFooter>
            {progress <= 100 ? 
                <p className="text-sm text-muted-foreground">You've used {progress.toFixed(0)}% of your weekly budget.</p> :
                <p className="text-sm text-destructive-foreground bg-destructive p-2 rounded-md">You're ${ (totalWeeklyCost - goal).toFixed(2) } over your goal!</p>
            }
         </CardFooter>
       )}
    </Card>
  );
}
