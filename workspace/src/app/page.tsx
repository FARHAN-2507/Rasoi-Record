"use client";

import { useState, useEffect } from "react";
import Header from "@/components/header";
import WastageForm from "@/components/wastage-form";
import WastageTable from "@/components/wastage-table";
import WastageCharts from "@/components/wastage-charts";
import WeeklySummary from "@/components/weekly-summary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WastageEntry } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [data, setData] = useState<WastageEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoaded(false);
      if (!db) {
        toast({
          title: "Firebase Not Configured",
          description: "Please set up your Firebase credentials in the .env file to store and retrieve data.",
          variant: "destructive",
          duration: 999999,
        });
        setData([]);
        setIsLoaded(true);
        return;
      }

      try {
        const q = query(collection(db, "wastage"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const wastageData = querySnapshot.docs.map((docSnapshot) => {
          const docData = docSnapshot.data();
          return {
            id: docSnapshot.id,
            item: docData.item,
            quantity: docData.quantity,
            unit: docData.unit,
            reason: docData.reason,
            date: (docData.date as Timestamp).toDate(),
          } as WastageEntry;
        });
        setData(wastageData);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
        toast({
          title: "Error",
          description: "Could not fetch data from database. Check Firestore rules and connection.",
          variant: "destructive",
        });
        setData([]);
      }
      setIsLoaded(true);
    };

    fetchData();
  }, [toast]);

  const handleAddWastage = async (entry: Omit<WastageEntry, "id" | "date">) => {
    if (!db) {
        toast({
            title: "Firebase Not Configured",
            description: "Cannot add entry. Please configure Firebase in .env file.",
            variant: "destructive",
        });
        return;
    }

    const newEntryData = {
      ...entry,
      date: new Date(),
    };

    try {
      const docRef = await addDoc(collection(db, "wastage"), newEntryData);
      const newEntry: WastageEntry = {
        ...newEntryData,
        id: docRef.id,
      };
      setData((prevData) => [newEntry, ...prevData]);
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        title: "Error",
        description: "Failed to log wastage entry.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWastage = async (id: string) => {
    if (!db) {
        toast({
            title: "Firebase Not Configured",
            description: "Cannot delete entry. Please configure Firebase in .env file.",
            variant: "destructive",
        });
        return;
    }
    try {
      await deleteDoc(doc(db, "wastage", id));
      setData((prevData) => prevData.filter((entry) => entry.id !== id));
    } catch (error) {
      console.error("Error deleting document: ", error);
      toast({
        title: "Error",
        description: "Failed to delete wastage entry.",
        variant: "destructive",
      });
    }
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
