'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import type { WastageEntry, AppUser, Donation } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { HeartHandshake, Mail, Package, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function DonationsList() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDonations = async () => {
      if (!db) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const q = query(collection(db, "wastage"), where("reason", "==", "Overproduction"));
        const wastageSnapshot = await getDocs(q);
        const wastageEntries = wastageSnapshot.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                ...data,
                date: (data.date as any).toDate() 
            } as WastageEntry
        });

        if (wastageEntries.length === 0) {
          setDonations([]);
          setIsLoading(false);
          return;
        }

        wastageEntries.sort((a, b) => b.date.getTime() - a.date.getTime());

        const userIds = [...new Set(wastageEntries.map(entry => entry.userId))];

        const userBatches = [];
        for (let i = 0; i < userIds.length; i += 30) {
            userBatches.push(userIds.slice(i, i + 30));
        }

        const usersMap = new Map<string, AppUser>();
        
        for (const batch of userBatches) {
            if (batch.length > 0) {
                const userQuery = query(collection(db, "users"), where(documentId(), "in", batch));
                const userSnapshot = await getDocs(userQuery);
                userSnapshot.docs.forEach(doc => {
                    usersMap.set(doc.id, { uid: doc.id, ...doc.data() } as AppUser);
                });
            }
        }
        
        const combinedDonations: Donation[] = wastageEntries
          .map(entry => {
            const donor = usersMap.get(entry.userId);
            return donor ? { ...entry, donor } : null;
          })
          .filter((d): d is Donation => d !== null);

        setDonations(combinedDonations);
      } catch (error) {
        console.error("Error fetching donations:", error);
        toast({
            title: "Error",
            description: "Could not fetch available donations. Please try again later.",
            variant: "destructive"
        })
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonations();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="shadow-md">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
            <CardFooter>
               <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-12 text-center shadow-md">
        <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full">
                <HeartHandshake className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="mt-4 font-headline">No Donations Available</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">
                There are currently no items available for donation.
                <br />
                Wastage marked as 'Overproduction' will appear here.
            </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
        <div className="text-center">
            <h2 className="text-3xl font-headline tracking-tight">Available Donations</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                These items have been marked as 'Overproduction' by local restaurants and are available for donation. Contact the provider directly to arrange pickup.
            </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {donations.map((donation) => (
            <Card key={donation.id} className="flex flex-col shadow-md">
            <CardHeader>
                <CardTitle className="text-xl">{donation.item}</CardTitle>
                <CardDescription>
                    From: {donation.donor.email}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>Quantity: {donation.quantity} {donation.unit}</span>
                </div>
                 <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                        Listed {formatDistanceToNow(new Date(donation.date), { addSuffix: true })}
                    </span>
                </div>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                <a href={`mailto:${donation.donor.email}?subject=Donation Inquiry: ${donation.item}`}>
                    <Mail className="mr-2 h-4 w-4" /> Contact to Claim
                </a>
                </Button>
            </CardFooter>
            </Card>
        ))}
        </div>
    </div>
  );
}
