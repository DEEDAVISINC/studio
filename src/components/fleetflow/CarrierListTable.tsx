
"use client";
import type { Carrier } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Edit3, Eye, Phone, Mail } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

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
          <TableHead>Legal Name / DBA</TableHead>
          <TableHead>MC# / DOT#</TableHead>
          <TableHead>Preferred Contact</TableHead>
          <TableHead>Equipment</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {carriers.map((carrier) => (
          <TableRow key={carrier.id}>
            <TableCell className="font-medium">
              <div>{carrier.name}</div>
              {carrier.dba && <div className="text-xs text-muted-foreground">DBA: {carrier.dba}</div>}
            </TableCell>
            <TableCell>
              <div>MC: {carrier.mcNumber || 'N/A'}</div>
              <div className="text-xs text-muted-foreground">DOT: {carrier.usDotNumber || 'N/A'}</div>
            </TableCell>
            <TableCell>
              <div>{carrier.contactPerson}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3"/> {carrier.contactPhone}
              </div>
               <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3"/> {carrier.contactEmail}
              </div>
            </TableCell>
            <TableCell className="max-w-[200px] truncate">
                {carrier.equipmentTypes ? carrier.equipmentTypes.split(',').map(eq => eq.trim()).map(eqt => (
                    <Badge key={eqt} variant="secondary" className="mr-1 mb-1 text-xs">{eqt}</Badge>
                )) : 'N/A'}
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
