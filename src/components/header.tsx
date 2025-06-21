import { CookingPot } from "lucide-react";

export default function Header() {
  return (
    <header className="flex items-center gap-4 border-b bg-card px-4 sm:px-6 md:px-8 h-16">
      <div className="flex items-center gap-2">
        <CookingPot className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-headline tracking-tight text-foreground">
          WasteWise Insights
        </h1>
      </div>
    </header>
  );
}
