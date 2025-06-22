import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { WastageEntry } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportToCsv(data: WastageEntry[], fileName: string) {
    if (!data || data.length === 0) {
        console.warn("No data to export.");
        return;
    }

    const headers = "ID,Date,Item,Quantity,Unit,Reason,Cost";
    
    const rows = data.map(entry => {
        const rowData = [
            entry.id,
            entry.date.toLocaleDateString(),
            `"${entry.item.replace(/"/g, '""')}"`,
            entry.quantity,
            entry.unit,
            entry.reason,
            entry.cost ? entry.cost.toFixed(2) : ''
        ];
        return rowData.join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
