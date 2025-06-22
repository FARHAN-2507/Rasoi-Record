
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Printer, CookingPot } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function ReportPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { appUser, loading: authLoading } = useAuth();
    const [isClient, setIsClient] = useState(false);

    const summary = searchParams.get('summary');

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!authLoading && !appUser) {
            router.push('/login');
        }
    }, [appUser, authLoading, router]);
    
    if (authLoading || !appUser) {
        return (
             <div className="flex items-center justify-center min-h-screen bg-background p-8">
                <Skeleton className="w-full max-w-4xl h-[600px]" />
            </div>
        );
    }
    
    if (!summary) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8">
                <Card className="text-center shadow-md">
                    <CardHeader>
                        <CardTitle>No summary provided</CardTitle>
                        <CardDescription>Go back to the dashboard to generate a report first.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push('/')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handlePrint = () => {
        if (isClient) {
            window.print();
        }
    };

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date();

    return (
        <main className="bg-background min-h-screen p-4 sm:p-8 print:bg-white print:p-0">
            <div className="max-w-4xl mx-auto">
                 <div className="flex justify-between items-center mb-8 print:hidden">
                    <Button variant="outline" onClick={() => router.push('/')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                    <Button onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print Report
                    </Button>
                </div>

                <Card className="shadow-lg print:shadow-none print:border-none print:bg-transparent">
                    <CardHeader className="bg-card print:bg-transparent">
                        <div className="flex items-center gap-3 mb-4">
                             <CookingPot className="h-8 w-8 text-primary" />
                             <h1 className="text-3xl font-headline tracking-tight text-foreground">
                                Rasoi Record
                             </h1>
                        </div>
                        <Separator />
                        <CardTitle className="pt-4 text-2xl">Weekly Wastage Report</CardTitle>
                        <CardDescription>
                            For period: {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                            <br />
                            Generated for: {appUser.email}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 text-base">
                        <h3 className="font-headline text-xl mb-4">AI-Generated Summary</h3>
                        <div className="prose max-w-none text-foreground/90 whitespace-pre-line">
                            {summary}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
