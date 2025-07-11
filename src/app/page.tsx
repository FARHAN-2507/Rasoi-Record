"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import WastageForm from "@/components/wastage-form";
import WastageTable from "@/components/wastage-table";
import WastageCharts from "@/components/wastage-charts";
import WeeklySummary from "@/components/weekly-summary";
import DonationsList from "@/components/donations-list";
import RecipeGenerator from "@/components/recipe-generator";
import SmartInsights from "@/components/smart-insights";
import GoalTracker from "@/components/goal-tracker";
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
  Timestamp,
  where,
  setDoc,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";

export default function Home() {
  const { appUser, setAppUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<WastageEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !appUser) {
      router.push("/login");
    }
  }, [appUser, authLoading, router]);

  useEffect(() => {
    if (!appUser || !db) {
      if (!authLoading && db === null) {
        toast({
            title: "Firebase Not Configured",
            description: "Please set up your Firebase credentials in the .env file.",
            variant: "destructive",
            duration: 999999,
        });
        setIsLoaded(true);
      }
      return;
    }

    const fetchData = async () => {
      setIsLoaded(false);
      try {
        let q;
        if (!db) {
          throw new Error("Firestore not initialized");
        }
        if (appUser.role === 'super_admin') {
          // Super admin sees all data
          q = query(collection(db, "wastage"));
        } else {
          // Owner sees only their data
          q = query(collection(db, "wastage"), where("userId", "==", appUser.uid));
        }
        
        const querySnapshot = await getDocs(q);
        const wastageData = querySnapshot.docs.map((docSnapshot) => {
          const docData = docSnapshot.data();
          return {
            id: docSnapshot.id,
            item: docData.item,
            quantity: docData.quantity,
            unit: docData.unit,
            reason: docData.reason,
            cost: docData.cost,
            date: (docData.date as Timestamp).toDate(),
            userId: docData.userId,
          } as WastageEntry;
        });
        
        // Sort data on the client-side to avoid needing a composite index
        wastageData.sort((a, b) => b.date.getTime() - a.date.getTime());

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
  }, [appUser, toast, authLoading]);

  const handleAddWastage = async (entry: Omit<WastageEntry, "id" | "date" | "userId">) => {
    if (!db || !appUser) {
        toast({
            title: "Error",
            description: "You must be logged in to add an entry.",
            variant: "destructive",
        });
        return;
    }

    const newEntryData = {
      ...entry,
      date: new Date(),
      userId: appUser.uid,
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

  const handleUpdateGoal = async (newGoal: number) => {
    if (!appUser || !db) return;

    const userDocRef = doc(db, 'users', appUser.uid);
    try {
        await setDoc(userDocRef, { weeklyWasteGoal: newGoal }, { merge: true });
        setAppUser(prev => prev ? { ...prev, weeklyWasteGoal: newGoal } : null);
    } catch (error) {
        console.error("Error updating goal:", error);
        toast({
            title: "Error",
            description: "Could not update your goal.",
            variant: "destructive",
        });
    }
  };

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weeklyData = data.filter(entry => entry.date >= sevenDaysAgo);
  
  if (authLoading || !isLoaded || !appUser) {
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
              <Skeleton className="h-[400px] w-full" />
              <Skeleton className="h-[150px] w-full" />
              <Skeleton className="h-[200px] w-full" />
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="records">All Records</TabsTrigger>
                <TabsTrigger value="donations">Donations</TabsTrigger>
                <TabsTrigger value="recipes">Recipe Ideas</TabsTrigger>
              </TabsList>
              <TabsContent value="dashboard" className="mt-6">
                <div className="flex flex-col gap-8">
                  <WastageCharts data={data} />
                  <GoalTracker weeklyData={weeklyData} goal={appUser.weeklyWasteGoal} onUpdateGoal={handleUpdateGoal} />
                  <WeeklySummary data={data} />
                  <SmartInsights data={data} />
                </div>
              </TabsContent>
              <TabsContent value="records" className="mt-6">
                <WastageTable data={data} onDeleteEntry={handleDeleteWastage} />
              </TabsContent>
              <TabsContent value="donations" className="mt-6">
                <DonationsList />
              </TabsContent>
              <TabsContent value="recipes" className="mt-6">
                <RecipeGenerator />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
