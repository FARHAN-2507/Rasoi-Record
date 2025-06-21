"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Header from "@/components/header";
import WastageForm from "@/components/wastage-form";
import WastageTable from "@/components/wastage-table";
import WastageCharts from "@/components/wastage-charts";
import WeeklySummary from "@/components/weekly-summary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WastageEntry } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const initialData: WastageEntry[] = [
  { id: '1', item: 'Tomatoes', quantity: 2, unit: 'kg', reason: 'Spoilage', date: new Date(new Date().setDate(new Date().getDate() - 1)) },
  { id: '2', item: 'Chicken Breast', quantity: 5, unit: 'kg', reason: 'Expired', date: new Date(new Date().setDate(new Date().getDate() - 2)) },
  { id: '3', item: 'Bread Loaves', quantity: 10, unit: 'units', reason: 'Preparation Waste', date: new Date(new Date().setDate(new Date().getDate() - 3)) },
  { id: '4', item: 'Milk', quantity: 3, unit: 'L', reason: 'Spoilage', date: new Date(new Date().setDate(new Date().getDate() - 4)) },
  { id: '5', item: 'Fries', quantity: 2.5, unit: 'kg', reason: 'Customer Leftover', date: new Date(new Date().setDate(new Date().getDate() - 5)) },
  { id: '6', item: 'Lettuce Head', quantity: 4, unit: 'units', reason: 'Spoilage', date: new Date(new Date().setDate(new Date().getDate() - 6)) },
  { id: '7', item: 'Burger Buns', quantity: 12, unit: 'units', reason: 'Overproduction', date: new Date(new Date().setDate(new Date().getDate() - 7)) },
];


export default function Home() {
  const [data, setData] = useState<WastageEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem("wastageData");
      if (storedData) {
        const parsedData = JSON.parse(storedData).map((entry: WastageEntry) => ({
          ...entry,
          date: new Date(entry.date),
        }));
        setData(parsedData);
      } else {
        setData(initialData);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      setData(initialData);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("wastageData", JSON.stringify(data));
      } catch (error) {
        console.error("Failed to save data to localStorage", error);
      }
    }
  }, [data, isLoaded]);

  const handleAddWastage = (entry: Omit<WastageEntry, 'id' | 'date'>) => {
    const newEntry: WastageEntry = {
      ...entry,
      id: uuidv4(),
      date: new Date(),
    };
    setData(prevData => [newEntry, ...prevData]);
  };

  const handleDeleteWastage = (id: string) => {
    setData(prevData => prevData.filter(entry => entry.id !== id));
  };
  
  if (!isLoaded) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-3 xl:grid-cols-4">
            <div className="lg:col-span-1 xl:col-span-1 space-y-4">
              <Skeleton className="h-[450px] w-full" />
            </div>
            <div className="lg:col-span-2 xl:col-span-3 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-3 xl:grid-cols-4">
          
          <div className="lg:col-span-1 xl:col-span-1">
            <WastageForm onAddEntry={handleAddWastage} />
          </div>

          <div className="lg:col-span-2 xl:col-span-3">
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="records">All Records</TabsTrigger>
              </TabsList>
              <TabsContent value="dashboard" className="mt-6">
                <div className="flex flex-col gap-8">
                  <WastageCharts data={data} />
                  <WeeklySummary data={data} />
                </div>
              </TabsContent>
              <TabsContent value="records" className="mt-6">
                <WastageTable data={data} onDeleteEntry={handleDeleteWastage} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
