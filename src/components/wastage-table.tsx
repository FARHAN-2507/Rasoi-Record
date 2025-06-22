"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowUpDown, FileDown, Trash2 } from "lucide-react";
import { exportToCsv } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { WastageEntry, WastageReason } from "@/types";
import { wastageReasons } from "@/types";

type WastageTableProps = {
  data: WastageEntry[];
  onDeleteEntry: (id: string) => void;
};

type SortKey = keyof WastageEntry;
type SortDirection = 'asc' | 'desc';

export default function WastageTable({ data, onDeleteEntry }: WastageTableProps) {
  const [filterItem, setFilterItem] = useState("");
  const [filterReason, setFilterReason] = useState<WastageReason | "all">("all");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({ key: 'date', direction: 'desc'});
  const { toast } = useToast();

  const filteredData = useMemo(() => {
    let filtered = data;
    if (filterItem) {
      filtered = filtered.filter((entry) =>
        entry.item.toLowerCase().includes(filterItem.toLowerCase())
      );
    }
    if (filterReason !== "all") {
      filtered = filtered.filter((entry) => entry.reason === filterReason);
    }
    return filtered;
  }, [data, filterItem, filterReason]);

  const sortedData = useMemo(() => {
    let sortableData = [...filteredData];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [filteredData, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' ? <ArrowUpDown className="ml-2 h-4 w-4" /> : <ArrowUpDown className="ml-2 h-4 w-4" />;
  };

  const handleExport = () => {
    exportToCsv(sortedData, "wastage_report");
    toast({
      title: "Export Successful",
      description: "Your wastage data has been exported to CSV.",
    });
  };

  const handleDelete = (id: string) => {
    onDeleteEntry(id);
    toast({
        title: "Entry Deleted",
        description: "The wastage entry has been successfully deleted.",
        variant: "destructive"
    })
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <CardTitle className="font-headline text-2xl">Wastage Records</CardTitle>
                <CardDescription>
                View, filter, and export all logged wastage entries.
                </CardDescription>
            </div>
            <Button onClick={handleExport} disabled={sortedData.length === 0}>
                <FileDown className="mr-2 h-4 w-4" />
                Export CSV
            </Button>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Filter by item..."
            value={filterItem}
            onChange={(e) => setFilterItem(e.target.value)}
            className="w-full sm:w-64"
          />
          <Select value={filterReason} onValueChange={(value) => setFilterReason(value as WastageReason | "all")}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Filter by reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reasons</SelectItem>
              {wastageReasons.map(reason => (
                <SelectItem key={reason} value={reason}>{reason}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('item')}>
                    Item
                    {getSortIndicator('item')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('quantity')}>
                    Quantity
                    {getSortIndicator('quantity')}
                  </Button>
                </TableHead>
                <TableHead>
                   <Button variant="ghost" onClick={() => requestSort('cost')}>
                    Cost
                    {getSortIndicator('cost')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('reason')}>
                    Reason
                    {getSortIndicator('reason')}
                  </Button>
                </TableHead>
                <TableHead>
                   <Button variant="ghost" onClick={() => requestSort('date')}>
                    Date
                    {getSortIndicator('date')}
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length > 0 ? (
                sortedData.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.item}</TableCell>
                    <TableCell>{entry.quantity} {entry.unit}</TableCell>
                    <TableCell>{entry.cost ? `$${entry.cost.toFixed(2)}` : 'N/A'}</TableCell>
                    <TableCell>{entry.reason}</TableCell>
                    <TableCell>{entry.date.toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the wastage entry for "{entry.item}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(entry.id)} className={buttonVariants({ variant: "destructive" })}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
