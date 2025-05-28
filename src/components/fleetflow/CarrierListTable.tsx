
"use client";
import type { Carrier } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Edit3, Eye } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface CarrierListTableProps {
  carriers: Carrier[];
  onEdit: (carrier: Carrier) => void;
  onDelete: (carrierId: string) => void;
}

export function CarrierListTable({ carriers, onEdit, onDelete }: CarrierListTableProps) {
  if (carriers.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No carriers found. Add a new carrier to get started.</p>;
  }

  return (
    <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Contact Person</TableHead>
          <TableHead>MC#</TableHead>
          <TableHead>US DOT#</TableHead>
          <TableHead>Availability</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {carriers.map((carrier) => (
          <TableRow key={carrier.id}>
            <TableCell className="font-medium">{carrier.name}</TableCell>
            <TableCell>{carrier.contactPerson}</TableCell>
            <TableCell>{carrier.mcNumber || 'N/A'}</TableCell>
            <TableCell>{carrier.usDotNumber || 'N/A'}</TableCell>
            <TableCell className="max-w-xs truncate">{carrier.availabilityNotes || 'N/A'}</TableCell>
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
                    {/* <DropdownMenuItem onClick={() => console.log("View carrier:", carrier)}>
                       <Eye className="mr-2 h-4 w-4" /> View Details (Full)
                    </DropdownMenuItem> */}
                    <DropdownMenuItem onClick={() => onEdit(carrier)}>
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
                      This action cannot be undone. This will permanently delete the carrier "{carrier.name}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(carrier.id)} className="bg-destructive hover:bg-destructive/90">
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
