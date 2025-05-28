"use client";
import type { Truck, Driver, Carrier } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Edit3, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface TruckListTableProps {
  trucks: Truck[];
  drivers: Driver[];
  carriers: Carrier[];
  onEdit: (truck: Truck) => void;
  onDelete: (truckId: string) => void;
}

export function TruckListTable({ trucks, drivers, carriers, onEdit, onDelete }: TruckListTableProps) {
  
  const getDriverName = (driverId?: string) => drivers.find(d => d.id === driverId)?.name || 'Unassigned';
  const getCarrierName = (carrierId: string) => carriers.find(c => c.id === carrierId)?.name || 'N/A';

  const getStatusBadgeVariant = (status: Truck['maintenanceStatus']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Good': return 'default'; // Or a custom green-like variant
      case 'Needs Service': return 'destructive';
      case 'In Service': return 'secondary'; // Or a custom yellow-like variant
      default: return 'outline';
    }
  };
  
  if (trucks.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No trucks found. Add a new truck to get started.</p>;
  }

  return (
    <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>License Plate</TableHead>
          <TableHead>Model & Year</TableHead>
          <TableHead>Carrier</TableHead>
          <TableHead>Driver</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {trucks.map((truck) => (
          <TableRow key={truck.id}>
            <TableCell className="font-medium">{truck.name}</TableCell>
            <TableCell>{truck.licensePlate}</TableCell>
            <TableCell>{truck.model} ({truck.year})</TableCell>
            <TableCell>{getCarrierName(truck.carrierId)}</TableCell>
            <TableCell>{getDriverName(truck.driverId)}</TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(truck.maintenanceStatus)} 
                     className={cn(
                       truck.maintenanceStatus === 'Good' && 'bg-green-500 hover:bg-green-600 text-white',
                       truck.maintenanceStatus === 'Needs Service' && 'bg-red-500 hover:bg-red-600 text-white',
                       truck.maintenanceStatus === 'In Service' && 'bg-yellow-500 hover:bg-yellow-600 text-black'
                     )}>
                {truck.maintenanceStatus}
              </Badge>
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
                    <DropdownMenuItem onClick={() => console.log("View truck:", truck)}>
                      <Eye className="mr-2 h-4 w-4" /> View Details
                    </DropdownMenuItem>
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
  );
}

// Helper function to make cn available if not globally imported in this file scope
// (already in lib/utils, but good practice for component self-containment if needed)
function cn(...inputs: any[]) {
  // Simplified version for brevity; in real use, import from '@/lib/utils'
  return inputs.filter(Boolean).join(' ');
}
