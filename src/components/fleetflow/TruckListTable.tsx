
"use client";
import type { Truck, Driver, Carrier } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Edit3, Eye, CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format, parseISO, isPast, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";

interface TruckListTableProps {
  trucks: Truck[];
  drivers: Driver[];
  carriers: Carrier[];
  onEdit: (truck: Truck) => void;
  onDelete: (truckId: string) => void;
}

export function TruckListTable({ trucks, drivers, carriers, onEdit, onDelete }: TruckListTableProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  const getDriverName = (driverId?: string) => drivers.find(d => d.id === driverId)?.name || 'Unassigned';
  const getCarrierName = (carrierId: string) => carriers.find(c => c.id === carrierId)?.name || 'N/A';

  const getStatusBadgeVariant = (status: Truck['maintenanceStatus']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Good': return 'default'; 
      case 'Needs Service': return 'destructive';
      case 'In Service': return 'secondary'; 
      default: return 'outline';
    }
  };

  const formatDate = (dateInput?: Date | string): string => {
    if (!hasMounted || !dateInput) return '...';
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    try {
        return format(date, 'MMM d, yyyy');
    } catch (e) {
        // console.error("Error formatting date:", dateInput, e);
        return 'Invalid Date';
    }
  };

  const getDateColor = (dateInput?: Date | string): string => {
    if (!hasMounted || !dateInput) return 'text-muted-foreground';
    try {
        const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
        if (isPast(date)) return 'text-destructive font-semibold';
        if (differenceInDays(date, new Date()) < 30) return 'text-yellow-600 font-semibold';
        return 'text-foreground';
    } catch (e) {
        // console.error("Error processing date for color:", dateInput, e);
        return 'text-muted-foreground';
    }
  };
  
  if (trucks.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No trucks found. Add a new truck to get started.</p>;
  }

  return (
    <TooltipProvider>
    <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>License Plate</TableHead>
          <TableHead>Carrier</TableHead>
          <TableHead>Driver</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>MC150 Due</TableHead>
          <TableHead>Permit Expiry</TableHead>
          <TableHead>Tax Due</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {trucks.map((truck) => (
          <TableRow key={truck.id}>
            <TableCell className="font-medium">{truck.name} <span className="text-xs text-muted-foreground">({truck.model} {truck.year})</span></TableCell>
            <TableCell>{truck.licensePlate}</TableCell>
            <TableCell>{getCarrierName(truck.carrierId)}</TableCell>
            <TableCell>{getDriverName(truck.driverId)}</TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(truck.maintenanceStatus)} 
                     className={cn(
                       truck.maintenanceStatus === 'Good' && 'bg-green-500 hover:bg-green-600 text-white',
                       truck.maintenanceStatus === 'Needs Service' && 'bg-red-500 hover:bg-red-600 text-white',
                       truck.maintenanceStatus === 'In Service' && 'bg-yellow-500 hover:bg-yellow-600 text-black' // Updated for better visibility
                     )}>
                {truck.maintenanceStatus}
              </Badge>
            </TableCell>
            <TableCell className={cn("text-xs", getDateColor(truck.mc150DueDate))}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="flex items-center gap-1">
                            {hasMounted && truck.mc150DueDate && <CalendarClock className="h-3 w-3" />}
                            {formatDate(truck.mc150DueDate)}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent><p>{truck.mc150DueDate ? 'MC150 Biennial Update Due' : 'MC150 Date Not Set'}</p></TooltipContent>
                </Tooltip>
            </TableCell>
            <TableCell className={cn("text-xs", getDateColor(truck.permitExpiryDate))}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="flex items-center gap-1">
                             {hasMounted && truck.permitExpiryDate && <CalendarClock className="h-3 w-3" />}
                            {formatDate(truck.permitExpiryDate)}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent><p>{truck.permitExpiryDate ? 'Permit Expiry Date' : 'Permit Expiry Not Set'}</p></TooltipContent>
                </Tooltip>
            </TableCell>
            <TableCell className={cn("text-xs", getDateColor(truck.taxDueDate))}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="flex items-center gap-1">
                            {hasMounted && truck.taxDueDate && <CalendarClock className="h-3 w-3" />}
                            {formatDate(truck.taxDueDate)}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent><p>{truck.taxDueDate ? 'Tax Due Date' : 'Tax Due Date Not Set'}</p></TooltipContent>
                </Tooltip>
            </TableCell>
            <TableCell className="text-right">
              <AlertDialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* <DropdownMenuItem onClick={() => console.log("View truck:", truck)}>
                      <Eye className="mr-2 h-4 w-4" /> View Details
                    </DropdownMenuItem> */}
                    <DropdownMenuItem onClick={() => onEdit(truck)}>
                      <Edit3 className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the truck "{truck.name}" and its associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(truck.id)} className="bg-destructive hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
    </TooltipProvider>
  );
}
