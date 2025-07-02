"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { WastageEntry } from "@/types";
import { wastageReasons, wastageUnits } from "@/types";


const formSchema = z.object({
  item: z.string().min(2, "Item name must be at least 2 characters."),
  quantity: z.coerce.number().positive("Quantity must be a positive number."),
  unit: z.enum(wastageUnits as [string, ...string[]]),
  reason: z.enum(wastageReasons as [string, ...string[]]),
  cost: z.coerce.number().min(0, "Cost must be a positive number.").optional(),
});

type WastageFormProps = {
  onAddEntry: (entry: Omit<WastageEntry, "id" | "date" | "userId">) => void;
};

export default function WastageForm({ onAddEntry }: WastageFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item: "",
      quantity: 0,
      unit: "kg",
      reason: "Spoilage",
      cost: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddEntry(values as Omit<WastageEntry, 'id' | 'date' | 'userId'>);
    toast({
      title: "Entry Added",
      description: `${values.quantity} ${values.unit} of ${values.item} logged.`,
    });
    form.reset();
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Log Wastage</CardTitle>
        <CardDescription>
          Quickly add a new food wastage entry.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="item"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Tomatoes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {wastageUnits.map((unit) => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Wastage</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {wastageReasons.map((reason) => (
                        <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Cost (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 4.50" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <Button type="submit" className="w-full" size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Log Wastage
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
