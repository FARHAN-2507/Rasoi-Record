"use client";

import { CookingPot, LogOut } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Header() {
  const { appUser } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/login');
    }
  };

  return (
    <header className="flex items-center justify-between gap-4 border-b bg-card px-4 sm:px-6 md:px-8 h-16">
      <div className="flex items-center gap-2">
        <CookingPot className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-headline tracking-tight text-foreground">
          Rasoi Record Insights
        </h1>
      </div>
      {appUser && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">{appUser.email}</span>
          <Button variant="ghost" size="icon" title="Logout" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      )}
    </header>
  );
}
